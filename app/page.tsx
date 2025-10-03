"use client"

import { easeInOut, motion } from "framer-motion"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Film, PersonStanding } from "lucide-react"

/**
 * Renders the main page (hero section only). 
 */
export default function Hero() {
  const initialObject = { opacity: 0, y: 20 }
  const animateObject = { opacity: 1, y: 0 }
  const transitionObject = { duration: 0.5, ease: easeInOut }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <motion.h1 
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6"
          initial={initialObject}
          animate={animateObject}
          transition={transitionObject}
        >
          Discover Your Next
          <span className="block bg-gradient-to-r from-secondaryColor via-primaryColor to-white bg-clip-text text-transparent">
            Favorite Movie
          </span>
        </motion.h1>

        <motion.p 
          className="text-sm sm:text-base md:text-xl text-gray-300 max-w-md md:max-w-2xl mx-auto mb-12"
          initial={initialObject}
          animate={animateObject}
          transition={{ ...transitionObject, delay: 0.2 }}
        >
          Explore movies and directors added by users, add your favorite movie or director.
          Find your perfect film to watch tonight.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          initial={initialObject}
          animate={animateObject}
          transition={{ ...transitionObject, delay: 0.3 }}
        >
          <Button
            asChild
            size="lg"
            variant="primary"
            className="py-6 text-sm md:text-lg rounded-full shadow-lg transition-all duration-300"
          >
            <Link href="/movies">
              <Film className="w-3 md:w-5 h-3 md:h-5" />
              Browse Movies
            </Link>
          </Button>

          <Button
            asChild
            size="lg"
            variant="outline"
            className="bg-input/10 backdrop-blur-[3px] border border-input px-8 py-6 text-sm md:text-lg rounded-full transition-all duration-300"
          >
            <Link href="/directors">
              <PersonStanding className="w-3 md:w-5 h-3 md:h-5" />
              Browse Directors
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  )
}