"use server"

import { db } from "@/lib/db"
import { directorsTable, moviesTable } from "@/lib/db/schema"
import { and, asc, eq } from "drizzle-orm"
import { TEST_USER } from "@/lib/db/seed/test-user"
import z from "zod"

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
        id: m.addedByUser.id,
        name: m.addedByUser.name || "Ismeretlen felhasználó",
      }
    }))

    return {
      success: true,
      message: "Movies fetched successfully!",
      data: typedMovies
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
        id: movie.addedByUser.id,
        name: movie.addedByUser.name || "Ismeretlen felhasználó",
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
    // TODO: implement validating request:
    // const { userId } = await auth()
    // if (!userId) return {
    //   success: false,
    //   message: "You must be logged in to add a movie.",
    //   data: null
    // }

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
      // TODO: add correct user id here
      userId: TEST_USER.id,
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