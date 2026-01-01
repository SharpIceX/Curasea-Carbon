import fs from 'node:fs';
import path from 'node:path';
import type { ITransport } from '../interface';

class FileTransport implements ITransport {
	private readonly logDirectory: string;
	private debugDirectory: string | undefined;
	private traceDirectory: string | undefined;
	private crashDirectory: string | undefined;

	/**
	 * @param directory
	 * ```
	 * EN: Must be an absolute path
	 * ZH: 必须使用绝对路径
	 * ```
	 */
	constructor(directory: string) {
		this.logDirectory = directory;
	}

	initialization(hasDebug: boolean, hasTrace: boolean): void {
		this.crashDirectory = path.join(this.logDirectory, 'crash');
		fs.mkdirSync(this.crashDirectory, { recursive: true });

		if (hasDebug) {
			this.debugDirectory = path.join(this.logDirectory, 'debug');
			fs.mkdirSync(this.debugDirectory, { recursive: true });
		}

		if (hasTrace) {
			this.traceDirectory = path.join(this.logDirectory, 'trace');
			fs.mkdirSync(this.traceDirectory, { recursive: true });
		}
	}

	write(level: number, timestamp: string, name: string, message: string): void {
		// TODO
	}

	writeTrace(timestamp: string, name: string, action: string, details?: Record<string, unknown>): void {
		// TODO
	}
}

export { FileTransport };
