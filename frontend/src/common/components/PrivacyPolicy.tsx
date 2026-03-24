import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import './LeftMenu.css'

type PrivacyButtonProps = {
	className?: string;
}

export function PrivacyButton({ className }: PrivacyButtonProps) {
	const { t } = useTranslation();

	return (
		<Link to={'/privacypolicy'} className={className}>
			{t('common.privacy')}
		</Link>
	);
}