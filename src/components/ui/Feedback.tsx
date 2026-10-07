import { Ionicons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import type { TxType } from '@/db/schema';

export function IconBubble({
  icon,
  color,
  size = 40,
  iconSize,
}: {
  icon: string;
  color: string;
  size?: number;
  iconSize?: number;
}) {
  return (
    <View
      className="items-center justify-center rounded-2xl"
      style={{ width: size, height: size, backgroundColor: `${color}1A` }}
    >
      <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={iconSize ?? size * 0.5} color={color} />
    </View>
  );
}

export function EmptyState({
  icon = 'sparkles-outline',
  title,
  description,
  action,
  onActionPress,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  action?: string;
  onActionPress?: () => void;
}) {
  return (
    <View className="items-center px-6 py-10">
      <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-brand-soft">
        <Ionicons name={icon} size={24} color="#6C5CE7" />
      </View>
      <Text className="text-center text-[15px] font-semibold text-ink">{title}</Text>
      {description ? (
        <Text className="mt-1 text-center text-sm leading-5 text-ink-muted">{description}</Text>
      ) : null}
      {action && onActionPress ? (
        <Text
          accessibilityRole="button"
          onPress={onActionPress}
          className="mt-3 text-sm font-semibold text-brand active:opacity-60"
        >
          {action}
        </Text>
      ) : null}
    </View>
  );
}

export const TYPE_META: Record<
  TxType,
  { label: string; plural: string; color: string; icon: string; sign: -1 | 1 }
> = {
  expense: {
    label: 'Gasto',
    plural: 'Gastos',
    color: '#F04438',
    icon: 'arrow-down',
    sign: -1,
  },
  income: {
    label: 'Ingreso',
    plural: 'Ingresos',
    color: '#12B76A',
    icon: 'arrow-up',
    sign: 1,
  },
  savings: {
    label: 'Ahorro',
    plural: 'Ahorros',
    color: '#F79009',
    icon: 'flag',
    sign: -1,
  },
};
