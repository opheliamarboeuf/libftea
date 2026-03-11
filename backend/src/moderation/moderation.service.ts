import { PrismaService } from "src/prisma/prisma.service";
import { Injectable, BadRequestException, ForbiddenException } from "@nestjs/common";
import { hasPermission } from "src/auth/permissions";
import { ReportStatus, Role } from "@prisma/client";
import { InternalServerErrorException, HttpException } from "@nestjs/common";
import { HandleReportDto } from './dto/handleReport.dto';

@Injectable()
export class ModerationService {
	constructor(
		private prisma: PrismaService,
	) {}

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
			// Update report status
				await prisma.report.update({
					where: { id: reportId },
					data: {
						handledById: userId,
						moderatorMessage: dto.moderatorMessage,
						status: ReportStatus.ACCEPTED,
						handledAt: new Date(),
					},
				});
			// Soft delete the post if it exists
			if (report.reportedPostId) {
				await prisma.post.update({
					where: { id: report.reportedPostId },
					data: { deletedAt: new Date() },
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

			const rejectReport = await this.prisma.report.update({
				where: {id: reportId},
				data: {
					handledById: userId,
					moderatorMessage : dto.moderatorMessage,
					status: ReportStatus.REJECTED,
					handledAt: new Date(),
				}
			});
			return rejectReport

		}
		catch (error){
			if (error instanceof HttpException)
				throw error;
			console.error("Error rejecting report:", error);
			throw new InternalServerErrorException("Could not rejecting report");
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
			})
			return reportedPosts;
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
				}
			})
			return reportedPosts;
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
				}
			})
			return reportedPosts;
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
