/**
 * ```
 * EN: Command line argument parsing return object.
 * ZH: 命令行参数解析返回对象。
 * ```
 */
interface CommandOption {
	/**
	 * ```
	 * EN: Option key-value pairs parsed from command line flags.
	 * ZH: 从命令行选项解析得到的键值对。
	 * ```
	 *
	 * @example
	 * node main.js -flag value -switch
	 * // => { flag: 'value', switch: true }
	 */
	option: Record<string, string | boolean>;

	/**
	 * ```
	 * EN: Arguments not associated with any option.
	 * ZH: 不与任何选项关联的独立参数。
	 * ```
	 *
	 * @example
	 * node main.js arg1 -flag value arg2
	 * // => ['arg1', 'arg2']
	 */
	isolated: string[];
}

/**
 * EN: Parse command line options into an array of option objects.
 * ZH: 解析命令行选项为选项对象数组。
 *
 * @param commandLine
 * ```
 * EN: An array of command line arguments.
 * ZH: 命令行参数数组。
 * ```
 *
 * @returns
 * ```
 * EN: An object containing parsed options and isolated arguments.
 * ZH: 包含解析选项和独立参数的对象。
 * ```
 */
function parseOption(commandLine: string[]): CommandOption {
	const options: CommandOption = {
		option: {},
		isolated: [],
	};

	for (let index = 0; index < commandLine.length; index++) {
		const current = String(commandLine[index]);

		if (current.startsWith('-')) {
			// 提取选项的键名，去除前导的一个或多个 '-'
			const key = current.replace(/^-+/, '');

			if (!key) continue;

			const nextValue = commandLine[index + 1];

			//  如果下一个值存在且不是另一个选项，则将其作为当前选项的值
			if (nextValue !== undefined && !nextValue.startsWith('-')) {
				options.option[key] = nextValue;
				index++;
			} else {
				options.option[key] = true;
			}
		} else {
			options.isolated.push(current);
		}
	}
	return options;
}

export { parseOption };
export type { CommandOption };
