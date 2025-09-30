import { TEST_USER } from "./test-user"

export const seedMovies = [
  {
    title: "Inception",
    releaseYear: 2010,
    description: "A thief who steals corporate secrets through the use of dream-sharing technology...",
    userId: TEST_USER.id,
    // directorId: Christopher Nolan (ezt töltjük ki dinamikusan)
  },
  {
    title: "Oppenheimer",
    releaseYear: 2023,
    description: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb.",
    userId: TEST_USER.id,
    // directorId: Christopher Nolan
  },
  {
    title: "Barbie",
    releaseYear: 2023,
    description: "Barbie and Ken have the time of their lives in the colorful and seemingly perfect world of Barbie Land.",
    userId: TEST_USER.id,
    // directorId: Greta Gerwig
  },
  {
    title: "Pulp Fiction",
    releaseYear: 1994,
    description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine...",
    userId: TEST_USER.id,
    // directorId: Quentin Tarantino
  },
  {
    title: "Dune",
    releaseYear: 2021,
    description: "A noble family becomes embroiled in a war for control over the galaxy's most valuable asset.",
    userId: TEST_USER.id,
    // directorId: Denis Villeneuve
  },
]
