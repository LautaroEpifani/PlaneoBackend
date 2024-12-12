import { pgTable, unique, integer, varchar, check, serial, text, timestamp, numeric } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "users_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar({ length: 255 }).notNull(),
	age: integer().notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 150 }).notNull(),
}, (table) => {
	return {
		usersEmailUnique: unique("users_email_unique").on(table.email),
	}
});

export const cards = pgTable("cards", {
	id: serial().primaryKey().notNull(),
	cardName: varchar("card_name", { length: 255 }).notNull(),
	description: text(),
	createdBy: varchar("created_by", { length: 255 }),
	assignedTo: varchar("assigned_to", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	status: varchar({ length: 20 }).default('todo'),
	order: numeric({ precision: 10, scale:  2 }),
}, (table) => {
	return {
		cardsStatusCheck: check("cards_status_check", sql`(status)::text = ANY ((ARRAY['todo'::character varying, 'in-progress'::character varying, 'done'::character varying])::text[])`),
	}
});
