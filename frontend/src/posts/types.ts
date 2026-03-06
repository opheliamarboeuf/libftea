export interface PostPayload {
	title: string;
	caption?: string;
}

export interface PostEditPayload {
	title?: string;
	caption?: string;
}

export enum ReportPostCategoryType {
	SPAM = "SPAM",
	HARASSMENT = "HARASSMENT",
	INAPPROPRIATE_CONTENT = "INAPPROPRIATE_CONTENT",
	OTHER = "OTHER",
}

export interface ReportPostType {
	category: ReportPostCategoryType; 
	description?: string;
}
