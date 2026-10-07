import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

function TabButton({
  label,
  focused,
  icon,
  onPress,
  onLongPress,
}: {
  label: string;
  focused: boolean;
  icon: ReactNode;
  onPress: () => void;
  onLongPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      onPress={onPress}
      onLongPress={onLongPress}
      className="flex-1 items-center justify-center gap-1 py-2 active:opacity-60"
    >
      {icon}
      <Text
        className="text-[11px] font-semibold"
        style={{ color: focused ? '#6C5CE7' : '#98A2B3' }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function TabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const left = state.routes[0];
  const right = state.routes[1];

  const renderTab = (route: (typeof state.routes)[number]) => {
    const options = descriptors[route.key]?.options;
    const focused = state.index === state.routes.indexOf(route);
    const label = options?.title ?? route.name;
    const color = focused ? '#6C5CE7' : '#98A2B3';
    const icon = options?.tabBarIcon?.({ focused, color, size: 22 });

    return (
      <TabButton
        key={route.key}
        label={label}
        focused={focused}
        icon={icon ?? <Ionicons name="ellipse-outline" size={22} color={color} />}
        onPress={() => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name as never);
          }
        }}
        onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
      />
    );
  };

  return (
    <View
      className="flex-row border-t border-line bg-surface"
      style={{ paddingBottom: insets.bottom, height: 64 + insets.bottom }}
    >
      {left ? renderTab(left) : null}

      <View className="w-20 items-center justify-center">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Registrar movimiento"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/registro');
          }}
          className="-mt-7 h-14 w-14 items-center justify-center rounded-full bg-brand active:opacity-80"
          style={{
            shadowColor: '#4B3BC4',
            shadowOpacity: 0.32,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 8,
          }}
        >
          <Ionicons name="add" size={30} color="#FFFFFF" />
        </Pressable>
        <Text className="mt-0.5 text-[11px] font-semibold text-ink-muted">Registrar</Text>
      </View>

      {right ? renderTab(right) : null}
    </View>
  );
}
