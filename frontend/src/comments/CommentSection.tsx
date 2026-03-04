import { likesApi } from "./api";
import { useComments } from "./hooks";
import { useUser } from "../context/UserContext";
import { useState } from "react";
import "./CommentSection.css";

interface Props {
    postId: number;
}

export function CommentSection({ postId }: Props) {
    const { comments, loading, error, createComment, deleteComment, replyComment } = useComments(postId);
    const { user } = useUser();
    const [newComment, setNewcomment] = useState("");
    const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState("");

    const handleCommentSubmit = async () => {
        if (!newComment.trim()) return;
        await createComment(newComment.trim());
        setNewcomment("");
    };

    const handleReplySubmit = async (parentId: number) => {
        if (!replyContent.trim()) return;
        await replyComment(parentId, replyContent.trim());
        setReplyContent("");
        setActiveReplyId(null);
    };

    const renderReplies = (replies: any[]) => (
        <ul className="replies-list">
            {replies.map(reply => (
                <li key={reply.id} className="reply-item">
                    <p>
                        <strong>{reply.user.username}</strong> • {new Date(reply.createdAt).toLocaleString()}
                    </p>
                    <p>{reply.content}</p>
                    {reply.userId === user?.id && (
                        <button onClick={() => deleteComment(reply.id)}>Delete</button>
                    )}
                </li>
            ))}
        </ul>
    );

	return (
		<div className="comment-section">
            <div className="new-comment">
                <input
                    type="text"
                    placeholer="Leave a comment..."
                    value={newComment}
                    onChange={(e) => setNewcomment(e.target.value)}
                    onFocus={() => setActiveReplyId(null)}
                />
                {newComment.trim() && (
                    <button onClick={handleCommentSubmit}>Comment</button>
                )}
            </div>
            {loading && <p>Loading comments...</p>}
            {error && <p className="error">{error}</p>}
            <ul className="comments-list">
                {comments.map(comment => (
                    <li key={comment.id} className="comment-item">
                        <p>
                           <strong>{comment.user.username}</strong> • {new Date(comment.createdAt).toLocaleString()}
                        </p>
                        <p>{comment.content}</p>
                        <div className="comment-actions">
                            <button onClick={() => setActiveReplyId(comment.id)}>Reply</button>
                            {comment.userId === user?.id && (
                                <button onClick={() => deleteComment(comment.id)}>Delete</button>
                            )}
                        </div>
                        {activeReplyId === comment.id && (
                            <div className="reply-box">
                                <input
                                    type="text"
                                    placeholer="Reply to this comment..."
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                />
                                <button onClick={() => handleReplySubmit(comment.id)}>Reply</button>
                            </div>
                        )}
                        {comment.replies && comment.replies.length > 0 && renderReplies(comment.replies)}
                    </li>
                ))}
            </ul>
        </div>
	);
}