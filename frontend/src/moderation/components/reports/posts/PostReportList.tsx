import './PostReportList.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PostReportType } from '../../../types';
import { moderationApi } from '../../../api';
import { useUser } from '../../../../context/UserContext';
import { ConfirmDialog } from '../../../../common/components/ConfirmDialog';
import { HandleReportModal } from '../handleReportModal';
import { useTranslation } from 'react-i18next';

interface PostReportListProps {
	reports: PostReportType[];
	onUpdate?: () => void;
}

export function PostReportList({ reports, onUpdate }: PostReportListProps) {
	const API_URL = import.meta.env.VITE_API_URL;
	const { user } = useUser();
	const [showConfirm, setShowConfirm] = useState(false);
	const [reportToUnassign, setReportToUnassign] = useState<number | null>(null);
	const [reportToHandle, setReportToHandle] = useState<number | null>(null);
	const { t } = useTranslation();

	const navigate = useNavigate();
	const goToProfile = (userId: number) => {
		navigate(`/users/${userId}`);
	};

	if (!Array.isArray(reports) || reports.length === 0) {
		return (
			<div className="post-report-list">
				<div className="post-report-card">
					<p className="no-reports">{t('postreport.noreports')}</p>
				</div>
			</div>
		);
	}

	return (
		<div className="post-report-list">
			{reports.map((report) => (
				<div key={report.id} className="post-report-card">
					<div className="post-report-header">
						<div className="post-report-header-content">
							<h3 className="post-report-title">{report.reportedPost.title}</h3>
							<div className="post-report-meta">
								<span
									className="post-report-author"
									onClick={() => goToProfile(report.reportedPost.author.id)}
								>
									{report.reportedPost.author.username},
								</span>
								<span className="post-report-date">
									{t('post.created', {
										date: new Date(
											report.reportedPost.createdAt,
										).toLocaleString(),
									})}
								</span>
							</div>
						</div>
						<div className="post-report-btn">
							{report.status === 'ASSIGNED' && report.handledBy && (
								<span className="assigned-to">
									{t('postreport.assignedto')}{' '}
									<span onClick={() => goToProfile(report.handledBy.id)}>
										{report.handledBy.username}
									</span>
								</span>
							)}
							{report.status === 'PENDING' && (
								<button
									onClick={async () => {
										await moderationApi.assignPendingReport(report.id);
										if (onUpdate) onUpdate(); // refresh after assigning
									}}
								>
									{t('postreport.assign')}
								</button>
							)}
							{report.status === 'ASSIGNED' &&
								(report.handledBy?.id === user.id || user.role === 'ADMIN') && (
									<button
										onClick={() => {
											setReportToUnassign(report.id);
											setShowConfirm(true);
										}}
									>
										{t('postreport.unassign')}
									</button>
								)}
							{report.status === 'ASSIGNED' && report.handledBy?.id === user.id && (
								<button onClick={() => setReportToHandle(report.id)}>
									{t('postreport.handle')}
								</button>
							)}
						</div>
					</div>
					<div className="post-report-content">
						<div className="post-report-image">
							<img
								src={
									report.reportedPost.imageUrl.startsWith('http')
										? report.reportedPost.imageUrl
										: `${API_URL ?? ''}${report.reportedPost.imageUrl}`
								}
								alt="Post"
							/>
						</div>
						<div className="post-report-info">
							<div className="post-report-pre-handle">
								<div className="reporter-info">
									<strong>{t('postreport.reporter')}</strong>
									<br />{' '}
									<span
										className="reporter-name"
										onClick={() => goToProfile(report.reporter.id)}
									>
										{report.reporter.username}
									</span>
								</div>
								<div className="post-report-category">
									<strong>{t('postreport.category')}</strong>
									<br />
									{t(`report.${report.reportCategory}`)}
								</div>
								<div className="post-report-description">
									<strong>{t('postreport.description')}</strong>
									<br />
									{report.reportDescription}
								</div>
								<div className="post-report-date">
									<strong>{t('postreport.creation')}</strong>
									<br />
									{new Date(report.createdAt).toLocaleString()}
								</div>
								{report.reportCount && report.reportCount > 1 && (
									<div className="post-report-more">
										<button
											onClick={() =>
												navigate(
													`/moderation/reports/posts/${report.reportedPost.id}`,
												)
											}
										>
											{t('postreport.view')} ({report.reportCount})
										</button>
									</div>
								)}
							</div>
							{(report.status === 'ACCEPTED' || report.status === 'REJECTED') && (
								<div className="post-report-post-handle">
									<div className="post-report-status">
										<strong>{t('postreport.status')}</strong>
										<br />
										<span className={report.status.toLowerCase()}>
											{report.status === 'ACCEPTED'
												? t('postreport.accepted')
												: t('postreport.rejected')}
										</span>
									</div>
									<div className="reporter-info">
										<strong>{t('postreport.handled')}</strong>
										<br />{' '}
										<span
											className="mod-name"
											onClick={() => goToProfile(report.handledBy.id)}
										>
											{report.handledBy.username}
										</span>
									</div>
									<div className="post-report-mod_message">
										<strong>{t('postreport.message')}</strong>
										<br />
										{report.moderatorMessage}
									</div>
									<div className="post-report-date">
										<strong>{t('postreport.date')}</strong>
										<br />
										{new Date(report.handledAt).toLocaleString()}
									</div>
								</div>
							)}
						</div>
					</div>
					{report.reportedPost.caption && (
						<div className="post-report-caption">
							<p>{report.reportedPost.caption}</p>
						</div>
					)}
				</div>
			))}
			{showConfirm && reportToUnassign !== null && (
				<ConfirmDialog
					message={t('postreport.unassignconfirm')}
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
					confirmLabel={t('common.yes')}
					cancelLabel={t('common.no')}
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
