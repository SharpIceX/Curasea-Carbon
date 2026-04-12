/**
 * SPDX-FileCopyrightText: 2026 SharpIce (锐冰)
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { z } from 'zod';

const configZod = z.object({
	general: z.object({
		proxy: z.string().optional().describe('代理设置'),
		timeout: z.number().default(15000).describe('代理超时时间'),
	}),
	telegram: z.object({
		enable: z.boolean().default(false).describe('是否启用 Telegram 适配器'),
		token: z.string().optional().describe('Telegram Bot Token'),
		whitelist_user: z
			.array(z.string())
			.default([])
			.describe('私人对话白名单 (User ID 字符串)')
			.transform((value) => {
				const set = new Set<string>();
				for (const item of value) {
					const trimmed = item.trim();
					if (trimmed) set.add(trimmed);
				}
				return set;
			}),
	}),
});

export { configZod };
