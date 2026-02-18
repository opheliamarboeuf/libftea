import { friendsApi } from "./api";
import { useUser } from "../context/UserContext";
import { useModal } from "../context/ModalContext";

interface Props {
    userId: number;
}

export function RemoveFriendButton({ userId }: Props) {
    const { refreshUser } = useUser();
    const { showModal } = useModal();
    
    const handleClick = async () => {
        try {
            await friendsApi.removeFriend(userId);
            await refreshUser();
            showModal("Friend removed");
        } catch (error) {
            console.error('Error:', error);
            showModal("Failed to remove friend");
        }
    }
    return <button onClick={handleClick}>Remove Friend</button>;
}