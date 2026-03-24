export interface ProfileData {
	bio: string;
	avatarUrl: string | null;
	coverUrl: string | null;
}

export interface ProfileEditForm {
	bio: string;
	avatarFile: File | null;
	coverFile: File | null;
}

export interface ProfileUpdateResponse {
	bio: string;
	avatarUrl: string | null;
	coverUrl: string | null;
}
