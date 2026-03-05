import { useState, useEffect, useRef } from "react";
import { friendsApi } from "../../friends/api";

export interface useUserProfileMenuResult {
	menuRef: React.RefObject<HTMLDivElement>;
	openMenu: boolean;
	toggleMenu: () => void;
	handleReport: () => void;
	handleBlock: () => void;
}

export function useUserProfileMenu() {

	const [openMenu, setOpenMenu] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);	

	// Detect clicks outside of the menu
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			// If the menu exists and the clicked element is NOT inside the menu
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				// Close the menu
				setOpenMenu(false);
			}
		};
		// Add an event listener for mouse clicks
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			// Cleanup function: remove the event listener when component unmounts
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const toggleMenu = () => {
		setOpenMenu(prev => !prev);
	}
	const handleBlock = async () => {
		console.log("is blocked");
	}

	const handleReport = async () => {
		console.log("is reported");
	}
	return {
		menuRef,
		openMenu,
		toggleMenu,
		handleBlock, 
		handleReport,
	};
}