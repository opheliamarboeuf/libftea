import { useComments } from './hooks';
import { useUser } from '../context/UserContext';
import { useState } from 'react';
import './CommentSection.css';
import { ConfirmDialog } from '../common/components/ConfirmDialog';
import { Link } from 'react-router-dom';
import { UserNameWithRole } from '../common/components/UserNameWithRole';

interface Props {
	postId: number;
}

export function CommentSection({ postId }: Props) {
	const { comments, loading, error, createComment, deleteComment, replyComment } =
		useComments(postId);
	const { user } = useUser();
	const [newComment, setNewcomment] = useState('');
	const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
	const [replyContent, setReplyContent] = useState('');
	const [showConfirm, setShowConfirm] = useState(false);
	const [commentToDelete, setCommentToDelete] = useState<number | null>(null);

	const handleCommentSubmit = async () => {
		if (!newComment.trim()) return;
		createComment(newComment.trim());
		setNewcomment('');
	};

	const handleReplySubmit = async (parentId: number) => {
		if (!replyContent.trim()) return;
		await replyComment(parentId, replyContent.trim());
		setReplyContent('');
		setActiveReplyId(null);
	};

	const renderReplies = (replies: any[]) => (
		<ul className="replies-list">
			{replies.map((reply) => (
				<li key={reply.id} className="reply-item">
					<p>
						<strong>
							<Link
								to={`/users/${reply.user.id}`}
								style={{ textDecoration: 'none', color: 'inherit' }}
							>
								<UserNameWithRole
									username={reply.user.username}
									role={(reply.user as any).role}
								/>
							</Link>
						</strong>{' '}
						• {new Date(reply.createdAt).toLocaleString()}
					</p>
					<p>{reply.content}</p>
					<div className="comment-actions">
						{reply.userId === user?.id && (
							<button
								onClick={() => {
									setCommentToDelete(reply.id);
									setShowConfirm(true);
								}}
							>
								Delete
							</button>
						)}
					</div>
				</li>
			))}
		</ul>
	);

	return (
		<div className="comment-section">
			<div className="new-comment">
				<input
					type="text"
					placeholder="Leave a comment..."
					value={newComment}
					onChange={(e) => setNewcomment(e.target.value)}
					onFocus={() => setActiveReplyId(null)}
				/>
				{newComment.trim() && <button onClick={handleCommentSubmit}>Comment</button>}
			</div>
			{loading && <p>Loading comments...</p>}
			{error && <p className="error">{error}</p>}
			<ul className="comments-list">
				{comments.map((comment) => (
					<li key={comment.id} className="comment-item">
						<p>
							<strong>
								<Link
									to={`/users/${comment.user.id}`}
									style={{ textDecoration: 'none', color: 'inherit' }}
								>
									<UserNameWithRole
										username={comment.user.username}
										role={(comment.user as any).role}
									/>
								</Link>
							</strong>{' '}
							• {new Date(comment.createdAt).toLocaleString()}
						</p>
						<p>{comment.content}</p>
						<div className="comment-actions">
							<button onClick={() => setActiveReplyId(comment.id)}>Reply</button>
							{comment.userId === user?.id && (
								<button
									onClick={() => {
										setCommentToDelete(comment.id);
										setShowConfirm(true);
									}}
								>
									Delete
								</button>
							)}
						</div>
						{activeReplyId === comment.id && (
							<div className="reply-box">
								<input
									type="text"
									placeholder="Reply to this comment..."
									value={replyContent}
									onChange={(e) => setReplyContent(e.target.value)}
								/>
								<button onClick={() => handleReplySubmit(comment.id)}>Reply</button>
							</div>
						)}
						{comment.replies &&
							comment.replies.length > 0 &&
							renderReplies(comment.replies)}
					</li>
				))}
			</ul>
			{showConfirm && commentToDelete !== null && (
				<ConfirmDialog
					message="Are you sure you want to delete this comment?"
					onConfirm={async () => {
						if (commentToDelete !== null) {
							await deleteComment(commentToDelete);
							setCommentToDelete(null);
							setShowConfirm(false);
						}
					}}
					onCancel={() => {
						setCommentToDelete(null);
						setShowConfirm(false);
					}}
				/>
			)}
		</div>
	);
}
