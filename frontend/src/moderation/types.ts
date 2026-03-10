export enum ReportCategory {
	DELETE_ANY_POST = "DELETE_ANY_POST",
	CHANGE_ROLE = "CHANGE_ROLE",
	BAN_USER = "BAN_USER",
	CREATE_TOURNAMENT = "CREATE_TOURNAMENT",
	REVIEW_REPORT = "REVIEW_REPORT",
}
export enum ReportStatus {
	PENDING = "PENDING",
	ASSIGNED = "ASSIGNED",
	ACCEPTED = "ACCEPTED",
	REJECTED = "REJECTED",
}

export interface ModerationLogType {
	id: number;
	action: ReportCategory; 
	createdAt: Date;
	actor: {
		id: number;
		username: string;
	};
	targetUser?: {
		id: number;
		username: string;
	};
	targetPost?: {
		id: number;
		title: string;
	};
	targetBattle?: {
		id: number;
		theme: string;
	};
	status: ReportStatus;
	handledBy?: {
		id: number;
		username: string;
	}; 
}

export interface PostReportType {
	id: number;
	reporter:{
		id: number
		username: string;
	};
	reportedPost: {
		id: number;
		title: string;
		imageUrl: string,
		caption?: string,
		createdAt: string,
		author: {
			id: number;
			username: string;
		};
	}
	reportCategory: ReportCategory;
	reportDescription: string;
	handledBy?: {
		id: number;
		username: string;
	};
	status: ReportStatus;
	createdAt: string;
	handledAt?: string;
}

// export type ReportType = {
// 	id: number;

// 	reporter: {
// 		id: number;
// 		username: string;
// 	};

// 	reportedUser?: {
// 		id: number;
// 		username: string;
// 	};
// 	reportedPost?: {
// 		id: number;
// 		title: string;
// 		caption?: string;
// 		imageUrl: string;
// 		createdAt: string;
// 		author: {
// 			id: number;
// 			username: string;
// 		};
// 	};
// 	reportCategory: string;
// 	reportDescription?: string;
// 	moderatorMessage?: string;
// 	status: ReportStatus;
// };