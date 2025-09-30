"use client"

import { useState, useTransition } from "react"

import { useRouter } from "next/navigation"
import Link from "next/link"

import { Movie } from "@/actions/movies.actions"
import { Search, Film, ArrowLeft, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import AddMovieModal from "./add-movie-modal"
import { Director } from "@/actions/directors.actions"

type Props = {
  movies: Movie[],
  directors: Director[]
}

export default function AllMovies(
  { movies, directors }: Props
) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const [openAddMovieModal, setOpenAddMovieModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
  const filteredMovies = movies.filter((movie: Movie) =>
    movie.title?.toLowerCase().includes(searchTerm.toLowerCase())
    || movie.director?.name.toLowerCase().includes(searchTerm.toLowerCase())
    || movie.releaseYear?.toString().toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleMovieClick = (movieId: number) => {
    startTransition(() => {
      router.push(`/movies?id=${movieId}`)
    })
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="min-h-screen grid place-items-center -translate-y-24">
        <div className="text-center">
          <Film className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-red-400">
            No movies available
          </h1>
          <p className="text-lg text-gray-500 mt-2">
            Check back later for new movies
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="h-[calc(100vh-96px)] grid justify-center lg:mt-24 sm:px-12">
        <div className="min-w-[90vw] min-[950px]:min-w-[924px]">
          <Button variant="ghost" className="text-gray-300 hover:text-white p-0 mb-2">
            <Link href="/" className="flex items-center p-2 rounded-lg">
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back to home page
            </Link>
          </Button>

          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold mb-6">All Movies</h1>
            
            <Button
              variant="primary"
              className="w-8 h-8 rounded-2xl"
              onClick={() => setOpenAddMovieModal(true)}
            >
              <PlusIcon className="w-8 h-8 text-white" />
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by title, director, or year..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-32 h-12 text-base"
            />

            {searchTerm && (
              <p className="absolute right-4 top-[2.5px] text-sm text-gray-200 mt-3">
                Found {filteredMovies.length} {filteredMovies.length === 1 ? "movie" : "movies"}
              </p>
            )}
          </div>

          {filteredMovies.length === 0 && (
            <div className="text-center py-16">
              <Film className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold">
                No movies found
              </h2>
              <p className="text-gray-400">
                Try adjusting your search criteria!
              </p>
            </div>
          )}

          {filteredMovies.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
              {filteredMovies.map((movie: Movie) => (
                <div
                  key={movie.id}
                  className="group bg-input/30 hover:bg-input/50 border border-input rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleMovieClick(movie.id)}
                >
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1 transition-colors">
                      {movie.title}
                    </h3>
                    
                    <div className="space-y-1 text-sm text-gray-300">
                      {movie.releaseYear && (
                        <p className="line-clamp-1">
                          Released in {movie.releaseYear}
                        </p>
                      )}
                      
                      {movie.director && (
                        <p className="line-clamp-1">
                          <span className="font-medium">Director:</span>
                          {" "}{movie.director.name}
                        </p>
                      )}
                    </div>

                    <Button 
                      asChild 
                      variant="primary"
                      className="w-full mt-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link href={`/movies?id=${movie.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    
      <AddMovieModal
        open={openAddMovieModal}
        onOpenChange={setOpenAddMovieModal}
        directors={directors}
      />
    </>
  )
}