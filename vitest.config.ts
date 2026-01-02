// vitest.config.ts
import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'node',
		include: ['test/**/*.test.ts'],
		alias: {
			$: path.resolve(import.meta.dirname, 'src'),
		},
		coverage: {
			provider: 'v8',
			reportsDirectory: path.resolve(import.meta.dirname, '.temp/coverage'),
			reporter: ['text'],
			exclude: ['node_modules/', 'dist/', 'test/', '**/*.test.ts', '**/index.ts'],
		},
	},
});
