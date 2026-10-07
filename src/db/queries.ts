import { and, desc, eq, like, or, sql, type SQL } from 'drizzle-orm';

import type { Database } from './client';
import {
  categories,
  savingsGoals,
  transactions,
  type NewSavingsGoal,
  type SavingsGoal,
  type Transaction,
  type TxType,
} from './schema';

export type TransactionRow = Transaction & {
  categoryName: string | null;
  categoryIcon: string;
  categoryColor: string;
  goalName: string | null;
};

export type CategoryTotal = {
  categoryId: number | null;
  name: string;
  icon: string;
  color: string;
  totalCents: number;
  share: number;
};

export type GoalWithProgress = SavingsGoal & {
  savedCents: number;
  progress: number;
  remainingCents: number;
};

export type FinanceSummary = {
  month: string;
  availableCents: number;
  totalIncomeCents: number;
  totalExpenseCents: number;
  totalSavingsCents: number;
  monthIncomeCents: number;
  monthExpenseCents: number;
  monthSavingsCents: number;
};

const txRowFields = {
  id: transactions.id,
  type: transactions.type,
  amountCents: transactions.amountCents,
  categoryId: transactions.categoryId,
  goalId: transactions.goalId,
  note: transactions.note,
  date: transactions.date,
  month: transactions.month,
  createdAt: transactions.createdAt,
  categoryName: categories.name,
  categoryIcon: sql<string>`coalesce(${categories.icon}, 'help-circle-outline')`,
  categoryColor: sql<string>`coalesce(${categories.color}, '#98A2B3')`,
  goalName: savingsGoals.name,
};

const sumFor = (type: TxType) =>
  sql<number>`coalesce(sum(case when ${transactions.type} = ${type} then ${transactions.amountCents} else 0 end), 0)`;

export function getSummary(database: Database, month: string): FinanceSummary {
  const allTime = database
    .select({
      income: sumFor('income'),
      expense: sumFor('expense'),
      savings: sumFor('savings'),
    })
    .from(transactions)
    .get();

  const forMonth = database
    .select({
      income: sumFor('income'),
      expense: sumFor('expense'),
      savings: sumFor('savings'),
    })
    .from(transactions)
    .where(eq(transactions.month, month))
    .get();

  const totalIncomeCents = allTime?.income ?? 0;
  const totalExpenseCents = allTime?.expense ?? 0;
  const totalSavingsCents = allTime?.savings ?? 0;

  return {
    month,
    totalIncomeCents,
    totalExpenseCents,
    totalSavingsCents,
    availableCents: totalIncomeCents - totalExpenseCents - totalSavingsCents,
    monthIncomeCents: forMonth?.income ?? 0,
    monthExpenseCents: forMonth?.expense ?? 0,
    monthSavingsCents: forMonth?.savings ?? 0,
  };
}

export function getRecentTransactions(
  database: Database,
  limit: number,
  type?: TxType | 'all',
): TransactionRow[] {
  const where =
    type && type !== 'all' ? eq(transactions.type, type) : undefined;

  return database
    .select(txRowFields)
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .leftJoin(savingsGoals, eq(transactions.goalId, savingsGoals.id))
    .where(where)
    .orderBy(desc(transactions.date), desc(transactions.id))
    .limit(limit)
    .all();
}

export function getTransactions(
  database: Database,
  options: {
    month?: string;
    type?: TxType | 'all';
    search?: string;
    limit?: number;
  } = {},
): TransactionRow[] {
  const conditions: (SQL | undefined)[] = [];
  if (options.month) conditions.push(eq(transactions.month, options.month));
  if (options.type && options.type !== 'all') conditions.push(eq(transactions.type, options.type));

  const search = options.search?.trim();
  if (search) {
    const pattern = `%${search}%`;
    const match = or(like(transactions.note, pattern), like(categories.name, pattern));
    if (match) conditions.push(match);
  }

  return database
    .select(txRowFields)
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .leftJoin(savingsGoals, eq(transactions.goalId, savingsGoals.id))
    .where(and(...conditions))
    .orderBy(desc(transactions.date), desc(transactions.id))
    .limit(options.limit ?? 300)
    .all();
}

export function getExpensesByCategory(database: Database, month: string): CategoryTotal[] {
  const rows = database
    .select({
      categoryId: categories.id,
      name: categories.name,
      icon: categories.icon,
      color: categories.color,
      totalCents: sql<number>`coalesce(sum(${transactions.amountCents}), 0)`,
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(and(eq(transactions.month, month), eq(transactions.type, 'expense')))
    .groupBy(categories.id)
    .orderBy(desc(sql`sum(${transactions.amountCents})`))
    .all();

  const total = rows.reduce((acc, row) => acc + row.totalCents, 0);

  return rows.map((row) => ({
    categoryId: row.categoryId,
    name: row.name ?? 'Sin categoría',
    icon: row.icon ?? 'help-circle-outline',
    color: row.color ?? '#98A2B3',
    totalCents: row.totalCents,
    share: total > 0 ? row.totalCents / total : 0,
  }));
}

export function getSavingsGoals(database: Database, includeArchived = false): GoalWithProgress[] {
  const goals = database
    .select()
    .from(savingsGoals)
    .where(includeArchived ? undefined : eq(savingsGoals.archived, false))
    .orderBy(desc(savingsGoals.createdAt))
    .all();

  const saved = database
    .select({
      goalId: transactions.goalId,
      total: sql<number>`coalesce(sum(${transactions.amountCents}), 0)`,
    })
    .from(transactions)
    .where(eq(transactions.type, 'savings'))
    .groupBy(transactions.goalId)
    .all();

  const savedByGoal = new Map(saved.map((row) => [row.goalId ?? 0, row.total]));

  return goals.map((goal) => {
    const savedCents = savedByGoal.get(goal.id) ?? 0;
    const progress = goal.targetCents > 0 ? Math.min(savedCents / goal.targetCents, 1) : 0;
    return {
      ...goal,
      savedCents,
      progress,
      remainingCents: Math.max(goal.targetCents - savedCents, 0),
    };
  });
}

export function getTransactionById(database: Database, id: number): TransactionRow | undefined {
  return database
    .select(txRowFields)
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .leftJoin(savingsGoals, eq(transactions.goalId, savingsGoals.id))
    .where(eq(transactions.id, id))
    .get();
}

export type TransactionInput = {
  type: TxType;
  amountCents: number;
  categoryId: number | null;
  goalId: number | null;
  note: string | null;
  date: string;
  month: string;
};

export function addTransaction(database: Database, input: TransactionInput) {
  return database.insert(transactions).values(input).returning().get();
}

export function updateTransaction(database: Database, id: number, input: TransactionInput) {
  return database
    .update(transactions)
    .set(input)
    .where(eq(transactions.id, id))
    .returning()
    .get();
}

export function deleteTransaction(database: Database, id: number) {
  database.delete(transactions).where(eq(transactions.id, id)).run();
}

export function createSavingsGoal(
  database: Database,
  input: Omit<NewSavingsGoal, 'createdAt' | 'archived'>,
) {
  return database.insert(savingsGoals).values(input).returning().get();
}

export function updateSavingsGoal(
  database: Database,
  id: number,
  input: Partial<Omit<NewSavingsGoal, 'id' | 'createdAt'>>,
) {
  return database.update(savingsGoals).set(input).where(eq(savingsGoals.id, id)).returning().get();
}

export function deleteSavingsGoal(database: Database, id: number) {
  database.delete(savingsGoals).where(eq(savingsGoals.id, id)).run();
}

export function deleteAllData(database: Database) {
  database.delete(transactions).run();
  database.delete(categories).where(sql`${categories.isDefault} = 0`).run();
  database.delete(savingsGoals).run();
}
