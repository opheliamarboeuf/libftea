import { useState } from "react";

// Handle the closing animation of a modal before actually removing it from the DOM (ie removed from view)
interface UseModalAnimationProps {
	onClose: () => void;
	duration?: number;
}

export function useModalAnimation({ onClose, duration = 250 }: UseModalAnimationProps) {
	const [fadeOut, setFadeOut] = useState(false);

	const closeWithAnimation = () => {
		setFadeOut(true);
		setTimeout(() => {
			onClose();
		}, duration);
	};

	return {
		fadeOut,
		closeWithAnimation,
	};
}
