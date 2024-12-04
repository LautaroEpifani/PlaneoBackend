import { pgTable, unique, integer, varchar } from "drizzle-orm/pg-core"
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
