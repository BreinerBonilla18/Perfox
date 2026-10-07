import { Text, View } from 'react-native';

import type { CategoryTotal } from '@/db/queries';
import { formatMoney, formatPercent } from '@/lib/format';
import { IconBubble } from '@/components/ui/Feedback';
import { ProgressBar } from '@/components/ui/Layout';

export function CategoryStatsList({
  items,
  emptyLabel = 'Sin gastos registrados en este mes.',
}: {
  items: CategoryTotal[];
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return (
      <View className="items-center rounded-3xl border border-line bg-surface px-6 py-10">
        <Text className="text-center text-sm text-ink-muted">{emptyLabel}</Text>
      </View>
    );
  }

  return (
    <View className="overflow-hidden rounded-3xl bg-surface">
      {items.map((item, index) => (
        <View key={`${item.categoryId ?? 'none'}-${item.name}`} className="px-4 py-3.5">
          <View className="flex-row items-center gap-3">
            <IconBubble icon={item.icon} color={item.color} size={38} />

            <View className="flex-1">
              <Text className="text-[15px] font-medium text-ink" numberOfLines={1}>
                {item.name}
              </Text>
              <View className="mt-2">
                <ProgressBar progress={item.share} color={item.color} height={6} />
              </View>
            </View>

            <View className="items-end">
              <Text className="text-[15px] font-semibold tabular-nums text-ink">
                {formatMoney(item.totalCents)}
              </Text>
              <Text className="mt-0.5 text-xs font-medium tabular-nums text-ink-muted">
                {formatPercent(item.share)}
              </Text>
            </View>
          </View>
          {index < items.length - 1 ? <View className="mt-3.5 h-px bg-line" /> : null}
        </View>
      ))}
    </View>
  );
}
