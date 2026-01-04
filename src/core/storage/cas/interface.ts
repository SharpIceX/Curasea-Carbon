import type { Mime } from 'mime';

/**
 * EN: A binary blob with metadata
 * ZH: 带元数据的二进制数据对象
 */
interface BlobItem {
	/**
	 * ```
	 * EN: SHA-512 hash of the data
	 * ZH: 数据的 SHA-512 哈希值
	 * ```
	 */
	sha512: Buffer;

	/**
	 * ```
	 * EN: Original filename
	 * ZH: 原始文件名
	 * ```
	 */
	name: string;

	/**
	 * ```
	 * EN: MIME type
	 * ZH: MIME 类型
	 * ```
	 */
	mime: Mime;

	/**
	 * ```
	 * EN: Binary content
	 * ZH: 二进制数据内容
	 * ```
	 */
	data: Buffer;

	/**
	 * ```
	 * EN: Size in bytes
	 * ZH: 数据总字节数
	 * ```
	 */
	size: number;
}

export type { BlobItem };
