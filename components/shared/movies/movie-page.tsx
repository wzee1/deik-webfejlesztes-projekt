import { Movie } from "@/actions/movies.actions"
import Link from "next/link"

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { Calendar, User, Film, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

export default function MoviePage(
  { movie }: { movie: Movie }
) {
  const data = [
    {
      id: "Director",
      value: (
        <Link
          href="/directors"
          className="text-xl font-semibold text-white cursor-pointer hover:underline"
        >
          {movie.director.name}
        </Link>
      )
    },
    {
      id: "Released in",
      value : (
        <Badge
          className="w-fit text-lg py-1 px-3 bg-primaryColor hover:bg-secondaryColor font-bold text-white"
        >
          <Calendar className="w-5 h-5 mr-1" />
          {movie.releaseYear || "N/A"}
        </Badge>
      )
    },
    {
      id: "Added by",
      value: (
        <div className="flex items-center text-lg text-white">
          <User className="w-5 h-5 mr-2 text-white" />
          {movie.addedByUser.name}
        </div>
      )
    },
    {
      id: "Added at",
      value: (
        <p className="text-lg text-white">
          {new Date(movie.createdAt).toLocaleDateString()}
        </p>
      )
    },
    {
      id: "Description",
      colSpan: "col-span-2",
      value: (
        <p className="text-lg text-white">
          {movie.description || "There is no description for the movie."}
        </p>
      )
    }
  ]

  return (
    <div className="h-[calc(100vh-96px)] grid justify-center lg:mt-24 sm:px-12">
      <div className="w-[90vw] sm:w-full lg:w-[50vw]">
        <Button variant="ghost" className="text-gray-300 hover:text-white p-0 mb-2">
          <Link href="/movies" className="flex items-center p-2 rounded-lg">
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back to all movies
          </Link>
        </Button>

        <Card className="w-full shadow-2xl bg-input/30 border border-input">
          <CardHeader className="border-b border-input pb-4">
            <CardTitle className="flex items-center text-4xl font-extrabold tracking-tight text-white">
              <Film className="w-8 h-8 mr-3 text-primaryColor" />
              {movie.title}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.map(({ id, value, colSpan }) => (
                <div key={id} className={cn(
                  "flex flex-col space-y-1",
                  colSpan && colSpan
                )}>
                  <span className="text-sm font-medium text-gray-400">
                    {id}
                  </span>
                  {value}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

