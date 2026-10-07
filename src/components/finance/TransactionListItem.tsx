import { Pressable, Text, View } from 'react-native';

import type { TransactionRow } from '@/db/queries';
import { formatDayLabel, formatMonthLabel } from '@/lib/date';
import { formatSignedMoney } from '@/lib/format';
import { IconBubble, TYPE_META } from '@/components/ui/Feedback';

export function TransactionListItem({
  tx,
  onPress,
  showDate = true,
}: {
  tx: TransactionRow;
  onPress?: () => void;
  showDate?: boolean;
}) {
  const meta = TYPE_META[tx.type];
  const title = tx.goalName ?? tx.categoryName ?? meta.label;
  const subtitle = tx.note?.trim() ? tx.note : showDate ? formatDayLabel(tx.date) : null;
  const icon = tx.categoryIcon ?? meta.icon;
  const color = tx.categoryColor ?? meta.color;

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      onPress={onPress}
      className="flex-row items-center gap-3 bg-surface px-4 py-3 active:opacity-60"
    >
      <IconBubble icon={icon} color={color} size={42} />

      <View className="flex-1">
        <Text className="text-[15px] font-medium text-ink" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-0.5 text-xs text-ink-muted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View className="items-end">
        <Text
          className="text-[15px] font-semibold tabular-nums"
          style={{ color: meta.color }}
        >
          {formatSignedMoney(tx.amountCents * meta.sign)}
        </Text>
        {tx.goalId ? (
          <Text className="mt-0.5 text-[11px] font-medium text-savings">Meta</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export function DayHeader({ title, trailing }: { title: string; trailing?: string | null }) {
  return (
    <View className="flex-row items-center justify-between bg-canvas px-4 pb-1.5 pt-3">
      <Text className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{title}</Text>
      {trailing ? (
        <Text className="text-xs font-semibold tabular-nums text-ink-muted">{trailing}</Text>
      ) : null}
    </View>
  );
}

export function MonthHeader({ month, count }: { month: string; count: number }) {
  return (
    <Text className="bg-canvas px-4 pb-1.5 pt-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">
      {formatMonthLabel(month)} · {count}
    </Text>
  );
}

export function TransactionList({
  items,
  onSelect,
  showDate = true,
}: {
  items: TransactionRow[];
  onSelect?: (tx: TransactionRow) => void;
  showDate?: boolean;
}) {
  return (
    <View className="overflow-hidden rounded-3xl border border-line">
      {items.map((tx, index) => (
        <View key={tx.id}>
          {index > 0 ? <View className="ml-16 h-px bg-line" /> : null}
          <TransactionListItem tx={tx} onPress={onSelect ? () => onSelect(tx) : undefined} showDate={showDate} />
        </View>
      ))}
    </View>
  );
}
