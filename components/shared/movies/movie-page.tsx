"use client"

import { useState } from "react"
import Link from "next/link"

import { easeInOut, motion } from "framer-motion"

import { Movie } from "@/actions/movies.actions"
import { Director } from "@/actions/directors.actions"

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import {
  Calendar, User, Film, Pencil, Trash
} from "lucide-react"
import { cn } from "@/lib/utils"

import MovieFormModal from "./movie-form-modal"
import DeleteMovieModal from "./delete-movie-modal"

import BackToGivenPage from "../back-to-given-page/back-to-given-page"

type Props = {
  movie: Movie,
  directors: Director[],
  userId: string,
  isAdmin: boolean
}

/**
 * Renders a page dedicated to a given movie and its information.
 */
export default function MoviePage(
  { movie, directors, userId, isAdmin }: Props
) {
  const [openEditMovieModal, setOpenEditMovieModal] = useState(false)
  const [openRemoveMovieModal, setOpenRemoveMovieModal] = useState(false)

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
          {movie.addedByUser.id === userId && " (You)"}
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
    <>
      <div className="h-[calc(100vh-96px)] grid justify-center pt-48 lg:pt-40 px-4 sm:px-12">
        <motion.div
          className="w-[90vw] lg:w-[50vw] xl:w-[40vw] relative"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: easeInOut }}
        >
          <BackToGivenPage
            link="/movies"
            pageName="all movies"
          />

          <Card className="w-full shadow-2xl bg-input/30 backdrop-blur-[3px] border border-input">
            <CardHeader className="border-b border-input pb-4 flex justify-between items-center">
              <CardTitle className="flex items-center text-4xl font-extrabold tracking-tight text-white">
                <Film className="w-8 h-8 mr-3 text-primaryColor" />
                {movie.title}
              </CardTitle>

              {(isAdmin || movie.addedByUser.id === userId) && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="w-8 md:w-fit h-8 rounded-2xl"
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpenEditMovieModal(true)
                    }}
                  >
                    <Pencil className="w-2 h-2 text-white" />
                    <span className="max-lg:hidden">Edit movie</span>
                  </Button>

                  <Button
                    variant="destructive"
                    className="w-8 md:w-fit h-8 rounded-2xl hover:bg-red-500! transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpenRemoveMovieModal(true)
                    }}
                  >
                    <Trash className="w-2 h-2 text-white" />
                    <span className="max-lg:hidden">Delete movie</span>
                  </Button>
                </div>
              )}
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
        </motion.div>
      </div>

      <MovieFormModal
        open={openEditMovieModal}
        onOpenChange={setOpenEditMovieModal}
        directors={directors}
        movieToEdit={movie}
        mode="edit"
      />

      <DeleteMovieModal
        open={openRemoveMovieModal}
        onOpenChange={setOpenRemoveMovieModal}
        movieToDelete={movie}
      />
    </>
  )
}

