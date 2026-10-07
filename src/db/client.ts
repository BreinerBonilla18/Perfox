import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';

import { migrations } from './migrations';
import { seedDefaultCategories } from './seed';
import * as schema from './schema';

const DATABASE_NAME = 'perfox.db';

let sqlite: SQLiteDatabase | null = null;

function getSqlite(): SQLiteDatabase {
  sqlite ??= openDatabaseSync(DATABASE_NAME);
  return sqlite;
}

export const db = drizzle(getSqlite(), { schema });

export type Database = typeof db;

function applyMigrations(database: SQLiteDatabase) {
  database.execSync('PRAGMA journal_mode = WAL');
  database.execSync('PRAGMA foreign_keys = ON');

  const row = database.getFirstSync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;

  for (const migration of migrations) {
    if (migration.version <= current) continue;
    database.execSync('BEGIN');
    try {
      database.execSync(migration.sql);
      database.execSync(`PRAGMA user_version = ${migration.version}`);
      database.execSync('COMMIT');
    } catch (error) {
      database.execSync('ROLLBACK');
      throw error;
    }
  }
}

/** Opens the database, brings it up to date and seeds the default categories. */
function initDatabase() {
  const database = getSqlite();
  applyMigrations(database);
  seedDefaultCategories(db);
}

export const databaseStatus: { status: 'ready' | 'error'; error: unknown } = (() => {
  try {
    initDatabase();
    return { status: 'ready', error: null };
  } catch (error) {
    console.error('[perfox] database init failed', error);
    return { status: 'error', error };
  }
})();
