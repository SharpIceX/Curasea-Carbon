import postgres from 'postgres';
import create_table_sql from './sql/create_table.sql';

/**
 * ```
 * EN: Content-Addressable Storage System Based on PostgreSQL
 * ZH: 基于 PostgreSQL 的内容可寻址存储系统
 * ```
 */
class CASManager {
	public readonly databaseContext: ReturnType<typeof postgres>;

	/**
	 * @param connectionString
	 * ```
	 * EN: PostgreSQL connection string
	 * ZH: PostgreSQL 连接字符串
	 * ```
	 *
	 * @param connectionOptions
	 * ```
	 * EN: Optional postgres connection options
	 * ZH: 可选的 postgres 连接配置
	 * ```
	 */
	constructor(connectionString: string, connectionOptions: Parameters<typeof postgres>[1] = {}) {
		this.databaseContext = postgres(connectionString, connectionOptions);
	}
}
