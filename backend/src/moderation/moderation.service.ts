import { PrismaService } from "src/prisma/prisma.service";
import { Injectable, BadRequestException, ForbiddenException } from "@nestjs/common";
import { hasPermission } from "src/auth/permissions";
import { ReportStatus, Role } from "@prisma/client";
import { InternalServerErrorException, HttpException, NotFoundException } from "@nestjs/common";
import { HandleReportDto } from './dto/handleReport.dto';
import { ReportDto } from "./dto/report.dto";

@Injectable()
export class ModerationService {
	constructor(
		private prisma: PrismaService,
	) {}

	private buildCountByKey<T, K extends number | string>(items: T[], getKey: (item: T) => K): Record<K, number> {
		return items.reduce((acc, item) => {
			// Extract the key for this item
			const key = getKey(item);
			// Increment the count for this key, or initialize to 1 if it doesn't exist yet
			acc[key] = (acc[key] ?? 0) + 1;
			return acc;
		}, {} as Record<K, number>); // Start with an empty object to store the counts
	}

	async reportPost(postId: number, dto: ReportDto, currentUserId: number) {
		try {
			const reportedPost = await this.prisma.post.findUnique({
				where: { id: postId, deletedAt: null },
				select: { authorId: true },
			});
			if (!reportedPost)
				throw new NotFoundException("Post not found");
			if (reportedPost.authorId === currentUserId)
				throw new BadRequestException("You cannot report your own post");
			const existingReport = await this.prisma.report.findUnique({
				where: {
					reporterId_reportedPostId: {
					reporterId: currentUserId,
					reportedPostId: postId,
				},
			},
		});
		if (existingReport)
			throw new BadRequestException("You have already reported this post");

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
		if (error instanceof HttpException)
			throw error;
		console.log("Error reporting post:", error);
		throw new InternalServerErrorException("Could not report post");
	}
}

	async acceptReport(reportId: number, dto: HandleReportDto, userId: number, userRole: Role){
		try {
			const report = await this.prisma.report.findUnique({where: {id: reportId}})
			if (!report)
				throw new BadRequestException("Failed to find the report");

			if (!hasPermission(userRole, "REVIEW_POST_REPORT")) {
				throw new ForbiddenException("You do not have the right to review reports");
			}

			if (report.handledById !== userId){
				throw new ForbiddenException("You do not have the right to accept this report");
			}
			if (report.status !== ReportStatus.ASSIGNED) {
				throw new BadRequestException("Report must be assigned before being handled");
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
			// Soft delete the post if it exists
				await prisma.post.update({
					where: { id: report.reportedPostId },
					data: { deletedAt: new Date() },
				});
			} else {
			// Fallback: if report is associated with a user, update the all the reports for the same user
				await prisma.report.update({
					where: { id: reportId },
					data: {
						handledById: userId,
						moderatorMessage: dto.moderatorMessage,
						status: ReportStatus.ACCEPTED,
						handledAt: new Date(),
					},
				});
			}
		});
		return (true);
		}
		catch (error){
			if (error instanceof HttpException)
				throw error;
			console.error("Error accepting report:", error);
			throw new InternalServerErrorException("Could not accept report");
		}
	}

	async rejectReport(reportId: number, dto: HandleReportDto, userId: number, userRole: Role){
		try {
			const report = await this.prisma.report.findUnique({where: {id: reportId}})
			if (!report)
				throw new BadRequestException("Failed to find the report");

			if (!hasPermission(userRole, "REVIEW_POST_REPORT")) {
				throw new ForbiddenException("You do not have the right to review reports");
			}

			if (report.handledById !== userId){
				throw new ForbiddenException("You do not have the right to reject this report");
			}
			if (report.status !== ReportStatus.ASSIGNED) {
				throw new BadRequestException("Report must be assigned before being handled");
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
			// Soft delete the post if it exists
				await prisma.post.update({
					where: { id: report.reportedPostId },
					data: { deletedAt: new Date() },
				});
			} else {
			// Fallback: if report is associated with a user, update the all the reports for the same user
				await prisma.report.update({
					where: { id: reportId },
					data: {
						handledById: userId,
						moderatorMessage: dto.moderatorMessage,
						status: ReportStatus.REJECTED,
						handledAt: new Date(),
					},
				});
			}
		});
		return (true);

		}
		catch (error){
			if (error instanceof HttpException)
				throw error;
			console.error("Error rejecting report:", error);
			throw new InternalServerErrorException("Could not rejecting report");
		}
	}

	async getAllReportsForThisPost(postId: number, userRole: Role, ){
		try {
			if (!hasPermission(userRole, "REVIEW_POST_REPORT")) {
				throw new BadRequestException("You do not have the right to review posts reports");
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
				orderBy: { createdAt: "asc" }
			});
			return reports;
		}
		catch (error){
			if (error instanceof HttpException)
				throw error;
			console.error("Error fetching all the reports for this post:", error);
			throw new InternalServerErrorException("Could not fetch all the reports for this post");
		}
	}

	async getAllPendingPostReports(userRole: Role){
		try {
			if (!hasPermission(userRole, "REVIEW_POST_REPORT")) {
				throw new BadRequestException("You do not have the right to review posts reports");
			}

			const reportedPosts = await this.prisma.report.findMany({
				where: {
					reportedPostId: {not: null},
					status: ReportStatus.PENDING,
				},
				select: {
					id: true,
					reporter: {select: {id: true, username: true}},
					reportedPost: {
						select: {
							id: true,
							title: true,
							imageUrl: true,
							caption: true,
							createdAt: true,
							author: {select: {id: true, username: true}}
						}
					},
					reportCategory: true,
					reportDescription: true,
					createdAt: true,
					status: true,
					handledBy: {select: {id: true, username: true}},
				}
			});

			// Filter to keep only the first report for each unique post
			const seenPostIds = new Set<number>(); // Create a Set to track post IDs we've already seen. A Set only stores unique values
			// Initialize an array to store only one report per post
			const uniqueReports = [];
			// Loop through each report in the list of reported posts.
			for (const report of reportedPosts) {
				const postId = report.reportedPost.id;
				if (!seenPostIds.has(postId)) { // Check if we have NOT already encountered this post ID
					uniqueReports.push(report); //  If it's the first time, add this report to the uniqueReports array.
					seenPostIds.add(postId); // Add the post ID to the Set so we don't include another report for this post later.
				}
			}

			
			const postIds = uniqueReports.map(r => r.reportedPost.id);
			const allReports = await this.prisma.report.findMany({
				where: {
					reportedPostId: {in: postIds},
				},
				select: {
					reportedPost: {select: {id: true}},
				}
			});
			const reportCountByPostId = this.buildCountByKey(allReports, (report) => report.reportedPost.id);

			return uniqueReports.map(report => ({
				...report,
				reportCount: reportCountByPostId[report.reportedPost.id] ?? 0,
			}));
		}
		catch (error){
			if (error instanceof HttpException)
				throw error;
			console.error("Error fetching pending post reports:", error);
			throw new InternalServerErrorException("Could not fetch pending post reports");
		}
	}

	async getMyPostReports(userId: number, userRole: Role){
		try {
			if (!hasPermission(userRole, "REVIEW_POST_REPORT")) {
				throw new ForbiddenException("You do not have the right to review posts reports");
			}
	
			const reportedPosts = await this.prisma.report.findMany({
				where: {
					reportedPostId: {not: null},
					status: ReportStatus.ASSIGNED,
					handledById: userId,
				},
				select: {
					id: true,
					reporter: {select: {id: true, username: true}},
					reportedPost: {
						select: {
							id: true,
							title: true,
							imageUrl: true,
							caption: true,
							createdAt: true,
							author: {select: {id: true, username: true}}
						}
					},
					reportCategory: true,
					reportDescription: true,
					createdAt: true,
					status: true,
					handledBy: {select: {id: true, username: true}},
				},
				orderBy: { createdAt: "asc" }
			});

			const postIds = reportedPosts.map(r => r.reportedPost.id);
			const allReports = await this.prisma.report.findMany({
				where: {
					reportedPostId: {in: postIds},
				},
				select: {
					reportedPost: {select: {id: true}},
				}
			});
			const reportCountByPostId = this.buildCountByKey(allReports, (report) => report.reportedPost.id);

			return reportedPosts.map(report => ({
				...report,
				reportCount: reportCountByPostId[report.reportedPost.id] ?? 0,
			}));
		}
		catch (error){
			if (error instanceof HttpException)
				throw error;
			console.error("Error fetching user's assigned post reports:", error);
			throw new InternalServerErrorException("Could not fetch user's assigned post reports");
		}
	}

		async getAllAssignedPostReports(userRole: Role){
		try {
			if (!hasPermission(userRole, "REVIEW_POST_REPORT")) {
				throw new ForbiddenException("You do not have the right to review posts reports");
			}
			const reportedPosts = await this.prisma.report.findMany({
				where: {
					reportedPostId: {not: null},
					status: ReportStatus.ASSIGNED,
				},
				select: {
					id: true,
					reporter: {select: {id: true, username: true}},
					reportedPost: {
						select: {
							id: true,
							title: true,
							imageUrl: true,
							caption: true,
							createdAt: true,
							author: {select: {id: true, username: true}}
							}
						},
					reportCategory: true,
					reportDescription: true,
					createdAt: true,
					status: true,
					handledBy: {select: {id: true, username: true}},
				},
				orderBy: { createdAt: "asc" }
			});

			const postIds = reportedPosts.map(r => r.reportedPost.id);
			const allReports = await this.prisma.report.findMany({
				where: {
					reportedPostId: {in: postIds},
				},
				select: {
					reportedPost: {select: {id: true}},
				}
			});
			const reportCountByPostId = this.buildCountByKey(allReports, (report) => report.reportedPost.id);

			return reportedPosts.map(report => ({
				...report,
				reportCount: reportCountByPostId[report.reportedPost.id] ?? 0,
			}));
		}
		catch (error){
			if (error instanceof HttpException)
				throw error;
			console.error("Error fetching all assigned post reports:", error);
			throw new InternalServerErrorException("Could not fetch all assigned post reports");
		}
	}

		async getAllHandledPostReports(userRole: Role){
		try {
			if (!hasPermission(userRole, "REVIEW_POST_REPORT")) {
				throw new ForbiddenException("You do not have the right to review posts reports");
			}
			const reportedPosts = await this.prisma.report.findMany({
				where: {
					reportedPostId: {not: null},
					status: {in: [ReportStatus.ACCEPTED, ReportStatus.REJECTED],}
				},
				select: {
					id: true,
					reporter: {select: {id: true, username: true}},
					reportedPost: {
						select: {
							id: true,
							title: true,
							imageUrl: true,
							caption: true,
							createdAt: true,
							author: {select: {id: true, username: true}}
							}
						},
					reportCategory: true,
					reportDescription: true,
					createdAt: true,
					status: true,
					handledBy: {select: {id: true, username: true}},
					moderatorMessage: true,
					handledAt: true,
				},
				orderBy: { handledAt: "desc" }
			})
			const reportCountByPostId = this.buildCountByKey(reportedPosts, (report) => report.reportedPost.id);

			return reportedPosts.map(report => ({
				...report,
				reportCount: reportCountByPostId[report.reportedPost.id] ?? 0,
			}));
		}
		catch (error){
			if (error instanceof HttpException)
				throw error;
			console.error("Error fetching all assigned post reports:", error);
			throw new InternalServerErrorException("Could not fetch all assigned post reports");
		}
	}

	async getAllPendingUserReports(userRole: Role){
		try {
				if (!hasPermission(userRole, "REVIEW_USER_REPORT")) {
					throw new ForbiddenException("You do not have the right to review users reports");
				}
				const reportedUsers = await this.prisma.report.findMany({
					where: {
						reportedUserId: {not: null},
						status: ReportStatus.PENDING,
					},
					select: {
						id: true,
						reporter: {select: {username: true}},
						reportedUser: {
							select: {
								id: true,
								username: true,
							}},
						reportCategory: true,
						reportDescription: true,
						createdAt: true,
					}
				})
			return reportedUsers;
		}
		catch (error) {
			if (error instanceof HttpException)
				throw error;
			console.error("Error fetching pending user reports:", error);
			throw new InternalServerErrorException("Could not fetch pending user reports");
		}
	}

	async assignReport(reportId: number, userId: number, userRole: Role) {
		try {
			const report = await this.prisma.report.findUnique({where: {id: reportId}})
			if (!report)
				throw new BadRequestException("Failed to find the report");
			if (report.reportedUserId) {
				if (!hasPermission(userRole, "REVIEW_USER_REPORT")) {
					throw new ForbiddenException("You do not have permission to assign a user report");
				}
			}
			if (report.reportedPostId) {
				if (!hasPermission(userRole, "REVIEW_POST_REPORT")) {
					throw new ForbiddenException("You do not have permission to assign a post report");
				}
			}

			if (report.handledById){
				throw new BadRequestException("Report already assigned");
			}

			const assignedReport = await this.prisma.report.update({
				where: {id: reportId},
				data: {
					handledById: userId,
					status: ReportStatus.ASSIGNED},
			});
			return assignedReport
		}
		catch (error) {
			if (error instanceof HttpException)
				throw error;
			console.error("Error assigning the report:", error);
			throw new InternalServerErrorException("Could not assgin the report");
		}
	}

		async unassignReport(reportId: number, userId: number, userRole: Role) {
		try {
			const report = await this.prisma.report.findUnique({where: {id: reportId}})
			if (!report)
				throw new BadRequestException("Failed to find the report");
			if (report.reportedUserId) {
				if (!hasPermission(userRole, "REVIEW_USER_REPORT")) {
					throw new ForbiddenException("You do not have permission to unassign a user report");
				}
			}
			if (report.reportedPostId) {
				if (!hasPermission(userRole, "REVIEW_POST_REPORT")) {
					throw new ForbiddenException("You do not have permission to unassign a post report");
				}
			}

			if (!report.handledById){
				throw new BadRequestException("Report is not assigned");
			}
			if (report.handledById !== userId && userRole !== Role.ADMIN){
				throw new ForbiddenException("You cannot unassign this report");
			}

			const assignedReport = await this.prisma.report.update({
				where: {id: reportId},
				data: {
					handledById: null,
					status: ReportStatus.PENDING},
			});
			return assignedReport
		}
		catch (error) {
			if (error instanceof HttpException)
				throw error;
			console.error("Error unassigning the report:", error);
			throw new InternalServerErrorException("Could not unassgin the report");
		}
	}

	async getAdminLogs(userId: number, userRole: Role){

		// Check if the user is the post author or has the permission to delete the post
		if (!hasPermission(userRole, "VIEW_ADMIN_LOGS")) {
			throw new ForbiddenException("You do not have the right to see the administrator logs");
		}
		
		const logs = await this.prisma.moderationLog.findMany({
			select: {
				id: true,
				action: true,
				createdAt: true,
				actor: {select: {id: true, username: true}},
				targetUser: { select: { id: true, username: true } },
				targetPost: { select: { id: true, title: true }},
				targetBattle: { select: { id: true, theme: true }},
			},
			orderBy: {createdAt: 'desc'},
		});
		return logs;
	}
}
