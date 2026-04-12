/**
 * SPDX-FileCopyrightText: 2026 SharpIce (锐冰)
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type koishi from 'koishi';

const middleware: koishi.Middleware = (session, next) => {
	if (session.platform !== 'telegram') return next();

	const tgConfig = globalThis._cur.config.telegram;

	// 用户白名单
	if (!session.userId || !tgConfig.whitelist_user.has(session.userId)) return;

	return next();
};

export default middleware;
