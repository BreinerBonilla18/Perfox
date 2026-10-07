const MONTH_LABELS_FALLBACK = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const DAY_LABELS_FALLBACK = [
  'dom',
  'lun',
  'mar',
  'mié',
  'jue',
  'vie',
  'sáb',
];

function pad(value: number) {
  return value < 10 ? `0${value}` : `${value}`;
}

/** Local calendar date as `YYYY-MM-DD` (never UTC-shifted). */
export function toIsoDate(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function currentMonthKey(): string {
  return toIsoDate().slice(0, 7);
}

export function monthKeyOf(isoDate: string): string {
  return isoDate.slice(0, 7);
}

export function todayIso(): string {
  return toIsoDate();
}

export function shiftMonth(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

export function isCurrentMonth(monthKey: string): boolean {
  return monthKey === currentMonthKey();
}

export function isFutureMonth(monthKey: string): boolean {
  return monthKey > currentMonthKey();
}

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  try {
    return new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(date);
  } catch {
    return `${MONTH_LABELS_FALLBACK[month - 1]} ${year}`;
  }
}

export function formatShortMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  try {
    return new Intl.DateTimeFormat(undefined, { month: 'short' }).format(date);
  } catch {
    return MONTH_LABELS_FALLBACK[month - 1].slice(0, 3);
  }
}

function toLocalDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** "Hoy" / "Ayer" / "12 oct" / "12 oct 2025" for past years. */
export function formatDayLabel(isoDate: string): string {
  const date = toLocalDate(isoDate);
  const today = toLocalDate(toIsoDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.getTime() === today.getTime()) return 'Hoy';
  if (date.getTime() === yesterday.getTime()) return 'Ayer';

  const sameYear = date.getFullYear() === today.getFullYear();
  try {
    return new Intl.DateTimeFormat(undefined, {
      day: 'numeric',
      month: 'short',
      year: sameYear ? undefined : 'numeric',
    }).format(date);
  } catch {
    const month = MONTH_LABELS_FALLBACK[date.getMonth()].slice(0, 3);
    return `${date.getDate()} ${month}${sameYear ? '' : ` ${date.getFullYear()}`}`;
  }
}

export function formatLongDate(isoDate: string): string {
  const date = toLocalDate(isoDate);
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(date);
  } catch {
    return formatDayLabel(isoDate);
  }
}

export function weekDayLabel(index: number): string {
  try {
    return new Intl.DateTimeFormat(undefined, { weekday: 'short' })
      .format(new Date(2024, 0, 8 + index))
      .replace('.', '');
  } catch {
    return DAY_LABELS_FALLBACK[index];
  }
}

export type MonthCell = {
  iso: string;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
};

/** Builds the 6x7 grid used by the quick-add date picker. */
export function buildMonthGrid(monthKey: string): MonthCell[] {
  const [year, month] = monthKey.split('-').map(Number);
  const first = new Date(year, month - 1, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const today = toIsoDate();

  const cells: MonthCell[] = [];
  const cursor = new Date(year, month - 1, 1 - startOffset);

  for (let index = 0; index < 42; index += 1) {
    const iso = toIsoDate(cursor);
    cells.push({
      iso,
      day: cursor.getDate(),
      isCurrentMonth: cursor.getMonth() === month - 1,
      isToday: iso === today,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return cells;
}
