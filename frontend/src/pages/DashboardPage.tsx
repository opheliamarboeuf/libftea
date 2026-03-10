import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "./DashboardPage.css"
// import { ModerationLogs } from "../moderation/components/ModerationLogs";
import { AdminDashboard } from "../moderation/components/AdminDashboard";
import { ModDashboard } from "../moderation/components/ModDashboard";

const DashboardPage = () => {
	
	const { user } = useUser();
	const [activeTab, setActiveTab] = useState<"ADMIN" | "MOD">(() => {
		const saved = localStorage.getItem("dashboardTab");
		return saved === "MOD" ? "MOD" : "ADMIN";
	});

	useEffect(() => {
		localStorage.setItem("dashboardTab", activeTab);
	}, [activeTab]);

	if (!user) return <Navigate to="/" replace />;
	if (user.role === "MOD") {
    return (
		<div className="dashboard-page">
			<div className="dash-board-content">
			<ModDashboard />
			</div>
		</div>
	);
  }
	
	return (
		<div className="dashboard-page">
			<div className="dashboard-header">
				<div className="dashboard-tabs">
					<div
						className={`dashboard-tab-indicator ${activeTab}`}
					/>
					<button
						className={activeTab === "ADMIN" ? "active" : "" }
						onClick={() => setActiveTab("ADMIN")}
					>
						Administrator Dashboard
					</button>
					<button
						className={activeTab === "MOD" ? "active" : "" }
						onClick={() => setActiveTab("MOD")}
					>
						Moderator Dashboard
					</button>
				</div>
			</div>
			<div className="dash-board-content">
				{activeTab === "ADMIN" && <AdminDashboard />}
				{activeTab === "MOD" && <ModDashboard />}
			</div>
		</div>
	)
}

export default DashboardPage

	// return <div className="dashboard-page">
	// 	<ModerationLogs />
	// </div>