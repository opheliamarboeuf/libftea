import { useUser } from "../context/UserContext";
import { Navigate } from "react-router-dom";
import "./Dashboard.css"
import { ModerationLogs } from "../moderation/components/ModerationLogs";

const Dashboard = () => {
	
	const { user } = useUser();
	if (!user) return <Navigate to="/" replace />;

	return <div className="dashboard-page">
		<ModerationLogs />
	</div>
}

export default Dashboard