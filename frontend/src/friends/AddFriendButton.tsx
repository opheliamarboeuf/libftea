import { friendsApi } from "./api";

interface Props {
	userId: number;
}

export function AddFriendButton({ userId }: Props) {
	const handleClick = async () => {
		await friendsApi.sendFriendRequest(userId);
		alert('Friend request sent');
	}
	return <button onClick={handleClick}>Ajouter en ami</button>;
}