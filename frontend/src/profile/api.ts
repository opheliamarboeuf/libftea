import { ProfileUpdateResponse } from "./types";
import i18n from "../i18n";

// Base URL of the backend API
const API_URL = "http://localhost:3000";

// API object that handles all profile-related requests
export const profileApi = {
	async updateProfile(
		bio: string,
		avatarFile: File | null,
		coverFile: File | null
	): Promise<ProfileUpdateResponse> {
		// Create a FormData object to send text fields and optional files
		const formData = new FormData();
		formData.append("bio", bio);
		if (avatarFile) formData.append("avatar", avatarFile);
		if (coverFile) formData.append("cover", coverFile);

		// Send the request to the backend with Authorization header
		const res = await fetch(`${API_URL}/profile/edit`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			body: formData,
		});

		// Parse JSON response from the server
		const data = await res.json();

		// If the request failed, extract the error message and throw an error
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || "Profile edit failed";
			throw new Error(message);
		}
		return data;
	},
	async getUserTournamentPosts(userId: number) : Promise<any[]> {
		const res = await fetch(`${API_URL}/tournament/user/${userId}/posts`, {
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
		});
		if (res.status === 204)
				return [];
		const data = await res.json();
		if (!res.ok)
		{
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || i18n.t('tournament.joinfail');
			throw new Error(message);
		}
		return data;
	}
};

export { API_URL };
