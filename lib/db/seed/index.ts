import { db } from ".."
import { directorsTable, moviesTable, user as usersTable } from "../schema"
import { TEST_USER } from "./test-user"
import { seedDirectors } from "./directors"
import { seedMovies } from "./movies"

interface DirectorMap {
  [key: string]: number
}

export async function seedTestUser() {
  console.log("Seeding test user...")

  await db.insert(usersTable)
    .values(TEST_USER)
    .onConflictDoUpdate({
      target: usersTable.id, 
      set: {
        email: TEST_USER.email,
        name: TEST_USER.name,
      }
    })

  console.log(`User ${TEST_USER.id} seeded/updated successfully.`)
}


export async function seedingDirectors() {
  console.log("Seeding directors...")
  
  await db.insert(directorsTable).values(seedDirectors)
    .onConflictDoNothing()
  
  console.log("Directors seeded successfully.")

  // Fetch directors
  const directors = await db.select({ 
    id: directorsTable.id, 
    name: directorsTable.name 
  }).from(directorsTable)
  
  const directorMap: DirectorMap = {}
  directors.forEach(d => {
    directorMap[d.name] = d.id
  })
  
  return directorMap
}

export async function seedingMovies(directorMap: DirectorMap) {
  console.log("Seeding movies...")

  const finalMoviesData = [
    // Christopher Nolan
    { ...seedMovies[0], directorId: directorMap["Christopher Nolan"] },
    { ...seedMovies[1], directorId: directorMap["Christopher Nolan"] },
    // Greta Gerwig
    { ...seedMovies[2], directorId: directorMap["Greta Gerwig"] },
    // Quentin Tarantino
    { ...seedMovies[3], directorId: directorMap["Quentin Tarantino"] },
    // Denis Villeneuve
    { ...seedMovies[4], directorId: directorMap["Denis Villeneuve"] },
  ].filter(movie => movie.directorId !== undefined) as typeof moviesTable.$inferInsert[]

  if (finalMoviesData.length > 0) {
    await db.insert(moviesTable)
      .values(finalMoviesData)
      .onConflictDoNothing()
    
    console.log("Movies seeded successfully.")
  } else {
    console.log("No movies to seed.")
  }
}

async function main() {
  await seedTestUser()

  const directorMap = await seedingDirectors()
  await seedingMovies(directorMap)
}

main().catch(err => {
  console.error("Seed failed:", err)
  process.exit(1)
})
