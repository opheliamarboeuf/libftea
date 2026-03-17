import { useState } from "react";
import i18n from "../../i18n";
import './LanguageMenu.css'

interface Props {
	fixed?: boolean ;
}

const LanguageMenu = ({ fixed = false }: Props) => {
	const languages = [ 
		{ code: 'fr', label: '🇫🇷 FR'},
		{ code: 'en', label: '🇺🇸 EN'},
		{ code: 'jp', label: '🇯🇵 JP'},
	];
	const [ langMenuHidden, setLangMenuHidden ] = useState(true);

	return (
		<div className={`language-dropdown ${fixed ? "fixed" : "" }`}
			onMouseLeave={() => setLangMenuHidden(true)}
		>
			<button
				className="language-drop-button"
				onClick={() => setLangMenuHidden(!langMenuHidden)}>
				{i18n.language.toUpperCase()} ▼
			</button>
				{ !langMenuHidden && (
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
				)}
			</div>
	);
};

export default LanguageMenu;