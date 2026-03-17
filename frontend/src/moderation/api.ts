import { PostReportType, UserReportType } from './types';
import { CreateReportType, ReportHandlePayload } from './types';

const API_URL = 'http://localhost:3000';

export const moderationApi = {
	fetchAdminLogs: async () => {
		const res = await fetch(`${API_URL}/moderation/admin/logs`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
		});

		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || 'Fetch amdin logs failed';
			throw new Error(message);
		}
		return data;
	},

	// ---------------------------------- CHANGE ROLES  -----------------------------------

	changeAdminRole: async (userId: number) => {
		const res = await fetch(`${API_URL}/moderation/role/admin/${userId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
		});

		const data = await res.json();

		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || 'Change admin role failed';
			throw new Error(message);
		}

		return data;
	},

	changeModRole: async (userId: number) => {
		const res = await fetch(`${API_URL}/moderation/role/mod/${userId}`, {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
		});

		const data = await res.json();

		if (!res.ok) {
			throw new Error(data.message || 'Change mod role failed');
		}

		return data;
	},

	// ---------------------------------- HANDLE REPORTS ----------------------------------

	rejectReport: async (
		reportId: number,
		payload: ReportHandlePayload,
	): Promise<PostReportType> => {
		const res = await fetch(`${API_URL}/moderation/reports/${reportId}/reject`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
			body: JSON.stringify(payload),
		});

		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || 'Reject report failed';
			throw new Error(message);
		}
		return data;
	},

	acceptReport: async (
		reportId: number,
		payload: ReportHandlePayload,
	): Promise<PostReportType> => {
		const res = await fetch(`${API_URL}/moderation/reports/${reportId}/accept`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
			body: JSON.stringify(payload),
		});

		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || 'Accept report failed';
			throw new Error(message);
		}
		return data;
	},

	assignPendingReport: async (reportId: number) => {
		const res = await fetch(`${API_URL}/moderation/reports/${reportId}/assign`, {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
		});

		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || 'Assign report failed';
			throw new Error(message);
		}
		return data;
	},

	unassignPendingReport: async (reportId: number) => {
		const res = await fetch(`${API_URL}/moderation/reports/${reportId}/unassign`, {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
		});

		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || 'Unassign report failed';
			throw new Error(message);
		}
		return data;
	},

	// ---------------------------------- USER REPORTS ----------------------------------

	banUser: async (targetId: number) => {
		const res = await fetch(`${API_URL}/moderation/ban/${targetId}`, {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
		});

		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || 'Bann user failed';
			throw new Error(message);
		}
		return data;
	},

	// ---------------------------------- USER REPORTS ----------------------------------

	reportUser: async (payload: CreateReportType, userId: number): Promise<void> => {
		const res = await fetch(`${API_URL}/moderation/reports/users/${userId}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
			body: JSON.stringify(payload),
		});
		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || 'User report failed';
			throw new Error(message);
		}
	},

	fetchPendingUserReport: async () => {
		const res = await fetch(`${API_URL}/moderation/reports/users/pending`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
		});

		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || 'Fetch pending users reports failed';
			throw new Error(message);
		}
		return data;
	},

	fetchMyUserReports: async (): Promise<UserReportType[]> => {
		const res = await fetch(`${API_URL}/moderation/reports/users/mine`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
		});

		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || 'Failed to fetch the users reports for this user';
			throw new Error(message);
		}
		return data;
	},

	fetchAllReportsForThisUser: async (reportId: number): Promise<UserReportType[]> => {
		const res = await fetch(`${API_URL}/moderation/reports/users/all/${reportId}`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
		});

		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || 'Fetch all reports for this user failed';
			throw new Error(message);
		}
		return data;
	},

	fetchAllAssignedUserReports: async (): Promise<UserReportType[]> => {
		const res = await fetch(`${API_URL}/moderation/reports/users/all/assigned`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
		});

		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || 'Fetch all assigned user reports failed';
			throw new Error(message);
		}
		return data;
	},

	fetchAllHandledUserReports: async (): Promise<UserReportType[]> => {
		const res = await fetch(`${API_URL}/moderation/reports/users/all/handled`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
		});

		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || 'Fetch all assigned post reuserports failed';
			throw new Error(message);
		}
		return data;
	},

	// ---------------------------------- POST REPORTS ----------------------------------

	reportPost: async (payload: CreateReportType, postId: number): Promise<void> => {
		const res = await fetch(`${API_URL}/moderation/reports/posts/${postId}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
			body: JSON.stringify(payload),
		});
		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || 'Post report failed';
			throw new Error(message);
		}
	},

	fetchPendingPostReports: async (): Promise<PostReportType[]> => {
		const res = await fetch(`${API_URL}/moderation/reports/posts/pending`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
		});

		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || 'Fetch pending post reports failed';
			throw new Error(message);
		}
		return data;
	},

	fetchMyPostReports: async (): Promise<PostReportType[]> => {
		const res = await fetch(`${API_URL}/moderation/reports/posts/mine`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
		});

		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || 'Failed to fetch the post reports for this user';
			throw new Error(message);
		}
		return data;
	},

	fetchAllReportsForThisPost: async (reportId: number): Promise<PostReportType[]> => {
		const res = await fetch(`${API_URL}/moderation/reports/posts/all/${reportId}`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
		});

		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || 'Fetch all reports for this post failed';
			throw new Error(message);
		}
		return data;
	},

	fetchAllAssignedPostReports: async (): Promise<PostReportType[]> => {
		const res = await fetch(`${API_URL}/moderation/reports/posts/all/assigned`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
		});

		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || 'Fetch all assigned post reports failed';
			throw new Error(message);
		}
		return data;
	},

	fetchAllHandledPostReports: async (): Promise<PostReportType[]> => {
		const res = await fetch(`${API_URL}/moderation/reports/posts/all/handled`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
		});

		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || 'Fetch all assigned post reports failed';
			throw new Error(message);
		}
		return data;
	},
};
