"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { createMovie } from "@/actions/movies.actions"
import { Director } from "@/actions/directors.actions"

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
import { Textarea } from "@/components/ui/textarea"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Film, Loader2 } from "lucide-react"

// Zod schema for client-side validation:
const addMovieSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required!")
    .max(255, "Title must be 255 characters or less!"),
  directorId: z
    .string()
    .min(1, "Director is required!"),
  releaseYear: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || !isNaN(parseInt(val)),
      "Release year must be a valid number!"
    )
    .refine(
      (val) => {
        if (!val || val === "") return true
        const year = parseInt(val)
        return year >= 1800 && year <= new Date().getFullYear() + 10
      },
      `Release year must be between 1800 and ${new Date().getFullYear() + 10}!`
    ),
  description: z.string().optional(),
})

type AddMovieFormValues = z.infer<typeof addMovieSchema>

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  directors: Director[]
}

export default function AddMovieModal({ open, onOpenChange, directors }: Props) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const form = useForm<AddMovieFormValues>({
    resolver: zodResolver(addMovieSchema),
    defaultValues: {
      title: "",
      directorId: "",
      releaseYear: "",
      description: "",
    },
  })

  const onSubmit = async (values: AddMovieFormValues) => {
    setIsPending(true)

    const formData = new FormData()

    formData.append("title", values.title)
    formData.append("directorId", values.directorId)

    if (values.releaseYear)
      formData.append("releaseYear", values.releaseYear)
    
    if (values.description)
      formData.append("description", values.description)

    const result = await createMovie(formData)

    if (result.success) {
      toast.success("Movie added successfully!")

      form.reset()
      onOpenChange(false)

      router.refresh()
      setIsPending(false)
    } else {
      toast.error(result.message)
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Film className="w-6 h-6" />
            Add New Movie
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new movie to the database.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Title <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter movie title"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Director */}
            <FormField
              control={form.control}
              name="directorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Director <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a director" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {directors.map((director) => (
                        <SelectItem key={director.id} value={director.id.toString()}>
                          {director.name}
                          {director.birthYear && ` (${director.birthYear})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Release Year */}
            <FormField
              control={form.control}
              name="releaseYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Release Year</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 2024"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter movie description (optional)"
                      rows={4}
                      disabled={isPending}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset()
                  onOpenChange(false)
                }}
                disabled={isPending}
                className="flex-1"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="primary"
                disabled={isPending}
                className="flex-1"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Movie"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}