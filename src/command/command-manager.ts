import type { CommandOption } from './args';

/**
 * ```
 * EN: Command Definition Interface
 * ZH: 命令定义接口
 * ```
 */
interface CommandDefinition<K extends keyof CommandOption = keyof CommandOption> {
	/**
	 * ```
	 * EN: Command identifier
	 * ZH: 命令标识符
	 * ```
	 *
	 * @example
	 * // For a command with identifier 'build':
	 * identifier = 'build'
	 * // Usage: node main.js build --option value
	 */
	readonly identifier: K;

	/**
	 * ```
	 * EN: Command description
	 * ZH: 命令描述
	 * ```
	 *
	 * @example
	 * // For a command with identifier 'build':
	 * description = 'Build the project'
	 * // Usage: node main.js build --target production
	 * // Description helps users understand what the command does.
	 */
	readonly description?: string;

	/**
	 * ```
	 * EN: Command execution method
	 * ZH: 命令执行方法
	 * ```
	 *
	 * @param options
	 * ```
	 * EN: Parsed command options and isolated arguments.
	 * ZH: 解析后的命令选项和独立参数。
	 * ```
	 */
	method: (options: CommandOption[K]) => Promise<void>;
}

/**
 * EN: Command Manager
 * ZH: 命令管理器
 */
class CommandManager {
	private readonly definitions = new Map<keyof CommandOption, CommandDefinition>();

	/**
	 * ```
	 * EN: Register a new command
	 * ZH: 注册一个新命令
	 * ```
	 *
	 * @param definition
	 * ```
	 * EN: The command definition to register
	 * ZH: 命令定义
	 * ```
	 */
	register<K extends keyof CommandOption>(definition: CommandDefinition<K>): void {
		// 防止重复注册相同的命令
		if (this.definitions.has(definition.identifier)) {
			throw new Error(`Command "${definition.identifier}" already exists.`);
		}

		this.definitions.set(definition.identifier, definition as unknown as CommandDefinition);
	}

	/**
	 * ```
	 * EN: Run
	 * ZH: 运行
	 * ```
	 *
	 * @param identifier
	 * ```
	 * EN: The command identifier to execute
	 * ZH: 要执行的命令标识符
	 * ```
	 *
	 * @param options
	 * ```
	 * EN: The parsed command options and isolated arguments
	 * ZH: 解析后的命令选项和独立参数
	 * ```
	 */
	async execute<K extends keyof CommandOption>(identifier: K, options: CommandOption[K]): Promise<void> {
		const definition = this.definitions.get(identifier);

		if (!definition) {
			console.error(`Command "${identifier}" not found.`);
			console.info('Use "help" to see available commands.');
			return;
		}

		/**
		 * 重点：模仿 Vite 的 Hook 调用。
		 * 我们通过 identifier 找到了对应的定义。
		 * 只要 identifier 匹配，options 就一定匹配。
		 */
		const plugin = definition as unknown as CommandDefinition<K>;
		await plugin.method(options);
	}

	/**
	 * ```
	 * EN: Display help information
	 * ZH: 显示帮助信息
	 * ```
	 */
	help(): void {
		let output = `Usage: command [options]

Available Commands:`;

		for (const definition of this.definitions.values()) {
			output += `\t${definition.identifier}\t${definition.description ?? 'No description provided.'}\n`;
		}

		console.log(output);
	}
}

export default CommandManager;
export type { CommandDefinition };
