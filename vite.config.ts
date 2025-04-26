import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
		mainFields: ['module', 'main'],
		conditions: ['import', 'module', 'require', 'default'],
	},
	optimizeDeps: {
		exclude: ['lucide-react'],
		esbuildOptions: {
			target: 'esnext',
		},
	},
	build: {
		target: 'esnext',
		rollupOptions: {
			external: [/@modelcontextprotocol\/sdk/],
		},
	},
	server: {
		proxy: {
			'/api': {
				target: 'http://localhost:3000',
				changeOrigin: true,
				secure: false,
			},
		},
	},
});
