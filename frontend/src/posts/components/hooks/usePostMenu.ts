import { useState, useRef, useEffect } from "react";
import { usePostDeletion } from "./usePostDeletion";
import { useUser } from "../../../context/UserContext";
import { useModal } from "../../../context/ModalContext";

export interface UsePostMenuResult {
	openMenuId: number | null;
	postToDelete: number | null;
	postToEdit: any | null;
	isDeleting: boolean;
	menuRef: React.RefObject<HTMLDivElement>;
	showConfirm: boolean;
	toggleMenu: (postId: number) => void;
	handleEdit: (post: any) => void;
	handleDelete: (postId: number) => Promise<void>;
	confirmDelete: () => Promise<void>;
	cancelDelete: () => void;
	handleReport: (postId: number) => void;
	setPostToDelete: (postId: number | null) => void;
	closeModal: () => void;
}

export function usePostMenu(onPostDeleted?: () => void): UsePostMenuResult {
	const { user, setUser } = useUser();
	const { showModal } = useModal();
	const { isDeleting, handlePostDeletion } = usePostDeletion();

	const [openMenuId, setOpenMenuId] = useState<number | null>(null);
	const [postToDelete, setPostToDelete] = useState<number | null>(null);
	const [postToEdit, setPostToEdit] = useState<any | null>(null);
	const menuRef = useRef<HTMLDivElement>(null);

	const showConfirm = postToDelete !== null;

	// Detect clicks outside of the menu
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			// If the menu exists and the clicked element is NOT inside the menu
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				// Close the menu
				setOpenMenuId(null);
			}
		};
		// Add an event listener for mouse clicks
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			// Cleanup function: remove the event listener when component unmounts
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const toggleMenu = (postId: number) => {
		setOpenMenuId(openMenuId === postId ? null : postId);
	};

	const handleEdit = (post: any) => {
		setPostToEdit(post);
		setOpenMenuId(null);
	};

	const handleDelete = async (postId: number) => {
		const success = await handlePostDeletion(postId);
		if (success && user) {
			// Create a new table without the deleted post
			const updatePosts = user.posts.filter(p => p.id !== postId);
			setUser({
				...user,
				posts: updatePosts,
			});
			setOpenMenuId(null);
			showModal("You post has been deleted");
			// Notify parent component to refresh
			if (onPostDeleted) {
				onPostDeleted();
			}
		} else {
			showModal("Failed to delete post");
		}
	};

	const confirmDelete = async () => {
		if (postToDelete === null)
			return;
		await handleDelete(postToDelete);
		setPostToDelete(null);
	};

	const cancelDelete = () => {
		setPostToDelete(null);
	};

	const handleReport = (postId: number) => {
		console.log("Report post", postId);
		setOpenMenuId(null);
	};

	const closeModal = () => {
		setPostToEdit(null);
	};

	return {
		openMenuId,
		postToDelete,
		postToEdit,
		isDeleting,
		menuRef,
		showConfirm,
		toggleMenu,
		handleEdit,
		handleDelete,
		confirmDelete,
		cancelDelete,
		handleReport,
		setPostToDelete,
		closeModal,
	};
}
