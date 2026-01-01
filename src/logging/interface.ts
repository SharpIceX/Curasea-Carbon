/**
 * ```
 * EN: Log levels for categorization.
 * ZH: 日志级别枚举。
 * ```
 */
enum LogLevel {
	INFO = 0,
	WARN = 1,
	ERROR = 2,
	FATAL = 3,
	DEBUG = -1,
	TRACE = -2,
}

/**
 * ```
 * EN: Transport interface for defining output targets.
 * ZH: 传输接口，用于定义输出目标。
 * ```
 */
interface ITransport {
	/**
	 * ```
	 * EN: Initialization function called when the factory is initialized.
	 * ZH: 初始化函数，在初始化工厂时调用。
	 * ```
	 */
	initialization(hasDebug: boolean, hasTrace: boolean): void;

	/**
	 * ```
	 * EN: Write a standard log message.
	 * ZH: 写入标准日志消息。
	 * ```
	 */
	write(level: LogLevel, timestamp: string, name: string, message: string): void;

	/**
	 * ```
	 * EN: Write a trace log message.
	 * ZH: 写入追踪日志消息。
	 * ```
	 */
	writeTrace?(timestamp: string, name: string, action: string, details?: Record<string, unknown>): void;
}

export { LogLevel };
export type { ITransport };
