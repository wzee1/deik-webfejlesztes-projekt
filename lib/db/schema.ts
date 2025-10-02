import {
  text, integer, pgTable,
  varchar, timestamp, serial, boolean
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// ==========================
// === BETTER-AUTH SCHEMA ===
// ==========================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role"),
  banned: boolean("banned").default(false),
  banReason: text("ban_reason"),
  banExpires: timestamp("ban_expires"),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  impersonatedBy: text("impersonated_by"),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

// ==============================
// === OWN TABLES & RELATIONS ===
// ==============================

export const usersRelations = relations(user, ({ many }) => ({
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
    .references(() => user.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const directorsRelations = relations(directorsTable, ({ one, many }) => ({
  addedByUser: one(user, {
    fields: [directorsTable.addedBy],
    references: [user.id],
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
    .references(() => user.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const moviesRelations = relations(moviesTable, ({ one }) => ({
  director: one(directorsTable, {
    fields: [moviesTable.directorId],
    references: [directorsTable.id],
  }),
  addedByUser: one(user, {
    fields: [moviesTable.userId],
    references: [user.id],
  }),
}))