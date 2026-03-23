import { useState, useEffect } from 'react';
import { moderationApi } from '../../../api';
import { useUser } from '../../../../context/UserContext';
import { Navigate, useParams, useNavigate } from 'react-router-dom';
import { UserReportType, SimpleReportType } from '../../../types';
import './UserReportList.css';
import './UserReportPage.css';

const UserReportPage = () => {
	const API_URL = import.meta.env.VITE_API_URL;
	const { user } = useUser();
	const { postId } = useParams<{ postId: string }>(); // get the id from URL
	const [fullReport, setFullReport] = useState<UserReportType | null>(null);
	const [simpleReports, setSimpleReports] = useState<SimpleReportType[]>([]);

	const navigate = useNavigate();
	const goToProfile = (userId: number) => {
		navigate(`/users/${userId}`);
	};

	useEffect(() => {
		if (!postId) return;

		const loadReports = async () => {
			const allReports: UserReportType[] =
				await moderationApi.fetchAllReportsForThisUser(+postId);
			if (allReports.length > 0) {
				setFullReport(allReports[0]);
				const simpleMapped = allReports.map((r) => ({
					id: r.id,
					reporter: r.reporter,
					reportCategory: r.reportCategory,
					reportDescription: r.reportDescription,
					createdAt: r.createdAt,
				}));
				setSimpleReports(simpleMapped);
			}
		};

		loadReports();
	}, [postId]);

	if (!user) return <Navigate to="/" replace />;

	return (
		<div className="user-report-page layout-flex">
			<div className="left-fixed">
				{fullReport && (
					<div className="user-report-card">
						<div className="user-report-header">
							<div className="user-report-header-content">
								<div className="user-report-header-content">
									<div>
										{fullReport.reportedUser ? (
											<span
												className="user-report-target-username"
												onClick={() =>
													goToProfile(fullReport.reportedUser.id)
												}
											>
												{fullReport.reportedUser.profile?.displayName
													? `${fullReport.reportedUser.username} (${fullReport.reportedUser.profile?.displayName})`
													: fullReport.reportedUser.username}
											</span>
										) : (
											<span className="user-report-target-username">
												Unknown user
											</span>
										)}
									</div>
								</div>
							</div>
						</div>
						<div className="user-report-content">
							<div className="user-report-profile">
								{fullReport.reportedUser && fullReport.reportedUser.profile ? (
									<>
										<div className="user-report-cover">
											<div className="user-report-label">Cover</div>
											{fullReport.reportedUser.profile.coverUrl ? (
												<img
													src={`${API_URL}${fullReport.reportedUser.profile.coverUrl}`}
													alt="Cover"
												/>
											) : (
												<span>No cover available</span>
											)}
										</div>
										<div className="user-report-avatar-bio-row">
											<div className="user-report-avatar">
												<div className="user-report-label">Avatar</div>
												{fullReport.reportedUser.profile.avatarUrl ? (
													<img
														src={`${API_URL}${fullReport.reportedUser.profile.avatarUrl}`}
														alt="Avatar"
													/>
												) : (
													<span>No avatar available</span>
												)}
											</div>
											<div className="user-report-bio">
												<div className="user-report-label">Bio</div>
												{fullReport.reportedUser.profile.bio &&
												fullReport.reportedUser.profile.bio.trim() !== ''
													? fullReport.reportedUser.profile.bio
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
					</div>
				)}
			</div>
			<div className="right-scroll">
				<div className="simple-user-reports">
					<div className="user-report-title">All reports for this user</div>
					{simpleReports.length === 0 ? (
						<p>No reports found for this post.</p>
					) : (
						simpleReports.map((r) => (
							<div key={r.id} className="simple-report-card">
								<div className="simple-report-header">
									<div className="simple-report-header-flex">
										<div className="simple-report-header-left">
											<strong>Reporter:</strong>
											<span
												className="simple-report-author"
												onClick={() => goToProfile(r.reporter.id)}
											>
												{r.reporter.username}
											</span>
										</div>
										<span className="simple-report-date">
											reported {new Date(r.createdAt).toLocaleString()}
										</span>
									</div>
								</div>
								<div className="simple-report-category">
									<strong>Category:</strong>
									<br /> {r.reportCategory.replace(/_/g, ' ')}
								</div>
								<div className="simple-report-description">
									<strong>Description:</strong>
									<br /> {r.reportDescription}
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
};

export default UserReportPage;
