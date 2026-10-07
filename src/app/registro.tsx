import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Text, TextInput, View } from 'react-native';

import {
  AmountField,
  CategoryPicker,
  DateField,
  GoalPicker,
  TypeToggle,
} from '@/components/finance/FormControls';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { TYPE_META } from '@/components/ui/Feedback';
import {
  useAddTransaction,
  useCategories,
  useCreateCategory,
  useDeleteTransaction,
  useSavingsGoals,
  useTransaction,
  useUpdateTransaction,
} from '@/hooks/use-finance';
import type { TxType } from '@/db/schema';
import { monthKeyOf, todayIso } from '@/lib/date';
import { parseAmountToCents } from '@/lib/format';

export default function RegistroScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const editId = params.id ? Number(params.id) : null;

  const existing = useTransaction(editId);
  const categories = useCategories('all');
  const goals = useSavingsGoals();

  const addTransaction = useAddTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();
  const createCategory = useCreateCategory();

  const [type, setType] = useState<TxType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [goalId, setGoalId] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayIso());
  const [creatingCategory, setCreatingCategory] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    const tx = existing.data;
    if (!tx || hydrated.current) return;
    hydrated.current = true;
    setType(tx.type);
    setAmount((tx.amountCents / 100).toFixed(2).replace('.', ','));
    setCategoryId(tx.categoryId);
    setGoalId(tx.goalId);
    setNote(tx.note ?? '');
    setDate(tx.date);
  }, [existing.data]);

  const categoriesForType = useMemo(
    () => (categories.data ?? []).filter((category) => category.type === type),
    [categories.data, type],
  );

  const cents = parseAmountToCents(amount);
  const selectedCategory =
    categoriesForType.find((category) => category.id === categoryId) ?? categoriesForType[0] ?? null;
  const meta = TYPE_META[type];
  const canSave = cents != null && selectedCategory != null;

  const close = () => router.back();

  const handleSave = () => {
    if (!canSave || cents == null || !selectedCategory) return;
    const payload = {
      type,
      amountCents: cents,
      categoryId: selectedCategory.id,
      goalId: type === 'savings' ? goalId : null,
      note: note.trim() ? note.trim() : null,
      date,
      month: monthKeyOf(date),
    };

    if (editId) updateTransaction.mutate({ id: editId, input: payload });
    else addTransaction.mutate(payload);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    close();
  };

  const handleDelete = () => {
    if (!editId) return;
    Alert.alert('Eliminar movimiento', 'Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          deleteTransaction.mutate(editId);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          close();
        },
      },
    ]);
  };

  const hint = selectedCategory
    ? `${meta.label} · ${selectedCategory.name}`
    : `Elige una categoría de ${meta.plural.toLowerCase()}`;

  return (
    <BottomSheet
      visible
      onClose={close}
      title={editId ? 'Editar movimiento' : 'Nuevo movimiento'}
      maxHeight="94%"
    >
      <TypeToggle
        value={type}
        onChange={(next) => {
          setType(next);
          if (next !== 'savings') setGoalId(null);
        }}
      />

      <AmountField value={amount} onChange={setAmount} color={meta.color} hint={hint} />

      <View className="mt-2">
        <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Categoría
        </Text>
        <CategoryPicker
          type={type}
          categories={categoriesForType}
          selectedId={selectedCategory?.id ?? null}
          onSelect={setCategoryId}
          onCreate={(name) => createCategory.mutate({ name, type })}
          creating={creatingCategory}
          onCreatingChange={setCreatingCategory}
        />
      </View>

      {type === 'savings' ? (
        <View className="mt-4">
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Meta (opcional)
          </Text>
          <GoalPicker goals={goals.data ?? []} selectedId={goalId} onSelect={setGoalId} />
        </View>
      ) : null}

      <View className="mt-4">
        <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Nota (opcional)
        </Text>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder="Ej. Almuerzo con el equipo"
          placeholderTextColor="#98A2B3"
          className="h-12 rounded-2xl border border-line bg-canvas px-4 text-[15px] text-ink"
          returnKeyType="done"
        />
      </View>

      <View className="mt-4">
        <DateField value={date} onChange={setDate} />
      </View>

      <View className="mt-5 flex-row gap-3">
        {editId ? (
          <Button
            label="Eliminar"
            variant="ghost"
            icon="trash-outline"
            onPress={handleDelete}
            className="flex-1"
          />
        ) : null}
        <Button
          label={editId ? 'Guardar cambios' : 'Guardar movimiento'}
          onPress={handleSave}
          disabled={!canSave}
          loading={addTransaction.isPending || updateTransaction.isPending}
          className="flex-1"
        />
      </View>

      {!canSave ? (
        <View className="mt-3 flex-row items-center justify-center gap-1.5">
          <Ionicons name="information-circle-outline" size={14} color="#98A2B3" />
          <Text className="text-xs text-ink-muted">Introduce un monto mayor que cero</Text>
        </View>
      ) : null}
    </BottomSheet>
  );
}
