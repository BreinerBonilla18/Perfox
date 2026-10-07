import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import type { Database } from './client';
import { categories, savingsGoals, transactions } from './schema';
import { toIsoDate } from '@/lib/date';

const BACKUP_VERSION = 1;

export type BackupPayload = {
  version: number;
  exportedAt: string;
  categories: (typeof categories.$inferSelect)[];
  savingsGoals: (typeof savingsGoals.$inferSelect)[];
  transactions: (typeof transactions.$inferSelect)[];
};

export function buildSnapshot(database: Database): BackupPayload {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    categories: database.select().from(categories).all(),
    savingsGoals: database.select().from(savingsGoals).all(),
    transactions: database.select().from(transactions).all(),
  };
}

export function toCsv(database: Database): string {
  const header = 'id,tipo,monto,categoria,meta,nota,fecha';
  const categoryNames = new Map(
    database.select().from(categories).all().map((category) => [category.id, category.name]),
  );
  const goalNames = new Map(
    database.select().from(savingsGoals).all().map((goal) => [goal.id, goal.name]),
  );

  const rows = database.select().from(transactions).all().map((tx) => {
    const amount = (tx.amountCents / 100).toFixed(2);
    return [
      String(tx.id),
      tx.type,
      amount,
      escapeCsv(tx.categoryId ? (categoryNames.get(tx.categoryId) ?? '') : ''),
      escapeCsv(tx.goalId ? (goalNames.get(tx.goalId) ?? '') : ''),
      escapeCsv(tx.note ?? ''),
      tx.date,
    ].join(',');
  });
  return [header, ...rows].join('\n');
}

function escapeCsv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

async function shareFile(name: string, contents: string, mimeType: string) {
  const file = new File(Paths.cache, name);
  if (file.exists) file.delete();
  file.create();
  file.write(contents);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType, dialogTitle: 'Respaldo de Perfox' });
  }
  return file.uri;
}

export async function exportJson(database: Database) {
  const name = `perfox-respaldo-${toIsoDate()}.json`;
  return shareFile(name, JSON.stringify(buildSnapshot(database), null, 2), 'application/json');
}

export async function exportCsvFile(database: Database) {
  const name = `perfox-transacciones-${toIsoDate()}.csv`;
  return shareFile(name, toCsv(database), 'text/csv');
}

function assertPayload(value: unknown): asserts value is BackupPayload {
  const payload = value as Partial<BackupPayload> | null;
  if (
    !payload ||
    typeof payload !== 'object' ||
    !Array.isArray(payload.transactions) ||
    !Array.isArray(payload.categories) ||
    !Array.isArray(payload.savingsGoals)
  ) {
    throw new Error('El archivo no tiene el formato de un respaldo de Perfox.');
  }
}

export function importJson(database: Database, contents: string) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(contents);
  } catch {
    throw new Error('No se pudo leer el archivo: JSON inválido.');
  }
  assertPayload(parsed);

  database.transaction((tx) => {
    tx.delete(transactions).run();
    tx.delete(categories).run();
    tx.delete(savingsGoals).run();

    if (parsed.categories.length) tx.insert(categories).values(parsed.categories).run();
    if (parsed.savingsGoals.length) tx.insert(savingsGoals).values(parsed.savingsGoals).run();
    if (parsed.transactions.length) tx.insert(transactions).values(parsed.transactions).run();
  });

  return {
    categories: parsed.categories.length,
    savingsGoals: parsed.savingsGoals.length,
    transactions: parsed.transactions.length,
  };
}

export async function pickAndImportJson(database: Database) {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (result.canceled) return null;

  const asset = result.assets?.[0];
  if (!asset) return null;

  const contents = await new File(asset.uri).text();
  return importJson(database, contents);
}
