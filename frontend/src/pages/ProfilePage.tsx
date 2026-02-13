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
	const [displayName, setDisplayName] = useState(user.profile.displayName);
	const [avatarFile, setAvatarFile] = useState<File | null>(null);
	const [coverFile, setCoverFile] = useState<File | null>(null);
	const [showModal, setshowModal] = useState(false);
	const [showConfirm, setshowConfirm] = useState(false);
	const [fadeOut, setFadeOut] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	
	const MAX_BIO_LENGTH = 400;
	const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
	const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

	const validateImage = (file: File, type: string): string | null => {
		if (!ALLOWED_TYPES.includes(file.type)) {
			return `${type} must be JPEG, PNG, or WebP`
		}
		if (file.size > MAX_FILE_SIZE) {
			return `${type} must be under 5MB`;
		}
		return null;
	}

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		if (file) {
			const error = validateImage(file, 'Profile picture');
			if (error) {
				setErrorMessage(error);
				e.target.value = '';
				return;
			}
		}
		setAvatarFile(file);
		setErrorMessage(null);
	};

	const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		if (file) {
			const error = validateImage(file, 'Cover picture');
			if (error) {
				setErrorMessage(error);
				e.target.value = '';
				return;
			}
		}
		setCoverFile(file);
		setErrorMessage(null);
	};

	const resetFields = () => {
			setBio(user.profile.bio);
			setDisplayName(user.profile.displayName);
			setErrorMessage(null);
	}

	const confirmDiscard = () => {
		resetFields();
		setshowConfirm(false);
		setshowModal(false);
	}

	const handleCancel = () => {
		const isChanged = bio !== user.profile.bio || 
				displayName !== user.profile.displayName ||
				avatarFile !== null || 
				coverFile !== null;

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

		if (bio.length > MAX_BIO_LENGTH) {
			setErrorMessage(`Bio cannot exceed ${MAX_BIO_LENGTH} characters`);
			return;
		}

		const formData = new FormData();
		formData.append("bio", bio);
		formData.append("displayName", displayName);
		if (avatarFile)
			formData.append("avatar", avatarFile); // expected name for the FileInterceptor
		if (coverFile)
			formData.append("cover", coverFile); 
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
						displayName: data.displayName,
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
		<button className="edit-profile-btn" onClick={() => setshowModal(true)}>
			Edit Profile
		</button>
		{/* MAIN CONTENT */}
		<div className="main-content">
		{/* PROFILE INFO COLUMN */}
		<div className="profile-info">
			<div className="profile-pic">
			<img
				src={user.profile.avatarUrl ? `${API_URL}${user.profile.avatarUrl}` : "/default-avatar.png"}
				alt="Profile Avatar"
			/>
			</div>
			<h2 className="display-name">{user.profile.displayName || user.username}</h2>
			<div className="stats">
			<span>Friends: 10</span>
			<span>Posts: 5</span>
			</div>
			<div className="bio">
			<p>{user.profile.bio || "This is my biography..."}</p>
			</div>
		</div>

		{/* COVER AND POSTS */}
		<div className="cover-and-posts">
			<div className="cover">
			<img
				src={user.profile.coverUrl ? `${API_URL}${user.profile.coverUrl}` : "/default-cover.png"}
				alt="Cover"
			/>
			</div>
			<div className="posts">
			<p>Post 1</p>
			<p>Post 2</p>
			<p>Post 3</p>
			</div>
		</div>
		</div>

		{/* MODAL OVERLAY */}
		{showModal && (
		<div className="modal-overlay" onClick={handleCancel}>
			<div className={`modal-content ${fadeOut ? "fade-out" : "fade-in"}`} onClick={e => e.stopPropagation()}>
			<h2>Edit Profile</h2>
			<label>Name</label>
			<textarea value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
			<label>Bio</label>
			<textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={5} />
			<div className={`char-counter ${bio.length > MAX_BIO_LENGTH ? "error" : ""}`}>
				{bio.length} / {MAX_BIO_LENGTH}
			</div>
			<label>Profile Picture</label>
			<input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleAvatarChange} />
			<small className="helper-text"> Accepted formats: JPEG, PNG, WebP (Max 5MB)</small>
			<label>Cover Picture</label>
			<input type="file" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleCoverChange} />
			<small className="helper-text">Accepted formats: JPEG, PNG, WebP (Max 5MB)</small>
			{errorMessage && <div className="error-message shake-horizontal">{errorMessage}</div>}
			<div className="modal-actions">
				<button className="modal-btn" onClick={handleSaveProfile}>Save</button>
				<button className="modal-btn" onClick={handleCancel}>Cancel</button>
			</div>
			</div>
		</div>
		)}

		{showConfirm && (
		<div className="confirm-overlay">
			<div className="confirm-box">
			<p>Looks like you’ve made some changes. Are you sure you want to exit without saving?</p>
			<div className="confirm-actions">
				<button className="modal-btn" onClick={() => confirmDiscard()}>Discard</button>
				<button className="modal-btn" onClick={() => setshowConfirm(false)}>Stay</button>
			</div>
			</div>
		</div>
		)}
	</div>
	);
};

export default ProfilePage;