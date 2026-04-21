import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { projectsTable } from "./projects";

export const activityTable = pgTable("activity", {
  id: serial("id").primaryKey(),
  type: text("type", {
    enum: ["project_created", "status_changed", "file_uploaded", "message_sent"],
  }).notNull(),
  projectId: integer("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  projectTitle: text("project_title").notNull(),
  description: text("description").notNull(),
  actorName: text("actor_name").notNull(),
  actorRole: text("actor_role", {
    enum: ["client", "designer"],
  }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertActivitySchema = createInsertSchema(activityTable).omit({ id: true, createdAt: true });
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activityTable.$inferSelect;
