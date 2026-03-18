import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import './LeftMenu.css'

type PrivacyButtonProps = {
	icon?: React.ReactNode;
	className?: string;
}

export function PrivacyButton({ icon, className }: PrivacyButtonProps) {
	const { t } = useTranslation();

	return (
		<Link to={'/privacypolicy'} className={className || "menu-bottom-item"}>
			{icon && <span className="icon">{icon}</span>}
			<span className="label">{t('common.privacy')}</span>
		</Link>
	);
}