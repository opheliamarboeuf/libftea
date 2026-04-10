import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LanguageMenu from "../common/components/LanguageMenu";
import { useTranslation } from "react-i18next";
import etoiles from "../assets/images/étoiles.jpg";

const LandingPage = () => {
    const navigate = useNavigate();
	const { t, i18n } = useTranslation();
	const isJp = i18n.language === 'jp';
    const [fading, setFading] = useState(false);

    const handleClick = () => {
        if (fading) return;
        setFading(true);
        setTimeout(() => navigate('/login'), 700);
    };

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white">
			<LanguageMenu fixed/>
            <div
                className="relative flex items-center justify-center cursor-pointer"
                onClick={handleClick}
                style={{
                    opacity: fading ? 0 : 1,
                    transition: 'opacity 0.7s ease',
                }}
            >
                <img
                    src={etoiles}
                    alt="landing"
                    className="w-80 h-80 rounded-full object-cover animate-spin-slow"
                />
                <div className="absolute flex flex-col items-center justify-center text-black">
                    <h1 className="text-2xl drop-shadow-lg" style={{ fontFamily: isJp ? "'Noto Serif JP', serif" : "'Blosta Script', cursive" }}>
                        {t('common.enter')}
                    </h1>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;