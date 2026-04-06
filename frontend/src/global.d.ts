declare module '*.css';

declare module '*.json' {
	const value: any;
	export default value;
}

declare module '*.txt?raw' {
	const content: string;
	export default content;
}

declare module '*.jpeg' {
	const src: string;
	export default src;
}

declare module '*.jpg' {
	const src: string;
	export default src;
}

declare module '*.png' {
	const src: string;
	export default src;
}

declare module '*.webp' {
	const src: string;
	export default src;
}

interface ImportMetaEnv {
	readonly VITE_API_URL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
