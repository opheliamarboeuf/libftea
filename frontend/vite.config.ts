import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
	base: '/transcendence/',
	server: {
		host: '0.0.0.0',
		port: 5173,
		hmr: {
			clientPort: 4433,
			protocol: 'wss',
		},
	},
	plugins: [react()],
});
