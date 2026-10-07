import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button, Card, IconButton } from '@/components/ui/Button';
import { EmptyState, IconBubble, TYPE_META } from '@/components/ui/Feedback';
import { ProgressBar } from '@/components/ui/Layout';
import {
  useAddTransaction,
  useCategories,
  useCreateGoal,
  useDeleteGoal,
  useSavingsGoals,
  useSummary,
  useUpdateGoal,
} from '@/hooks/use-finance';
import type { GoalWithProgress } from '@/db/queries';
import { currentMonthKey, monthKeyOf, todayIso } from '@/lib/date';
import { formatMoney, formatPercent, parseAmountToCents } from '@/lib/format';

const ICONS: (keyof typeof Ionicons.glyphMap)[] = [
  'flag-outline',
  'shield-checkmark-outline',
  'airplane-outline',
  'home-outline',
  'car-sport-outline',
  'gift-outline',
];

const COLORS = ['#6C5CE7', '#F79009', '#12B76A', '#2E90FA', '#F04438', '#EE46BC'];

type GoalDraft = { id: number | null; name: string; target: string; icon: string; color: string };

const EMPTY_DRAFT: GoalDraft = { id: null, name: '', target: '', icon: 'flag-outline', color: '#6C5CE7' };

export default function AhorrosScreen() {
  const goals = useSavingsGoals();
  const summary = useSummary(currentMonthKey());
  const savingsCategories = useCategories('savings');
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const addTransaction = useAddTransaction();

  const [draft, setDraft] = useState<GoalDraft | null>(null);
  const [contributing, setContributing] = useState<GoalWithProgress | null>(null);
  const [contribution, setContribution] = useState('');

  const available = summary.data?.availableCents ?? 0;
  const totalSaved = goals.data?.reduce((acc, goal) => acc + goal.savedCents, 0) ?? 0;
  const totalTarget = goals.data?.reduce((acc, goal) => acc + goal.targetCents, 0) ?? 0;

  const draftCents = draft ? parseAmountToCents(draft.target) : null;
  const canSaveDraft = !!draft && draft.name.trim().length > 0 && draftCents != null;
  const contributionCents = parseAmountToCents(contribution);
  const canContribute = contributionCents != null && contributing != null;

  const openCreate = () => setDraft({ ...EMPTY_DRAFT });
  const openEdit = (goal: GoalWithProgress) =>
    setDraft({
      id: goal.id,
      name: goal.name,
      target: (goal.targetCents / 100).toFixed(2).replace('.', ','),
      icon: goal.icon,
      color: goal.color,
    });

  const saveDraft = () => {
    if (!draft || !canSaveDraft || draftCents == null) return;
    if (draft.id) updateGoal.mutate({ id: draft.id, changes: { name: draft.name.trim(), targetCents: draftCents } });
    else
      createGoal.mutate({
        name: draft.name.trim(),
        targetCents: draftCents,
        icon: draft.icon,
        color: draft.color,
      });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setDraft(null);
  };

  const removeGoal = (goal: GoalWithProgress) => {
    Alert.alert('Eliminar meta', `Se eliminará "${goal.name}". Las aportaciones registradas se conservan.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => deleteGoal.mutate(goal.id),
      },
    ]);
  };

  const saveContribution = () => {
    if (!canContribute || !contributing || contributionCents == null) return;
    const categoryId = savingsCategories.data?.[0]?.id ?? null;
    if (categoryId == null) return;

    const date = todayIso();
    addTransaction.mutate({
      type: 'savings',
      amountCents: contributionCents,
      categoryId,
      goalId: contributing.id,
      note: `Aporte a ${contributing.name}`,
      date,
      month: monthKeyOf(date),
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setContributing(null);
    setContribution('');
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-[26px] font-bold leading-8 text-ink">Ahorros</Text>
            <Text className="text-sm text-ink-muted">Metas que te acercan a tu objetivo</Text>
          </View>
          <IconButton icon="add" accessibilityLabel="Nueva meta" color="#FFFFFF" background="#6C5CE7" onPress={openCreate} />
        </View>

        <Card className="mb-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                Disponible para aportar
              </Text>
              <Text className="mt-1 text-2xl font-bold tabular-nums text-ink">
                {formatMoney(available)}
              </Text>
            </View>
            <View className="h-11 w-11 items-center justify-center rounded-full bg-brand-soft">
              <Ionicons name="wallet-outline" size={20} color="#6C5CE7" />
            </View>
          </View>

          {totalTarget > 0 ? (
            <View className="mt-4">
              <View className="mb-1.5 flex-row items-center justify-between">
                <Text className="text-xs font-medium text-ink-soft">Progreso total</Text>
                <Text className="text-xs font-semibold tabular-nums text-ink-soft">
                  {formatPercent(totalTarget > 0 ? totalSaved / totalTarget : 0)} · {formatMoney(totalSaved)} de{' '}
                  {formatMoney(totalTarget)}
                </Text>
              </View>
              <ProgressBar
                progress={totalSaved / totalTarget}
                color="#F79009"
                height={10}
              />
            </View>
          ) : null}
        </Card>

        {goals.data && goals.data.length > 0 ? (
          <View className="gap-3">
            {goals.data.map((goal) => (
              <Card key={goal.id}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Abrir meta ${goal.name}`}
                  onPress={() => openEdit(goal)}
                  className="flex-row items-center gap-3"
                >
                  <IconBubble icon={goal.icon} color={goal.color} size={44} />
                  <View className="flex-1">
                    <Text className="text-[15px] font-semibold text-ink" numberOfLines={1}>
                      {goal.name}
                    </Text>
                    <Text className="mt-0.5 text-xs tabular-nums text-ink-muted">
                      {formatMoney(goal.savedCents)} de {formatMoney(goal.targetCents)} ·{' '}
                      {formatPercent(goal.progress)}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#D0D5DD" />
                </Pressable>

                <View className="mt-3">
                  <ProgressBar progress={goal.progress} color={goal.color} height={10} />
                </View>

                <View className="mt-3 flex-row gap-2">
                  <Button
                    label="Aportar"
                    icon="add-circle-outline"
                    size="sm"
                    className="flex-1"
                    onPress={() => {
                      setContributing(goal);
                      setContribution('');
                    }}
                  />
                  <Button
                    label="Editar"
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onPress={() => openEdit(goal)}
                  />
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <Card className="items-center py-4">
            <EmptyState
              icon="flag-outline"
              title="Crea tu primera meta"
              description="Define un objetivo y aparta dinero del saldo disponible hacia él."
              action="Nueva meta"
              onActionPress={openCreate}
            />
          </Card>
        )}
      </ScrollView>

      <BottomSheet
        visible={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.id ? 'Editar meta' : 'Nueva meta'}
      >
        {draft ? (
          <View>
            <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Nombre
            </Text>
            <TextInput
              value={draft.name}
              onChangeText={(name) => setDraft({ ...draft, name })}
              placeholder="Ej. Fondo de emergencia"
              placeholderTextColor="#98A2B3"
              autoFocus={!draft.id}
              className="h-12 rounded-2xl border border-line bg-canvas px-4 text-[15px] text-ink"
            />

            <Text className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Monto objetivo
            </Text>
            <View className="flex-row items-center rounded-2xl border border-line bg-canvas px-4">
              <Text className="text-lg font-semibold text-ink-muted">$</Text>
              <TextInput
                value={draft.target}
                onChangeText={(target) => setDraft({ ...draft, target })}
                keyboardType="decimal-pad"
                inputMode="decimal"
                placeholder="0"
                placeholderTextColor="#D0D5DD"
                className="h-12 flex-1 px-2 text-[15px] text-ink"
              />
            </View>

            <Text className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Ícono
            </Text>
            <View className="flex-row flex-wrap" style={{ marginHorizontal: -4 }}>
              {ICONS.map((icon) => (
                <View key={icon} className="p-1" style={{ width: `${100 / 6}%` }}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Ícono ${icon}`}
                    onPress={() => setDraft({ ...draft, icon })}
                    className="h-11 items-center justify-center rounded-2xl border"
                    style={{
                      borderColor: draft.icon === icon ? draft.color : '#E9EAEE',
                      backgroundColor: draft.icon === icon ? `${draft.color}14` : '#FFFFFF',
                    }}
                  >
                    <Ionicons name={icon} size={20} color={draft.icon === icon ? draft.color : '#667085'} />
                  </Pressable>
                </View>
              ))}
            </View>

            <Text className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Color
            </Text>
            <View className="flex-row gap-2">
              {COLORS.map((color) => (
                <Pressable
                  key={color}
                  accessibilityRole="button"
                  accessibilityLabel={`Color ${color}`}
                  onPress={() => setDraft({ ...draft, color })}
                  className="h-9 w-9 items-center justify-center rounded-full"
                  style={{ backgroundColor: color }}
                >
                  {draft.color === color ? <Ionicons name="checkmark" size={16} color="#FFFFFF" /> : null}
                </Pressable>
              ))}
            </View>

            <Button
              label={draft.id ? 'Guardar cambios' : 'Crear meta'}
              fullWidth
              className="mt-6"
              disabled={!canSaveDraft}
              loading={createGoal.isPending || updateGoal.isPending}
              onPress={saveDraft}
            />

            {draft.id ? (
              <Button
                label="Eliminar meta"
                variant="danger"
                icon="trash-outline"
                fullWidth
                className="mt-3"
                onPress={() => {
                  const goal = goals.data?.find((item) => item.id === draft.id);
                  if (goal) removeGoal(goal);
                }}
              />
            ) : null}
          </View>
        ) : null}
      </BottomSheet>

      <BottomSheet
        visible={!!contributing}
        onClose={() => setContributing(null)}
        title={`Aportar a ${contributing?.name ?? ''}`}
      >
        {contributing ? (
          <View>
            <View className="mb-4 rounded-2xl bg-canvas p-4">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Meta
                </Text>
                <Text className="text-xs font-semibold tabular-nums text-ink-soft">
                  {formatPercent(contributing.progress)}
                </Text>
              </View>
              <ProgressBar progress={contributing.progress} color={contributing.color} height={10} />
              <Text className="mt-2 text-xs tabular-nums text-ink-muted">
                Faltan {formatMoney(contributing.remainingCents)} para completarla
              </Text>
            </View>

            <View className="mb-1 flex-row items-center justify-center">
              <Text className="mb-1 mr-1 text-xl font-semibold text-ink-muted">$</Text>
              <TextInput
                value={contribution}
                onChangeText={setContribution}
                keyboardType="decimal-pad"
                inputMode="decimal"
                placeholder="0"
                placeholderTextColor="#D0D5DD"
                autoFocus
                className="min-w-[100px] text-center text-4xl font-bold tabular-nums text-ink"
                style={{ paddingVertical: 0 }}
              />
            </View>

            <View className="mt-2 flex-row justify-center gap-2">
              {[10, 25, 50, 100].map((amountValue) => (
                <Pressable
                  key={amountValue}
                  accessibilityRole="button"
                  onPress={() => setContribution(String(amountValue))}
                  className="rounded-full bg-canvas px-3 py-1.5 active:opacity-70"
                >
                  <Text className="text-xs font-semibold text-ink-soft">${amountValue}</Text>
                </Pressable>
              ))}
            </View>

            <Button
              label="Confirmar aporte"
              icon={TYPE_META.savings.icon as keyof typeof Ionicons.glyphMap}
              fullWidth
              className="mt-5"
              disabled={!canContribute}
              loading={addTransaction.isPending}
              onPress={saveContribution}
            />

            <Text className="mt-3 text-center text-xs text-ink-muted">
              Se descontará de tu saldo disponible: {formatMoney(available)}
            </Text>
          </View>
        ) : null}
      </BottomSheet>
    </SafeAreaView>
  );
}
