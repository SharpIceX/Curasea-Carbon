import chalk from 'chalk';
import { LogLevel, type ITransport } from '../interface';

/**
 * ```
 * EN: Color mapping for different log levels.
 * ZH: 不同日志级别的颜色映射。
 * ```
 */
const colorMap: Record<string, (message: string) => string> = {
	[LogLevel.INFO]: chalk.whiteBright,
	[LogLevel.WARN]: chalk.yellowBright,
	[LogLevel.ERROR]: chalk.redBright,
	[LogLevel.DEBUG]: chalk.gray,
	[LogLevel.FATAL]: chalk.red.bold,
};

class ConsoleTransport implements ITransport {
	private hasDebug = false;

	initialization(hasDebug: boolean): void {
		this.hasDebug = hasDebug;
	}

	write(level: LogLevel, timestamp: string, name: string, message: string): void {
		const colorFunction = colorMap[level] ?? chalk.white;
		const output = colorFunction(`[${timestamp}] [${LogLevel[level]}] [${name}]: ${message}\n`);

		if (level === LogLevel.ERROR || level === LogLevel.FATAL) {
			process.stderr.write(output);
		} else {
			if (level === LogLevel.DEBUG && !this.hasDebug) return;
			process.stdout.write(output);
		}
	}
}

export { ConsoleTransport };
