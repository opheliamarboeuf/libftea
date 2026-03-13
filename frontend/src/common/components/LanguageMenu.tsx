import { useState } from "react";
import i18n from "../../i18n";

interface Props {
	fixed?: boolean ;
}

const LanguageMenu = ({ fixed = false }: Props) => {
	const languages = [ 
		{ code: 'fr', label: 'FR'},
		{ code: 'en', label: 'EN'},
	];
	const [ langMenuHidden, setLangMenuHidden ] = useState(true);

	return (
		<div
			onMouseLeave={() => setLangMenuHidden(true)}
			style={{
				position: fixed ? 'fixed' : 'relative',
				top: fixed ? '16px' : 'auto',
				right: fixed ? '16px' : 'auto',
				zIndex: fixed ? 10000 : 'auto',
				display: 'inline-block',
			}}
		>
			<button onClick={() => setLangMenuHidden(!langMenuHidden)}
				style={{
					backgroundColor: '#f0f0f0',
					color: '#333',
					padding: '5px 10px',
					border: '1px solid #ccc',
					borderRadius: '4px',
					cursor: 'pointer',
					fontWeight: 'bold',
					fontSize: '0.85rem',
				}}
				>
				{i18n.language.toUpperCase()} ▼
			</button>
				{ !langMenuHidden && (
					<div
						style={{
								position: 'absolute',
								top: '100%',
								right: '0',
								backgroundColor: '#fff',
								border: '1px solid #ccc',
								borderRadius: '4px',
								boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
								zIndex: 10000,
								minWidth: '80px',
								display: 'flex',
								flexDirection: 'column',
								padding: '0',
							}}
					>
						{languages.map(lang => (
							<button
								key={lang.code}
								style={{
									display: 'block',
									width: '100%',
									padding: '5px 10px',
									background: 'none',
									border: 'nonde',
									borderRadius: '0',
									textAlign: 'left',
									cursor: 'pointer',
									color: '#333',
									fontSize: '0.85rem',
									fontWeight: 'normal',
									margin: '0',
								}}
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