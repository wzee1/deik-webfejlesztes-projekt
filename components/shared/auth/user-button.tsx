"use client"

import { useSession, signOut } from "@/lib/auth/auth-client"
import { useRouter } from "next/navigation"

import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function UserButton() {
  const { data: session } = useSession()
  const router = useRouter()

  if (!session) {
    return (
      <div className="flex gap-2">
        <Button variant="ghost" asChild>
          <Link href="/login">Sign In</Link>
        </Button>
        <Button variant="primary" asChild>
          <Link href="/register">Sign Up</Link>
        </Button>
      </div>
    )
  }

  return (
    <Button
      variant="ghost"
      className="hover:bg-primaryColor!"
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
  )
}