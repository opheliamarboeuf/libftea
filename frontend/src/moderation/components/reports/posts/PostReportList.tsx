import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PostReportType } from "../../../types";
import "./PostReportList.css";
import { moderationApi } from "../../../api";
import { useUser } from "../../../../context/UserContext";
import { ConfirmDialog } from "../../../../common/components/ConfirmDialog";
import { HandleReportModal } from "../handleReportModal";

interface PostReportListProps {
	reports: PostReportType[];
	onUpdate?: () => void;
}

export function PostReportList( {reports, onUpdate}: PostReportListProps ) {
	const API_URL = "http://localhost:3000";
    const { user } = useUser();
	const [showConfirm, setShowConfirm] = useState(false);
	const [reportToUnassign, setReportToUnassign] = useState<number | null>(null);
	const [reportToHandle, setReportToHandle] = useState<number | null>(null);

	const navigate = useNavigate();
	const goToProfile = (userId: number) => {
		navigate(`/users/${userId}`);
	};

	if (!Array.isArray(reports) || reports.length === 0) {
		return (
			<div className="report-list">
				<div className="report-card">
				<p className="no-reports">No reports available</p>
				</div>
			</div>
		);
	}

	return (
	<div className="report-list">
		{reports.map((report) => (
			<div key={report.reportedPost.id} className="report-card">
			<div className="report-header">
				<div className="report-header-content">
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
						<button onClick={() => {
							setReportToUnassign(report.id);
							setShowConfirm(true);
						}}>
							Unassign Report
						</button>
					)}
					{report.status === "ASSIGNED" && report.handledBy?.id === user.id && (
						<button
						onClick={() => setReportToHandle(report.id)}
						>
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
							<div className="report-pre-handle">
								<div className="reporter-info">
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
								<div className="report-date" >
									<strong>Report Creation:</strong><br />
								{new Date(report.createdAt).toLocaleString()}
								</div>
							</div>
						{(report.status === "ACCEPTED" || report.status === "REJECTED") && (
						<div className="report-post-handle">
						<div className="report-status">
							<strong>Report Status:</strong><br />
									<span className={report.status.toLowerCase()}>
										{report.status}
									</span>
							</div>
							<div className="reporter-info">
								<strong>Handled by:</strong><br />{" "}
								<span
									className="mod-name"
									onClick={() => goToProfile(report.handledBy.id)}
									>
									{report.handledBy.username}
								</span>
							</div>
							<div className="report-mod_message">
							<strong>Moderation Message:</strong><br />
								{report.moderatorMessage}
							</div>
							<div className="report-date">
							<strong>Report handle date:</strong><br />
								{new Date(report.handledAt).toLocaleString()}
							</div>
						</div>
					)}
					</div>
				</div>
				{report.reportedPost.caption && (
				<div className="report-caption">
					<p>{report.reportedPost.caption}</p>
				</div>
				)}
			</div>
		))}
		{showConfirm && reportToUnassign !== null && (
			<ConfirmDialog
				message="Are you sure you want to unassign this report?"
				onConfirm={async () => {
					await moderationApi.unassignPendingReport(reportToUnassign);
					setShowConfirm(false);
					setReportToUnassign(null);
					if (onUpdate) onUpdate();
				}}
				onCancel={() => {
					setShowConfirm(false);
					setReportToUnassign(null);
				}}
				confirmLabel="Yes"
				cancelLabel="No"
			/>
		)}
		{reportToHandle !== null && (
			<HandleReportModal
			reportId={reportToHandle}
			onPostReported={() => {
				setReportToHandle(null);
				if (onUpdate) onUpdate();
			}}
			onClose={() => setReportToHandle(null)}
		/>
		)}
		</div>
	);
}