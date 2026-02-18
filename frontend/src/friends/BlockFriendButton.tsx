import { friendsApi } from "./api";
import { useUser } from "../context/UserContext";
import { useModal } from "../context/ModalContext";
import { useState } from "react"
import { ConfirmBlockDelete } from "./ConfirmBlockDelete";

interface Props {
    userId: number;
}

export function BlockFriendButton({ userId }: Props) {
    const { refreshUser } = useUser();
    const { showModal } = useModal();
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    

    const handleClick = async () => {
        try {
            setLoading(true);
            await friendsApi.blockFriend(userId);
            await refreshUser();
            showModal("Friend blocked");
        } catch (error) {
            console.error('Error:', error);
            showModal("Failed to block friend");
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
                    {loading ? "Blocking..." : "Block"}
            </button>

            {showConfirm && (
                <ConfirmBlockDelete
                    message="Are you sure you want to block this user?"
                    onYes={handleClick}
                    onNo={() => setShowConfirm(false)}
                />
            )}
        </>
    );
}