import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import './LeftMenu.css'

type TermsButtonProps = {
	className?: string;
}

export function TermsButton({ className }: TermsButtonProps) {
	const { t } = useTranslation();

	return (
		<Link to={'/termsofservice'} className={className}>
			{t('common.terms')}
		</Link>
	);
}