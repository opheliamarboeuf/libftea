import { FriendsList, PendingRequests, BlockedList } from "../friends";
import "./FriendsPage.css"
const FriendsPage = () => {
	return (
		<div className="friends-page">
			<h1>Mes amis</h1>

			<PendingRequests />

			<hr/>
			
			<FriendsList />

			<hr/>

			<BlockedList />

		</div>
	);
};

export default FriendsPage