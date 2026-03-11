import { useNavigate } from "react-router-dom";
import { PostReportType } from "../../../types";
import "./PostReportList.css";
import { moderationApi } from "../../../api";
import { useUser } from "../../../../context/UserContext";
interface PostReportListProps {
	reports: PostReportType[];
	onUpdate?: () => void;
}

export function PostReportList( {reports, onUpdate}: PostReportListProps ) {
	if (!Array.isArray(reports) || reports.length === 0) {
		return (
			<div className="report-list">
				<div className="report-card">
				<p className="no-reports">No reports available</p>
				</div>
			</div>
		);
	}

	const API_URL = "http://localhost:3000";
    const { user } = useUser();


	const navigate = useNavigate();
	const goToProfile = (userId: number) => {
		navigate(`/users/${userId}`);
	};

	return (
	<div className="report-list">
		{reports.map((report) => (
			<div key={report.reportedPost.id} className="report-card">
			<div className="report-header">
				<h3 className="report-title">{report.reportedPost.title}</h3>
				<div className="report-meta">
				<span
					className="report-author"
					onClick={() => goToProfile(report.reportedPost.author.id)}
				>
					{report.reportedPost.author.username},
				</span>
				<span className="report-date">
					{` created ${new Date(report.reportedPost.createdAt).toLocaleString()}`}
				</span>
				</div>
				<div className="report-btn">
					{report.status === "ASSIGNED" && report.handledBy && (
						<span className="assigned-to">
							Assigned to{" "}
							<span onClick={() => goToProfile(report.handledBy.id)}>
								{report.handledBy.username}
							</span>
						</span>
					)}
					{report.status === "PENDING" && (
						<button
						onClick={async () => {
							await moderationApi.assignPendingReport(report.id);
							if (onUpdate) onUpdate(); // refresh after assigning
							}}
							>
								Assign Report
								</button>
							)}
						{report.status === "ASSIGNED" && 
							(report.handledBy?.id === user.id || user.role === "ADMIN") && (
						<button onClick={async () => {
							await moderationApi.unassignPendingReport(report.id);
							if (onUpdate) onUpdate();
						}}>
							Unassign Report
						</button>
					)}
					{report.status === "ASSIGNED" && report.handledBy?.id === user.id && (
						<button
						onClick={() => { navigate(`/dashboard/moderation/reports/posts/${report.id}/handle`);
					}} >
						Handle Report
						</button>)}
				</div>
				</div>
				<div className="report-content">
					<div className="report-image">
						<img src={`${API_URL}${report.reportedPost.imageUrl}`}
 							alt="Post" />
					</div>
						<div className="report-info">
							<div>
								<strong>Reporter:</strong><br />{" "}
								<span
									className="reporter-name"
									onClick={() => goToProfile(report.reporter.id)}
									>
									{report.reporter.username}
								</span>
							</div>
							<div 
								className="report-category" >
								<strong>Report Category:</strong><br />
								{report.reportCategory.replace(/_/g, " ")}
							</div>
							<div 
								className="report-description" >
								<strong>Report Description:</strong><br />
								{report.reportDescription}
							</div>
							<div 
								className="report-date" >
								<strong>Report Creation:</strong><br />
								{new Date(report.createdAt).toLocaleString()}
						</div>
					</div>
				</div>
				{report.reportedPost.caption && (
				<div className="report-caption">
					<p>{report.reportedPost.caption}</p>
				</div>
				)}
			</div>
		))}
		</div>
	);
}