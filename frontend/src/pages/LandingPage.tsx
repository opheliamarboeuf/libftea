import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
    const navigate = useNavigate();
    const [fading, setFading] = useState(false);

    const handleClick = () => {
        if (fading) return;
        setFading(true);
        setTimeout(() => navigate('/login'), 700);
    };

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white">
            <div
                className="relative flex items-center justify-center cursor-pointer"
                onClick={handleClick}
                style={{
                    opacity: fading ? 0 : 1,
                    transition: 'opacity 0.7s ease',
                }}
            >
                <img
                    src="src/assets/images/étoiles.jpg"
                    alt="landing"
                    className="w-80 h-80 rounded-full object-cover animate-spin-slow"
                />
                <div className="absolute flex flex-col items-center justify-center text-black">
                    <h1 className="text-2xl drop-shadow-lg" style={{ fontFamily: "'Blosta Script', cursive" }}>
                        Click to enter
                    </h1>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;