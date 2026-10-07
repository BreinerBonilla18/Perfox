import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { Category, SavingsGoal, TxType } from '@/db/schema';
import {
  buildMonthGrid,
  currentMonthKey,
  formatDayLabel,
  formatLongDate,
  formatMonthLabel,
  monthKeyOf,
  shiftMonth,
  weekDayLabel,
} from '@/lib/date';
import { IconBubble, TYPE_META } from '@/components/ui/Feedback';

const TYPE_ORDER: TxType[] = ['expense', 'income', 'savings'];

export function TypeToggle({
  value,
  onChange,
}: {
  value: TxType;
  onChange: (type: TxType) => void;
}) {
  return (
    <View className="flex-row gap-2">
      {TYPE_ORDER.map((type) => {
        const meta = TYPE_META[type];
        const active = type === value;
        return (
          <Pressable
            key={type}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(type)}
            className={`flex-1 items-center gap-1 rounded-2xl border py-3 ${
              active ? 'border-transparent' : 'border-line bg-canvas'
            }`}
            style={active ? { backgroundColor: `${meta.color}1A`, borderColor: meta.color } : undefined}
          >
            <Ionicons name={meta.icon as keyof typeof Ionicons.glyphMap} size={18} color={meta.color} />
            <Text className="text-[13px] font-semibold" style={{ color: active ? meta.color : '#667085' }}>
              {meta.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function AmountField({
  value,
  onChange,
  color,
  hint,
}: {
  value: string;
  onChange: (value: string) => void;
  color: string;
  hint?: string;
}) {
  return (
    <View className="items-center py-2">
      <View className="flex-row items-end justify-center">
        <Text className="mb-2 mr-1 text-2xl font-semibold text-ink-muted">$</Text>
        <TextInput
          value={value}
          onChangeText={onChange}
          keyboardType="decimal-pad"
          inputMode="decimal"
          placeholder="0"
          placeholderTextColor="#D0D5DD"
          autoFocus={!value}
          accessibilityLabel="Monto"
          className="min-w-[80px] text-center text-5xl font-bold tabular-nums text-ink"
          style={{ color: value ? color : undefined, paddingVertical: 0 }}
        />
      </View>
      <Text className="mt-1 text-xs font-medium text-ink-muted">{hint ?? 'Introduce el monto'}</Text>
    </View>
  );
}

export function CategoryPicker({
  type,
  categories,
  selectedId,
  onSelect,
  onCreate,
  creating,
  onCreatingChange,
}: {
  type: TxType;
  categories: Category[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onCreate: (name: string) => void;
  creating: boolean;
  onCreatingChange: (creating: boolean) => void;
}) {
  const [draft, setDraft] = useState('');

  return (
    <View>
      <View className="flex-row flex-wrap" style={{ marginHorizontal: -5 }}>
        {categories.map((category) => {
          const active = category.id === selectedId;
          return (
            <View key={category.id} className="p-[5px]" style={{ width: '33.333%' }}>
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                onPress={() => onSelect(category.id)}
                className="items-center gap-1.5 rounded-2xl border px-1 py-3"
                style={{
                  borderColor: active ? category.color : '#E9EAEE',
                  backgroundColor: active ? `${category.color}14` : '#FFFFFF',
                }}
              >
                <IconBubble icon={category.icon} color={category.color} size={34} />
                <Text
                  numberOfLines={1}
                  className="text-[11px] font-medium"
                  style={{ color: active ? category.color : '#667085' }}
                >
                  {category.name}
                </Text>
              </Pressable>
            </View>
          );
        })}

        <View className="p-[5px]" style={{ width: '33.333%' }}>
          <Pressable
            accessibilityRole="button"
            onPress={() => onCreatingChange(!creating)}
            className="items-center gap-1.5 rounded-2xl border border-dashed border-line px-1 py-3 active:opacity-70"
          >
            <View className="h-[34px] w-[34px] items-center justify-center rounded-2xl bg-canvas">
              <Ionicons name="add" size={20} color="#667085" />
            </View>
            <Text className="text-[11px] font-medium text-ink-muted">Nueva</Text>
          </Pressable>
        </View>
      </View>

      {creating ? (
        <View className="mt-3 flex-row items-center gap-2">
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={`Nombre de la categoría (${TYPE_META[type].label.toLowerCase()})`}
            placeholderTextColor="#98A2B3"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={() => {
              if (draft.trim()) {
                onCreate(draft.trim());
                setDraft('');
                onCreatingChange(false);
              }
            }}
            className="h-11 flex-1 rounded-2xl border border-line bg-canvas px-3 text-[15px] text-ink"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Guardar categoría"
            onPress={() => {
              if (draft.trim()) {
                onCreate(draft.trim());
                setDraft('');
                onCreatingChange(false);
              }
            }}
            className="h-11 w-11 items-center justify-center rounded-2xl bg-brand active:opacity-80"
          >
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

export function GoalPicker({
  goals,
  selectedId,
  onSelect,
}: {
  goals: SavingsGoal[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}) {
  return (
    <View className="flex-row flex-wrap" style={{ marginHorizontal: -4 }}>
      <View className="p-1" style={{ width: '50%' }}>
        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ selected: selectedId === null }}
          onPress={() => onSelect(null)}
          className={`flex-row items-center gap-2 rounded-2xl border px-3 py-3 ${
            selectedId === null ? 'border-brand bg-brand-soft' : 'border-line'
          }`}
        >
          <Ionicons name="wallet-outline" size={18} color={selectedId === null ? '#6C5CE7' : '#667085'} />
          <Text
            className="text-sm font-semibold"
            style={{ color: selectedId === null ? '#6C5CE7' : '#667085' }}
          >
            Sin meta
          </Text>
        </Pressable>
      </View>

      {goals.map((goal) => {
        const active = goal.id === selectedId;
        return (
          <View key={goal.id} className="p-1" style={{ width: '50%' }}>
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              onPress={() => onSelect(goal.id)}
              className="flex-row items-center gap-2 rounded-2xl border px-3 py-3"
              style={{
                borderColor: active ? goal.color : '#E9EAEE',
                backgroundColor: active ? `${goal.color}14` : '#FFFFFF',
              }}
            >
              <Ionicons
                name={goal.icon as keyof typeof Ionicons.glyphMap}
                size={18}
                color={active ? goal.color : '#667085'}
              />
              <Text
                numberOfLines={1}
                className="flex-1 text-sm font-semibold"
                style={{ color: active ? goal.color : '#667085' }}
              >
                {goal.name}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

export function DateField({
  value,
  onChange,
}: {
  value: string;
  onChange: (iso: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => monthKeyOf(value));
  const cells = buildMonthGrid(viewMonth);
  const today = currentMonthKey();

  return (
    <View>
      <View className="flex-row items-center gap-2">
        <Pressable
          accessibilityRole="button"
          onPress={() => setOpen(!open)}
          className="flex-1 flex-row items-center gap-3 rounded-2xl border border-line bg-canvas px-3.5 py-3 active:opacity-70"
        >
          <Ionicons name="calendar-outline" size={18} color="#667085" />
          <View className="flex-1">
            <Text className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">Fecha</Text>
            <Text className="text-[15px] font-medium capitalize text-ink">
              {formatDayLabel(value)} · {formatLongDate(value)}
            </Text>
          </View>
          <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#98A2B3" />
        </Pressable>
      </View>

      {open ? (
        <View className="mt-2 rounded-2xl border border-line bg-surface p-3">
          <View className="mb-2 flex-row items-center justify-between">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mes anterior"
              onPress={() => setViewMonth(shiftMonth(viewMonth, -1))}
              className="h-9 w-9 items-center justify-center rounded-full bg-canvas active:opacity-70"
            >
              <Ionicons name="chevron-back" size={16} color="#475467" />
            </Pressable>
            <Text className="text-sm font-semibold capitalize text-ink">
              {formatMonthLabel(viewMonth)}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mes siguiente"
              onPress={() => setViewMonth(shiftMonth(viewMonth, 1))}
              className="h-9 w-9 items-center justify-center rounded-full bg-canvas active:opacity-70"
            >
              <Ionicons name="chevron-forward" size={16} color="#475467" />
            </Pressable>
          </View>

          <View className="flex-row">
            {Array.from({ length: 7 }, (_, index) => (
              <Text
                key={index}
                className="flex-1 text-center text-[10px] font-semibold uppercase text-ink-muted"
              >
                {weekDayLabel(index).slice(0, 2)}
              </Text>
            ))}
          </View>

          <View className="mt-1 flex-row flex-wrap">
            {cells.map((cell) => {
              const selected = cell.iso === value;
              return (
                <View key={cell.iso} className="p-[2px]" style={{ width: `${100 / 7}%` }}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={formatLongDate(cell.iso)}
                    onPress={() => {
                      onChange(cell.iso);
                      setOpen(false);
                    }}
                    className="h-9 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: selected ? '#101828' : cell.isToday ? '#EFEDFF' : 'transparent',
                    }}
                  >
                    <Text
                      className="text-[13px] font-semibold"
                      style={{
                        color: selected ? '#FFFFFF' : cell.isCurrentMonth ? '#101828' : '#D0D5DD',
                      }}
                    >
                      {cell.day}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={() => {
              onChange(`${today}-${value.slice(8)}`);
              setViewMonth(today);
              setOpen(false);
            }}
            className="mt-2 self-center rounded-full bg-canvas px-4 py-2 active:opacity-70"
          >
            <Text className="text-xs font-semibold text-brand">Ir a hoy</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
