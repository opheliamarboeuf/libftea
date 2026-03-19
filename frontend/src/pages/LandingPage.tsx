import { useNavigate } from "react-router-dom";

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white">
            <div 
                className="relative flex items-center justify-center cursor-pointer"
                onClick={() => navigate('/login')}
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