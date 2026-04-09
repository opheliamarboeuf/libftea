import { PostReportType, UserReportType, ModerationLogType } from './types';
import { ReportHandlePayload } from './types';
import { ReportStatus, ReportCategory, ModerationLogCategory } from './types';
import { mockDatabase } from '../mockData';

// Helper function to map mock logs to ModerationLogType
const mapModerationLog = (log: (typeof mockDatabase.moderationLogs)[0]): ModerationLogType => {
	const actor = mockDatabase.users.find((u) => u.id === log.actorId) || {
		id: log.actorId,
		username: 'Unknown',
	};
	const targetUser = log.targetUserId
		? mockDatabase.users.find((u) => u.id === log.targetUserId)
		: undefined;
	const targetPost = log.targetPostId
		? mockDatabase.posts.find((p) => p.id === log.targetPostId)
		: undefined;

	return {
		id: log.id,
		action: log.action as unknown as ModerationLogCategory,
		createdAt: log.createdAt,
		actor: {
			id: actor.id,
			username: actor.username,
		},
		targetUser: targetUser
			? {
					id: targetUser.id,
					username: targetUser.username,
				}
			: undefined,
		targetPost: targetPost
			? {
					id: targetPost.id,
					title: targetPost.title,
					author: targetPost.author
						? {
								id: targetPost.author.id,
								username: targetPost.author.username,
							}
						: { id: 0, username: 'Unknown' },
				}
			: undefined,
		status: 'PENDING' as ReportStatus,
	};
};

// Helper function to map mock reports to UserReportType
const mapUserReport = (report: (typeof mockDatabase.reports)[0]): UserReportType | null => {
	if (!report.reportedUserId) return null;

	const reportedUser = mockDatabase.users.find((u) => u.id === report.reportedUserId);
	const reporter = mockDatabase.users.find((u) => u.id === report.reporterId);
	const handledByUser = report.handledById
		? mockDatabase.users.find((u) => u.id === report.handledById)
		: undefined;

	if (!reportedUser || !reporter) return null;

	return {
		id: report.id,
		reporter: {
			id: reporter.id,
			username: reporter.username,
		},
		reportedUser: {
			id: reportedUser.id,
			username: reportedUser.username,
			profile: reportedUser.profile,
		},
		reportCategory: report.reportCategory as unknown as ReportCategory,
		reportDescription: report.reportDescription,
		handledBy: handledByUser
			? {
					id: handledByUser.id,
					username: handledByUser.username,
				}
			: undefined,
		status: report.status as ReportStatus,
		createdAt: report.createdAt.toISOString(),
		moderatorMessage: report.moderatorMessage,
		handledAt: report.handledAt?.toISOString(),
	};
};

// Helper function to map mock reports to PostReportType
const mapPostReport = (report: (typeof mockDatabase.reports)[0]): PostReportType | null => {
	if (!report.reportedPostId) return null;

	const reportedPost = mockDatabase.posts.find((p) => p.id === report.reportedPostId);
	const reporter = mockDatabase.users.find((u) => u.id === report.reporterId);
	const handledByUser = report.handledById
		? mockDatabase.users.find((u) => u.id === report.handledById)
		: undefined;

	if (!reportedPost || !reporter || !reportedPost.author) return null;

	return {
		id: report.id,
		reporter: {
			id: reporter.id,
			username: reporter.username,
		},
		reportedPost: {
			id: reportedPost.id,
			title: reportedPost.title,
			imageUrl: reportedPost.imageUrl,
			caption: reportedPost.caption,
			createdAt: reportedPost.createdAt.toISOString(),
			author: {
				id: reportedPost.author.id,
				username: reportedPost.author.username,
			},
		},
		reportCategory: report.reportCategory as unknown as ReportCategory,
		reportDescription: report.reportDescription,
		handledBy: handledByUser
			? {
					id: handledByUser.id,
					username: handledByUser.username,
				}
			: undefined,
		status: report.status as ReportStatus,
		createdAt: report.createdAt.toISOString(),
		moderatorMessage: report.moderatorMessage,
		handledAt: report.handledAt?.toISOString(),
	};
};

export const moderationApi = {
	fetchAdminLogs: async () => {
		// Return mock moderation logs
		return mockDatabase.moderationLogs.map(mapModerationLog);
	},

	fetchModLogs: async () => {
		// Return mock moderation logs (same as admin for this implementation)
		return mockDatabase.moderationLogs.map(mapModerationLog);
	},

	// ---------------------------------- CHANGE ROLES  -----------------------------------

	changeAdminRole: async (userId: number) => {
		// Mock implementation - just return success
		const user = mockDatabase.users.find((u) => u.id === userId);
		if (user) {
			user.role = 'ADMIN';
		}
		return user;
	},

	changeModRole: async (userId: number) => {
		// Mock implementation - just return success
		const user = mockDatabase.users.find((u) => u.id === userId);
		if (user) {
			user.role = 'MOD';
		}
		return user;
	},

	// ---------------------------------- HANDLE REPORTS ----------------------------------

	rejectReport: async (
		reportId: number,
		payload: ReportHandlePayload,
	): Promise<PostReportType> => {
		// Mock implementation - update report status and return it
		const report = mockDatabase.reports.find((r) => r.id === reportId);
		if (report) {
			report.status = 'REJECTED';
			report.moderatorMessage = payload.moderatorMessage;
			report.handledAt = new Date();
		}

		const mapped = report ? mapPostReport(report) : null;
		if (!mapped) throw new Error('Report not found');
		return mapped;
	},

	acceptReport: async (
		reportId: number,
		payload: ReportHandlePayload,
	): Promise<PostReportType> => {
		// Mock implementation - update report status and return it
		const report = mockDatabase.reports.find((r) => r.id === reportId);
		if (report) {
			report.status = 'ACCEPTED';
			report.moderatorMessage = payload.moderatorMessage;
			report.handledAt = new Date();
		}

		const mapped = report ? mapPostReport(report) : null;
		if (!mapped) throw new Error('Report not found');
		return mapped;
	},

	assignPendingReport: async (reportId: number) => {
		// Mock implementation
		const report = mockDatabase.reports.find((r) => r.id === reportId);
		if (report) {
			report.status = 'ASSIGNED' as unknown as typeof report.status;
		}
		return report;
	},

	unassignPendingReport: async (reportId: number) => {
		// Mock implementation
		const report = mockDatabase.reports.find((r) => r.id === reportId);
		if (report) {
			report.status = 'PENDING' as unknown as typeof report.status;
		}
		return report;
	},

	// ---------------------------------- BAN USERS ----------------------------------

	banUser: async (targetId: number) => {
		// Mock implementation
		const user = mockDatabase.users.find((u) => u.id === targetId);
		if (user) {
			user.bannedAt = new Date();
		}
		return user;
	},

	unbanUser: async (targetId: number) => {
		// Mock implementation
		const user = mockDatabase.users.find((u) => u.id === targetId);
		if (user) {
			user.bannedAt = null;
		}
		return user;
	},

	// ---------------------------------- USER REPORTS ----------------------------------

	reportUser: async (): Promise<void> => {
		// Mock implementation - create a new report
		// This would normally be created in the backend
	},

	fetchPendingUserReport: async () => {
		// Return pending user reports from mock data
		return mockDatabase.reports
			.filter((r) => r.reportedUserId && r.status === 'PENDING')
			.map(mapUserReport)
			.filter((r): r is UserReportType => r !== null);
	},

	fetchMyUserReports: async (): Promise<UserReportType[]> => {
		// Mock implementation - return assigned reports
		return mockDatabase.reports
			.filter((r) => r.reportedUserId && (r.status as unknown as string) === 'ASSIGNED')
			.map(mapUserReport)
			.filter((r): r is UserReportType => r !== null);
	},

	fetchAllReportsForThisUser: async (reportId: number): Promise<UserReportType[]> => {
		// Mock implementation - return reports for a specific user
		const report = mockDatabase.reports.find((r) => r.id === reportId);
		if (!report || !report.reportedUserId) return [];

		return mockDatabase.reports
			.filter((r) => r.reportedUserId === report.reportedUserId)
			.map(mapUserReport)
			.filter((r): r is UserReportType => r !== null);
	},

	fetchAllAssignedUserReports: async (): Promise<UserReportType[]> => {
		// Return assigned user reports from mock data
		return mockDatabase.reports
			.filter((r) => r.reportedUserId && (r.status as unknown as string) === 'ASSIGNED')
			.map(mapUserReport)
			.filter((r): r is UserReportType => r !== null);
	},

	fetchAllHandledUserReports: async (): Promise<UserReportType[]> => {
		// Return handled (accepted or rejected) user reports from mock data
		return mockDatabase.reports
			.filter((r) => r.reportedUserId && (r.status === 'ACCEPTED' || r.status === 'REJECTED'))
			.map(mapUserReport)
			.filter((r): r is UserReportType => r !== null);
	},

	// ---------------------------------- POST REPORTS ----------------------------------

	reportPost: async (): Promise<void> => {
		// Mock implementation - create a new report
		// This would normally be created in the backend
	},

	fetchPendingPostReports: async (): Promise<PostReportType[]> => {
		// Return pending post reports from mock data
		return mockDatabase.reports
			.filter((r) => r.reportedPostId && r.status === 'PENDING')
			.map(mapPostReport)
			.filter((r): r is PostReportType => r !== null);
	},

	fetchMyPostReports: async (): Promise<PostReportType[]> => {
		// Mock implementation - return assigned reports
		return mockDatabase.reports
			.filter((r) => r.reportedPostId && (r.status as unknown as string) === 'ASSIGNED')
			.map(mapPostReport)
			.filter((r): r is PostReportType => r !== null);
	},

	fetchAllReportsForThisPost: async (reportId: number): Promise<PostReportType[]> => {
		// Mock implementation - return reports for a specific post
		const report = mockDatabase.reports.find((r) => r.id === reportId);
		if (!report || !report.reportedPostId) return [];

		return mockDatabase.reports
			.filter((r) => r.reportedPostId === report.reportedPostId)
			.map(mapPostReport)
			.filter((r): r is PostReportType => r !== null);
	},

	fetchAllAssignedPostReports: async (): Promise<PostReportType[]> => {
		// Return assigned post reports from mock data
		return mockDatabase.reports
			.filter((r) => r.reportedPostId && (r.status as unknown as string) === 'ASSIGNED')
			.map(mapPostReport)
			.filter((r): r is PostReportType => r !== null);
	},

	fetchAllHandledPostReports: async (): Promise<PostReportType[]> => {
		// Return handled (accepted or rejected) post reports from mock data
		return mockDatabase.reports
			.filter((r) => r.reportedPostId && (r.status === 'ACCEPTED' || r.status === 'REJECTED'))
			.map(mapPostReport)
			.filter((r): r is PostReportType => r !== null);
	},
};
