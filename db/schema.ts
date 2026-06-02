import { pgTable, serial, text, jsonb, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

// A single table holds every journal entry for every user. Each row is keyed by
// the owning Identity user, the entry "type" ("daily" | "weekly"), and the entry
// key (a date like "2026-06-02" for daily, or a week key like "2026-23" for
// weekly). The free-form answers live in `data` as JSON so the shape can evolve
// without further migrations.
export const entries = pgTable(
  "entries",
  {
    id: serial().primaryKey(),
    userId: text("user_id").notNull(),
    type: text().notNull(),
    entryKey: text("entry_key").notNull(),
    data: jsonb().notNull(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    // One row per user + type + key; used for upserts on save.
    userTypeKey: uniqueIndex("entries_user_type_key").on(
      table.userId,
      table.type,
      table.entryKey,
    ),
  }),
);
