import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import {
  currentMonthKey,
  formatMonthLabel,
  isCurrentMonth,
  isFutureMonth,
  shiftMonth,
} from '@/lib/date';

export function MonthStepper({
  month,
  onChange,
}: {
  month: string;
  onChange: (month: string) => void;
}) {
  const canGoForward = !isFutureMonth(shiftMonth(month, 1));

  return (
    <View className="flex-row items-center justify-between">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Mes anterior"
        onPress={() => onChange(shiftMonth(month, -1))}
        className="h-9 w-9 items-center justify-center rounded-full bg-surface border border-line active:opacity-70"
      >
        <Ionicons name="chevron-back" size={16} color="#475467" />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ir al mes actual"
        onPress={() => onChange(currentMonthKey())}
        className="items-center px-4 active:opacity-60"
      >
        <Text className="text-base font-semibold capitalize text-ink">{formatMonthLabel(month)}</Text>
        <Text
          className={`text-[11px] font-medium ${
            isCurrentMonth(month) ? 'text-ink-muted' : 'text-brand'
          }`}
        >
          {isCurrentMonth(month) ? 'Mes actual' : 'Toca para volver a hoy'}
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Mes siguiente"
        disabled={!canGoForward}
        onPress={() => canGoForward && onChange(shiftMonth(month, 1))}
        className={`h-9 w-9 items-center justify-center rounded-full border active:opacity-70 ${
          canGoForward ? 'border-line bg-surface' : 'border-line bg-canvas opacity-40'
        }`}
      >
        <Ionicons name="chevron-forward" size={16} color="#475467" />
      </Pressable>
    </View>
  );
}
