import { useState, useEffect } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "./DashboardPage.css"

const DashboardPage = () => {
	const { user } = useUser();
	const location = useLocation();
	const navigate = useNavigate();

	const isModRoute = location.pathname.startsWith("/dashboard/moderation");
	const activeTab = isModRoute ? "MOD" : "ADMIN";

	if (!user)
		return <Navigate to="/" replace />;

	// Si MOD, pas de tabs, juste le contenu
	if (user.role === "MOD") {
		return (
			<div className="dashboard-page">
				<div className="dash-board-content">
					<Outlet />
				</div>
			</div>
		);
	}

	return (
		<div className="dashboard-page">
			<div className="dashboard-header">
				<div className="dashboard-tabs">
					<div className={`dashboard-tab-indicator ${activeTab}`} />
					<button
						className={activeTab === "ADMIN" ? "active" : ""}
						onClick={() => navigate("/dashboard/admin/reports/users/pending")}
					>
						Administrator Dashboard
					</button>
					<button
						className={activeTab === "MOD" ? "active" : ""}
						onClick={() => navigate("/dashboard/moderation/reports/posts/pending")}
					>
						Moderator Dashboard
					</button>
				</div>
			</div>
			<div className="dash-board-content">
				<Outlet />
			</div>
		</div>
	)
}

export default DashboardPage;