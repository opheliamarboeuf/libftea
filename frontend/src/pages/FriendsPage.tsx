import { FriendsList, PendingRequests } from "../friends";

const FriendsPage = () => {
	return (
		<div style={{ padding: '20px' }}>
			<h1>Mes amis</h1>

			<PendingRequests />

			<hr style={{ margin: '30px' }} />
			
			<FriendsList />
		</div>
	);
};

export default FriendsPage