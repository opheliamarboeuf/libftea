import { useState, useEffect } from "react";
import { moderationApi } from "../../../api";
import { useUser } from "../../../../context/UserContext";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import { PostReportType, SimpleReportType } from "../../../types";
import "./PostReportList.css";
import "./PostReportPage.css";

const PostReportPage = () => {
	const API_URL = "http://localhost:3000";
	const { user } = useUser();
	const { postId } = useParams<{ postId: string }>(); // get the id from URL
	const [fullReport, setFullReport] = useState<PostReportType | null>(null);
	const [simpleReports, setSimpleReports] = useState<SimpleReportType[]>([]);

	const navigate = useNavigate();
	const goToProfile = (userId: number) => {
		navigate(`/users/${userId}`);
	};

	useEffect(() => {
		if (!postId) return;

		const loadReports = async () => {
			const allReports: PostReportType[] = await moderationApi.fetchAllReportsForThisPost(+postId);
			if (allReports.length > 0) {
				setFullReport(allReports[0]);
				const simpleMapped = allReports.map(r => ({
					id: r.id,
					reporter: r.reporter,
					reportCategory: r.reportCategory,
					reportDescription: r.reportDescription,
					createdAt: r.createdAt
				}));
				setSimpleReports(simpleMapped);
			}
		};

		loadReports();
	}, [postId]);

	if (!user) return <Navigate to="/" replace />;

	return (
		<div className="post-report-page layout-flex">
			<div className="left-fixed">
				{fullReport && (
					<div className="report-card">
						<div className="report-header">
							<div className="report-header-content">
								<h3 className="report-title">{fullReport.reportedPost.title}</h3>
								<div className="report-meta">
									<span
										className="report-author"
										onClick={() => {
											if (fullReport.reportedPost.author) {
												window.location.href = `/users/${fullReport.reportedPost.author.id}`;
											}
										}}
									>
										{fullReport.reportedPost.author?.username},
									</span>
									<span className="report-date">
										{` created ${new Date(fullReport.reportedPost.createdAt).toLocaleString()}`}
									</span>
								</div>
							</div>
						</div>
						<div className="report-content">
							<div className="report-image">
								<img src={`${API_URL}${fullReport.reportedPost.imageUrl}`}/>
							</div>
						</div>
					</div>
				)}
			</div>
			<div className="right-scroll">
				<div className="simple-post-reports">
					<div className="report-title">All Reports for this Post</div>
					{simpleReports.length === 0 ? (
						<p>No reports found for this post.</p>
					) : (
						simpleReports.map((r) => (
							<div key={r.id} className="simple-report-card">
								<div className="simple-report-header">
									<div className="simple-report-header-flex">
										<div className="simple-report-header-left">
											<strong>Reporter:</strong>
											<span className="simple-report-author" onClick={() => goToProfile(r.reporter.id)}>{r.reporter.username}</span>
										</div>
										<span className="simple-report-date">reported {new Date(r.createdAt).toLocaleString()}</span>
									</div>
								</div>
								<div className="simple-report-category">
									<strong>Category:</strong><br />{" "}
									{r.reportCategory.replace(/_/g, " ")}
								</div>
								<div className="simple-report-description">
									<strong>Description:</strong><br />{" "}
									{r.reportDescription}
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
};

export default PostReportPage;