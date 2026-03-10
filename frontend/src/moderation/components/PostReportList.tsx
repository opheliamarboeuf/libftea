import { useNavigate } from "react-router-dom";
import { PostReportType } from "../types";
import "./PostReportList.css";

interface PostReportListProps {
	reports: PostReportType[];
	// onreportReviewed?: () => void;
}

export function PostReportList( {reports}: PostReportListProps ) {
	if (!Array.isArray(reports)) return null;

	const API_URL = "http://localhost:3000";
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
				</div>
				<div className="report-content">
					<div className="report-image">
						<img src={`${API_URL}${report.reportedPost.imageUrl}`}
 							alt="Post" />
					</div>
					<div className="report-action">
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