"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { Director, createDirector, updateDirector } from "@/actions/directors.actions"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { PersonStanding, Loader2 } from "lucide-react"

const directorFormSchema = z.object({
  name: z.string()
    .min(1, "Name is required!")
    .max(255, "Name must be 255 characters or less!"),
  birthYear: z.string().optional()
    .refine(
      (val) => !val || val === "" || !isNaN(parseInt(val)),
      "Birth year must be a valid number!"
    ).refine(
      (val) => {
        if (!val || val === "") return true
        const year = parseInt(val)
        return year >= 1800 && year <= new Date().getFullYear()
      },
      `Birth year must be between 1800 and ${new Date().getFullYear()}!`
    ),
})

type DirectorFormValues = z.infer<typeof directorFormSchema>

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit"
  directorToEdit?: Director
}

export default function DirectorFormModal({
  open, onOpenChange, mode, directorToEdit
}: Props) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()
  const isEditMode = mode === "edit"

  const form = useForm<DirectorFormValues>({
    resolver: zodResolver(directorFormSchema),
    defaultValues: {
      name: "",
      birthYear: ""
    },
  })

  useEffect(() => {
    if (open) {
      form.reset({
        name: directorToEdit?.name || "",
        birthYear: directorToEdit?.birthYear?.toString() || "",
      })
    }
  }, [open, directorToEdit, form])

  const onSubmit = async (values: DirectorFormValues) => {
    setIsPending(true)

    const formData = new FormData()
    formData.append("name", values.name)
    if (values.birthYear) formData.append("birthYear", values.birthYear)

    const result = isEditMode && directorToEdit
      ? await updateDirector(directorToEdit.id, formData)
      : await createDirector(formData)

    if (result.success) {
      toast.success(isEditMode ? "Director updated successfully!" : "Director added successfully!")
      form.reset()
      onOpenChange(false)
      router.refresh()
    } else {
      toast.error(result.message)
    }

    setIsPending(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <PersonStanding className="w-6 h-6" />
            {isEditMode ? "Edit Director" : "Add New Director"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update the details below to edit the director." : "Fill in the details below to add a new director."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Enter director name" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birthYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Birth Year</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 1954" disabled={isPending} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => { form.reset(); onOpenChange(false) }} disabled={isPending} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isPending} className="flex-1">
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isEditMode ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  isEditMode ? "Update Director" : "Add Director"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}