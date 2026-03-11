import { useState, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "./DashboardPage.css"
import { AdminDashboard } from "../moderation/components/AdminDashboard";
import { ModDashboard } from "../moderation/components/ModDashboard";

const DashboardPage = () => {
	
	const { user } = useUser();
	const location = useLocation();
	// Determine if the current route is a moderation sub-route 
	const isModRoute = location.pathname.startsWith("/dashboard/moderation");
	
	// Initialize the active tab based on the current route
	const [activeTab, setActiveTab] = useState<"ADMIN" | "MOD">(() => {
		if (isModRoute)
			return "MOD";
		// Default tab is ADMIN
		return "ADMIN";
	});

	// Keep activeTab in sync with route changes
	useEffect(() => {
		if (isModRoute) {
			setActiveTab("MOD");
		}
	}, [isModRoute]);

	useEffect(() => {
		// Keep the active tab selection in localStorage
		localStorage.setItem("dashboardTab", activeTab);
	}, [activeTab]);

	if (!user)
		return <Navigate to="/" replace />;

	// If user is a MOD, always show moderation dashboard
	if (user.role === "MOD") {
    return (
		<div className="dashboard-page">
			<div className="dash-board-content">
				{isModRoute ? <Outlet /> : <ModDashboard />}
			</div>
		</div>
	);
  }
	
	return (
		<div className="dashboard-page">
			<div className="dashboard-header">
				<div className="dashboard-tabs">
					{/* Tab indicator that moves based on activeTab */}
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
				{activeTab === "MOD" && (isModRoute ? <Outlet /> : <ModDashboard />)}
			</div>
		</div>
	)
}

export default DashboardPage
