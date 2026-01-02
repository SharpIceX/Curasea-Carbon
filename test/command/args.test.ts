import { describe, it, expect } from 'vitest';
import { parseOption } from '$/command/args';

describe('parseOption', () => {
	// 解析标准 --key=value 格式
	// 防止用户写错等号/类型推断错误
	it('should parse basic key-value pairs', () => {
		const input = ['--host=localhost', '--port=8080', '--timeout=5.5'];
		const result = parseOption(input);
		expect(result).toEqual({
			option: {
				host: 'localhost',
				port: 8080,
				timeout: 5.5,
			},
			isolated: [],
		});
	});

	// 整数前导零处理：`0080` → `80`
	// 防止用户写 `--port=080` 却期望字符串 "080"（我们坚持转 number）
	it('should handle leading zeros in integers', () => {
		const input = ['--p=0080', '--id=0123'];
		const result = parseOption(input);
		expect(result.option['p']).toBe(80);
		expect(result.option['id']).toBe(123);
		expect(typeof result.option['p']).toBe('number');
	});

	// 浮点与科学计数法：`1e3` → `1000`
	// 防止用户传 `1.23e-5` 被当字符串
	it('should parse float and scientific notation', () => {
		const input = ['--scale=10.5', '--factor=1e3', '--small=2.5e-2'];
		const result = parseOption(input);
		expect(result.option['scale']).toBe(10.5);
		expect(result.option['factor']).toBe(1000);
		expect(result.option['small']).toBe(0.025);
	});

	// 布尔字符串转 native boolean
	// 防止用户写 `--debug=TRUE` 或 `--enabled=FaLsE` 大小写混乱
	it('should convert "true"/"false" to boolean (case-insensitive)', () => {
		const input = ['--debug=TRUE', '--enabled=False', '--flag=tRuE'];
		const result = parseOption(input);
		expect(result.option['debug']).toBe(true);
		expect(result.option['enabled']).toBe(false);
		expect(result.option['flag']).toBe(true);
		expect(typeof result.option['debug']).toBe('boolean');
	});

	// 短横线 flag 无等号 → true
	// 防止用户写 `-v`、`---f`（多破折号）被忽略
	it('should treat flags without = as boolean true', () => {
		const input = ['-v', '--verbose', '---f']; // ---f → f=true
		const result = parseOption(input);
		expect(result.option['v']).toBe(true);
		expect(result.option['verbose']).toBe(true);
		expect(result.option['f']).toBe(true);
	});

	// POSIX `--` 分隔符：之后全进 isolated
	// 防止用户传 `-- --help` 想保留 `--help` 为参数
	it('should respect -- delimiter for isolated args', () => {
		const input = ['--opt=1', 'arg1', '--', 'arg2', '--not-flag', 'arg3'];
		const result = parseOption(input);
		expect(result.option['opt']).toBe(1);
		expect(result.isolated).toEqual(['arg1', 'arg2', '--not-flag', 'arg3']);
	});

	// 非 flag 参数（无 `-` 开头）进 isolated
	// 防止用户混传文件名 `app.js config.json --port=80`
	it('should put non-flag args into isolated', () => {
		const input = ['file1.txt', '--config=path', 'file2.log'];
		const result = parseOption(input);
		expect(result.option['config']).toBe('path');
		expect(result.isolated).toEqual(['file1.txt', 'file2.log']);
	});

	// 拦截“天才”输入：`=value`、`key=`、`--=`、`-=val` —— 全跳过不污染结果
	// 防止用户手滑少打 `-` 或多打 `=`
	it('should skip malformed arguments like `=value` or `key=` (no crash, no entry)', () => {
		const input = ['=value', 'key=', '--=', '---=', '-=val'];
		const result = parseOption(input);
		expect(result.option).toEqual({});
		expect(result.isolated).toEqual([]);
		// Warnings are side effects; we just ensure no crash or pollution
	});

	// 非有限数值（Infinity/NaN）或溢出数（1e1000）fallback 为 string
	// 防止用户传 `--timeout=Infinity` 导致 JSON.stringify 崩溃
	it('should fallback to string for non-finite or unsafe numbers', () => {
		const input = [
			'--inf=Infinity',
			'--nan=NaN',
			'--big=1e1000',
			'--text=hello',
			`--unsafe=${(Number.MAX_SAFE_INTEGER + 1).toString()}`, // 9007199254740992 → string
		];
		const result = parseOption(input);
		expect(result.option['inf']).toBe('Infinity');
		expect(result.option['nan']).toBe('NaN');
		expect(result.option['big']).toBe('1e1000');
		expect(result.option['text']).toBe('hello');
		expect(result.option['unsafe']).toBe((Number.MAX_SAFE_INTEGER + 1).toString());
		expect(typeof result.option['inf']).toBe('string');
		expect(typeof result.option['unsafe']).toBe('string');
	});

	// 安全整数（±MAX_SAFE）仍转 number
	// 防止用户传 `-9007199254740991` 被误转字符串
	it('should handle safe integers and negative safe integers', () => {
		const MAX_SAFE = Number.MAX_SAFE_INTEGER;
		const input = [
			`--safe=${MAX_SAFE.toString()}`, // 9007199254740991 → number
			`--negSafe=${(-MAX_SAFE).toString()}`, // -9007199254740991 → number
			'--zero=0',
			'--minusOne=-1',
		];
		const result = parseOption(input);
		expect(result.option['safe']).toBe(MAX_SAFE);
		expect(result.option['negSafe']).toBe(-MAX_SAFE);
		expect(result.option['zero']).toBe(0);
		expect(result.option['minusOne']).toBe(-1);
		expect(typeof result.option['safe']).toBe('number');
		expect(typeof result.option['negSafe']).toBe('number');
	});

	// key/value 两边空格自动 trim
	// 防止用户写 `--  name  =  Alice  `（带多余空格）导致 key 为 `'  name  '`
	it('should trim key and value whitespace', () => {
		const input = ['--  name  =  Alice  ', '-- age = 30 ', '--flag= true '];
		const result = parseOption(input);

		// Keys are trimmed: '  name  ' → 'name', ' age ' → 'age'
		expect(result.option).toHaveProperty('name', 'Alice');
		expect(result.option).toHaveProperty('age', 30);
		expect(result.option).toHaveProperty('flag', true);

		// 原始带空格的 key 不存在（证明 trim 生效）
		expect(result.option).not.toHaveProperty('  name  ');
		expect(result.option).not.toHaveProperty(' age ');

		// trim 后仍能正确类型转换（30 → number, true → boolean）
		expect(typeof result.option['age']).toBe('number');
		expect(typeof result.option['flag']).toBe('boolean');
	});

	// 全流程回归测试：覆盖文档示例所有情况
	// 防止重构时破坏组合行为（如 isolated + flag + delimiter 混合）
	it('full example from doc', () => {
		const input = [
			'--host=localhost',
			'--p=08080', // leading zero → 8080
			'--time=10.1',
			'--debug=false', // → boolean false
			'--verbose', // → true
			'-f', // → true
			'args1',
			'args2',
			'--', // delimiter
			'--not-an-option',
			'args3',
			'args4',
		];
		const result = parseOption(input);
		expect(result).toEqual({
			option: {
				host: 'localhost',
				p: 8080,
				time: 10.1,
				debug: false,
				verbose: true,
				f: true,
			},
			isolated: ['args1', 'args2', '--not-an-option', 'args3', 'args4'],
		});
	});
});
