import mysql, { type Pool } from "mysql2/promise";

declare global {
  var __umrahyukMySqlPool: Pool | undefined;
}

export function isMySqlConfigured(): boolean {
  return Boolean(process.env.MYSQL_URL || hasDiscreteMysqlConfig());
}

export function getMySqlPool(): Pool | null {
  if (!isMySqlConfigured()) return null;

  if (!globalThis.__umrahyukMySqlPool) {
    globalThis.__umrahyukMySqlPool = createPool();
  }
  return globalThis.__umrahyukMySqlPool;
}

function createPool(): Pool {
  if (process.env.MYSQL_URL) {
    return mysql.createPool({
      uri: process.env.MYSQL_URL,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  return mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT ?? 3306),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
}

function hasDiscreteMysqlConfig(): boolean {
  return Boolean(
    process.env.MYSQL_HOST &&
    process.env.MYSQL_USER &&
    process.env.MYSQL_DATABASE,
  );
}
