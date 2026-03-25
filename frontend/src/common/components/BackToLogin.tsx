import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import '../../pages/Legal.css'

export function BackToLoginButton() {
	const { t } = useTranslation();

	return (
		<div className="back-button">
			<Link to={'/login'}>
				<FaArrowLeft />
				{t('common.back')}
			</Link>
		</div>
	)
}