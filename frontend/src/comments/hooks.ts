import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { mockDatabase } from '../mockData';

interface User {
	id: number;
	username: string;
}

export interface Comment {
	id: number;
	content: string;
	createdAt: string;
	user: User;
	userId: number;
	postId: number;
	replies?: Comment[];
}

export const useComments = (postId: number) => {
	const [comments, setComments] = useState<Comment[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const { user } = useUser();

	useEffect(() => {
		const fetchComments = () => {
			setLoading(true);
			setError(null);
			try {
				const postComments = mockDatabase.comments
					.filter((c) => c.postId === postId && !c.parentId)
					.map((c) => {
						const author = mockDatabase.users.find((u) => u.id === c.userId);
						return {
							id: c.id,
							content: c.content,
							createdAt: c.createdAt.toISOString(),
							user: { id: author?.id ?? c.userId, username: author?.username ?? '' },
							userId: c.userId,
							postId: c.postId,
							replies: (c.replies ?? []).map((r) => {
								const replyAuthor = mockDatabase.users.find(
									(u) => u.id === r.userId,
								);
								return {
									id: r.id,
									content: r.content,
									createdAt: r.createdAt.toISOString(),
									user: {
										id: replyAuthor?.id ?? r.userId,
										username: replyAuthor?.username ?? '',
									},
									userId: r.userId,
									postId: r.postId,
									replies: [],
								};
							}),
						};
					});
				setComments(postComments);
			} catch (err: any) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};
		fetchComments();
	}, [postId]);

	const createComment = (content: string) => {
		// Mock: add comment to local state
		const newComment: Comment = {
			id:
				Math.max(
					0,
					...comments.map((c) => c.id),
					...comments.flatMap((c) => c.replies?.map((r) => r.id) ?? []),
				) + 1,
			content,
			createdAt: new Date().toISOString(),
			user,
			userId: user.id,
			postId,
		};
		setComments((prev) => [...prev, newComment]);
	};

	const removeComment = (arr: Comment[], commentId: number): Comment[] => {
		return arr
			.filter((c) => c.id !== commentId)
			.map((c) => ({ ...c, replies: c.replies ? removeComment(c.replies, commentId) : [] }));
	};
	const deleteComment = (commentId: number) => {
		setComments((prev) => removeComment(prev, commentId));
	};

	const replyComment = async (parentCommentId: number, content: string) => {
		// Mock: add reply to local state
		const reply: Comment = {
			id:
				Math.max(
					0,
					...comments.map((c) => c.id),
					...comments.flatMap((c) => c.replies?.map((r) => r.id) ?? []),
				) + 1,
			content,
			createdAt: new Date().toISOString(),
			user,
			userId: user.id,
			postId,
		};
		setComments((prev) => {
			const addReply = (arr: Comment[]): Comment[] => {
				return arr.map((c) => {
					if (c.id === parentCommentId) {
						return { ...c, replies: [...(c.replies || []), reply] };
					}
					if (c.replies && c.replies.length > 0) {
						return { ...c, replies: addReply(c.replies) };
					}
					return c;
				});
			};
			return addReply(prev);
		});
	};

	return { comments, loading, error, createComment, deleteComment, replyComment };
};
