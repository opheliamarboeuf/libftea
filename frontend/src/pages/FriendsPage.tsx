import { FriendsList, PendingRequests } from "../friends";

const FriendsPage = () => {
	return (
		<div>
			<h1>Mes amis</h1>

			<PendingRequests />

			<hr/>
			
			<FriendsList />
		</div>
	);
};

export default FriendsPage