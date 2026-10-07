import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryStatsList } from '@/components/finance/CategoryStatsList';
import { TransactionList } from '@/components/finance/TransactionListItem';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button, Card, IconButton } from '@/components/ui/Button';
import { EmptyState, TYPE_META } from '@/components/ui/Feedback';
import { useExpensesByCategory, useRecentTransactions, useSummary } from '@/hooks/use-finance';
import type { TxType } from '@/db/schema';
import { currentMonthKey, formatMonthLabel } from '@/lib/date';
import { formatMoney } from '@/lib/format';

const FILTERS: { value: TxType | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'income', label: 'Ingresos' },
  { value: 'expense', label: 'Gastos' },
  { value: 'savings', label: 'Ahorros' },
];

export default function DashboardScreen() {
  const router = useRouter();
  const month = currentMonthKey();
  const [filter, setFilter] = useState<TxType | 'all'>('all');
  const [statsOpen, setStatsOpen] = useState(false);

  const summary = useSummary(month);
  const recent = useRecentTransactions(8, filter);
  const byCategory = useExpensesByCategory(month);

  const monthTotal = byCategory.data?.reduce((acc, item) => acc + item.totalCents, 0) ?? 0;
  const balance = summary.data?.availableCents ?? 0;
  const hasMovements = (recent.data?.length ?? 0) > 0;

  const balanceLabel = useMemo(() => formatMoney(balance), [balance]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-[26px] font-bold leading-8 text-ink">Perfox</Text>
            <Text className="text-sm text-ink-muted">
              {formatMonthLabel(month)} · sin registro, sin esfuerzo
            </Text>
          </View>
          <IconButton
            icon="settings-outline"
            accessibilityLabel="Ajustes y datos"
            onPress={() => router.push('/datos')}
          />
        </View>

        <LinearGradient
          colors={['#6C5CE7', '#4B3BC4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="mb-4 overflow-hidden rounded-4xl p-5"
        >
          <View className="mb-1 flex-row items-center justify-between">
            <Text className="text-xs font-semibold uppercase tracking-wide text-white/70">
              Saldo disponible
            </Text>
            <Ionicons name="wallet-outline" size={18} color="rgba(255,255,255,0.75)" />
          </View>

          <Text className="text-4xl font-bold tabular-nums text-white">{balanceLabel}</Text>
          <Text className="mt-1 text-xs text-white/70">
            Ingresos − gastos − ahorro guardado
          </Text>

          <View className="mt-4 flex-row rounded-2xl bg-white/12 p-3">
            <MiniStat label="Ingresos" value={summary.data?.monthIncomeCents ?? 0} />
            <View className="mx-2 w-px self-stretch bg-white/20" />
            <MiniStat label="Gastos" value={summary.data?.monthExpenseCents ?? 0} />
            <View className="mx-2 w-px self-stretch bg-white/20" />
            <MiniStat label="Ahorro" value={summary.data?.monthSavingsCents ?? 0} />
          </View>
        </LinearGradient>

        <View className="mb-4 flex-row gap-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ver gastos del mes por categoría"
            onPress={() => setStatsOpen(true)}
            className="flex-1 active:opacity-80"
          >
            <Card className="h-full">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Gastos del mes
                </Text>
                <Ionicons name="pie-chart-outline" size={16} color="#F04438" />
              </View>
              <Text className="text-2xl font-bold tabular-nums text-ink">
                {formatMoney(summary.data?.monthExpenseCents ?? 0)}
              </Text>
              <Text className="mt-1 text-xs font-medium text-brand">
                {monthTotal > 0 ? 'Toca para ver el desglose' : 'Sin gastos registrados'}
              </Text>
            </Card>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ver mis metas de ahorro"
            onPress={() => router.push('/ahorros')}
            className="flex-1 active:opacity-80"
          >
            <Card className="h-full">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Ahorros
                </Text>
                <Ionicons name="flag-outline" size={16} color="#F79009" />
              </View>
              <Text className="text-2xl font-bold tabular-nums text-ink">
                {formatMoney(summary.data?.totalSavingsCents ?? 0)}
              </Text>
              <Text className="mt-1 text-xs font-medium text-brand">Tus metas de ahorro</Text>
            </Card>
          </Pressable>
        </View>

        <View>
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-[17px] font-semibold text-ink">Movimientos recientes</Text>
            <Text
              accessibilityRole="button"
              onPress={() => router.push('/historial')}
              className="text-sm font-semibold text-brand active:opacity-60"
            >
              Ver más
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3"
            contentContainerStyle={{ gap: 8, paddingRight: 8 }}
          >
            {FILTERS.map((option) => {
              const active = filter === option.value;
              const color = option.value === 'all' ? '#6C5CE7' : TYPE_META[option.value].color;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setFilter(option.value)}
                  className="rounded-full border px-3.5 py-2 active:opacity-70"
                  style={{
                    borderColor: active ? color : '#E9EAEE',
                    backgroundColor: active ? `${color}14` : '#FFFFFF',
                  }}
                >
                  <Text
                    className="text-[13px] font-semibold"
                    style={{ color: active ? color : '#667085' }}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {recent.isLoading ? (
            <Card>
              <Text className="text-sm text-ink-muted">Cargando movimientos…</Text>
            </Card>
          ) : hasMovements ? (
            <TransactionList
              items={recent.data ?? []}
              onSelect={(tx) => router.push({ pathname: '/registro', params: { id: String(tx.id) } })}
            />
          ) : (
            <Card className="items-center py-4">
              <EmptyState
                icon="flash-outline"
                title="Aún no hay movimientos"
                description="Toca el botón + para registrar tu primer gasto en menos de 3 segundos."
              />
            </Card>
          )}
        </View>
      </ScrollView>

      <BottomSheet
        visible={statsOpen}
        onClose={() => setStatsOpen(false)}
        title="Gastos por categoría"
      >
        <Text className="mb-1 text-sm text-ink-muted">
          {formatMonthLabel(month)} · {formatMoney(monthTotal)} en total
        </Text>

        <View className="mt-3">
          <CategoryStatsList items={byCategory.data ?? []} />
        </View>

        <Button
          label="Ver análisis completo"
          variant="secondary"
          icon="stats-chart-outline"
          fullWidth
          className="mt-4"
          onPress={() => {
            setStatsOpen(false);
            router.push({ pathname: '/historial', params: { tab: 'categorias' } });
          }}
        />
      </BottomSheet>
    </SafeAreaView>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-1 items-center">
      <Text className="text-[11px] font-medium uppercase tracking-wide text-white/70">
        {label}
      </Text>
      <Text className="mt-0.5 text-[15px] font-semibold tabular-nums text-white">
        {formatMoney(value)}
      </Text>
    </View>
  );
}
