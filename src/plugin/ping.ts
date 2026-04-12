/**
 * SPDX-FileCopyrightText: 2026 SharpIce (锐冰)
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type koishi from 'koishi';

const command: koishi.Plugin.Object = {
	name: '@curasea-carbon/ping',
	apply: (ctx) => {
		ctx.command('ping', '心跳测试').action(() => 'pong');
	},
};

export default command;
