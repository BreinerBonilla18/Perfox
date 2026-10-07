/**
 * Perfox schema migrations.
 *
 * The Drizzle schema (`./schema.ts`) is the source of truth for types. To evolve
 * the database:
 *
 *   1. Edit `./schema.ts` and run `npm run db:generate` to inspect the SQL diff.
 *   2. Append a new entry below with the DDL you need (bump `version`).
 *   3. Never edit an already released `version` — add a new one instead.
 *
 * `user_version` is used as the applied-migration marker, following the
 * expo-sqlite migration pattern.
 */
export type Migration = {
  version: number;
  name: string;
  sql: string;
};

export const migrations: Migration[] = [
  {
    version: 1,
    name: 'init',
    sql: `
CREATE TABLE \`categories\` (
  \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  \`name\` text NOT NULL,
  \`type\` text NOT NULL,
  \`icon\` text DEFAULT 'pricetag-outline' NOT NULL,
  \`color\` text DEFAULT '#667085' NOT NULL,
  \`is_default\` integer DEFAULT false NOT NULL,
  \`created_at\` integer DEFAULT (unixepoch() * 1000) NOT NULL
);

CREATE TABLE \`savings_goals\` (
  \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  \`name\` text NOT NULL,
  \`icon\` text DEFAULT 'flag-outline' NOT NULL,
  \`color\` text DEFAULT '#6C5CE7' NOT NULL,
  \`target_cents\` integer NOT NULL,
  \`created_at\` integer DEFAULT (unixepoch() * 1000) NOT NULL,
  \`archived\` integer DEFAULT false NOT NULL
);

CREATE TABLE \`transactions\` (
  \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  \`type\` text NOT NULL,
  \`amount_cents\` integer NOT NULL,
  \`category_id\` integer,
  \`goal_id\` integer,
  \`note\` text,
  \`date\` text NOT NULL,
  \`month\` text NOT NULL,
  \`created_at\` integer DEFAULT (unixepoch() * 1000) NOT NULL,
  FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  FOREIGN KEY (\`goal_id\`) REFERENCES \`savings_goals\`(\`id\`) ON UPDATE no action ON DELETE set null
);

CREATE INDEX \`transactions_month_idx\` ON \`transactions\` (\`month\`);
CREATE INDEX \`transactions_date_idx\` ON \`transactions\` (\`date\`);
`,
  },
];
