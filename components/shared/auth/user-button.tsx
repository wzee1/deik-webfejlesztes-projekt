"use client"

import { useSession, signOut } from "@/lib/auth/auth-client"
import { useRouter } from "next/navigation"

import { motion, AnimatePresence } from "framer-motion"

import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

const transitionVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
}

export default function UserButton() {
  const { data: session } = useSession()
  const router = useRouter()

  return (
    <AnimatePresence mode="wait">
      {!session ? (
        <motion.div
          key="signedOut"
          variants={transitionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex gap-2"
        >
          <Button
            variant="ghost" asChild
            className="border border-input backdrop-blur-[2px] hover:bg-primaryColor!"
          >
            <Link href="/login">Sign In</Link>
          </Button>
          <Button variant="primary" asChild>
            <Link href="/register">Sign Up</Link>
          </Button>
        </motion.div>
      ) : (
        <motion.div
          key="signedIn"
          variants={transitionVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Button
            variant="ghost"
            className="border border-input backdrop-blur-[2px] hover:bg-primaryColor!"
            onClick={() => {
              signOut()
              toast.success("Signed out successfully!")
              router.push("/")
              router.refresh()
            }}
          >
            <LogOut className="w-4 h-4 stroke-white" />
            Sign Out
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}