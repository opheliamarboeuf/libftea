import { ProfileUpdateResponse } from "./types";
import { ReportUserType } from "./types";

// Base URL of the backend API
const API_URL = "http://localhost:3000";

// API object that handles all profile-related requests
export const profileApi = {
	async updateProfile(
		bio: string,
		displayName: string,
		avatarFile: File | null,
		coverFile: File | null
	): Promise<ProfileUpdateResponse> {
		// Create a FormData object to send text fields and optional files
		const formData = new FormData();
		formData.append("bio", bio);
		formData.append("displayName", displayName);
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

	reportUser: async (
			payload: ReportUserType,
			targetId: number,
		): Promise<void> => {
			const res = await fetch(`${API_URL}/users/${targetId}/report`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify(payload),
			});
			const data = await res.json();
			if (!res.ok) {
				const message = Array.isArray(data.message)
					? data.message[0]
					: data.message || "User report failed";
				throw new Error(message);
			}
		},
};

export { API_URL };
