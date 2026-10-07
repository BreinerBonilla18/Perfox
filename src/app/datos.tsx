import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, IconButton } from '@/components/ui/Button';
import { IconBubble, TYPE_META } from '@/components/ui/Feedback';
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useResetData,
} from '@/hooks/use-finance';
import { exportCsvFile, exportJson, pickAndImportJson } from '@/db/backup';
import { db } from '@/db/client';
import type { TxType } from '@/db/schema';

const TYPE_ORDER: TxType[] = ['expense', 'income', 'savings'];

export default function DatosScreen() {
  const router = useRouter();
  const categories = useCategories('all');
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const resetData = useResetData();

  const [draft, setDraft] = useState<{ type: TxType; name: string } | null>(null);
  const [busy, setBusy] = useState<'json' | 'csv' | 'import' | null>(null);

  const runExport = async (kind: 'json' | 'csv') => {
    setBusy(kind);
    try {
      if (kind === 'json') await exportJson(db);
      else await exportCsvFile(db);
    } catch (error) {
      Alert.alert('No se pudo exportar', String(error));
    } finally {
      setBusy(null);
    }
  };

  const runImport = () => {
    Alert.alert(
      'Importar respaldo',
      'Se reemplazarán todos los datos actuales por los del archivo. Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Elegir archivo',
          onPress: async () => {
            setBusy('import');
            try {
              const result = await pickAndImportJson(db);
              if (result) {
                Alert.alert(
                  'Respaldo importado',
                  `${result.transactions} movimientos, ${result.savingsGoals} metas y ${result.categories} categorías.`,
                );
              }
            } catch (error) {
              Alert.alert('No se pudo importar', error instanceof Error ? error.message : String(error));
            } finally {
              setBusy(null);
            }
          },
        },
      ],
    );
  };

  const confirmReset = () => {
    Alert.alert('Borrar todos los datos', 'Se eliminarán movimientos y metas de ahorro.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar todo',
        style: 'destructive',
        onPress: () => resetData.mutate(),
      },
    ]);
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas">
      <View className="flex-row items-center justify-between px-4 py-3">
        <IconButton
          icon="chevron-back"
          accessibilityLabel="Volver"
          onPress={() => router.back()}
          className="-ml-1"
        />
        <Text className="text-[17px] font-semibold text-ink">Tus datos</Text>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Card className="mb-4">
          <View className="mb-1 flex-row items-center gap-2">
            <Ionicons name="shield-checkmark-outline" size={18} color="#12B76A" />
            <Text className="text-[15px] font-semibold text-ink">100% local y privado</Text>
          </View>
          <Text className="text-sm leading-5 text-ink-soft">
            Perfox no tiene cuenta ni nube: todo vive en tu dispositivo. Haz un respaldo cuando quieras
            guardar o mover tu información.
          </Text>
        </Card>

        <Text className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Respaldo
        </Text>
        <Card className="mb-4 gap-2">
          <Button
            label="Exportar respaldo (JSON)"
            icon="download-outline"
            variant="ghost"
            fullWidth
            loading={busy === 'json'}
            onPress={() => runExport('json')}
          />
          <Button
            label="Exportar transacciones (CSV)"
            icon="grid-outline"
            variant="ghost"
            fullWidth
            loading={busy === 'csv'}
            onPress={() => runExport('csv')}
          />
          <Button
            label="Importar respaldo (JSON)"
            icon="cloud-upload-outline"
            variant="ghost"
            fullWidth
            loading={busy === 'import'}
            onPress={runImport}
          />
        </Card>

        <View className="mb-2 flex-row items-center justify-between px-1">
          <Text className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Categorías
          </Text>
          <Text
            accessibilityRole="button"
            onPress={() => setDraft({ type: 'expense', name: '' })}
            className="text-xs font-semibold text-brand active:opacity-60"
          >
            Nueva
          </Text>
        </View>

        {draft ? (
          <Card className="mb-3">
            <View className="mb-3 flex-row gap-2">
              {TYPE_ORDER.map((type) => (
                <Pressable
                  key={type}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: draft.type === type }}
                  onPress={() => setDraft({ ...draft, type })}
                  className="flex-1 items-center rounded-xl border py-2"
                  style={{
                    borderColor: draft.type === type ? TYPE_META[type].color : '#E9EAEE',
                    backgroundColor: draft.type === type ? `${TYPE_META[type].color}14` : '#FFFFFF',
                  }}
                >
                  <Text
                    className="text-xs font-semibold"
                    style={{ color: draft.type === type ? TYPE_META[type].color : '#667085' }}
                  >
                    {TYPE_META[type].label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View className="flex-row gap-2">
              <TextInput
                value={draft.name}
                onChangeText={(name) => setDraft({ ...draft, name })}
                placeholder="Nombre de la categoría"
                placeholderTextColor="#98A2B3"
                autoFocus
                className="h-11 flex-1 rounded-2xl border border-line bg-canvas px-3 text-[15px] text-ink"
                onSubmitEditing={() => {
                  if (draft.name.trim()) {
                    createCategory.mutate({ name: draft.name.trim(), type: draft.type });
                    setDraft(null);
                  }
                }}
              />
              <Button
                label="Guardar"
                size="sm"
                className="h-11"
                disabled={!draft.name.trim()}
                onPress={() => {
                  createCategory.mutate({ name: draft.name.trim(), type: draft.type });
                  setDraft(null);
                }}
              />
            </View>
          </Card>
        ) : null}

        {TYPE_ORDER.map((type) => {
          const items = (categories.data ?? []).filter((category) => category.type === type);
          return (
            <View key={type} className="mb-3 overflow-hidden rounded-3xl bg-surface">
              <View className="flex-row items-center gap-2 bg-canvas px-4 py-2">
                <Ionicons name={TYPE_META[type].icon as keyof typeof Ionicons.glyphMap} size={14} color={TYPE_META[type].color} />
                <Text className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  {TYPE_META[type].plural}
                </Text>
              </View>
              {items.map((category, index) => (
                <View key={category.id}>
                  {index > 0 ? <View className="ml-16 h-px bg-line" /> : null}
                  <View className="flex-row items-center gap-3 px-4 py-2.5">
                    <IconBubble icon={category.icon} color={category.color} size={32} iconSize={16} />
                    <Text className="flex-1 text-[15px] text-ink">{category.name}</Text>
                    {category.isDefault ? (
                      <Text className="text-[11px] font-medium text-ink-muted">Por defecto</Text>
                    ) : (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Eliminar ${category.name}`}
                        onPress={() =>
                          Alert.alert('Eliminar categoría', `Los movimientos de "${category.name}" quedarán sin categoría.`, [
                            { text: 'Cancelar', style: 'cancel' },
                            {
                              text: 'Eliminar',
                              style: 'destructive',
                              onPress: () => deleteCategory.mutate(category.id),
                            },
                          ])
                        }
                        className="h-8 w-8 items-center justify-center rounded-full bg-canvas active:opacity-70"
                      >
                        <Ionicons name="trash-outline" size={15} color="#F04438" />
                      </Pressable>
                    )}
                  </View>
                </View>
              ))}
            </View>
          );
        })}

        <Text className="mb-2 mt-2 px-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          Zona sensible
        </Text>
        <Card>
          <Button
            label="Borrar todos los datos"
            icon="trash-outline"
            variant="danger"
            fullWidth
            loading={resetData.isPending}
            onPress={confirmReset}
          />
        </Card>

        <Text className="mt-6 text-center text-xs text-ink-muted">Perfox · MVP local</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
