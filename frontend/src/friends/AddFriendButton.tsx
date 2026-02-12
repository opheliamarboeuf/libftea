import { friendsApi } from "./api";

interface Props {
	userId: number;
}

export function AddFriendButton({ userId }: Props) {
	const handleClick = async () => {
		try {
			const response = await friendsApi.sendFriendRequest(userId);
			alert('Friend request sent');
		} catch (error) {
			console.error('Error:', error);
			alert('Erreur lors de l\'envoi de la demande');
		}
	}
	return <button onClick={handleClick}>Ajouter en ami</button>;
}