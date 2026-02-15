import { friendsApi } from "./api";
import { useUser } from "../context/UserContext";
import { useModal } from "../context/ModalContext";

interface Props {
	userId: number;
}

export function AddFriendButton({ userId }: Props) {
	const { refreshUser } = useUser();
	const { showModal } = useModal();
	
	const handleClick = async () => {
		try {
			await friendsApi.sendFriendRequest(userId);
			await refreshUser();
			showModal("Friend request sent");
		} catch (error) {
			console.error('Error:', error);
			showModal("Error sending the request");
		}
	}
	return <button onClick={handleClick}>Add Friend</button>;
}