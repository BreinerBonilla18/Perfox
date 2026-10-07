import type { ReactNode } from 'react';
import { Text, View, type ViewProps } from 'react-native';

export function ProgressBar({
  progress,
  color,
  trackColor = '#EEF0F3',
  height = 8,
  className = '',
}: {
  progress: number;
  color: string;
  trackColor?: string;
  height?: number;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(progress, 1));
  return (
    <View
      className={`w-full overflow-hidden rounded-full ${className}`}
      style={{ height, backgroundColor: trackColor }}
      accessibilityRole="progressbar"
      accessibilityValue={{ now: Math.round(clamped * 100), min: 0, max: 100 }}
    >
      <View
        style={{ width: `${clamped * 100}%`, height: '100%', backgroundColor: color }}
        className="rounded-full"
      />
    </View>
  );
}

export function Divider({ className = '' }: { className?: string }) {
  return <View className={`h-px w-full bg-line ${className}`} />;
}

export function SectionTitle({
  title,
  action,
  onActionPress,
  className = '',
}: {
  title: string;
  action?: string;
  onActionPress?: () => void;
  className?: string;
}) {
  return (
    <View className={`mb-3 flex-row items-center justify-between ${className}`}>
      <Text className="text-[17px] font-semibold text-ink">{title}</Text>
      {action ? (
        <Text
          accessibilityRole="button"
          onPress={onActionPress}
          className="text-sm font-semibold text-brand active:opacity-60"
        >
          {action}
        </Text>
      ) : null}
    </View>
  );
}

export function Row({ children, className = '', ...rest }: ViewProps & { children: ReactNode }) {
  return (
    <View className={`flex-row items-center ${className}`} {...rest}>
      {children}
    </View>
  );
}
