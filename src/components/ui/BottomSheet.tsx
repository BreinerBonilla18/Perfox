import { useEffect, useState, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  scroll = true,
  maxHeight = '92%',
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  scroll?: boolean;
  maxHeight?: number | `${number}%`;
}) {
  const insets = useSafeAreaInsets();
  const [progress] = useState(() => new Animated.Value(0));
  const [mounted, setMounted] = useState(visible);
  const [wasVisible, setWasVisible] = useState(visible);

  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setMounted(true);
  }

  useEffect(() => {
    if (visible) progress.setValue(0);
    Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: visible ? 260 : 190,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !visible) setMounted(false);
    });
  }, [progress, visible]);

  const Body = scroll ? ScrollView : View;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end" pointerEvents={visible ? 'auto' : 'none'}>
        <Animated.View
          style={[StyleSheet.absoluteFill, { opacity: progress }]}
          className="bg-black/50"
        >
          <Pressable
            accessibilityLabel="Cerrar"
            style={StyleSheet.absoluteFill}
            onPress={onClose}
          />
        </Animated.View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Animated.View
            className="rounded-t-4xl bg-surface"
            style={{
              maxHeight,
              paddingBottom: Math.max(insets.bottom, 12),
              transform: [
                {
                  translateY: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [420, 0],
                  }),
                },
              ],
            }}
          >
            <View className="items-center pb-1 pt-3">
              <View className="h-1.5 w-10 rounded-full bg-line" />
            </View>

            {title ? (
              <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
                <Text className="text-lg font-semibold text-ink">{title}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar"
                  onPress={onClose}
                  className="h-9 w-9 items-center justify-center rounded-full bg-canvas active:opacity-70"
                >
                  <Ionicons name="close" size={18} color="#475467" />
                </Pressable>
              </View>
            ) : null}

            <Body
              className="px-5"
              keyboardShouldPersistTaps="handled"
              {...(scroll ? { contentContainerStyle: { paddingBottom: 24 } } : {})}
            >
              {children}
            </Body>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
