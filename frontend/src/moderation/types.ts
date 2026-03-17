export enum ModerationActionType {
	DELETE_ANY_POST = "DELETE_ANY_POST",
	CHANGE_ROLE = "CHANGE_ROLE",
	BAN_USER = "BAN_USER",
	CREATE_TOURNAMENT = "CREATE_TOURNAMENT",
	REVIEW_REPORT = "REVIEW_REPORT",
}

export interface ModerationLogType {
	id: number;
	action: ModerationActionType; 
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
}
