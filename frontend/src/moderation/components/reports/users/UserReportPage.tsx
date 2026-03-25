import { useState, useEffect } from 'react';
import { moderationApi } from '../../../api';
import { useUser } from '../../../../context/UserContext';
import { Navigate, useParams, useNavigate } from 'react-router-dom';
import { UserReportType, SimpleReportType } from '../../../types';
import './UserReportList.css';
import './UserReportPage.css';
import { useTranslation } from 'react-i18next';

const UserReportPage = () => {
	const API_URL = import.meta.env.VITE_API_URL;
	const { user } = useUser();
	const { postId } = useParams<{ postId: string }>(); // get the id from URL
	const [fullReport, setFullReport] = useState<UserReportType | null>(null);
	const [simpleReports, setSimpleReports] = useState<SimpleReportType[]>([]);
	const { t } = useTranslation();

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
											</span>
										) : (
											<span className="user-report-target-username">
												{t('userreport.unknown')}
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
											<div className="user-report-label">{t('userreport.cover')}</div>
											{fullReport.reportedUser.profile.coverUrl ? (
												<img
													src={`${API_URL}${fullReport.reportedUser.profile.coverUrl}`}
													alt="Cover"
												/>
											) : (
												<span>{t('userreport.nocover')}</span>
											)}
										</div>
										<div className="user-report-avatar-bio-row">
											<div className="user-report-avatar">
												<div className="user-report-label">{t('userreport.avatar')}</div>
												{fullReport.reportedUser.profile.avatarUrl ? (
													<img
														src={`${API_URL}${fullReport.reportedUser.profile.avatarUrl}`}
														alt="Avatar"
													/>
												) : (
													<span>{t('userreport.noavatar')}</span>
												)}
											</div>
											<div className="user-report-bio">
												<div className="user-report-label">{t('editprofile.bio')}</div>
												{fullReport.reportedUser.profile.bio &&
												fullReport.reportedUser.profile.bio.trim() !== ''
													? fullReport.reportedUser.profile.bio
													: t('userreport.nobio')}
											</div>
										</div>
									</>
								) : (
									<div className="user-report-profile-missing">
										{t('userreport.unavailable')}
									</div>
								)}
							</div>
						</div>
					</div>
				)}
			</div>
			<div className="right-scroll">
				<div className="simple-user-reports">
					<div className="user-report-title">{t('userreport.all')}</div>
					{simpleReports.length === 0 ? (
						<p>{t('userreport.nonefound')}</p>
					) : (
						simpleReports.map((r) => (
							<div key={r.id} className="simple-report-card">
								<div className="simple-report-header">
									<div className="simple-report-header-flex">
										<div className="simple-report-header-left">
											<strong>{t('postreport.reporter')}</strong>
											<span
												className="simple-report-author"
												onClick={() => goToProfile(r.reporter.id)}
											>
												{r.reporter.username}
											</span>
										</div>
										<span className="simple-report-date">
											{t('postreport.reported', { date: new Date(r.createdAt).toLocaleString() })}
										</span>
									</div>
								</div>
								<div className="simple-report-category">
									<strong>{t('postreport.category')}</strong>
									<br /> {r.reportCategory.replace(/_/g, ' ')}
								</div>
								<div className="simple-report-description">
									<strong>{t('postreport.description')}</strong>
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
