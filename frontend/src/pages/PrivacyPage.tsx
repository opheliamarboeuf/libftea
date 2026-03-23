import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import MarkdownRender from "../common/components/MarkdownRender";
import './Legal.css'
import { useUser } from "../context/UserContext";
import { BackToLoginButton } from "../common/components/BackToLogin";
import LanguageMenu from "../common/components/LanguageMenu";

function PrivacyPage() {
	const { i18n, t } = useTranslation();
	const [content, setContent] = useState("");
	const [loading, setLoading] = useState(true);
	const { user } = useUser();

	useEffect(() => {
		setLoading(true);

		fetch(`/privacy.${i18n.language}.md`)
			.then((res) => {
				if (!res.ok) throw new Error(t('errorpage.filenotfound'));
				return res.text();
			})
			.then((text) => setContent(text))
			.catch(() => setContent(t('errorpage.contentnotfound')))
			.finally(() => setLoading(false));
	}, [i18n.language]);

	if (loading) return <p>{t('userprofile.loading')}</p>

	return (
		<div className="content-wrapper">
			{!user && <BackToLoginButton />}
			{!user && <LanguageMenu fixed />}
			<div className="privacy-box">
				<MarkdownRender content={content} />
			</div>
		</div>
	);
}

export default PrivacyPage