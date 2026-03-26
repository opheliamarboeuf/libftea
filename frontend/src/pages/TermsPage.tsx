import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import MarkdownRender from "../common/components/MarkdownRender";
import './Legal.css'
import { useUser } from "../context/UserContext";
import { BackToLoginButton } from "../common/components/BackToLogin";
import LanguageMenu from "../common/components/LanguageMenu";

function TermsPage() {
	const { i18n, t } = useTranslation();
	const [content, setContent] = useState("");
	const [loading, setLoading] = useState(true);
	const { user } = useUser();

	const files = {
		'en': () => import('../../public/terms.en.txt?raw'),
		'fr': () => import('../../public/terms.fr.txt?raw'),
		'jp': () => import('../../public/terms.jp.txt?raw'),
	}

	useEffect(() => {
		setLoading(true);

		const f = files[i18n.language] || files['fr'];
		f()
			.then((module) => setContent(module.default))
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

export default TermsPage