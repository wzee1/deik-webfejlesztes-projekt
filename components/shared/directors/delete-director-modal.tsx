"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Director, deleteDirector } from "@/actions/directors.actions"

import { toast } from "sonner"
import { AlertTriangle, Loader2 } from "lucide-react"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  directorToDelete: Director | undefined
}

export default function DeleteDirectorModal({
  open, onOpenChange, directorToDelete
}: Props) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  if (!directorToDelete) return null

  const handleDelete = async () => {
    setIsPending(true)

    const result = await deleteDirector(directorToDelete.id)

    if (result.success) {
      toast.success("Director deleted successfully!")
      onOpenChange(false)
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
            Delete Director
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base pt-2">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-white">"{directorToDelete.name}"</span>?<br />
            This action cannot be undone and will fail if the director has associated movies.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Director"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}