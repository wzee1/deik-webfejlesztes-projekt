import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "@/lib/db/index"

import { admin } from "better-auth/plugins"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: { 
    enabled: true,
    requireEmailVerification: false
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  plugins: [admin()],
})

export type Session = typeof auth.$Infer.Session.session
export type User = typeof auth.$Infer.Session.user