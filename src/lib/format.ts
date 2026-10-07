const CURRENCY_SYMBOL = '$';

function numberFormatter(minimumFractionDigits = 2, maximumFractionDigits = 2) {
  try {
    return new Intl.NumberFormat(undefined, {
      minimumFractionDigits,
      maximumFractionDigits,
    });
  } catch {
    return {
      format: (value: number) =>
        value.toFixed(maximumFractionDigits).replace('.', ','),
    };
  }
}

/** 1234.5 -> "$1.234,50" (grouping follows the device locale). */
export function formatMoney(cents: number): string {
  const value = (cents ?? 0) / 100;
  return `${CURRENCY_SYMBOL}${numberFormatter().format(value)}`;
}

/** Same as formatMoney but always carries an explicit sign. */
export function formatSignedMoney(cents: number): string {
  const sign = cents > 0 ? '+' : cents < 0 ? '-' : '';
  return `${sign}${formatMoney(Math.abs(cents))}`;
}

/** Compact form for dense cards, e.g. "$1,2 mil". */
export function formatMoneyShort(cents: number): string {
  const value = Math.abs(cents ?? 0) / 100;
  if (value >= 1_000_000) return `${CURRENCY_SYMBOL}${trim(value / 1_000_000)} M`;
  if (value >= 10_000) return `${CURRENCY_SYMBOL}${trim(value / 1_000)} k`;
  return formatMoney(cents);
}

function trim(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return numberFormatter(0, 1).format(rounded);
}

export function formatPercent(share: number): string {
  const percent = share * 100;
  if (percent >= 10) return `${Math.round(percent)}%`;
  if (percent > 0 && percent < 1) return '<1%';
  return `${percent.toFixed(1)}%`;
}

/** Parses the quick-add amount field into integer cents. */
export function parseAmountToCents(input: string): number | null {
  const normalized = input.replace(/[^\d.,]/g, '').replace(/,/g, '.');
  if (!normalized) return null;
  const value = Number.parseFloat(normalized);
  if (!Number.isFinite(value) || value <= 0) return null;
  return Math.round(value * 100);
}
