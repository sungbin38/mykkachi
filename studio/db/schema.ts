import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
export const content = sqliteTable(
  "content",
  {
    id: text("id").primaryKey(),
    channel: text("channel").notNull(),
    locale: text("locale").notNull(),
    topic: text("topic").notNull(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    excerpt: text("excerpt").notNull(),
    body: text("body").notNull(),
    keyword: text("keyword").notNull(),
    slides: text("slides").notNull().default("[]"),
    status: text("status").notNull().default("draft"),
    scheduledAt: text("scheduled_at"),
    publishedSnapshot: text("published_snapshot"),
    publishedAt: text("published_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (t) => [
    uniqueIndex("idx_content_locale_channel_slug").on(
      t.locale,
      t.channel,
      t.slug,
    ),
    index("idx_content_status_schedule").on(t.status, t.scheduledAt),
  ],
);
export const events = sqliteTable(
  "event_totals",
  {
    day: text("day").notNull(),
    event: text("event").notNull(),
    source: text("source").notNull(),
    locale: text("locale").notNull(),
    count: integer("count").notNull().default(0),
  },
  (t) => [
    uniqueIndex("idx_event_totals_key").on(t.day, t.event, t.source, t.locale),
  ],
);
export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
export const jobs = sqliteTable("job_runs", {
  id: text("id").primaryKey(),
  startedAt: text("started_at").notNull(),
  summary: text("summary").notNull(),
  mode: text("mode").notNull(),
});
