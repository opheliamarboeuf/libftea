import { ProfileUpdateResponse } from "./types";

const API_URL = "http://localhost:3000";

export const profileApi = {
	async updateProfile(
		bio: string,
		displayName: string,
		avatarFile: File | null,
		coverFile: File | null
	): Promise<ProfileUpdateResponse> {
		const formData = new FormData();
		formData.append("bio", bio);
		formData.append("displayName", displayName);
		if (avatarFile) formData.append("avatar", avatarFile);
		if (coverFile) formData.append("cover", coverFile);

		const res = await fetch(`${API_URL}/profile/edit`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
			},
			body: formData,
		});

		const data = await res.json();

		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || "Profile edit failed";
			throw new Error(message);
		}

		return data;
	},
};

export { API_URL };
