import isInt from 'validator/es/lib/isInt';
import isFloat from 'validator/es/lib/isFloat';

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
	 */
	option: Record<string, string | boolean | number>;

	/**
	 * ```
	 * EN: Arguments not associated with any option.
	 * ZH: 不与任何选项关联的独立参数。
	 * ```
	 */
	isolated: string[];
}

/**
 * EN:
 * ```
 * Parse command line arguments into an option object and isolated arguments.
 * Only supports key-value pairs in `--key=value` or `-k=value` format (equals sign required).
 * Does NOT support space-separated values (e.g., `-k value`).
 * Short flags (e.g., `-v`) are supported as boolean options.
 * Combined short options (e.g., `-abc`) are NOT supported and will be treated as a single option name.
 * Parses according to POSIX standards: arguments after `--` are treated as positional (isolated) arguments.
 * ```
 * ZH:
 * ```
 * 将命令行参数解析为选项对象与独立参数。
 * 仅支持 `--key=value` 或 `-k=value` 格式的键值对（必须使用等号连接）。
 * 不支持空格分隔的值（例如 `-k value`）。
 * 单字母标志（如 `-v`）可作为布尔选项使用。
 * 不支持组合短选项（如 `-abc`），此类输入将被视为单一选项名。
 * 根据 POSIX 标准解析：`--` 之后的参数视为位置参数（归入 isolated）。
 * ```
 *
 * @param commandLine
 * ```
 * EN: An array of command line arguments (e.g., process.argv.slice(2)).
 * ZH: 命令行参数数组（例如 process.argv.slice(2)）。
 * ```
 *
 * @example
 * `node app.js --host=localhost --p=08080 --time=10.1 --debug=false --verbose -f args1 args2 -- --not-an-option args3 args4`
 *
 * @returns
 * ```json
 * {
 *   "option": {
 *     "host": "localhost",
 *     "p": 8080,
 *     "time": 10.1,
 *     "debug": false,
 *     "verbose": true,
 *     "f": true
 *   },
 *   "isolated": [
 *     "args1",
 *     "args2",
 *     "--not-an-option",
 *     "args3",
 *     "args4"
 *   ]
 * }
 * ```
 */
function parseOption(commandLine: string[]): CommandOption {
	const options: CommandOption = {
		option: {},
		isolated: [],
	};

	let commandLineCopy = commandLine.filter((argument) => argument.trim() !== '');

	// 如果有`--`，则切出前后部分，等待前面处理完再合并
	const delimiterIndex = commandLineCopy.indexOf('--');
	const isolated: CommandOption['isolated'] = [];
	if (delimiterIndex !== -1) {
		isolated.push(...commandLineCopy.slice(delimiterIndex + 1));
		commandLineCopy = commandLineCopy.slice(0, delimiterIndex);
	}

	for (const originalArgument of commandLineCopy) {
		// 处理开头直接为等于号的天才情况
		if (!originalArgument.startsWith('-') && originalArgument.includes('=')) {
			// console.warn(`Why do you pass an argument starting with '='? Argument: "${originalArgument}"`);
			continue;
		}

		// 处理开头无`-`的独立参数
		if (!originalArgument.startsWith('-')) {
			options.isolated.push(originalArgument);
			continue;
		}

		// 去除开头所有的破折号
		const argument = originalArgument.replace(/^-+/, '');

		// 处理全是破折号的情况
		if (argument.length === 0) {
			// console.warn(`Why do you pass so many dashes? Argument: "${originalArgument}"`);
			continue;
		}

		// 处理无`=`的布尔选项
		if (!argument.includes('=')) {
			options.option[argument] = true;
			continue;
		}

		// 拆出 key 和 value
		let [key, value] = argument.split('=');

		// 处理`=value`的抖M情况，直接丢弃
		if (!key || key === '') {
			// console.warn(`Why do you pass an empty value? Argument: "${originalArgument}"`);
			continue;
		}

		// 处理`key=`的空值情况，直接丢弃
		if (!value || value === '') {
			// console.warn(`Why do you pass an empty value? Argument: "${originalArgument}"`);
			continue;
		}

		key = key.trim();
		value = value.trim();

		// 布尔值处理
		const lowerValue = value.toLowerCase();
		if (lowerValue === 'true' || lowerValue === 'false') {
			options.option[key] = lowerValue === 'true';
			continue;
		}

		// 处理整数。允许前导零（007、0123）
		if (isInt(value, { allow_leading_zeroes: true })) {
			const number_ = Number.parseInt(value, 10);
			options.option[key] = Number.isSafeInteger(number_) ? number_ : value;
			continue;
		}

		// 处理浮点数。排除 Infinity/NaN 避免解析出非有限数值
		if (isFloat(value)) {
			const number = Number.parseFloat(value);
			if (Number.isFinite(number)) {
				options.option[key] = number;
				continue;
			}
		}

		// 其他一律作为字符串处理
		options.option[key] = value;
	}

	options.isolated.push(...isolated);
	return options;
}

export { parseOption };
export type { CommandOption };
