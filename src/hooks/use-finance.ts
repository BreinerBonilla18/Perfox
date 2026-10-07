import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';

import { db } from '@/db/client';
import {
  addTransaction,
  createSavingsGoal,
  deleteAllData,
  deleteSavingsGoal,
  deleteTransaction,
  getExpensesByCategory,
  getRecentTransactions,
  getSavingsGoals,
  getSummary,
  getTransactionById,
  getTransactions,
  updateSavingsGoal,
  updateTransaction,
  type TransactionInput,
  type TransactionRow,
} from '@/db/queries';
import { createCategory, deleteCategory, listCategories } from '@/db/seed';
import type { TxType } from '@/db/schema';

export const queryKeys = {
  root: ['perfox'] as const,
  summary: (month: string) => ['perfox', 'summary', month] as const,
  recent: (limit: number, type: TxType | 'all') => ['perfox', 'recent', limit, type] as const,
  expensesByCategory: (month: string) => ['perfox', 'expenses-by-category', month] as const,
  transactions: (params: {
    month?: string;
    type?: TxType | 'all';
    search?: string;
  }) => ['perfox', 'transactions', params] as const,
  transaction: (id: number) => ['perfox', 'transaction', id] as const,
  categories: (type: TxType | 'all') => ['perfox', 'categories', type] as const,
  goals: (includeArchived?: boolean) =>
    ['perfox', 'savings-goals', includeArchived ?? false] as const,
};

function useInvalidateFinance() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.root });
}

export function useSummary(month: string) {
  return useQuery({
    queryKey: queryKeys.summary(month),
    queryFn: () => getSummary(db, month),
  });
}

export function useRecentTransactions(limit: number, type: TxType | 'all' = 'all') {
  return useQuery({
    queryKey: queryKeys.recent(limit, type),
    queryFn: () => getRecentTransactions(db, limit, type),
  });
}

export function useExpensesByCategory(month: string) {
  return useQuery({
    queryKey: queryKeys.expensesByCategory(month),
    queryFn: () => getExpensesByCategory(db, month),
  });
}

export function useTransactions(params: {
  month?: string;
  type?: TxType | 'all';
  search?: string;
}) {
  return useQuery({
    queryKey: queryKeys.transactions(params),
    queryFn: () => getTransactions(db, params),
  });
}

export function useTransaction(id: number | null) {
  return useQuery({
    queryKey: queryKeys.transaction(id ?? 0),
    queryFn: () => (id ? getTransactionById(db, id) : undefined),
    enabled: id != null,
  });
}

export function useCategories(type: TxType | 'all' = 'all') {
  return useQuery({
    queryKey: queryKeys.categories(type),
    queryFn: () => (type === 'all' ? listCategories(db) : listCategories(db, type)),
  });
}

export function useSavingsGoals() {
  return useQuery({
    queryKey: queryKeys.goals(),
    queryFn: () => getSavingsGoals(db),
  });
}

export function useAddTransaction(): UseMutationResult<
  void,
  Error,
  TransactionInput
> {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async (input: TransactionInput) => {
      addTransaction(db, input);
    },
    onSuccess: invalidate,
  });
}

export function useUpdateTransaction(): UseMutationResult<
  void,
  Error,
  { id: number; input: TransactionInput }
> {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: TransactionInput }) => {
      updateTransaction(db, id, input);
    },
    onSuccess: invalidate,
  });
}

export function useDeleteTransaction(): UseMutationResult<void, Error, number> {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async (id: number) => deleteTransaction(db, id),
    onSuccess: invalidate,
  });
}

export function useCreateCategory(): UseMutationResult<
  number,
  Error,
  { name: string; type: TxType }
> {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async (input: { name: string; type: TxType }) =>
      createCategory(db, input).id,
    onSuccess: invalidate,
  });
}

export function useDeleteCategory(): UseMutationResult<void, Error, number> {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async (id: number) => deleteCategory(db, id),
    onSuccess: invalidate,
  });
}

export function useCreateGoal(): UseMutationResult<
  void,
  Error,
  { name: string; targetCents: number; icon?: string; color?: string }
> {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async (input: { name: string; targetCents: number; icon?: string; color?: string }) => {
      createSavingsGoal(db, {
        name: input.name.trim(),
        targetCents: input.targetCents,
        icon: input.icon ?? 'flag-outline',
        color: input.color ?? '#6C5CE7',
      });
    },
    onSuccess: invalidate,
  });
}

export function useUpdateGoal(): UseMutationResult<
  void,
  Error,
  { id: number; changes: { name?: string; targetCents?: number; archived?: boolean } }
> {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async ({ id, changes }: { id: number; changes: { name?: string; targetCents?: number; archived?: boolean } }) => {
      updateSavingsGoal(db, id, changes);
    },
    onSuccess: invalidate,
  });
}

export function useDeleteGoal(): UseMutationResult<void, Error, number> {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async (id: number) => deleteSavingsGoal(db, id),
    onSuccess: invalidate,
  });
}

export function useResetData(): UseMutationResult<void, Error, void> {
  const invalidate = useInvalidateFinance();
  return useMutation({
    mutationFn: async () => deleteAllData(db),
    onSuccess: invalidate,
  });
}

export type { TransactionRow };
