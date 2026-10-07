import '../../global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { databaseStatus } from '@/db/client';
import { createQueryClient } from '@/lib/query-client';

export default function RootLayout() {
  const [queryClient] = useState(createQueryClient);
  const { status } = databaseStatus;

  return (
    <GestureHandlerRootView style={{ flex: 1 }} className="bg-canvas">
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />

          {status === 'error' ? (
            <View className="flex-1 items-center justify-center bg-canvas px-8">
              <Text className="text-center text-base font-semibold text-ink">
                No se pudo abrir la base de datos
              </Text>
              <Text className="mt-2 text-center text-sm text-ink-muted">
                Reinicia la app para intentarlo de nuevo.
              </Text>
            </View>
          ) : null}

          {status === 'ready' ? (
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#F4F5F7' },
              }}
            >
              <Stack.Screen name="(tabs)" />
              <Stack.Screen
                name="registro"
                options={{ presentation: 'transparentModal', animation: 'none' }}
              />
              <Stack.Screen name="historial" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="datos" options={{ animation: 'slide_from_right' }} />
            </Stack>
          ) : null}
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
