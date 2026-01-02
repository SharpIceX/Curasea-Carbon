import globals from 'globals';
import eslint from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import eslintConfigPrettier from 'eslint-config-prettier/flat';

const config = defineConfig([
	eslint.configs.recommended,
	tseslint.configs.strictTypeChecked,
	tseslint.configs.stylisticTypeChecked,
	jsdoc.configs['flat/recommended-typescript-error'],
	eslintPluginUnicorn.configs.recommended,
	eslintConfigPrettier,
	{
		languageOptions: {
			globals: globals.node,
			parserOptions: {
				projectService: true,
				sourceType: 'module',
				ecmaVersion: 'latest',
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			eqeqeq: 'error',
			'unicorn/prevent-abbreviations': [
				'error',
				{
					checkFilenames: false,
				},
			],
			'jsdoc/tag-lines': [
				'warn',
				'any',
				{
					startLines: 1,
					endLines: 0,
				},
			],
		},
	},
	{
		files: ['*.ts', '*.tsx'],
		ignores: ['node_modules', 'dist', 'data'],
	},
]);

export default config;
