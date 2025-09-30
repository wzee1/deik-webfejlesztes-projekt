import {
text, integer, pgTable,
varchar, timestamp, boolean, serial
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// ==============================
// === OWN TABLES & RELATIONS ===
// ==============================

// --- USERS TABLE (BetterAuth Compatible) ---
// Note: Table name is "user" to align with BetterAuth
export const usersTable = pgTable("user", {
  // BetterAuth uses text ID
  id: text("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), 
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(), 
  image: text("image"), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const usersRelations = relations(usersTable, ({ many }) => ({
  addedDirectors: many(directorsTable),
  addedMovies: many(moviesTable),
}))

// --- DIRECTORS TABLE ---
export const directorsTable = pgTable("directors", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  birthYear: integer("birth_year"),
  // Foreign key to usersTable.id (text)
  addedBy: text("added_by")
    .notNull()
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
    .references(() => directorsTable.id, { onDelete: "restrict" }),
  // Foreign key to usersTable.id (text)
  userId: text("user_id")
    .notNull()
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


// ====================================
// === BETTERAUTH GENERATED TABLES ===
// ====================================

// Note: The "user" table is defined above as usersTable, so it is omitted here.

export const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  // References the unified usersTable (which has table name "user")
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }), 
})

export const accountTable = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  // References the unified usersTable (which has table name "user")
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
})

export const verificationTable = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})
