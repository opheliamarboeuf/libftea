import { time } from "console";
import { useEffect, useRef } from "react";
import { clearTimeout } from "timers";

export const useDebounce = (callback: () => void, delay:number) => {
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	const debouncedCallback = () => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		timeoutRef.current = setTimeout(() => {
			callback();
		}, delay);
	};

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	return debouncedCallback;
};