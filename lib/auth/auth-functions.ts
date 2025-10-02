import { auth } from "@/lib/auth/auth"
import { headers } from "next/headers"

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  
  return session
}

export async function isAuthenticated() {
  const session = await getSession()
  return session
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user ?? null
}

export async function isAdmin() {
  const user = await getCurrentUser()
  return user?.role === "admin"
}

export const notAuthenticatedObject = {
  success: false,
  message: "You have to login to perform this action!",
  data: null
}