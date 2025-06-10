import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    resolve: {
        alias: {
           '@': path.resolve(__dirname, 'src'),
            '@app': path.resolve(__dirname, 'src/app'),
            '@producer': path.resolve(__dirname, 'src/producer'),
            '@initiator': path.resolve(__dirname, 'src/initiator'),
            '@execution': path.resolve(__dirname, 'src/execution'),
            '@storage': path.resolve(__dirname, 'src/storage'),
            '@logic': path.resolve(__dirname, 'src/logic'),
            '@data': path.resolve(__dirname, 'src/data'),
            '@shared': path.resolve(__dirname, 'src/shared'),
        },
    },
    test: {
        globals: true,
        coverage: {
            reporter: ['text', 'html'],
        },
    },
});
