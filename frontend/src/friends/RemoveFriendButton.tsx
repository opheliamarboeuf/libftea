import { friendsApi } from "./api";
import { useUser } from "../context/UserContext";
import { useModal } from "../context/ModalContext";
import { ConfirmBlockDelete } from "./ConfirmBlockDelete";
import { useState } from "react";

interface Props {
    userId: number;
}

export function RemoveFriendButton({ userId }: Props) {
    const { refreshUser } = useUser();
    const { showModal } = useModal();
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const handleClick = async () => {
        try {
            setLoading(true);
            await friendsApi.removeFriend(userId);
            await refreshUser();
            showModal("Friend removed");
        } catch (error) {
            console.error('Error:', error);
            showModal("Failed to remove friend");
        } finally {
            setLoading(false);
            setShowConfirm(false);
        }
    }
    return (
        <>
            <button 
                onClick={() => setShowConfirm(true)}
                disabled={loading}
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