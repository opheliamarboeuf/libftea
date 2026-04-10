import { useState, useEffect, useRef } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { seedDatabase, mockDatabase } from "../mockData";
import { toContextUser } from "../mockData/mockUser";
import type { BaseUser } from "../mockData/seed";
import LanguageMenu from "../common/components/LanguageMenu";
import "./LoginPage.css";

const ROLE_LABELS: Record<string, string> = {
	ADMIN: 'Admin',
	MOD: 'Mod',
	USER: 'User',
};

const USER_ORDER = ['ophe', 'cha', 'ari', 'leo', 'admin', 'mod'];

const LoginPage = () => {
	const [visible, setVisible] = useState(false);
	const { setUser } = useUser();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const seeded = useRef(false);

	useEffect(() => {
		if (!seeded.current) {
			if (mockDatabase.users.length === 0) seedDatabase();
			seeded.current = true;
		}
		const t = setTimeout(() => setVisible(true), 20);
		return () => clearTimeout(t);
	}, []);

	const users = USER_ORDER
		.map((name) => mockDatabase.users.find((u) => u.username === name))
		.filter(Boolean) as BaseUser[];

	const handleSwitch = (user: BaseUser) => {
		const contextUser = toContextUser(user);
		setUser(contextUser);
		navigate('/feed', { replace: true });
	};

	return (
		<div
			className="fixed inset-0 flex items-center justify-center"
			style={{ opacity: visible ? 1 : 0, transition: 'opacity 1.2s ease' }}
		>
			<LanguageMenu fixed />
			<div className="switcher-card">
				<h1 className="switcher-title">{t('loginpage.login')}</h1>
				<p className="switcher-subtitle">{t('loginpage.choose')}</p>

				<div className="switcher-grid">
					{users.map((u) => {
						const roleLabel = ROLE_LABELS[u.role] ?? 'User';
						return (
							<button
								key={u.id}
								className="switcher-btn"
								onClick={() => handleSwitch(u)}
							>
								<span className="switcher-name">{u.username}</span>
								<span className="switcher-role">{roleLabel}</span>
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
