"use server"

import { db } from "@/lib/db"
import { directorsTable, moviesTable } from "@/lib/db/schema"
import { TEST_USER } from "@/lib/db/seed/test-user"

import z from "zod"
import { and, asc, eq, not } from "drizzle-orm"

import { getCurrentUser, isAuthenticated, notAuthenticatedObject } from "@/lib/auth/auth-functions"

export type Movie = {
  id: number
  title: string
  releaseYear: number | null
  description: string | null
  directorId: number
  userId: string
  createdAt: Date
  director: {
    id: number
    name: string
    birthYear: number | null
  }
  addedByUser: {
    id: string
    name: string | null
  }
}

export async function getMovies() {
  try {
    const valid = isAuthenticated()
    const user = await getCurrentUser()
    if (!valid || !user) return notAuthenticatedObject

    const movies = await db.query.moviesTable.findMany({
      orderBy: [asc(moviesTable.title)],
      with: {
        director: {
          columns: {
            id: true,
            name: true,
            birthYear: true,
          }
        },
        addedByUser: {
          columns: {
            id: true,
            name: true,
          }
        }
      },
    })

    if (movies.length > 0) {
      const typedMovies: Movie[] = movies.map(m => ({
        id: m.id,
        title: m.title,
        releaseYear: m.releaseYear,
        description: m.description,
        directorId: m.directorId,
        userId: m.userId,
        createdAt: m.createdAt,
        director: m.director,
        addedByUser: {
          id: user.id,
          name: user.name || "Unknown user",
        }
      }))

      return {
        success: true,
        message: "Movies fetched successfully!",
        data: typedMovies
      }
    }
    
    return {
      success: true,
      message: "0 movies were fetched successfully!",
      data: movies
    }
  } catch (error) {
    return {
      success: false,
      message: "Unexpected error occurred while fetching movies.",
      data: null
    }
  }
}

export async function getMovieById(id: number) {
  try {
    const valid = isAuthenticated()
    const user = await getCurrentUser()
    if (!valid || !user) return notAuthenticatedObject

    const movie = await db.query.moviesTable.findFirst({
      where: eq(moviesTable.id, id),
      with: {
        director: {
          columns: {
            id: true,
            name: true,
            birthYear: true,
          }
        },
        addedByUser: {
          columns: {
            id: true,
            name: true,
          }
        }
      },
    })

    if (!movie) return {
      success: false,
      message: `Movie with ID ${id} not found.`,
      data: null
    }
    
    const typedMovie: Movie = {
      id: movie.id,
      title: movie.title,
      releaseYear: movie.releaseYear,
      description: movie.description,
      directorId: movie.directorId,
      userId: movie.userId,
      createdAt: movie.createdAt,
      director: movie.director,
      addedByUser: {
        id: user.id,
        name: user.name || "Unknown user",
      }
    }

    return {
      success: true,
      message: "Movie fetched successfully!",
      data: typedMovie
    }
  } catch (error) {
    return {
      success: false,
      message: `Unexpected error occurred while fetching movie ID ${id}.`,
      data: null
    }
  }
}

const createMovieSchema = z.object({
  title: z.string().trim()
    .min(1, "Title is required!")
    .max(255, "Title must be 255 characters or less!"),
  releaseYear: z.string().trim().optional()
    .refine(
      (val) => !val || val === "" || !isNaN(parseInt(val)),
      "Release year must be a valid number!"
    )
    .transform((val) => (val && val !== "" ? parseInt(val) : null))
    .refine(
      (val) => val === null || (val >= 1800 && val <= new Date().getFullYear() + 10),
      `Release year must be between 1800 and ${new Date().getFullYear() + 10}!`
    ),
  description: z.string().trim().optional()
    .transform((val) => val || null),
  directorId: z.string().trim()
    .min(1, "Director is required!")
    .transform((val) => parseInt(val))
    .refine((val) => !isNaN(val), "Invalid director ID!")
})

export async function createMovie(formData: FormData) {
  try {
    const valid = isAuthenticated()
    const user = await getCurrentUser()
    if (!valid || !user) return notAuthenticatedObject

    // Extract form data
    const rawData = {
      title: formData.get("title")?.toString(),
      releaseYear: formData.get("releaseYear")?.toString(),
      description: formData.get("description")?.toString(),
      directorId: formData.get("directorId")?.toString()
    }

    // Validate with Zod
    const validationResult = createMovieSchema.safeParse(rawData)

    if (!validationResult.success) return {
      success: false,
      message: validationResult.error.issues[0].message,
      data: null
    }

    const { title, releaseYear, description, directorId } = validationResult.data

    // Check if director exists
    const directorExists = await db.query.directorsTable.findFirst({
      where: eq(directorsTable.id, directorId)
    })

    if (!directorExists) return {
      success: false,
      message: "Selected director does not exist!",
      data: null
    }

    // Check for duplicate movie (same title and director)
    const existingMovie = await db.query.moviesTable.findFirst({
      where: and(
        eq(moviesTable.title, title),
        eq(moviesTable.directorId, directorId)
      )
    })

    if (existingMovie) return {
      success: false,
      message: "A movie with this title and director already exists!",
      data: null
    }

    // Insert movie into database
    const [newMovie] = await db.insert(moviesTable).values({
      title,
      releaseYear,
      description,
      directorId,
      userId: user.id,
      createdAt: new Date()
    }).returning()

    return {
      success: true,
      message: "Movie added successfully!",
      data: {
        id: newMovie.id,
        title: newMovie.title,
        releaseYear: newMovie.releaseYear,
        description: newMovie.description,
        directorId: newMovie.directorId,
        userId: newMovie.userId,
        createdAt: newMovie.createdAt
      }
    }

  } catch (error) {
    return {
      success: false,
      message: "Unexpected error occurred while adding the movie!",
      data: null
    }
  }
}

const updateMovieSchema = z.object({
  title: z.string().trim()
    .min(1, "Title is required!")
    .max(255, "Title must be 255 characters or less!"),
  releaseYear: z.string().trim().optional()
    .refine(
      (val) => !val || val === "" || !isNaN(parseInt(val)),
      "Release year must be a valid number!"
    )
    .transform((val) => (val && val !== "" ? parseInt(val) : null))
    .refine(
      (val) => val === null || (val >= 1800 && val <= new Date().getFullYear() + 10),
      `Release year must be between 1800 and ${new Date().getFullYear() + 10}!`
    ),
  description: z.string().trim().optional()
    .transform((val) => val || null),
  directorId: z.string().trim()
    .min(1, "Director is required!")
    .transform((val) => parseInt(val))
    .refine((val) => !isNaN(val), "Invalid director ID!")
})

export async function updateMovie(id: number, formData: FormData) {
  try {
    const valid = isAuthenticated()
    const user = await getCurrentUser()
    if (!valid || !user) return notAuthenticatedObject

    // Check if movie exists
    const existingMovie = await db.query.moviesTable.findFirst({
      where: eq(moviesTable.id, id)
    })

    if (!existingMovie) return {
      success: false,
      message: `Movie with ID ${id} not found!`,
      data: null
    }

    if (existingMovie.userId !== user.id) return {
      success: false,
      message: "You don't have permission to update this movie!",
      data: null
    }

    // Extract form data
    const rawData = {
      title: formData.get("title")?.toString(),
      releaseYear: formData.get("releaseYear")?.toString(),
      description: formData.get("description")?.toString(),
      directorId: formData.get("directorId")?.toString()
    }

    // Validate with Zod
    const validationResult = updateMovieSchema.safeParse(rawData)

    if (!validationResult.success) return {
      success: false,
      message: validationResult.error.issues[0].message,
      data: null
    }

    const { title, releaseYear, description, directorId } = validationResult.data

    // Check if director exists
    const directorExists = await db.query.directorsTable.findFirst({
      where: eq(directorsTable.id, directorId)
    })

    if (!directorExists) return {
      success: false,
      message: "Selected director does not exist!",
      data: null
    }

    // Check for duplicate movie (same title and director, but different id)
    const duplicateMovie = await db.query.moviesTable.findFirst({
      where: and(
        eq(moviesTable.title, title),
        eq(moviesTable.directorId, directorId),
        not(eq(moviesTable.id, id))
      )
    })

    if (duplicateMovie) return {
      success: false,
      message: "A movie with this title and director already exists!",
      data: null
    }

    // Update movie in database
    const [updatedMovie] = await db.update(moviesTable)
      .set({
        title,
        releaseYear,
        description,
        directorId,
      })
      .where(eq(moviesTable.id, id))
      .returning()

    return {
      success: true,
      message: "Movie updated successfully!",
      data: {
        id: updatedMovie.id,
        title: updatedMovie.title,
        releaseYear: updatedMovie.releaseYear,
        description: updatedMovie.description,
        directorId: updatedMovie.directorId,
        userId: updatedMovie.userId,
        createdAt: updatedMovie.createdAt
      }
    }

  } catch (error) {
    return {
      success: false,
      message: "Unexpected error occurred while updating the movie!",
      data: null
    }
  }
}

export async function deleteMovie(id: number) {
  try {
    const valid = isAuthenticated()
    const user = await getCurrentUser()
    if (!valid || !user) return notAuthenticatedObject

    // Check if movie exists
    const existingMovie = await db.query.moviesTable.findFirst({
      where: eq(moviesTable.id, id)
    })

    if (!existingMovie) return {
      success: false,
      message: `Movie with ID ${id} not found!`,
      data: null
    }

    if (existingMovie.userId !== user.id) return {
      success: false,
      message: "You don't have permission to delete this movie!",
      data: null
    }

    // Delete movie from database
    await db.delete(moviesTable)
      .where(eq(moviesTable.id, id))

    return {
      success: true,
      message: "Movie deleted successfully!",
      data: {
        id: existingMovie.id,
        title: existingMovie.title
      }
    }

  } catch (error) {
    return {
      success: false,
      message: "Unexpected error occurred while deleting the movie!",
      data: null
    }
  }
}