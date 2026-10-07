import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark';
type Size = 'sm' | 'md' | 'lg';

const CONTAINER: Record<Variant, string> = {
  primary: 'bg-brand',
  secondary: 'bg-brand-soft',
  ghost: 'bg-surface border border-line',
  danger: 'bg-expense',
  dark: 'bg-ink',
};

const LABEL: Record<Variant, string> = {
  primary: 'text-white',
  secondary: 'text-brand',
  ghost: 'text-ink-soft',
  danger: 'text-white',
  dark: 'text-white',
};

const SIZES: Record<Size, { box: string; text: string; icon: number }> = {
  sm: { box: 'h-9 px-3 rounded-xl', text: 'text-sm', icon: 16 },
  md: { box: 'h-12 px-4 rounded-2xl', text: 'text-[15px]', icon: 18 },
  lg: { box: 'h-14 px-5 rounded-2xl', text: 'text-base', icon: 20 },
};

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: keyof typeof Ionicons.glyphMap;
  trailingIcon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  children?: ReactNode;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  trailingIcon,
  disabled,
  loading,
  fullWidth,
  className = '',
  children,
}: ButtonProps) {
  const sizing = SIZES[size];
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive }}
      onPress={inactive ? undefined : onPress}
      className={`flex-row items-center justify-center gap-2 ${sizing.box} ${CONTAINER[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${inactive ? 'opacity-50' : 'active:opacity-80'} ${className}`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' || variant === 'danger' || variant === 'dark' ? '#fff' : '#6C5CE7'} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={sizing.icon} color={iconColor(variant)} /> : null}
          <Text className={`font-semibold ${sizing.text} ${LABEL[variant]}`}>{label}</Text>
          {trailingIcon ? (
            <Ionicons name={trailingIcon} size={sizing.icon} color={iconColor(variant)} />
          ) : null}
          {children}
        </>
      )}
    </Pressable>
  );
}

function iconColor(variant: Variant) {
  if (variant === 'primary' || variant === 'danger' || variant === 'dark') return '#FFFFFF';
  if (variant === 'secondary') return '#6C5CE7';
  return '#475467';
}

export function IconButton({
  icon,
  onPress,
  size = 40,
  color = '#101828',
  background = '#FFFFFF',
  className = '',
  accessibilityLabel,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  size?: number;
  color?: string;
  background?: string;
  className?: string;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: background }}
      className={`items-center justify-center active:opacity-70 ${className}`}
    >
      <Ionicons name={icon} size={size * 0.48} color={color} />
    </Pressable>
  );
}

export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <View className={`rounded-3xl bg-surface p-4 ${className}`}>{children}</View>;
}
