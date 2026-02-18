import { friendsApi } from "./api";
import { useUser } from "../context/UserContext";
import { useModal } from "../context/ModalContext";
import { useState } from "react"

interface Props {
    userId: number;
}

export function BlockFriendButton({ userId }: Props) {
    const { refreshUser } = useUser();
    const { showModal } = useModal();
    const [loading, setLoading] = useState(false);
    
    const handleClick = async () => {
        try {
            await friendsApi.blockFriend(userId);
            await refreshUser();
            showModal("Friend blocked");
        } catch (error) {
            console.error('Error:', error);
            showModal("Failed to block friend");
        } finally {
            setLoading(false);
        }
    }
    return <button onClick={handleClick} disabled={loading}>{loading ? "Blocking..." : "Block"}</button>;
}