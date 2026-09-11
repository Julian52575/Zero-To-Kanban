import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    root: 'frontend',
    plugins: [
        react({
            include: '**/*.js',
        }),
    ],

    server: {
        proxy: {
            '/items': 'http://localhost:3000',
        },
    },
});