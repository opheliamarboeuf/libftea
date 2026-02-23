import { useState } from "react";
import { postsApi } from "./api";
import { PostPayload } from "./types";
import { createPortal } from "react-dom";

interface CreatePostModalProps {
	onPostCreated: () => void;
	onClose: () => void;
}

// A FAIRE : Désactiver le bouton pendant la soumission pour éviter les doubles clics.

export function CreatePostModal ({ onPostCreated, onClose }: CreatePostModalProps) {
	const [ title, setTitle ] = useState("");
	const [ caption, setCaption ] = useState("");
	const [showConfirm, setShowConfirm] = useState(false);
	const [fadeOut, setFadeOut] = useState(false);

	const closeWithAnimation = () => {
		setFadeOut(true);
		setTimeout(() => {
			onClose();
		}, 250);
	};


	const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
		e.preventDefault();
			// setErrorMessage(null);
			
		const payload: PostPayload = {title, caption}; 
		try {
			await postsApi.createPost(payload);
			setTitle("");
			setCaption("");
			onPostCreated();
			onClose();
			
		}
		catch (error) {
				console.log("Could not submit Post:", error);
			}
		}

	return (
		<div className="create-post-form">
			<form onSubmit={handleSubmit}>
				<input
					type="text"
					placeholder="title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					// onFocus={() => setShowResults(true)}
					className="create-post-input"
					/>
				<textarea
					placeholder="caption"
					value={caption}
					onChange={(e) => setCaption(e.target.value)}
					// onFocus={() => setShowResults(true)}
					className="create-post-input"
				/>
				<button type="submit"> Submit </button>
			</form>
		</div>
	);
}