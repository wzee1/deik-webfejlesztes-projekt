import {
  serial, integer, pgTable,
  varchar, text, timestamp,
  boolean
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// --- USERS TABLE ---
export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const usersRelations = relations(usersTable, ({ many }) => ({
  // 1 user can have many directors and movies
  addedDirectors: many(directorsTable),
  addedMovies: many(moviesTable),
}))

// --- DIRECTORS TABLE ---
export const directorsTable = pgTable("directors", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  birthYear: integer("birth_year"),
  addedBy: integer("added_by")
    .notNull()
    // foreign key
    .references(() => usersTable.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const directorsRelations = relations(directorsTable, ({ one, many }) => ({
  addedByUser: one(usersTable, {
    fields: [directorsTable.addedBy],
    references: [usersTable.id],
  }),
  movies: many(moviesTable),
}))

// --- MOVIES TABLE ---
export const moviesTable = pgTable("movies", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  releaseYear: integer("release_year"),
  description: text("description"),
  directorId: integer("director_id")
    .notNull()
    // foreign key for directors
    .references(() => directorsTable.id, { onDelete: "restrict" }),
  userId: integer("user_id")
    .notNull()
    // foreign key for users
    .references(() => usersTable.id, { onDelete: "restrict" }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const moviesRelations = relations(moviesTable, ({ one }) => ({
  director: one(directorsTable, {
    fields: [moviesTable.directorId],
    references: [directorsTable.id],
  }),
  addedByUser: one(usersTable, {
    fields: [moviesTable.userId],
    references: [usersTable.id],
  }),
}))
