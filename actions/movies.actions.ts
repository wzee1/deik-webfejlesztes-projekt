"use server"

import { db } from "@/lib/db"
import { moviesTable } from "@/lib/db/schema"
import { asc, eq } from "drizzle-orm"

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
