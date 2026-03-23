import './UserReportList.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserReportType } from '../../../types';
import { moderationApi } from '../../../api';
import { useUser } from '../../../../context/UserContext';
import { ConfirmDialog } from '../../../../common/components/ConfirmDialog';
import { HandleReportModal } from '../handleReportModal';

interface UserReportListProps {
	reports: UserReportType[];
	onUpdate?: () => void;
}

export function UserReportList({ reports, onUpdate }: UserReportListProps) {
	const API_URL = import.meta.env.VITE_API_URL;
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
			<div className="user-report-list">
				<div className="user-report-card">
					<p className="no-reports">No reports available</p>
				</div>
			</div>
		);
	}

	return (
		<div className="user-report-list">
			{reports.map((report) => (
				<div key={report.id} className="user-report-card">
					<div className="user-report-header">
						<div className="user-report-header-content">
							<div>
								{report.reportedUser ? (
									<span
										className="user-report-target-username"
										onClick={() => goToProfile(report.reportedUser.id)}
									>
										{report.reportedUser.profile?.displayName
											? `${report.reportedUser.username} (${report.reportedUser.profile?.displayName})`
											: report.reportedUser.username}
									</span>
								) : (
									<span className="user-report-target-username">
										Unknown user
									</span>
								)}
							</div>
						</div>
						<div className="user-report-btn">
							{report.status === 'ASSIGNED' && report.handledBy && (
								<span className="assigned-to">
									Assigned to{' '}
									<span onClick={() => goToProfile(report.handledBy.id)}>
										{report.handledBy.username}
									</span>
								</span>
							)}
							{report.status === 'PENDING' && (
								<button
									onClick={async () => {
										await moderationApi.assignPendingReport(report.id);
										if (onUpdate) onUpdate();
									}}
								>
									Assign Report
								</button>
							)}
							{report.status === 'ASSIGNED' && report.handledBy?.id === user.id && (
								<button
									onClick={() => {
										setReportToUnassign(report.id);
										setShowConfirm(true);
									}}
								>
									Unassign Report
								</button>
							)}
							{report.status === 'ASSIGNED' && report.handledBy?.id === user.id && (
								<button onClick={() => setReportToHandle(report.id)}>
									Handle Report
								</button>
							)}
						</div>
					</div>
					<div className="user-report-body">
						<div className="user-report-content">
							<div className="user-report-profile">
								{report.reportedUser && report.reportedUser.profile ? (
									<>
										<div className="user-report-cover">
											<div className="user-report-label">Cover</div>
											{report.reportedUser.profile.coverUrl ? (
												<img
													src={`${API_URL}${report.reportedUser.profile.coverUrl}`}
													alt="Cover"
												/>
											) : (
												<span>No cover available</span>
											)}
										</div>
										<div className="user-report-avatar-bio-row">
											<div className="user-report-avatar">
												<div className="user-report-label">Avatar</div>
												{report.reportedUser.profile.avatarUrl ? (
													<img
														src={`${API_URL}${report.reportedUser.profile.avatarUrl}`}
														alt="Avatar"
													/>
												) : (
													<span>No avatar available</span>
												)}
											</div>
											<div className="user-report-bio">
												<div className="user-report-label">Bio</div>
												{report.reportedUser.profile.bio &&
												report.reportedUser.profile.bio.trim() !== ''
													? report.reportedUser.profile.bio
													: 'No bio available'}
											</div>
										</div>
									</>
								) : (
									<div className="user-report-profile-missing">
										User profile unavailable
									</div>
								)}
							</div>
						</div>
						<div className="user-report-info">
							<div className="user-report-pre-handle">
								<div className="reporter-info">
									<strong>Reporter:</strong>
									<br />{' '}
									<span
										className="reporter-name"
										onClick={() => goToProfile(report.reporter.id)}
									>
										{report.reporter.username}
									</span>
								</div>
								<div className="user-report-category">
									<strong>Report Category:</strong>
									<br />
									{report.reportCategory.replace(/_/g, ' ')}
								</div>
								<div className="user-report-description">
									<strong>Report Description:</strong>
									<br />
									{report.reportDescription}
								</div>
								<div className="user-report-date">
									<strong>Report Creation:</strong>
									<br />
									{new Date(report.createdAt).toLocaleString()}
								</div>
								{report.reportCount && report.reportCount > 1 && (
									<div className="user-report-more">
										<button
											onClick={() =>
												navigate(
													`/moderation/reports/users/${report.reportedUser.id}`,
												)
											}
										>
											View all the reports ({report.reportCount})
										</button>
									</div>
								)}
							</div>

							{(report.status === 'ACCEPTED' || report.status === 'REJECTED') && (
								<div className="user-report-post-handle">
									<div className="user-report-status">
										<strong>Report Status:</strong>
										<br />
										<span className={report.status.toLowerCase()}>
											{report.status}
										</span>
									</div>
									<div className="reporter-info">
										<strong>Handled by:</strong>
										<br />{' '}
										<span
											className="mod-name"
											onClick={() => goToProfile(report.handledBy.id)}
										>
											{report.handledBy.username}
										</span>
									</div>
									<div className="user-report-mod_message">
										<strong>Moderation Message:</strong>
										<br />
										{report.moderatorMessage}
									</div>
									<div className="user-report-date">
										<strong>Report handle date:</strong>
										<br />
										{new Date(report.handledAt).toLocaleString()}
									</div>
								</div>
							)}
						</div>
					</div>
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
