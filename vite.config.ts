import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    resolve: {
        alias: {
            '@components': path.resolve(__dirname, 'src/components'),
            '@styles': path.resolve(__dirname, 'src/styles'),
            '@services': path.resolve(__dirname, 'src/services'),
            '@icons': path.resolve(__dirname, 'src/icons')
        }
    }
});