import { getMovieById, getMovies, Movie } from "@/actions/movies.actions"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

import AllMovies from "@/components/shared/movies/all-movies"
import MoviePage from "@/components/shared/movies/movie-page"

type Props = {
  searchParams: Promise<{ [key: string]: string | undefined }>
}

export default async function Movies({ searchParams }: Props) {
  const params = (await searchParams)
  const movieId = params.id
  
  if (!movieId) {
    const result = await getMovies()

    if (!result.success || !result.data) return (
      <div className="min-h-screen grid place-items-center -translate-y-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-400">
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

    return <AllMovies movies={result.data} />
  }

  const result = await getMovieById(parseInt(movieId))

  if (!result.success || !result.data) return (
    <div className="min-h-screen grid place-items-center -translate-y-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-400">
          No movies were found with given ID.
        </h1>
        
        <p className="text-lg text-gray-500 mt-2">
          To properly fetch a movie's information enter:<br />
          /movies?id=movieIdHere
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

  const movie: Movie = result.data

  return <MoviePage movie={movie} />
}

