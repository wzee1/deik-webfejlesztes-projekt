import { getMovieById, getMovies, Movie } from "@/actions/movies.actions"
import { getDirectors } from "@/actions/directors.actions"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

import AllMovies from "@/components/shared/movies/all-movies"
import MoviePage from "@/components/shared/movies/movie-page"

import { isAuthenticated } from "@/lib/auth/auth-functions"
import { redirect } from "next/navigation"

type Props = {
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export default async function Movies({ searchParams }: Props) {
  const valid = await isAuthenticated()
  if (!valid) redirect("/login?returnTo=movies")

  const params = (await searchParams)
  const movieId = params.id
  
  const directorsResult = await getDirectors()

  if (!movieId) {
    const moviesResult = await getMovies()

    if (
      !moviesResult.success ||
      !moviesResult.data ||
      !directorsResult.success ||
      !directorsResult.data
    ) return (
      <div className="min-h-screen grid place-items-center -translate-y-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold">
            Unexpected error
          </h1>
          
          <p className="text-lg text-gray-500 mt-2">
            Unexpected error occurred while fetching movies
          </p>

          <Button asChild className="mt-6 bg-gray-200 hover:bg-gray-300/90">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to home page
            </Link>
          </Button>
        </div>
      </div>
    )

    return (
      <AllMovies
        movies={moviesResult.data}
        directors={directorsResult.data}
      />
    )
  }

  const movieResult = await getMovieById(parseInt(movieId))

  const errMessages = {
    header: (!movieResult.success || !movieResult.data)
      ? "No movies were found with given ID." : "Unexpected error",
    desc: (!movieResult.success || !movieResult.data)
      ? (
        <>
          To properly fetch a movie's information enter:<br />
          /movies?id=movieIdHere
        </>
      ) : "Unexpected error occurred while fetching movies"
  }

  if (
    !movieResult.success
    || !movieResult.data
    || !directorsResult.success
    || !directorsResult.data
  ) return (
    <div className="min-h-screen grid place-items-center -translate-y-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-400">
          {errMessages.header}
        </h1>
        
        <p className="text-lg text-gray-500 mt-2">
          {errMessages.desc}
        </p>

        <Button asChild className="mt-6 bg-gray-200 hover:bg-gray-300/90">
          <Link href="/movies">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to all movies
          </Link>
        </Button>
      </div>
    </div>
  )

  return (
    <MoviePage
      movie={movieResult.data}
      directors={directorsResult.data}
    />
  )
}

