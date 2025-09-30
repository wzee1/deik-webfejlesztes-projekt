"use server"

import { db } from "@/lib/db"
import { directorsTable } from "@/lib/db/schema"
import { asc } from "drizzle-orm"

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
    email: string
    emailVerified: boolean
    image: string | null
    createdAt: Date
    updatedAt: Date
  }
}

export async function getDirectors() {
  try {
    const directorsWithUser = await db.query.directorsTable.findMany({
      orderBy: [asc(directorsTable.name)],
      with: {
        addedByUser: true,
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