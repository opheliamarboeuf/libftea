import { useEffect } from "react";

// Triggers the browser's native confirmation dialog when leaving the page
export function useBeforeUnload(hasChanges: () => boolean) {
useEffect(() => {
	const handler = (e: BeforeUnloadEvent) => {
	if (!hasChanges())
		return;
	e.preventDefault();
	e.returnValue = ""; // Required for Chrome to show the native confirmation dialog
	};

	window.addEventListener("beforeunload", handler); // Listen to page/tab close or refresh
	return () => window.removeEventListener("beforeunload", handler);
}, [hasChanges]);
}