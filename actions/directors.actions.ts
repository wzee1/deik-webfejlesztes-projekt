"use server"

import { db } from "@/lib/db"
import { directorsTable } from "@/lib/db/schema"
import { asc } from "drizzle-orm"

import { z } from "zod"
import { eq, and } from "drizzle-orm"
import { moviesTable } from "@/lib/db/schema"

import {
  getCurrentUser,
  isAuthenticated,
  notAuthenticatedObject
} from "@/lib/auth/auth-functions"

export type Director = {
  id: number
  name: string
  birthYear: number | null
  addedBy: string
  addedByName: string | null
  createdAt: Date
  addedByUser: {
    id: string
    name: string
  }
}

export async function getDirectors() {
  try {
    const valid = await isAuthenticated()
    if (!valid) return notAuthenticatedObject

    const directorsWithUser = await db.query.directorsTable.findMany({
      orderBy: [asc(directorsTable.name)],
      with: {
        addedByUser: {
          columns: {
            id: true,
            name: true,
          }
        },
      },
    })

    const directors: Director[] = directorsWithUser.map((d) => ({
      id: d.id,
      name: d.name,
      birthYear: d.birthYear,
      addedBy: d.addedBy,
      addedByName: d.addedByUser?.name || "Unknown user",
      createdAt: d.createdAt,
      addedByUser: d.addedByUser,
    }))

    return {
      success: true,
      message: "Directors fetched successfully!",
      data: directors
    }


  } catch (error) {
    return {
      success: false,
      message: "Unexpected error occurred, please try again later!",
      data: null
    }
  }
}

// Zod schema for director validation
const directorSchema = z.object({
  name: z.string().trim()
    .min(1, "Name is required!")
    .max(255, "Name must be 255 characters or less!"),
  birthYear: z.string().trim().optional()
    .refine(
      (val) => !val || val === "" || !isNaN(parseInt(val)),
      "Birth year must be a valid number!"
    )
    .transform((val) => (val && val !== "" ? parseInt(val) : null))
    .refine(
      (val) => val === null || (val >= 1800 && val <= new Date().getFullYear()),
      `Birth year must be between 1800 and ${new Date().getFullYear()}!`
    ),
})

export async function createDirector(formData: FormData) {
  try {
    const valid = await isAuthenticated()
    const user = await getCurrentUser()
    if (!valid || !user) return notAuthenticatedObject

    const rawData = {
      name: formData.get("name")?.toString(),
      birthYear: formData.get("birthYear")?.toString(),
    }

    const validationResult = directorSchema.safeParse(rawData)

    if (!validationResult.success) return {
      success: false,
      message: validationResult.error.issues[0].message,
      data: null
    }

    const { name, birthYear } = validationResult.data

    let existingDirector: any

    if (birthYear === null) {
      existingDirector = await db.query.directorsTable.findFirst({
        where: eq(directorsTable.name, name)
      })
    } else {
      existingDirector = await db.query.directorsTable.findFirst({
        where: and(
          eq(directorsTable.name, name),
          eq(directorsTable.birthYear, birthYear)
        )
      })
    }

    if (existingDirector) return {
      success: false,
      message: "A director with this name and birth year already exists!",
      data: null
    }

    const [newDirector] = await db.insert(directorsTable).values({
      name,
      birthYear,
      addedBy: user.id,
      createdAt: new Date()
    }).returning()

    return {
      success: true,
      message: "Director added successfully!",
      data: newDirector
    }
  } catch (error) {
    return {
      success: false,
      message: "Unexpected error occurred while adding the director!",
      data: null
    }
  }
}

export async function updateDirector(id: number, formData: FormData) {
  try {
    const valid = await isAuthenticated()
    const user = await getCurrentUser()
    if (!valid || !user) return notAuthenticatedObject

    const existingDirector = await db.query.directorsTable.findFirst({
      where: eq(directorsTable.id, id)
    })

    if (!existingDirector) return {
      success: false,
      message: `Director with ID ${id} not found!`,
      data: null
    }

    if (
      user.role === "user" &&
      existingDirector.addedBy !== user.id
    ) return {
      success: false,
      message: "You don't have permission to update this director!",
      data: null
    }

    const rawData = {
      name: formData.get("name")?.toString(),
      // Added "or null" so it matches with db type:
      birthYear: formData.get("birthYear")?.toString() || null
    }

    if (
      rawData.name === existingDirector.name &&
      rawData.birthYear === existingDirector.birthYear?.toString()
    ) return {
      success: false,
      message: "No updates found, please modify the name or birth year to proceed!",
      data: null
    }

    const validationResult = directorSchema.safeParse(rawData)

    if (!validationResult.success) return {
      success: false,
      message: validationResult.error.issues[0].message,
      data: null
    }

    const { name, birthYear } = validationResult.data

    let duplicateDirector: any

    if (birthYear === null) {
      duplicateDirector = await db.query.directorsTable.findFirst({
        where: eq(directorsTable.name, name)
      })
    } else {
      duplicateDirector = await db.query.directorsTable.findFirst({
        where: and(
          eq(directorsTable.name, name),
          eq(directorsTable.birthYear, birthYear)
        )
      })
    }

    if (duplicateDirector && duplicateDirector.id !== id) return {
      success: false,
      message: "A director with this name and birth year already exists!",
      data: null
    }

    const [updatedDirector] = await db.update(directorsTable)
      .set({ name, birthYear })
      .where(eq(directorsTable.id, id))
      .returning()

    return {
      success: true,
      message: "Director updated successfully!",
      data: updatedDirector
    }
  } catch (error) {
    return {
      success: false,
      message: "Unexpected error occurred while updating the director!",
      data: null
    }
  }
}

export async function deleteDirector(id: number) {
  try {
    const valid = await isAuthenticated()
    const user = await getCurrentUser()
    if (!valid || !user) return notAuthenticatedObject

    const existingDirector = await db.query.directorsTable.findFirst({
      where: eq(directorsTable.id, id)
    })

    if (!existingDirector) return {
      success: false,
      message: `Director with ID ${id} not found!`,
      data: null
    }

    if (
      user.role === "user" &&
      existingDirector.addedBy !== user.id
    ) return {
      success: false,
      message: "You don't have permission to delete this director!",
      data: null
    }

    const directorMovies = await db.query.moviesTable.findMany({
      where: eq(moviesTable.directorId, id)
    })

    if (directorMovies.length > 0) return {
      success: false,
      message: `Cannot delete director. They have ${directorMovies.length} associated movie(s)!`,
      data: null
    }

    await db.delete(directorsTable).where(eq(directorsTable.id, id))

    return {
      success: true,
      message: "Director deleted successfully!",
      data: { id: existingDirector.id, name: existingDirector.name }
    }
  } catch (error) {
    return {
      success: false,
      message: "Unexpected error occurred while deleting the director!",
      data: null
    }
  }
}