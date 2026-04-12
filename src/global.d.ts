/**
 * SPDX-FileCopyrightText: 2026 SharpIce (锐冰)
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { z } from 'zod';
import type koishi from 'koishi';
import type { configZod } from './config';

declare global {
	// eslint-disable-next-line vars-on-top
	var _cur: {
		dataDir: string;

		koishiContext: koishi.Context;

		config: z.infer<typeof configZod>;
	};
}
