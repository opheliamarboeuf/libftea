export interface ProfileData {
	bio: string;
	displayName: string;
	avatarUrl: string | null;
	coverUrl: string | null;
}

export interface ProfileEditForm {
	bio: string;
	displayName: string;
	avatarFile: File | null;
	coverFile: File | null;
}

export interface ProfileUpdateResponse {
	bio: string;
	displayName: string;
	avatarUrl: string | null;
	coverUrl: string | null;
}

export enum ReportUserCategoryType {
	SPAM = "SPAM",
	HARASSMENT = "HARASSMENT",
	INAPPROPRIATE_CONTENT = "INAPPROPRIATE_CONTENT",
	OTHER = "OTHER",
}

export interface ReportUserType {
	category: ReportUserCategoryType; 
	description?: string;
}
