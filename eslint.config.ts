/**
 * SPDX-FileCopyrightText: 2026 锐冰(SharpIce)
 * SPDX-License-Identifier: 0BSD
 */

import antfu from '@antfu/eslint-config';

const config = antfu(
	{
		yaml: false,
		markdown: false,
		stylistic: false,
		lessOpinionated: true,
		typescript: {
			parserOptions: {
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
		rules: {
			eqeqeq: 'error',

			// 安全性
			'pnpm/yaml-enforce-settings': 'off',

			// 允许手动排序
			'jsonc/sort-keys': 'off',
			'perfectionist/sort-imports': 'off',
			'perfectionist/sort-named-imports': 'off',
			'perfectionist/sort-named-exports': 'off',

			// 代码样式
			'ts/no-import-type-side-effects': 'off',
			'import/consistent-type-specifier-style': 'off',
		},
	},
);

export default config;
