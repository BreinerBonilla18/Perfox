import { Pressable, Text, View } from 'react-native';

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <View className={`flex-row rounded-2xl bg-canvas p-1 ${className}`}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(option.value)}
            className={`flex-1 items-center justify-center rounded-xl py-2.5 ${
              active ? 'bg-surface' : 'active:opacity-60'
            }`}
            style={active ? shadow : undefined}
          >
            <Text
              className={`text-sm font-semibold ${active ? 'text-ink' : 'text-ink-muted'}`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const shadow = {
  shadowColor: '#101828',
  shadowOpacity: 0.06,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};
