import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import path from 'path';
import { resolve } from 'path';

export default defineConfig({
    base: './',
    plugins: [dts({ rollupTypes: true })],

    resolve: {
        alias: {  
            '@': path.resolve(__dirname, 'src'),
            '@app': path.resolve(__dirname, 'src/app'),
            '@flow': path.resolve(__dirname, 'src/flow'),
            '@execution': path.resolve(__dirname, 'src/execution'),
            '@containers': path.resolve(__dirname, 'src/containers'),
            '@logic': path.resolve(__dirname, 'src/logic'),
            '@data': path.resolve(__dirname, 'src/data'),
            '@shared': path.resolve(__dirname, 'src/shared'),
        },
    },

    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'GamzixCore',
            fileName: 'index',
        },
    },
});
