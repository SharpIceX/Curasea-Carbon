/**
 * SPDX-FileCopyrightText: 2026 SharpIce (锐冰)
 * SPDX-License-Identifier: AGPL-3.0-only
 */

/* eslint-disable antfu/no-top-level-await */

import koishi from 'koishi';
import path from 'node:path';
import toml from 'smol-toml';
import fs from 'node:fs/promises';
import pingPlugin from './plugin/ping';
import { configZod } from './config.js';
import serverPlugin from '@cordisjs/plugin-server';
import loggerPlugin from '@koishijs/plugin-logger';
import consolePlugin from '@koishijs/plugin-console';
import { TelegramBot } from '@satorijs/adapter-telegram';
import { HTTP as httpPlugin } from '@koishijs/plugin-http';
import * as proxyAgentPlugin from '@cordisjs/plugin-proxy-agent';
import telegramWhitelistMiddleware from './middleware/telegram_whitelist';

globalThis._cur ||= {} as typeof globalThis._cur;
globalThis._cur.dataDir = path.resolve(import.meta.dirname, '../data');

// 初始化配置
const configTomlRaw = await fs.readFile(path.resolve(globalThis._cur.dataDir, 'config.toml'), 'utf8');
const configObject = toml.parse(configTomlRaw);
globalThis._cur.config = configZod.parse(configObject);

// Koishi 实例
globalThis._cur.koishiContext = new koishi.Context({
	prefix: '/',
	prefixMode: 'strict',
});
const ctx = globalThis._cur.koishiContext;

// 基本插件
ctx.plugin(httpPlugin);

if (globalThis._cur.config.general.proxy) {
	// eslint-disable-next-line ts/ban-ts-comment
	// @ts-expect-error
	ctx.plugin(proxyAgentPlugin, {
		proxyAgent: globalThis._cur.config.general.proxy,
	});
}

// eslint-disable-next-line ts/ban-ts-comment
// @ts-expect-error
ctx.plugin(consolePlugin);
ctx.plugin(loggerPlugin, { root: path.resolve(globalThis._cur.dataDir, 'logs') });

// Telegram 支持
if (globalThis._cur.config.telegram.enable && globalThis._cur.config.telegram.token) {
	ctx.plugin(TelegramBot, {
		protocol: 'polling',
		token: globalThis._cur.config.telegram.token,
	});

	ctx.middleware(telegramWhitelistMiddleware);
}

// 额外插件
/* eslint-disable ts/ban-ts-comment */
// @ts-expect-error
ctx.plugin(serverPlugin, { port: 5140, host: '127.0.0.1' });
/* eslint-enable ts/ban-ts-comment */

// 本地插件
ctx.plugin(pingPlugin);

await ctx.start();
