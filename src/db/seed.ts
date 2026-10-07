import { sql } from 'drizzle-orm';

import { categories, type Category, type NewCategory, type TxType } from './schema';
import type { Database } from './client';

type DefaultCategory = {
  name: string;
  type: TxType;
  icon: string;
  color: string;
};

const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { name: 'Comida', type: 'expense', icon: 'fast-food-outline', color: '#F79009' },
  { name: 'Transporte', type: 'expense', icon: 'car-outline', color: '#2E90FA' },
  { name: 'Hogar', type: 'expense', icon: 'home-outline', color: '#7A5AF8' },
  { name: 'Salud', type: 'expense', icon: 'medkit-outline', color: '#F04438' },
  { name: 'Entretenimiento', type: 'expense', icon: 'game-controller-outline', color: '#EE46BC' },
  { name: 'Compras', type: 'expense', icon: 'bag-handle-outline', color: '#12B76A' },
  { name: 'Servicios', type: 'expense', icon: 'receipt-outline', color: '#667085' },
  { name: 'Otros gastos', type: 'expense', icon: 'ellipsis-horizontal', color: '#98A2B3' },

  { name: 'Salario', type: 'income', icon: 'briefcase-outline', color: '#12B76A' },
  { name: 'Freelance', type: 'income', icon: 'laptop-outline', color: '#2E90FA' },
  { name: 'Inversiones', type: 'income', icon: 'trending-up-outline', color: '#7A5AF8' },
  { name: 'Otros ingresos', type: 'income', icon: 'ellipsis-horizontal', color: '#98A2B3' },

  { name: 'Ahorro general', type: 'savings', icon: 'wallet-outline', color: '#F79009' },
  { name: 'Fondo de emergencia', type: 'savings', icon: 'shield-checkmark-outline', color: '#12B76A' },
  { name: 'Meta de ahorro', type: 'savings', icon: 'flag-outline', color: '#6C5CE7' },
];

export function seedDefaultCategories(database: Database) {
  const existing = database.select({ id: categories.id }).from(categories).all();
  if (existing.length > 0) return;

  database.insert(categories).values(
    DEFAULT_CATEGORIES.map((category) => ({
      name: category.name,
      type: category.type,
      icon: category.icon,
      color: category.color,
      isDefault: true,
    })),
  ).run();
}

export function listCategories(database: Database, type?: TxType): Category[] {
  if (!type) {
    return database.select().from(categories).orderBy(categories.id).all();
  }
  return database
    .select()
    .from(categories)
    .where(sql`${categories.type} = ${type}`)
    .orderBy(categories.id)
    .all();
}

export function createCategory(
  database: Database,
  input: { name: string; type: TxType; icon?: string; color?: string },
): Category {
  const name = input.name.trim();
  return database
    .insert(categories)
    .values({
      name,
      type: input.type,
      icon: input.icon ?? 'pricetag-outline',
      color: input.color ?? '#6C5CE7',
      isDefault: false,
    } satisfies NewCategory)
    .returning()
    .get();
}

export function deleteCategory(database: Database, id: number) {
  database.delete(categories).where(sql`${categories.id} = ${id}`).run();
}
