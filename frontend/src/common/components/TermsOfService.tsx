import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import './LeftMenu.css'

type TermsButtonProps = {
	icon?: React.ReactNode;
	className?: string;
}

export function TermsButton({ icon, className }: TermsButtonProps) {
	const { t } = useTranslation();

	return (
		<Link to={'/termsofservice'} className={className || "menu-bottom-item"}>
			{icon && <span className="icon">{icon}</span>}
			<span className="label">{t('common.terms')}</span>
		</Link>
	);
}