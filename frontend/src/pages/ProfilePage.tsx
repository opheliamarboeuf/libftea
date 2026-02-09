import "../App.css";
import "./ProfilePage.css";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const ProfilePage = () => {
	const API_URL = "http://localhost:3000";

	const { user, setUser } = useUser();
	const navigate = useNavigate();

	if (!user)
		return <Navigate to="/" replace />; // redirect if not logged in


	const [bio, setBio] = useState(user.profile.bio);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [coverFile, setCoverFile] = useState<File | null>(null);
  	const [showMenu, setShowMenu] = useState(false);
	const [showModal, setshowModal] = useState(false);
	const [showConfirm, setshowConfirm] = useState(false);
	const [fadeOut, setFadeOut] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const MAX_BIO_LENGTH = 400;

	const handleLogout = () => {
		localStorage.removeItem("token");
		setUser(null);
	}

	const resetFields = () => {
			setBio(user.profile.bio);
			setErrorMessage(null);
	}

	const confirmDiscard = () => {
		resetFields();
		setshowConfirm(false);
		setshowModal(false);
	}

	const handleCancel = () => {
		const isChanged =
		bio !== user.profile.bio //||
		// avatarFile !== user.profile.avatarUrl ||
		// coverFile !== user.profile.coverUrl;

		if (isChanged) {
			setshowConfirm(true);
			return ;
		}
		setFadeOut(true);
		setTimeout(() => {
			resetFields();
			setshowModal(false);
			setFadeOut(false);
		}, 250) // CSS duration
	}

	const handleSaveProfile = async () => {
		setErrorMessage(null);

		const formData = new FormData();
		formData.append("bio", bio);
		if (avatarFile)
			formData.append("avatar", avatarFile); // expected name for the FileInterceptor
		if (coverFile)
			formData.append("covr", coverFile); 
		try {
			const res = await fetch("http://localhost:3000/profile/edit", {
				method: 'POST',
				headers: { 
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: formData,
			});

			const data = await res.json();

			if (!res.ok) {
				if (Array.isArray(data.message)) setErrorMessage(data.message[0]);
				else setErrorMessage(data.message || "Profile edit Failed");
				return;
			}

			// Update user context by creating a new object: 
			// if prevUser exists, keep all user fields, replace the profile object 
			// with a copy that updates bio, avatarUrl, and coverUrl; 
			// if prevUser is null, do nothing
			setUser((prevUser) =>
					prevUser
					? {
						...prevUser,
						profile: {
						...prevUser.profile,
						bio: data.bio,
						avatarUrl: data.avatarUrl,
						coverUrl: data.coverUrl,
					},
				}
				: prevUser
			);
			setFadeOut(true);
			setTimeout(() => {
				setshowModal(false);
				setFadeOut(false);
			}, 250);
		} catch (error) {
			console.log("Server unreachable");
		}
	};

	return (
		<div className="profile-page">
			<button className="menu-btn" 
				onClick={() => setShowMenu(!showMenu)}> 
				☰
			</button>
			{showMenu && (
				<div className="drop-down-menu">
					<button onClick={() => navigate("/home")}>My Feed</button>
					<button onClick={handleLogout}>Log Out</button>
				</div>
			)}
			<button className="edit-profile-btn" onClick={() => setshowModal(true)}>
				Edit Profile</button>
			{ showModal && (
				<div className="modal-overlay" onClick={handleCancel}>
					<div className={`modal-content ${fadeOut ? "fade-out" : "fade-in"}`} onClick={e => e.stopPropagation()}> {/*stops modal-overlay onCLick propagation*/}
						<h2>Edit Profile</h2>
						<label>Bio</label>
						<textarea
							value={bio}
							onChange={(e) => setBio(e.target.value)}
							rows={5}/>
							<div className={`char-counter ${bio.length > MAX_BIO_LENGTH ? "error" : ""}`}>
 								{bio.length} / {MAX_BIO_LENGTH}
							</div>
						<label>Profile Picture</label>
						<input
							type="file"
							accept="image/*"
							onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
						<label>Cover Picture</label>
						<input
							type="file"
							accept="image/*"
							onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
							{errorMessage && (<div className="error-message shake-horizontal">
								{errorMessage}</div>)}
							<div className="modal-actions">
								<button className="modal-btn" onClick={handleSaveProfile}>Save</button>
								<button className="modal-btn" onClick={handleCancel}>Cancel</button>
							</div>
					</div>
				</div>
				)}
				{ showConfirm && (
					<div className="confirm-overlay">
						<div className="confirm-box">
							<p>Looks like you’ve made some changes. Are you sure you want to exit without saving?</p>
							<div className="confirm-actions">
								<button className="modal-btn" onClick={() => confirmDiscard()}>Discard</button>
								<button className="modal-btn" onClick={() =>setshowConfirm(false)}>Stay</button>
							</div>
						</div>
					</div>
				)}
			<div className="cover-image">
				<img src={ user.profile.coverUrl ? `${API_URL}${user.profile.coverUrl}`
      				: "/default-cover.png"} alt="Cover"/></div>
			<div className="profile-header">
				<div className="avatar-image">
					<img src={    user.profile.avatarUrl ? `${API_URL}${user.profile.avatarUrl}`
      				: "/default-avatar.png"} alt="Avatar"/></div>
				<div className="bio"><p>{user.profile.bio}</p></div>
			</div>
			<div className="posts"></div>
		</div>
	);
};

export default ProfilePage;
