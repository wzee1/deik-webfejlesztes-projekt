"use client"

import { useState, useEffect } from "react"
import Cookies from "js-cookie"

import { Movie } from "@/actions/movies.actions"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"

import { Calendar, Film } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { truncateString } from "@/lib/utils"

const COOKIE_NAME = "showMovieModal"

export default function LatestMoviesModal(
  { latestMovies }: { latestMovies: Movie[] }
) {
  const [isOpen, setIsOpen] = useState(false)
  const [doNotShowAgain, setDoNotShowAgain] = useState(false)

  useEffect(() => {
    const cookieValue = Cookies.get(COOKIE_NAME)
    
    // Check if the cookie is explicitly set to "false"
    if (cookieValue === "false") setIsOpen(false)
    else setIsOpen(true)
  }, [])

  const handleClose = () => {
    if (doNotShowAgain) {
      Cookies.set(COOKIE_NAME, "false", { expires: 365, secure: process.env.NODE_ENV === "production" })
    } else {
       Cookies.set(COOKIE_NAME, "true", { secure: process.env.NODE_ENV === "production" })
    }
    
    setIsOpen(false)
  }

  const moviesToShow = latestMovies.slice(0, 3)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader className="space-y-4">
          <DialogTitle className="flex items-center text-2xl font-bold">
            <Film className="w-6 h-6 mr-2" />
            New Recommendations!
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-base">
            Check out the most recently added movies:
          </DialogDescription>

          {/* Render the top 3 latest movies here */}
          <div className="space-y-3 pt-2">
            {moviesToShow.length > 0 ? (
              moviesToShow.map((movie, index) => (
                <div 
                  key={movie.id} 
                  className="flex items-start p-3 bg-input rounded-lg shadow-sm"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primaryColor grid place-items-center mr-3 font-semibold">
                    {index + 1}
                  </div>
                  <div className="w-full">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold leading-tight text-lg">
                        {truncateString(movie.title, 13)}
                      </h4>

                      {movie.releaseYear && (
                        <Badge
                          className="w-fit text-sm py-1 px-2 bg-primaryColor hover:bg-secondaryColor font-bold text-white"
                        >
                          <Calendar className="w-4 h-4 mr-1" />
                          {movie.releaseYear || "N/A"}
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-gray-400">
                      <span className="font-semibold">Director:</span> {movie.director.name}

                      {movie.description && (
                        <>
                          <br />
                          <span className="font-semibold">Description:</span><br />
                          {movie.description}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-400 border-dashed border-2 rounded-lg">
                No latest movies available yet.
              </div>
            )}
          </div>
        </DialogHeader>
        
        <div className="flex items-center space-x-2 mt-6">
          <Checkbox 
            id="do-not-show-again"
            checked={doNotShowAgain}
            onCheckedChange={(checked) => setDoNotShowAgain(!!checked)}
          />
          <label
            htmlFor="do-not-show-again"
            className="text-sm font-medium leading-none text-gray-400 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Don't show this message again on future visits
          </label>
        </div>
        
        <Button variant="primary" onClick={handleClose}>
          Got it!
        </Button>
      </DialogContent>
    </Dialog>
  )
}
