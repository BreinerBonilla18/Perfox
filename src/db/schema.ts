import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const TX_TYPES = ['expense', 'income', 'savings'] as const;
export type TxType = (typeof TX_TYPES)[number];

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type', { enum: TX_TYPES }).notNull(),
  icon: text('icon').notNull().default('pricetag-outline'),
  color: text('color').notNull().default('#667085'),
  isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
});

export const savingsGoals = sqliteTable('savings_goals', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  icon: text('icon').notNull().default('flag-outline'),
  color: text('color').notNull().default('#6C5CE7'),
  targetCents: integer('target_cents').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .default(sql`(unixepoch() * 1000)`),
  archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
});

export const transactions = sqliteTable(
  'transactions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    type: text('type', { enum: TX_TYPES }).notNull(),
    amountCents: integer('amount_cents').notNull(),
    categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
    goalId: integer('goal_id').references(() => savingsGoals.id, { onDelete: 'set null' }),
    note: text('note'),
    date: text('date').notNull(),
    month: text('month').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (t) => [index('transactions_month_idx').on(t.month), index('transactions_date_idx').on(t.date)],
);

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type SavingsGoal = typeof savingsGoals.$inferSelect;
export type NewSavingsGoal = typeof savingsGoals.$inferInsert;
