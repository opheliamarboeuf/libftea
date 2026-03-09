import { friendsApi } from "./api";
import { useUser } from "../context/UserContext";
import { useModal } from "../context/ModalContext";
import { useState } from "react"
import { useEffect } from "react";
import { ConfirmBlockDelete } from "./ConfirmBlockDelete";
import { useFriendsSocket } from "./useFriendsSocket";

interface Props {
    userId: number;
	onAction?: () => Promise<void>;
}

export function BlockFriendButton({ userId, onAction }: Props) {
    const { refreshUser, user } = useUser();
    const { showModal } = useModal();
    const [loading, setLoading] = useState(false);
	const [blockSent, setBlockSent] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    
	useEffect(() => {
		const isBlocked = user?.blockedUsers?.some(
			u => u.id === userId
		) ?? false;
		setBlockSent(isBlocked);
	}, [userId, user]);

	const { emit } = useFriendsSocket(user?.id, {
		onUserBlocked: async () => {
			setLoading(false);
			setShowConfirm(false);
			showModal("User blocked");
			await refreshUser();
			if (onAction) await onAction();
		},
		onUserUnblocked: async () => {
			setLoading(false);
			setShowConfirm(false);
			showModal("User unblocked");
			await refreshUser();
			if (onAction) await onAction();
		},
	});

    const handleClick = async () => {
        setLoading(true);
        try {
			if (!blockSent) {
				emit("block_friend",{ userId: user?.id, targetId: userId });
			} else {
				emit("unblock_friend", { userId: user?.id, targetId: userId });
			}
        } catch (error) {
            console.error('Error:', error);
            showModal("Failed to block friend");
        }
    }
    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                disabled={loading}
				className="friend-action-btn"
                >
                    {loading ? "Processing..." : blockSent ? "Unblock User" : "Block User"}
            </button>

            {showConfirm && (
                <ConfirmBlockDelete
                    message={ blockSent ? "Are you sure you want to unblock this user?" : "Are you sure you want to block this user?" }
                    onYes={handleClick}
                    onNo={() => setShowConfirm(false)}
                />
            )}
        </>
    );
}