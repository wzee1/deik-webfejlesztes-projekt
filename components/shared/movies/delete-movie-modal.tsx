"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Movie, deleteMovie } from "@/actions/movies.actions"

import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2 } from "lucide-react"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  movieToDelete: Movie
}

export default function DeleteMovieModal({
  open, onOpenChange, movieToDelete
}: Props) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsPending(true)

    const result = await deleteMovie(movieToDelete.id)

    if (result.success) {
      toast.success("Movie deleted successfully!")
      onOpenChange(false)
      router.push("/movies")
      router.refresh()
      setIsPending(false)
    } else {
      toast.error(result.message)
      setIsPending(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-2xl">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            Delete Movie
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base pt-2">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-white">
              "{movieToDelete.title}"
            </span>
            ?<br />This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Movie"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}