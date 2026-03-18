import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { hasPermission } from 'src/auth/permissions';
import { ReportStatus, Role } from '@prisma/client';
import { InternalServerErrorException, HttpException, NotFoundException } from '@nestjs/common';
import { HandleReportDto } from './dto/handleReport.dto';
import { ReportDto } from './dto/report.dto';
import { ModerationLogType } from '@prisma/client';

@Injectable()
export class ModerationService {
	constructor(private prisma: PrismaService) {}

	private buildCountByKey<T, K extends number | string>(
		items: T[],
		getKey: (item: T) => K,
	): Record<K, number> {
		return items.reduce(
			(acc, item) => {
				// Extract the key for this item
				const key = getKey(item);
				// Increment the count for this key, or initialize to 1 if it doesn't exist yet
				acc[key] = (acc[key] ?? 0) + 1;
				return acc;
			},
			{} as Record<K, number>,
		); // Start with an empty object to store the counts
	}

	// ---------------------------------- CHANGE ROLE ------------------------------------

async updateAdminRole(
	targetId: number,
	actorId: number,
	currentUserRole: Role,
) {
	if (!hasPermission(currentUserRole, 'CHANGE_ADMIN_ROLE')) {
		throw new ForbiddenException('You do not have the right to update an admin role');
	}

	const user = await this.prisma.user.findUnique({ where: { id: targetId } });
	if (!user) throw new BadRequestException('User not found');

	if (user.role !== Role.MOD) {
		throw new BadRequestException('Only a MOD can be promoted to ADMIN');
	}

	const updatedUser = await this.prisma.$transaction(async (tx) => {
		// If MOD, promote to ADMIN
		if (user.role === Role.MOD) {
			const updated = await tx.user.update({
				where: { id: targetId },
				data: { role: Role.ADMIN },
			});
			await tx.moderationLog.create({
				data: {
					action: ModerationLogType.CHANGE_ADMIN_ROLE,
					actorId,
					targetUserId: targetId,
				},
			});
			return updated;
		}
		throw new BadRequestException('Invalid role transition');
	});

	return updatedUser;
}

async updateModRole(
	targetId: number,
	actorId: number,
	userRole: Role,
) {
	if (!hasPermission(userRole, 'CHANGE_MOD_ROLE')) {
		throw new ForbiddenException('You do not have the right to update a mod role');
	}

	const user = await this.prisma.user.findUnique({ where: { id: targetId } });
	if (!user) throw new BadRequestException('User not found');

	if (user.role !== Role.USER && user.role !== Role.MOD) {
		throw new BadRequestException('User must be USER or MOD');
	}

	if (user.bannedAt) throw new BadRequestException('You cannot update a banned user role');

	const updatedUser = await this.prisma.$transaction(async (tx) => {
		if (user.role === Role.MOD) {
			const modCount = await tx.user.count({ where: { role: Role.MOD } });
			if (modCount <= 1) {
				throw new BadRequestException('At least one MOD must remain');
			}
			const updated = await tx.user.update({
				where: { id: targetId },
				data: { role: Role.USER },
			});
			await tx.moderationLog.create({
				data: {
					action: ModerationLogType.CHANGE_MOD_ROLE,
					actorId,
					targetUserId: targetId,
				},
			});
			return updated;
		}

		if (user.role === Role.USER) {
			const updated = await tx.user.update({
				where: { id: targetId },
				data: { role: Role.MOD },
			});
			await tx.moderationLog.create({
				data: {
					action: ModerationLogType.CHANGE_MOD_ROLE,
					actorId,
					targetUserId: targetId,
				},
			});
			return updated;
		}

		throw new BadRequestException('Invalid role transition');
	});

	return updatedUser;
}

	// ---------------------------------- HANDLE REPORTS ----------------------------------
async acceptReport(reportId: number, dto: HandleReportDto, userId: number, userRole: Role) {
		try {
			const actor = await this.prisma.user.findUnique({ where: { id: userId } });
			if (!actor) {
				throw new NotFoundException('User not found');
			}
			if (actor.bannedAt) {
				throw new ForbiddenException('Banned users cannot perform moderation actions');
			}

			const report = await this.prisma.report.findUnique({ where: { id: reportId } });
			if (!report) throw new BadRequestException('Failed to find the report');

			if (!hasPermission(userRole, 'REVIEW_POST_REPORT')) {
				throw new ForbiddenException('You do not have the right to review reports');
			}

			if (report.handledById !== userId) {
				throw new ForbiddenException('You do not have the right to accept this report');
			}
			if (report.status !== ReportStatus.ASSIGNED) {
				throw new BadRequestException('Report must be assigned before being handled');
			}

			await this.prisma.$transaction(async (prisma) => {
				// Update all reports for the same post
				if (report.reportedPostId) {
					await prisma.report.updateMany({
						where: { reportedPostId: report.reportedPostId },
						data: {
							handledById: userId,
							moderatorMessage: dto.moderatorMessage,
							status: ReportStatus.ACCEPTED,
							handledAt: new Date(),
						},
					});
					// Soft delete the post
					await prisma.post.update({
						where: { id: report.reportedPostId },
						data: { deletedAt: new Date() },
					});
					// Log post report review
					await prisma.moderationLog.create({
						data: {
							action: ModerationLogType.REVIEW_POST_REPORT,
							actorId: userId,
							targetPostId: report.reportedPostId,
						},
					});
				} else {
					// Fallback: if report is associated with a user
					if (!report.reportedUserId)
						throw new BadRequestException('No user associated with this report');
					await prisma.report.updateMany({
						where: { reportedUserId: report.reportedUserId },
						data: {
							handledById: userId,
							moderatorMessage: dto.moderatorMessage,
							status: ReportStatus.ACCEPTED,
							handledAt: new Date(),
						},
					});
					// Ban the user
					await prisma.user.update({
						where: { id: report.reportedUserId },
						data: { bannedAt: new Date() },
					});
					// Log user report review
					await prisma.moderationLog.createMany({
						data: [
							{
								action: ModerationLogType.REVIEW_USER_REPORT,
								actorId: userId,
								targetUserId: report.reportedUserId,
							},
							{
								action: ModerationLogType.BAN_USER,
								actorId: userId,
								targetUserId: report.reportedUserId,
							},
						],
					});
				}
			});
			return true;
		} catch (error) {
			if (error instanceof HttpException) throw error;
			console.error('Error accepting report:', error);
			throw new InternalServerErrorException('Could not accept report');
		}
	}

	async rejectReport(reportId: number, dto: HandleReportDto, userId: number, userRole: Role) {
		try {
			const actor = await this.prisma.user.findUnique({ where: { id: userId } });
			if (!actor) {
				throw new NotFoundException('User not found');
			}
			if (actor.bannedAt) {
				throw new ForbiddenException('Banned users cannot perform moderation actions');
			}

			const report = await this.prisma.report.findUnique({ where: { id: reportId } });
			if (!report) throw new BadRequestException('Failed to find the report');

			if (!hasPermission(userRole, 'REVIEW_POST_REPORT')) {
				throw new ForbiddenException('You do not have the right to review reports');
			}

			if (report.handledById !== userId) {
				throw new ForbiddenException('You do not have the right to reject this report');
			}
			if (report.status !== ReportStatus.ASSIGNED) {
				throw new BadRequestException('Report must be assigned before being handled');
			}

			await this.prisma.$transaction(async (prisma) => {
				// Update all reports for the same post
				if (report.reportedPostId) {
					await prisma.report.updateMany({
						where: { reportedPostId: report.reportedPostId },
						data: {
							handledById: userId,
							moderatorMessage: dto.moderatorMessage,
							status: ReportStatus.REJECTED,
							handledAt: new Date(),
						},
					});
					// Soft delete the post
					await prisma.post.update({
						where: { id: report.reportedPostId },
						data: { deletedAt: new Date() },
					});
					// Log post report review
					await prisma.moderationLog.create({
						data: {
							action: ModerationLogType.REVIEW_POST_REPORT,
							actorId: userId,
							targetPostId: report.reportedPostId,
						},
					});
				} else {
					// Fallback: if report is associated with a user
					await prisma.report.update({
						where: { id: reportId },
						data: {
							handledById: userId,
							moderatorMessage: dto.moderatorMessage,
							status: ReportStatus.REJECTED,
							handledAt: new Date(),
						},
					});
					//Log user report review
					await prisma.moderationLog.create({
						data: {
							action: ModerationLogType.REVIEW_USER_REPORT,
							actorId: userId,
							targetUserId: report.reportedUserId,
						},
					});
				}
			});
			return true;
		} catch (error) {
			if (error instanceof HttpException) throw error;
			console.error('Error rejecting report:', error);
			throw new InternalServerErrorException('Could not rejecting report');
		}
	}

	async assignReport(reportId: number, userId: number, userRole: Role) {
		try {
			const actor = await this.prisma.user.findUnique({ where: { id: userId } });
			if (!actor) {
				throw new NotFoundException('User not found');
			}
			if (actor.bannedAt) {
				throw new ForbiddenException('Banned users cannot perform moderation actions');
			}

			const report = await this.prisma.report.findUnique({ where: { id: reportId } });
			if (!report) throw new BadRequestException('Failed to find the report');
			if (report.reportedUserId) {
				if (!hasPermission(userRole, 'REVIEW_USER_REPORT')) {
					throw new ForbiddenException(
						'You do not have permission to assign a user report',
					);
				}
			}
			if (report.reportedPostId) {
				if (!hasPermission(userRole, 'REVIEW_POST_REPORT')) {
					throw new ForbiddenException(
						'You do not have permission to assign a post report',
					);
				}
			}

			if (report.handledById) {
				throw new BadRequestException('Report already assigned');
			}

			// If it's a post report, assign all reports for this post
			if (report.reportedPostId) {
				await this.prisma.report.updateMany({
					where: {
						reportedPostId: report.reportedPostId,
						handledById: null,
						status: ReportStatus.PENDING,
					},
					data: {
						handledById: userId,
						status: ReportStatus.ASSIGNED,
					},
				});
				// Return all assigned reports for this post
				return await this.prisma.report.findMany({
					where: {
						reportedPostId: report.reportedPostId,
						handledById: userId,
						status: ReportStatus.ASSIGNED,
					},
				});
			}
			// If it's a user report, assign all reports for this user
			if (report.reportedUserId) {
				await this.prisma.report.updateMany({
					where: {
						reportedUserId: report.reportedUserId,
						handledById: null,
						status: ReportStatus.PENDING,
					},
					data: {
						handledById: userId,
						status: ReportStatus.ASSIGNED,
					},
				});
				// Return all assigned reports for this user
				return await this.prisma.report.findMany({
					where: {
						reportedUserId: report.reportedUserId,
						handledById: userId,
						status: ReportStatus.ASSIGNED,
					},
				});
			}
			// Fallback: assign only the report
			const assignedReport = await this.prisma.report.update({
				where: { id: reportId },
				data: {
					handledById: userId,
					status: ReportStatus.ASSIGNED,
				},
			});
			return assignedReport;
		} catch (error) {
			if (error instanceof HttpException) throw error;
			console.error('Error assigning the report:', error);
			throw new InternalServerErrorException('Could not assgin the report');
		}
	}

	async unassignReport(reportId: number, userId: number, userRole: Role) {
		try {
			const actor = await this.prisma.user.findUnique({ where: { id: userId } });
			if (!actor) {
				throw new NotFoundException('User not found');
			}
			if (actor.bannedAt) {
				throw new ForbiddenException('Banned users cannot perform moderation actions');
			}

			const report = await this.prisma.report.findUnique({ where: { id: reportId } });
			if (!report) throw new BadRequestException('Failed to find the report');
			if (report.reportedUserId) {
				if (!hasPermission(userRole, 'REVIEW_USER_REPORT')) {
					throw new ForbiddenException(
						'You do not have permission to unassign a user report',
					);
				}
			}
			if (report.reportedPostId) {
				if (!hasPermission(userRole, 'REVIEW_POST_REPORT')) {
					throw new ForbiddenException(
						'You do not have permission to unassign a post report',
					);
				}
			}

			if (!report.handledById) {
				throw new BadRequestException('Report is not assigned');
			}
			// Allow admin to unassign any report, otherwise only allow the moderator who is assigned
			let targetHandledById = userId;
			if (userRole === Role.ADMIN) {
				targetHandledById = report.handledById;
			} else if (report.handledById !== userId) {
				throw new ForbiddenException('You cannot unassign this report');
			}

			// If it's a post report, unassign all reports for this post
			if (report.reportedPostId) {
				await this.prisma.report.updateMany({
					where: {
						reportedPostId: report.reportedPostId,
						handledById: targetHandledById,
						status: ReportStatus.ASSIGNED,
					},
					data: {
						handledById: null,
						status: ReportStatus.PENDING,
					},
				});
				// Return all unassigned reports for this post
				return await this.prisma.report.findMany({
					where: {
						reportedPostId: report.reportedPostId,
						handledById: null,
						status: ReportStatus.PENDING,
					},
				});
			}
			// If it's a user report, unassign all reports for this user
			if (report.reportedUserId) {
				await this.prisma.report.updateMany({
					where: {
						reportedUserId: report.reportedUserId,
						handledById: targetHandledById,
						status: ReportStatus.ASSIGNED,
					},
					data: {
						handledById: null,
						status: ReportStatus.PENDING,
					},
				});
				// Return all unassigned reports for this user
				return await this.prisma.report.findMany({
					where: {
						reportedUserId: report.reportedUserId,
						handledById: null,
						status: ReportStatus.PENDING,
					},
				});
			}
			// Fallback: unassign only the report
			const assignedReport = await this.prisma.report.update({
				where: { id: reportId },
				data: {
					handledById: null,
					status: ReportStatus.PENDING,
				},
			});
			return assignedReport;
		} catch (error) {
			if (error instanceof HttpException) throw error;
			console.error('Error unassigning the report:', error);
			throw new InternalServerErrorException('Could not unassgin the report');
		}
	}

	// ---------------------------------- USER REPORTS ----------------------------------

	async banUser(targetId: number, userId: number, userRole: Role) {
		try {
			const actor = await this.prisma.user.findUnique({ where: { id: userId } });
			if (!actor) {
				throw new NotFoundException('User not found');
			}
			if (actor.bannedAt) {
				throw new ForbiddenException('Banned users cannot perform moderation actions');
			}

			if (!hasPermission(userRole, 'BAN_USER')) {
				throw new ForbiddenException('You do not have permission to ban a user');
			}

			if (targetId === userId) {
				throw new BadRequestException('You cannot ban yourself');
			}

			const targetUser = await this.prisma.user.findUnique({
				where: { id: targetId },
				select: {
					id: true,
					role: true,
					bannedAt: true,
				},
			});

			if (!targetUser) {
				throw new NotFoundException('User not found');
			}
			if (targetUser.role === Role.ADMIN) {
				throw new ForbiddenException('You cannot ban an administrator');
			}

			if (targetUser.bannedAt) {
				throw new BadRequestException('User has already been banned');
			}

			const bannedUser = await this.prisma.$transaction(async (tx) => {
				// Set the user as banned
				const updateUser = await tx.user.update({
					where: { id: targetId },
					data: {
						bannedAt: new Date(),
					},
				});
				// Soft-delete comments
				await tx.comment.updateMany({
					where: { userId: targetId, deletedAt: null },
					data: { deletedAt: new Date() },
				});

				// 3. Soft-delete posts
				await tx.post.updateMany({
					where: { authorId: targetId, deletedAt: null },
					data: { deletedAt: new Date() },
				});

				// 4. Add log
				await tx.moderationLog.create({
						data: {
							action: ModerationLogType.BAN_USER,
							actorId: userId,
							targetUserId: targetId,
						},
					});

				return updateUser;
			});

			return bannedUser;
		} catch (error) {
			if (error instanceof HttpException) throw error;
			console.error('Error banning user:', error);
			throw new InternalServerErrorException('Could not ban the user');
		}
	}

		async unbanUser(targetId: number, userId: number, userRole: Role) {
		try {
			const actor = await this.prisma.user.findUnique({ where: { id: userId } });
			if (!actor) {
				throw new NotFoundException('User not found');
			}
			if (actor.bannedAt) {
				throw new ForbiddenException('Banned users cannot perform moderation actions');
			}

			if (!hasPermission(userRole, 'UNBAN_USER')) {
				throw new ForbiddenException('You do not have permission to unban a user');
			}

			if (targetId === userId) {
				throw new BadRequestException('You cannot unban yourself');
			}

			const targetUser = await this.prisma.user.findUnique({
				where: { id: targetId },
				select: {
					id: true,
					role: true,
					bannedAt: true,
				},
			});

			if (!targetUser) {
				throw new NotFoundException('User not found');
			}

			if (!targetUser.bannedAt) {
				throw new BadRequestException('User has already been unbanned');
			}

			const unbannedUser = await this.prisma.$transaction(async (tx) => {
				// Set the user as banned
				const updateUser = await tx.user.update({
					where: { id: targetId },
					data: {
						bannedAt: null,
					},
				});
				// Cancel soft-delete for comments
				await tx.comment.updateMany({
					where: { userId: targetId, deletedAt: { not: null } },
					data: { deletedAt: null },
				});

				// 3. Cancel soft-delete for posts
				await tx.post.updateMany({
					where: { authorId: targetId, deletedAt: { not: null } },
					data: { deletedAt: null},
				});

				// 4. Add log
				await tx.moderationLog.create({
						data: {
							action: ModerationLogType.UNBAN_USER,
							actorId: userId,
							targetUserId: targetId,
						},
					});

				return updateUser;
			});

			return unbannedUser;
		} catch (error) {
			if (error instanceof HttpException) throw error;
			console.error('Error unbanning user:', error);
			throw new InternalServerErrorException('Could not unban the user');
		}
	}

	// ---------------------------------- USER REPORTS ----------------------------------

	async reportUser(userId: number, dto: ReportDto, currentUserId: number) {
		try {
			const reporter = await this.prisma.user.findUnique({ where: { id: currentUserId } });
			if (!reporter) {
				throw new NotFoundException('User not found');
			}
			if (reporter.bannedAt) {
				throw new ForbiddenException('Banned users cannot report users');
			}

			const reportedUser = await this.prisma.user.findUnique({
				where: { id: userId },
				select: { id: true },
			});
			if (!reportedUser) throw new NotFoundException('User not found');
			if (userId === currentUserId)
				throw new BadRequestException('You cannot report yourself');
			const existingReport = await this.prisma.report.findUnique({
				where: {
					reporterId_reportedUserId: {
						reporterId: currentUserId,
						reportedUserId: userId,
					},
				},
			});
			if (existingReport)
				throw new BadRequestException('You have already reported this user');

			const report = await this.prisma.$transaction(async (tx) => {
				const createdReport = await tx.report.create({
					data: {
						reporterId: currentUserId,
						reportedUserId: userId,
						reportCategory: dto.category,
						reportDescription: dto.description,
					},
				});

				await tx.userHiddenForUser.upsert({
					where: {
						targetUserId_userId: {
							targetUserId: userId,
							userId: currentUserId,
						},
					},
					update: {},
					create: {
						userId: currentUserId,
						targetUserId: userId,
					},
				});

				// Remove any existing friendship with the reported user (in both directions)
				const existingFriendship = await tx.friendship.findFirst({
					where: {
						OR: [
							{ requesterId: currentUserId, addresseId: userId },
							{ requesterId: userId, addresseId: currentUserId },
						],
					},
				});

				if (existingFriendship) {
					await tx.friendship.delete({
						where: { id: existingFriendship.id },
					});
				}

				return createdReport;
			});
			return report;
		} catch (error) {
			if (error instanceof HttpException) throw error;
			console.log('Error reporting user:', error);
			throw new InternalServerErrorException('Could not report user');
		}
	}

	async getAllReportsForThisUser(userId: number, userRole: Role) {
		try {
			if (!hasPermission(userRole, 'REVIEW_USER_REPORT')) {
				throw new ForbiddenException('You do not have the right to review users reports');
			}
			const user = await this.prisma.user.findUnique({
				where: { id: userId },
				select: { id: true },
			});

			if (!user) {
				throw new NotFoundException('User not found');
			}

			const reports = await this.prisma.report.findMany({
				where: {
					reportedUserId: userId,
				},
				select: {
					id: true,
					reporter: { select: { id: true, username: true } },
					reportedUser: {
						select: {
							id: true,
							username: true,
							profile: {
								select: {
									displayName: true,
									avatarUrl: true,
									coverUrl: true,
									bio: true,
								},
							},
						},
					},
					reportCategory: true,
					reportDescription: true,
					createdAt: true,
					status: true,
					handledBy: { select: { id: true, username: true } },
				},
				orderBy: { createdAt: 'asc' },
			});
			return reports;
		} catch (error) {
			if (error instanceof HttpException) throw error;
			console.error('Error fetching all the reports for this user:', error);
			throw new InternalServerErrorException('Could not fetch all the reports for this user');
		}
	}

	async getAllPendingUserReports(userRole: Role) {
		try {
			if (!hasPermission(userRole, 'REVIEW_USER_REPORT')) {
				throw new BadRequestException('You do not have the right to review user reports');
			}

			const pendingReports = await this.prisma.report.findMany({
				where: {
					reportedUserId: { not: null },
					status: ReportStatus.PENDING,
				},
				select: {
					id: true,
					reporter: { select: { id: true, username: true } },
					reportedUser: {
						select: {
							id: true,
							username: true,
							profile: {
								select: {
									displayName: true,
									avatarUrl: true,
									coverUrl: true,
									bio: true,
								},
							},
						},
					},
					reportCategory: true,
					reportDescription: true,
					createdAt: true,
					status: true,
					handledBy: { select: { id: true, username: true } },
				},
			});

			// Get all ASSIGNED reports
			const assignedReports = await this.prisma.report.findMany({
				where: {
					reportedUserId: { not: null },
					status: ReportStatus.ASSIGNED,
				},
				select: {
					reportedUser: { select: { id: true } },
				},
			});
			// Create a set (checks if an element exists)
			const assignedUserIds = new Set(assignedReports.map((r) => r.reportedUser.id));

			// Exclude reports already assigned
			const filteredPendingReports = pendingReports.filter(
				(report) => !assignedUserIds.has(report.reportedUser.id),
			);

			// Keep one report per user
			const seenUserIds = new Set<number>();
			const uniqueReports = [];
			// Loop through each report in the list of filtered pending reports.
			for (const report of filteredPendingReports) {
				const userId = report.reportedUser.id;
				// Check if we have NOT already encountered this user ID
				if (!seenUserIds.has(userId)) {
					uniqueReports.push(report); // If it's the first time, add this report to the uniqueReports array.
					seenUserIds.add(userId); // Add the user ID to the Set so we don't include another report for this user later.
				}
			}

			// Count all reports per user
			const userIds = uniqueReports.map((r) => r.reportedUser.id);
			const allReports = await this.prisma.report.findMany({
				where: {
					reportedUserId: { in: userIds },
				},
				select: {
					reportedUser: { select: { id: true } },
				},
			});
			const reportCountByUserId = this.buildCountByKey(
				allReports,
				(report) => report.reportedUser.id,
			);

			return uniqueReports.map((report) => ({
				...report,
				reportCount: reportCountByUserId[report.reportedUser.id] ?? 0,
			}));
		} catch (error) {
			if (error instanceof HttpException) throw error;
			console.error('Error fetching pending user reports:', error);
			throw new InternalServerErrorException('Could not fetch pending user reports');
		}
	}

	async getMyUserReports(userId: number, userRole: Role) {
		try {
			if (!hasPermission(userRole, 'REVIEW_USER_REPORT')) {
				throw new ForbiddenException('You do not have the right to review user reports');
			}

			const myAssignedReports = await this.prisma.report.findMany({
				where: {
					reportedUserId: { not: null },
					status: ReportStatus.ASSIGNED,
					handledById: userId,
				},
				select: {
					id: true,
					reporter: { select: { id: true, username: true } },
					reportedUser: {
						select: {
							id: true,
							username: true,
							profile: {
								select: {
									displayName: true,
									avatarUrl: true,
									coverUrl: true,
									bio: true,
								},
							},
						},
					},
					reportCategory: true,
					reportDescription: true,
					createdAt: true,
					status: true,
					handledBy: { select: { id: true, username: true } },
				},
				orderBy: { createdAt: 'asc' },
			});

			// Keep only one report per reported user
			const seenUserIds = new Set<number>();
			const uniqueReports = [];

			for (const report of myAssignedReports) {
				const uid = report.reportedUser.id;
				if (!seenUserIds.has(uid)) {
					uniqueReports.push(report);
					seenUserIds.add(uid);
				}
			}

			// Count all reports per user
			const userIds = uniqueReports.map((r) => r.reportedUser.id);

			const allReports = await this.prisma.report.findMany({
				where: {
					reportedUserId: { in: userIds },
				},
				select: {
					reportedUser: { select: { id: true } },
				},
			});

			const reportCountByUserId = this.buildCountByKey(
				allReports,
				(report) => report.reportedUser.id,
			);

			return uniqueReports.map((report) => ({
				...report,
				reportCount: reportCountByUserId[report.reportedUser.id] ?? 0,
			}));
		} catch (error) {
			if (error instanceof HttpException) throw error;
			console.error("Error fetching user's assigned user reports:", error);
			throw new InternalServerErrorException("Could not fetch user's assigned user reports");
		}
	}

	async getAllAssignedUserReports(userRole: Role) {
		try {
			if (!hasPermission(userRole, 'REVIEW_USER_REPORT')) {
				throw new ForbiddenException('You do not have the right to review users reports');
			}
			const assignedReports = await this.prisma.report.findMany({
				where: {
					reportedUserId: { not: null },
					status: ReportStatus.ASSIGNED,
				},
				select: {
					id: true,
					reporter: { select: { id: true, username: true } },
					reportedUser: {
						select: {
							id: true,
							username: true,
							profile: {
								select: {
									displayName: true,
									avatarUrl: true,
									coverUrl: true,
									bio: true,
								},
							},
						},
					},
					reportCategory: true,
					reportDescription: true,
					createdAt: true,
					status: true,
					handledBy: { select: { id: true, username: true } },
				},
				orderBy: { createdAt: 'asc' },
			});
			// Keep only the first report for each unique user
			const seenUserIds = new Set<number>();
			const uniqueReports = [];
			for (const report of assignedReports) {
				const userId = report.reportedUser.id;
				if (!seenUserIds.has(userId)) {
					uniqueReports.push(report);
					seenUserIds.add(userId);
				}
			}
			// Count all reports per user
			const userIds = uniqueReports.map((r) => r.reportedUser.id);
			const allReports = await this.prisma.report.findMany({
				where: {
					reportedUserId: { in: userIds },
				},
				select: {
					reportedUser: { select: { id: true } },
				},
			});
			const reportCountByUserId = this.buildCountByKey(
				allReports,
				(report) => report.reportedUser.id,
			);
			return uniqueReports.map((report) => ({
				...report,
				reportCount: reportCountByUserId[report.reportedUser.id] ?? 0,
			}));
		} catch (error) {
			if (error instanceof HttpException) throw error;
			console.error('Error fetching all assigned user reports:', error);
			throw new InternalServerErrorException('Could not fetch all assigned user reports');
		}
	}

	async getAllHandledUserReports(userRole: Role) {
		try {
			if (!hasPermission(userRole, 'REVIEW_USER_REPORT')) {
				throw new ForbiddenException('You do not have the right to review users reports');
			}
			const handledReports = await this.prisma.report.findMany({
				where: {
					reportedUserId: { not: null },
					status: { in: [ReportStatus.ACCEPTED, ReportStatus.REJECTED] },
				},
				select: {
					id: true,
					reporter: { select: { id: true, username: true } },
					reportedUser: {
						select: {
							id: true,
							username: true,
							profile: {
								select: {
									displayName: true,
									avatarUrl: true,
									coverUrl: true,
									bio: true,
								},
							},
						},
					},
					reportCategory: true,
					reportDescription: true,
					createdAt: true,
					status: true,
					handledBy: { select: { id: true, username: true } },
					moderatorMessage: true,
					handledAt: true,
				},
				orderBy: { handledAt: 'desc' },
			});
			// Keep only the first report for each unique user
			const seenUserIds = new Set<number>();
			const uniqueReports = [];
			for (const report of handledReports) {
				const userId = report.reportedUser.id;
				if (!seenUserIds.has(userId)) {
					uniqueReports.push(report);
					seenUserIds.add(userId);
				}
			}
			// Count all reports per user
			const userIds = uniqueReports.map((r) => r.reportedUser.id);
			const allReports = await this.prisma.report.findMany({
				where: {
					reportedUserId: { in: userIds },
					status: { in: [ReportStatus.ACCEPTED, ReportStatus.REJECTED] },
				},
				select: {
					reportedUser: { select: { id: true } },
				},
			});
			const reportCountByUserId = this.buildCountByKey(
				allReports,
				(report) => report.reportedUser.id,
			);
			return uniqueReports.map((report) => ({
				...report,
				reportCount: reportCountByUserId[report.reportedUser.id] ?? 0,
			}));
		} catch (error) {
			if (error instanceof HttpException) throw error;
			console.error('Error fetching all handled user reports:', error);
			throw new InternalServerErrorException('Could not fetch all handled user reports');
		}
	}

	// ---------------------------------- POST REPORTS ----------------------------------

	async reportPost(postId: number, dto: ReportDto, currentUserId: number) {
		try {
			const reporter = await this.prisma.user.findUnique({ where: { id: currentUserId } });
			if (!reporter) {
				throw new NotFoundException('User not found');
			}
			if (reporter.bannedAt) {
				throw new ForbiddenException('Banned users cannot report posts');
			}

			const reportedPost = await this.prisma.post.findUnique({
				where: { id: postId, deletedAt: null },
				select: { authorId: true },
			});
			if (!reportedPost) throw new NotFoundException('Post not found');
			if (reportedPost.authorId === currentUserId)
				throw new BadRequestException('You cannot report your own post');
			const existingReport = await this.prisma.report.findUnique({
				where: {
					reporterId_reportedPostId: {
						reporterId: currentUserId,
						reportedPostId: postId,
					},
				},
			});
			if (existingReport)
				throw new BadRequestException('You have already reported this post');

			const report = await this.prisma.$transaction(async (tx) => {
				const createdReport = await tx.report.create({
					data: {
						reporterId: currentUserId,
						reportedPostId: postId,
						reportCategory: dto.category,
						reportDescription: dto.description,
					},
				});

				await tx.postHiddenForUser.upsert({
					where: {
						postId_userId: {
							postId,
							userId: currentUserId,
						},
					},
					update: {},
					create: {
						postId,
						userId: currentUserId,
					},
				});

				// Remove any existing friendship with the post author (in both directions)
				const existingFriendship = await tx.friendship.findFirst({
					where: {
						OR: [
							{ requesterId: currentUserId, addresseId: reportedPost.authorId },
							{ requesterId: reportedPost.authorId, addresseId: currentUserId },
						],
					},
				});

				if (existingFriendship) {
					await tx.friendship.delete({
						where: { id: existingFriendship.id },
					});
				}
				return createdReport;
			});
			return report;
		} catch (error) {
			if (error instanceof HttpException) throw error;
			console.log('Error reporting post:', error);
			throw new InternalServerErrorException('Could not report post');
		}
	}

	async getAllReportsForThisPost(postId: number, userRole: Role) {
		try {
			if (!hasPermission(userRole, 'REVIEW_POST_REPORT')) {
				throw new ForbiddenException('You do not have the right to review posts reports');
			}
			const post = await this.prisma.post.findUnique({
				where: { id: postId },
				select: { id: true },
			});

			if (!post) {
				throw new NotFoundException('Post not found');
			}

			const reports = await this.prisma.report.findMany({
				where: {
					reportedPostId: postId,
				},
				select: {
					id: true,
					reporter: { select: { id: true, username: true } },
					reportedPost: {
						select: {
							id: true,
							title: true,
							caption: true,
							imageUrl: true,
							createdAt: true,
							author: { select: { id: true, username: true } },
						},
					},
					reportCategory: true,
					reportDescription: true,
					createdAt: true,
					status: true,
					handledBy: { select: { id: true, username: true } },
				},
				orderBy: { createdAt: 'asc' },
			});
			return reports;
		} catch (error) {
			if (error instanceof HttpException) throw error;
			console.error('Error fetching all the reports for this post:', error);
			throw new InternalServerErrorException('Could not fetch all the reports for this post');
		}
	}

	async getAllPendingPostReports(userRole: Role) {
		try {
			if (!hasPermission(userRole, 'REVIEW_POST_REPORT')) {
				throw new BadRequestException('You do not have the right to review posts reports');
			}

			const pendingReports = await this.prisma.report.findMany({
				where: {
					reportedPostId: { not: null },
					status: ReportStatus.PENDING,
				},
				select: {
					id: true,
					reporter: { select: { id: true, username: true } },
					reportedPost: {
						select: {
							id: true,
							title: true,
							imageUrl: true,
							caption: true,
							createdAt: true,
							author: { select: { id: true, username: true } },
						},
					},
					reportCategory: true,
					reportDescription: true,
					createdAt: true,
					status: true,
					handledBy: { select: { id: true, username: true } },
				},
			});

			// Get all ASSIGNED reports for this post
			const assignedReports = await this.prisma.report.findMany({
				where: {
					reportedPostId: { not: null },
					status: ReportStatus.ASSIGNED,
				},
				select: {
					reportedPost: { select: { id: true } },
				},
			});
			// Create a set if postIds already assigned
			const assignedPostIds = new Set(assignedReports.map((r) => r.reportedPost.id));

			// Filter PENDING reports to exclude those whose post has already been assigned
			const filteredPendingReports = pendingReports.filter(
				(report) => !assignedPostIds.has(report.reportedPost.id),
			);

			// Keep one report per post
			const seenPostIds = new Set<number>();
			const uniqueReports = [];
			// Loop through each report in the list of filtered pending reports.
			for (const report of filteredPendingReports) {
				const postId = report.reportedPost.id;
				// Check if we have NOT already encountered this post ID
				if (!seenPostIds.has(postId)) {
					uniqueReports.push(report); // If it's the first time, add this report to the uniqueReports array.
					seenPostIds.add(postId); // Add the post ID to the Set so we don't include another report for this post later.
				}
			}

			// Count all reports per post
			const postIds = uniqueReports.map((r) => r.reportedPost.id);
			const allReports = await this.prisma.report.findMany({
				where: {
					reportedPostId: { in: postIds },
				},
				select: {
					reportedPost: { select: { id: true } },
				},
			});
			const reportCountByPostId = this.buildCountByKey(
				allReports,
				(report) => report.reportedPost.id,
			);

			return uniqueReports.map((report) => ({
				...report,
				reportCount: reportCountByPostId[report.reportedPost.id] ?? 0,
			}));
		} catch (error) {
			if (error instanceof HttpException) throw error;
			console.error('Error fetching pending post reports:', error);
			throw new InternalServerErrorException('Could not fetch pending post reports');
		}
	}

	async getMyPostReports(userId: number, userRole: Role) {
		try {
			if (!hasPermission(userRole, 'REVIEW_POST_REPORT')) {
				throw new ForbiddenException('You do not have the right to review posts reports');
			}

			const myAssignedReports = await this.prisma.report.findMany({
				where: {
					reportedPostId: { not: null },
					status: ReportStatus.ASSIGNED,
					handledById: userId,
				},
				select: {
					id: true,
					reporter: { select: { id: true, username: true } },
					reportedPost: {
						select: {
							id: true,
							title: true,
							imageUrl: true,
							caption: true,
							createdAt: true,
							author: { select: { id: true, username: true } },
						},
					},
					reportCategory: true,
					reportDescription: true,
					createdAt: true,
					status: true,
					handledBy: { select: { id: true, username: true } },
				},
				orderBy: { createdAt: 'asc' },
			});
			// Keep only the first report for eeach unique post
			const seenPostIds = new Set<number>();
			const uniqueReports = [];
			for (const report of myAssignedReports) {
				const postId = report.reportedPost.id;
				if (!seenPostIds.has(postId)) {
					uniqueReports.push(report);
					seenPostIds.add(postId);
				}
			}
			// Count all reports per post
			const postIds = uniqueReports.map((r) => r.reportedPost.id);
			const allReports = await this.prisma.report.findMany({
				where: {
					reportedPostId: { in: postIds },
				},
				select: {
					reportedPost: { select: { id: true } },
				},
			});
			const reportCountByPostId = this.buildCountByKey(
				allReports,
				(report) => report.reportedPost.id,
			);
			return uniqueReports.map((report) => ({
				...report,
				reportCount: reportCountByPostId[report.reportedPost.id] ?? 0,
			}));
		} catch (error) {
			if (error instanceof HttpException) throw error;
			console.error("Error fetching user's assigned post reports:", error);
			throw new InternalServerErrorException("Could not fetch user's assigned post reports");
		}
	}

	async getAllAssignedPostReports(userRole: Role) {
		try {
			if (!hasPermission(userRole, 'REVIEW_POST_REPORT')) {
				throw new ForbiddenException('You do not have the right to review posts reports');
			}
			const assignedReports = await this.prisma.report.findMany({
				where: {
					reportedPostId: { not: null },
					status: ReportStatus.ASSIGNED,
				},
				select: {
					id: true,
					reporter: { select: { id: true, username: true } },
					reportedPost: {
						select: {
							id: true,
							title: true,
							imageUrl: true,
							caption: true,
							createdAt: true,
							author: { select: { id: true, username: true } },
						},
					},
					reportCategory: true,
					reportDescription: true,
					createdAt: true,
					status: true,
					handledBy: { select: { id: true, username: true } },
				},
				orderBy: { createdAt: 'asc' },
			});
			// Keep only the first report for each unique post
			const seenPostIds = new Set<number>();
			const uniqueReports = [];
			for (const report of assignedReports) {
				const postId = report.reportedPost.id;
				if (!seenPostIds.has(postId)) {
					uniqueReports.push(report);
					seenPostIds.add(postId);
				}
			}
			// Count all reports per post
			const postIds = uniqueReports.map((r) => r.reportedPost.id);
			const allReports = await this.prisma.report.findMany({
				where: {
					reportedPostId: { in: postIds },
				},
				select: {
					reportedPost: { select: { id: true } },
				},
			});
			const reportCountByPostId = this.buildCountByKey(
				allReports,
				(report) => report.reportedPost.id,
			);
			return uniqueReports.map((report) => ({
				...report,
				reportCount: reportCountByPostId[report.reportedPost.id] ?? 0,
			}));
		} catch (error) {
			if (error instanceof HttpException) throw error;
			console.error('Error fetching all assigned post reports:', error);
			throw new InternalServerErrorException('Could not fetch all assigned post reports');
		}
	}

	async getAllHandledPostReports(userRole: Role) {
		try {
			if (!hasPermission(userRole, 'REVIEW_POST_REPORT')) {
				throw new ForbiddenException('You do not have the right to review posts reports');
			}
			const handledReports = await this.prisma.report.findMany({
				where: {
					reportedPostId: { not: null },
					status: { in: [ReportStatus.ACCEPTED, ReportStatus.REJECTED] },
				},
				select: {
					id: true,
					reporter: { select: { id: true, username: true } },
					reportedPost: {
						select: {
							id: true,
							title: true,
							imageUrl: true,
							caption: true,
							createdAt: true,
							author: { select: { id: true, username: true } },
						},
					},
					reportCategory: true,
					reportDescription: true,
					createdAt: true,
					status: true,
					handledBy: { select: { id: true, username: true } },
					moderatorMessage: true,
					handledAt: true,
				},
				orderBy: { handledAt: 'desc' },
			});
			// Keep only the first report for each unique post
			const seenPostIds = new Set<number>();
			const uniqueReports = [];
			for (const report of handledReports) {
				const postId = report.reportedPost.id;
				if (!seenPostIds.has(postId)) {
					uniqueReports.push(report);
					seenPostIds.add(postId);
				}
			}
			// Count all handled reports per post
			const postIds = uniqueReports.map((r) => r.reportedPost.id);
			const allReports = await this.prisma.report.findMany({
				where: {
					reportedPostId: { in: postIds },
					status: { in: [ReportStatus.ACCEPTED, ReportStatus.REJECTED] },
				},
				select: {
					reportedPost: { select: { id: true } },
				},
			});
			const reportCountByPostId = this.buildCountByKey(
				allReports,
				(report) => report.reportedPost.id,
			);
			return uniqueReports.map((report) => ({
				...report,
				reportCount: reportCountByPostId[report.reportedPost.id] ?? 0,
			}));
		} catch (error) {
			if (error instanceof HttpException) throw error;
			console.error('Error fetching all assigned post reports:', error);
			throw new InternalServerErrorException('Could not fetch all assigned post reports');
		}
	}

	async getAdminLogs(userId: number, userRole: Role) {
		if (!hasPermission(userRole, 'VIEW_ADMIN_LOGS')) {
			throw new ForbiddenException('You do not have the right to see the administrator logs');
		}

		const logs = await this.prisma.moderationLog.findMany({
			select: {
				id: true,
				action: true,
				createdAt: true,
				actor: { select: { id: true, username: true } },
				targetUser: { select: { id: true, username: true } },
				targetBattle: { select: { id: true, theme: true } },
				targetPost: {
					select: {
						id: true,
						title: true,
						author: { select: { id: true, username: true } },
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		});
		return logs;
	}

	async getModLogs(userId: number, userRole: Role) {
		if (!hasPermission(userRole, 'VIEW_MOD_LOGS')) {
			throw new ForbiddenException('You do not have the right to see the moderator logs');
		}

		const logs = await this.prisma.moderationLog.findMany({
			where: {
				action: {
					in: [
						ModerationLogType.DELETE_ANY_POST,
						ModerationLogType.CHANGE_MOD_ROLE,
						ModerationLogType.REVIEW_POST_REPORT,
					],
				},
			},
			select: {
				id: true,
				action: true,
				createdAt: true,
				actor: { select: { id: true, username: true } },
				targetUser: { select: { id: true, username: true } },
				targetPost: {
					select: {
						id: true,
						title: true,
						author: { select: { id: true, username: true } },
					},
				},
			},
			orderBy: { createdAt: 'desc' },
		});
		return logs;
	}
}
