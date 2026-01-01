import { LogLevel, type ITransport } from './interface';

const noop = (): void => {
	/* Empty */
};

/**
 * ```
 * EN: Format an Error object into a string message, including its stack and cause.
 * ZH: 将 Error 对象格式化为错误消息字符串，包括其堆栈信息和原因。
 *
 * ! Note:
 * ! EN: Only compatible with V8 engine, as the stack format handling is written for V8 only.
 * ! ZH: 只兼容 V8 引擎，因为 stack 的处理格式只写了 V8 引擎的格式。
 * ```
 *
 * @param error
 * ```
 * EN: The Error object to format.
 * ZH: 要格式化的错误对象。
 * ```
 *
 * @param seen
 * ```
 * EN: A WeakSet to track seen errors and prevent circular references.
 * ZH: 用于跟踪已见错误并防止循环引用的 WeakSet。
 * ```
 *
 * @returns
 * ```
 * EN: The formatted error message string.
 * ZH: 格式化后的错误消息字符串。
 * ```
 */
function formatError(error: Error, seen = new WeakSet<object>()): string {
	// 防止循环引用
	if (seen.has(error)) return '[Circular Error]';
	seen.add(error);

	const header = `${error.name}: ${error.message}`;
	const details: string[] = [];

	if (error.stack) {
		const stackLines = error.stack.split('\n').slice(1);
		details.push(...stackLines.map((line) => line.trim()));
	}

	if (error.cause !== undefined && error.cause !== null) {
		let causeString: string;

		if (typeof error.cause === 'object') {
			// 如果 cause 是对象，先检查循环引用
			if (seen.has(error.cause)) {
				causeString = '[Circular Error]';
			} else {
				// 如果是 Error 实例，递归格式化
				if (error.cause instanceof Error) {
					causeString = formatError(error.cause, seen);
				} else {
					// 如果是普通对象，尝试 JSON 序列化
					try {
						// 加入 seen 防止这个对象内部引用了之前的错误
						seen.add(error.cause);
						causeString = JSON.stringify(error.cause, undefined, 2);
					} catch {
						causeString = '[Unserializable Object]';
					}
				}
			}
		} else {
			// 如果是 string, number, boolean 等原始类型，则直接转字符串
			causeString = String(error.cause as unknown);
		}

		details.push(`Caused by: ${causeString}`);
	}

	if (details.length === 0) return header;

	const formattedDetails = details.join('\n').replaceAll(/^(?!\s*$)/gm, '\t');

	return `${header}\n${formattedDetails}`;
}

/**
 * EN: Instantiate a logger.
 * ZH: 实例化日志记录器。
 */
class LoggerFactory {
	private readonly transports: ITransport[] = [];
	private readonly hasDebug: boolean;
	private readonly hasTrace: boolean;

	/**
	 * @param transports
	 * ```
	 * EN: One or more transports for log output.
	 * ZH: 一个或多个日志传输目标。
	 * ```
	 *
	 * @param hasDebug
	 * ```
	 * EN: Debug level log output switch.
	 * ZH: 调试级别日志输出开关
	 * ```
	 *
	 * @param hasTrace
	 * ```
	 * EN: Trace level log output switch.
	 * ZH: 跟踪级别日志输出开关
	 * ``
	 */
	constructor(transports: ITransport | ITransport[], hasDebug?: boolean, hasTrace?: boolean) {
		this.transports = Array.isArray(transports) ? transports : [transports];
		this.hasDebug = hasDebug ?? false;
		this.hasTrace = hasTrace ?? false;

		for (const transport of this.transports) {
			transport.initialization(this.hasDebug, this.hasTrace);
		}
	}

	private dispatch(level: LogLevel, name: string, message: string | Error): void {
		const timestamp = new Date().toISOString();
		let formatMessage = '';

		if (message instanceof Error) {
			formatMessage += formatError(message);
		} else {
			// 如果 message 是多行文本，则在换行开头（不包括第一行）加入`\t`
			formatMessage += message.includes('\n')
				? message
						.split('\n')
						.map((line, index) => (index === 0 ? line : `\t${line}`))
						.join('\n')
				: message;
		}

		for (const transport of this.transports) {
			transport.write(level, timestamp, name, formatMessage);
		}
	}

	private dispatchTrace(name: string, action: string, details?: Record<string, unknown>): void {
		const timestamp = new Date().toISOString();
		for (const transport of this.transports) {
			if (transport.writeTrace) transport.writeTrace(timestamp, name, action, details);
		}
	}

	create(name: string) {
		return {
			info: (message: string) => {
				this.dispatch(LogLevel.INFO, name, message);
			},
			warn: (message: string) => {
				this.dispatch(LogLevel.WARN, name, message);
			},
			error: (message: string | Error) => {
				this.dispatch(LogLevel.ERROR, name, message);
			},
			fatal: (message: string | Error) => {
				this.dispatch(LogLevel.FATAL, name, message);
			},
			debug: this.hasDebug
				? (message: string) => {
						this.dispatch(LogLevel.DEBUG, name, message);
					}
				: noop,
			trace: this.hasTrace
				? (action: string, details?: Record<string, unknown>) => {
						this.dispatchTrace(name, action, details);
					}
				: noop,
		};
	}
}

export default LoggerFactory;
