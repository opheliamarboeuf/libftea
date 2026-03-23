import { PostReportType, UserReportType } from './types';
import { CreateReportType, ReportHandlePayload } from './types';
import i18n from '../i18n';

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
				: data.message || i18n.t('modfail.fetchlogsadmin');
			throw new Error(message);
		}
		return data;
	},

	fetchModLogs: async () => {
		const res = await fetch(`${API_URL}/moderation/mod/logs`, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
		});

		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || i18n.t('modfail.fetchlogsmod');
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
				: data.message || i18n.t('modfail.changeroleadmin');
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
			throw new Error(data.message || i18n.t('modfail.changerolemod'));
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
				: data.message || i18n.t('modfail.reject');
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
				: data.message || i18n.t('modfail.accept');
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
				: data.message || i18n.t('modfail.assign');
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
				: data.message || i18n.t('modfail.unassign');
			throw new Error(message);
		}
		return data;
	},

	// ---------------------------------- BAN USERS ----------------------------------

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
				: data.message || i18n.t('modfail.ban');
			throw new Error(message);
		}
		return data;
	},

	unbanUser: async (targetId: number) => {
		const res = await fetch(`${API_URL}/moderation/unban/${targetId}`, {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${localStorage.getItem('token')}`,
			},
		});

		const data = await res.json();
		if (!res.ok) {
			const message = Array.isArray(data.message)
				? data.message[0]
				: data.message || i18n.t('modfail.unban');
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
				: data.message || i18n.t('modfail.userreport');
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
				: data.message || i18n.t('modfail.fetchreports');
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
				: data.message || i18n.t('modfail.fetchuserreports');
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
				: data.message || i18n.t('modfail.fetchalluser');
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
				: data.message || i18n.t('modfail.fetchassigned');
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
				: data.message || i18n.t('modfail.fetchhandled');
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
				: data.message || i18n.t('modfail.postreport');
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
				: data.message || i18n.t('modfail.fetchpost');
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
				: data.message || i18n.t('modfail.fetchpostreports');
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
				: data.message || i18n.t('modfail.fetchallpost');
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
				: data.message || i18n.t('modfail.fetchassignedpost');
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
				: data.message || i18n.t('modfail.fetchhandledpost');
			throw new Error(message);
		}
		return data;
	},
};
