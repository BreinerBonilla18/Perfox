import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryStatsList } from '@/components/finance/CategoryStatsList';
import { MonthStepper } from '@/components/finance/MonthStepper';
import { DayHeader, TransactionListItem } from '@/components/finance/TransactionListItem';
import { Card, IconButton } from '@/components/ui/Button';
import { EmptyState, TYPE_META } from '@/components/ui/Feedback';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { useExpensesByCategory, useTransactions } from '@/hooks/use-finance';
import type { TransactionRow } from '@/db/queries';
import type { TxType } from '@/db/schema';
import { currentMonthKey, formatLongDate, formatMonthLabel } from '@/lib/date';
import { formatMoney, formatPercent, formatSignedMoney } from '@/lib/format';

type Tab = 'transacciones' | 'categorias';

const TYPE_FILTERS: { value: TxType | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'income', label: 'Ingresos' },
  { value: 'expense', label: 'Gastos' },
  { value: 'savings', label: 'Ahorros' },
];

export default function HistorialScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const [tab, setTab] = useState<Tab>(params.tab === 'categorias' ? 'categorias' : 'transacciones');
  const [month, setMonth] = useState(currentMonthKey());
  const [type, setType] = useState<TxType | 'all'>('all');
  const [search, setSearch] = useState('');

  const query = useMemo(
    () => ({ month, type, search: search.trim() || undefined }),
    [month, search, type],
  );
  const transactions = useTransactions(query);
  const byCategory = useExpensesByCategory(month);

  const items = useMemo(() => transactions.data ?? [], [transactions.data]);
  const total = items.reduce(
    (acc, tx) => acc + tx.amountCents * TYPE_META[tx.type].sign,
    0,
  );
  const categoryTotal =
    byCategory.data?.reduce((acc, item) => acc + item.totalCents, 0) ?? 0;

  const groups = useMemo(() => groupByDay(items), [items]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <View className="flex-row items-center justify-between px-4 py-3">
        <IconButton
          icon="chevron-back"
          accessibilityLabel="Volver"
          onPress={() => router.back()}
          className="-ml-1"
        />
        <Text className="text-[17px] font-semibold text-ink">Historial y análisis</Text>
        <View className="w-10" />
      </View>

      <View className="px-4 pb-3">
        <SegmentedControl<Tab>
          value={tab}
          onChange={setTab}
          options={[
            { value: 'transacciones', label: 'Transacciones' },
            { value: 'categorias', label: 'Por categorías' },
          ]}
        />
      </View>

      <View className="px-4 pb-3">
        <MonthStepper month={month} onChange={setMonth} />
      </View>

      {tab === 'transacciones' ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-3 flex-row items-center gap-2 rounded-2xl border border-line bg-surface px-3.5">
            <Ionicons name="search" size={18} color="#98A2B3" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buscar por nota o categoría"
              placeholderTextColor="#98A2B3"
              returnKeyType="search"
              className="h-12 flex-1 text-[15px] text-ink"
            />
            {search.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Limpiar búsqueda"
                onPress={() => setSearch('')}
                className="h-8 w-8 items-center justify-center rounded-full bg-canvas active:opacity-70"
              >
                <Ionicons name="close" size={14} color="#475467" />
              </Pressable>
            ) : null}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3"
            contentContainerStyle={{ gap: 8, paddingRight: 8 }}
          >
            {TYPE_FILTERS.map((option) => {
              const active = type === option.value;
              const color = option.value === 'all' ? '#6C5CE7' : TYPE_META[option.value].color;
              return (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  onPress={() => setType(option.value)}
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

          {items.length === 0 ? (
            <Card className="mt-2 items-center py-4">
              <EmptyState
                icon="search-outline"
                title="Sin resultados"
                description="Prueba con otro mes, tipo o término de búsqueda."
              />
            </Card>
          ) : (
            <View className="overflow-hidden rounded-3xl">
              {groups.map((group) => (
                <View key={group.date} className="mb-2 overflow-hidden rounded-3xl bg-surface">
                  <DayHeader title={formatLongDate(group.date)} />
                  {group.items.map((tx, index) => (
                    <View key={tx.id}>
                      {index > 0 ? <View className="ml-16 h-px bg-line" /> : null}
                      <TransactionListItem
                        tx={tx}
                        showDate={false}
                        onPress={() => router.push({ pathname: '/registro', params: { id: String(tx.id) } })}
                      />
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <Card className="mb-3">
            <Text className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Total del mes
            </Text>
            <Text className="mt-1 text-3xl font-bold tabular-nums text-ink">
              {formatMoney(categoryTotal)}
            </Text>
            <View className="mt-3 flex-row items-center gap-4">
              <View className="flex-1">
                <Text className="text-[11px] font-medium text-ink-muted">Categorías activas</Text>
                <Text className="text-sm font-semibold text-ink">{byCategory.data?.length ?? 0}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[11px] font-medium text-ink-muted">Movimientos</Text>
                <Text className="text-sm font-semibold text-ink">{items.length}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-[11px] font-medium text-ink-muted">Balance mes</Text>
                <Text
                  className="text-sm font-semibold tabular-nums"
                  style={{ color: total >= 0 ? '#12B76A' : '#F04438' }}
                >
                  {formatSignedMoney(total)}
                </Text>
              </View>
            </View>
          </Card>

          <CategoryStatsList items={byCategory.data ?? []} />

          {byCategory.data && byCategory.data.length > 0 ? (
            <View className="mt-4 flex-row flex-wrap gap-2">
              {byCategory.data.slice(0, 6).map((item) => (
                <View
                  key={item.categoryId ?? item.name}
                  className="flex-row items-center gap-1.5 rounded-full bg-surface px-3 py-1.5"
                >
                  <View
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <Text className="text-xs font-medium text-ink-soft">
                    {item.name} · {formatPercent(item.share)}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          <Text className="mt-6 text-center text-xs text-ink-muted">
            {formatMonthLabel(month)} · toca una categoría para ver su detalle
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function groupByDay(items: TransactionRow[]) {
  const map = new Map<string, TransactionRow[]>();
  for (const tx of items) {
    const list = map.get(tx.date) ?? [];
    list.push(tx);
    map.set(tx.date, list);
  }
  return [...map.entries()].map(([date, dayItems]) => ({ date, items: dayItems }));
}
