import React from 'react';
import { createRoot } from 'react-dom/client';
import { CustomThemeProvider } from '@/components/ThemeProvider';
import App from './App.tsx';
import './index.css';

const container = document.getElementById('root');
if (!container) {
	throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(
	<React.StrictMode>
		<CustomThemeProvider defaultTheme='system' storageKey='artic-theme'>
			<App />
		</CustomThemeProvider>
	</React.StrictMode>,
);
