import { friendsApi } from "./api";
import { useUser } from "../context/UserContext";

interface Props {
	userId: number;
}

export function AddFriendButton({ userId }: Props) {
	const { refreshUser } = useUser();

	const handleClick = async () => {
		try {
			await friendsApi.sendFriendRequest(userId);
			await refreshUser();
			alert('Friend request sent');
		} catch (error) {
			console.error('Error:', error);
			alert('Erreur lors de l\'envoi de la demande');
		}
	}
	return <button onClick={handleClick}>Ajouter en ami</button>;
}