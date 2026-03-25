<<<<<<< HEAD
import i18n from "../i18n";

const API_URL = 'http://localhost:3000/comments';
=======
const API_URL = import.meta.env.VITE_API_URL;
>>>>>>> main

export const commentsApi = {
    createComment: async (postId: number, content: string) => {
        const res = await fetch(`${API_URL}/comments/post/${postId}`, {
            method: 'POST',
			credentials: 'include',
			headers: {
                'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem("token")}`,
		    },
            body: JSON.stringify({ content }),
        });

        if (!res.ok) {
            throw new Error(i18n.t('errorcomments.create'));
        }
        
        const text = await res.text();
		return  text ? JSON.parse(text) : null;
    },

    deleteComment: async (commentId: number) => {
         const res = await fetch(`${API_URL}/comments/${commentId}`, {
            method: 'DELETE',
			credentials: 'include',
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
		    },
        });

        if (!res.ok) {
            throw new Error(i18n.t('errorcomments.delete'));
        }

		const data = await res.json();
        return data;
    },

    replyComment: async (parentCommentId: number, content: string) => {
        const res = await fetch(`${API_URL}/comments/${parentCommentId}/reply`, {
            method: 'POST',
			credentials: 'include',
			headers: {
                'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem("token")}`,
		    },
            body: JSON.stringify({ content }),
        });

        if (!res.ok) {
            throw new Error(i18n.t('errorcomments.reply'));
        }

		return res.json();
    },

    getComments: async (postId: number) => {
        const res = await fetch(`${API_URL}/comments/post/${postId}`, {
            method: 'GET',
			credentials: 'include',
			headers: {
				Authorization: `Bearer ${localStorage.getItem("token")}`,
		    },
        });

        if (!res.ok) {
            throw new Error(i18n.t('errorcomments.get'));
        }

		const text = await res.text();
		return  text ? JSON.parse(text) : [];
    }
}