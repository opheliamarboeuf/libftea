import { useState, useEffect } from "react";
import { commentsApi } from "./api";
import { socket } from "../socket/socket";
import { useUser } from "../context/UserContext";

interface User {
    id: number;
    username: string;
}

export interface Comment {
    id: number;
    content: string;
    createdAt: string;
    user: User;
    replies?: Comment[];
}

export const useComments = (postId: number) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
	const { user } = useUser();

    useEffect(() => {
        const fetchComments = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await commentsApi.getComments(postId);
                setComments(data || []);
            } catch (err) {
                setError(err.message || "Failed to load comments");
            } finally {
                setLoading(false);
            }
        };
        fetchComments();
    }, [postId]);

	useEffect(() => {
		const handleNewComment = (comment: Comment) => {
			if (comment.postId === postId) {
				setComments(prev => [...prev, comment]);
			}
		};
		const handleDeletedComment = (commentId: number) => {
			setComments(prev => removeComment(prev, commentId));
		};

		socket.on("comment_created", handleNewComment);
		socket.on("comment_deleted", handleDeletedComment);

		return () => {
			socket.off("comment_created", handleNewComment);
			socket.off("comment_deleted", handleDeletedComment);
		}
	}, [postId]);

    const createComment = (content: string) => {
		socket.emit("create_comment", {
			postId,
			userId:user.id,
			content,
		});
        // try {
        //     const newComment = await commentsApi.createComment(postId, content);
        //     if (newComment) setComments(prev => [...prev, newComment]);
        // } catch (err) {
        //     setError(err.message || "Failed to create comment");
        // }
    };

    const removeComment = (arr: Comment[], commentId: number): Comment[] => {
        return arr.filter(c => c.id !== commentId).map(c => ({ ...c, replies: c.replies ? removeComment(c.replies, commentId) : []}));
    }
    const deleteComment = (commentId: number) => {
		setComments(prev => removeComment(prev, commentId));
		socket.emit("delete_comment", {
			commentId,
			userId:user.id,
		});
        // try {
        //     await commentsApi.deleteComment(commentId);
        //     setComments(prev => removeComment(prev, commentId));
        // } catch (err) {
        //     setError(err.message || "Failed to delete comment");
        // }
    };

    const replyComment = async (parentCommentId: number, content: string) => {
        try {
            const reply = await commentsApi.replyComment(parentCommentId, content);
            const addReply = (arr: Comment[]) : Comment[] => {
                return arr.map(c => {
                    if (c.id === parentCommentId) {
                        return {...c, replies: [...(c.replies || []), reply]};
                    }
                    if (c.replies && c.replies.length > 0) {
                        return {...c, replies: addReply(c.replies)};
                    }
                    return c;
                });
            };
            setComments(prev => addReply(prev));
        } catch (err) {
            setError(err.message || "Failed to reply to comment");
        }
    };

    return { comments, loading, error, createComment, deleteComment, replyComment };
}