import { pgTable, foreignKey, check, serial, varchar, text, timestamp, numeric, integer, unique, primaryKey } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



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
	projectId: integer("project_id").notNull(),
}, (table) => {
	return {
		fkProject: foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "fk_project"
		}).onDelete("cascade"),
		cardsStatusCheck: check("cards_status_check", sql`(status)::text = ANY ((ARRAY['todo'::character varying, 'in-progress'::character varying, 'done'::character varying])::text[])`),
	}
});

export const projects = pgTable("projects", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
});

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	email: varchar({ length: 100 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	age: integer(),
}, (table) => {
	return {
		usersEmailKey: unique("users_email_key").on(table.email),
	}
});

export const userProjects = pgTable("user_projects", {
	userId: integer("user_id").notNull(),
	projectId: integer("project_id").notNull(),
}, (table) => {
	return {
		userProjectsUserIdFkey: foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_projects_user_id_fkey"
		}).onDelete("cascade"),
		userProjectsProjectIdFkey: foreignKey({
			columns: [table.projectId],
			foreignColumns: [projects.id],
			name: "user_projects_project_id_fkey"
		}).onDelete("cascade"),
		userProjectsPkey: primaryKey({ columns: [table.userId, table.projectId], name: "user_projects_pkey"}),
	}
});
