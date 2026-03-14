import { friendsApi } from "./api";
import { useUser } from "../context/UserContext";
import { useModal } from "../context/ModalContext";
import { ConfirmBlockDelete } from "./ConfirmBlockDelete";
import { useState } from "react";
import { useFriendsSocket } from "./useFriendsSocket";

interface Props {
    userId: number;
}

export function RemoveFriendButton({ userId }: Props) {
    const { user, refreshUser } = useUser();
    const { showModal } = useModal();
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    
	const { emit } = useFriendsSocket(user?.id, {
		onFriendRemoved: () => {
			setLoading(false);
			refreshUser();
			showModal("Friend removed");
		},
		onUserRemoved: () => {
			refreshUser();
		}
	});
    const handleClick = async () => {
        try {
            setLoading(true);
            emit("remove_friend", { userId: user?.id, friendId: userId });
			setShowConfirm(false);
        } catch (error) {
            console.error('Error:', error);
            showModal("Failed to remove friend");
        }
    }
    return (
        <>
            <button 
                onClick={() => setShowConfirm(true)}
                disabled={loading}
				className="friend-action-btn"
                >
                    {loading ? "Deleting..." : "Delete"}
            </button>

            {showConfirm && (
                <ConfirmBlockDelete
                    message="Are you sure you want to delete this friend from your friendlist?"
                    onYes={handleClick}
                    onNo={() => setShowConfirm(false)}
                />
            )}
        </>
    );
}