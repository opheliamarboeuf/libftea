import { useEffect, useRef, useState } from "react";
import i18n from "../../i18n";
import { useTranslation } from "react-i18next";
import './LanguageMenu.css'

interface Props {
	fixed?: boolean ;
}

const LanguageMenu = ({ fixed = false }: Props) => {
	const { t } = useTranslation();
	const languages = [ 
		{ code: 'en', label: 'EN'},
		{ code: 'fr', label: 'FR'},
		{ code: 'jp', label: 'JP'},
	];
	const [ langMenuHidden, setLangMenuHidden ] = useState(true);
	const ref = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node))
				setLangMenuHidden(true);
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	return (
		<div className={`language-dropdown ${fixed ? "fixed" : "" } ${!langMenuHidden ? "open" : "" }`}
			ref={ref}
			onMouseEnter={() => setLangMenuHidden(false)}
			onMouseLeave={() => setLangMenuHidden(true)}
		>
			<div className="language-drop-button">
				{t('common.languages')}
			</div>
			<div className="l-menu">
				{languages.map(lang => (
					<button
						className="language-button"
						key={lang.code}
						onClick={() => {
							i18n.changeLanguage(lang.code);
							setLangMenuHidden(true);
						}}
					>
						{lang.label}
					</button>
				))}
			</div>
		</div>
	);
};

export default LanguageMenu;