"use client"

import { createMovie, updateMovie, Movie } from "@/actions/movies.actions"
import { Director } from "@/actions/directors.actions"

import { z } from "zod"
import { Film } from "lucide-react"

import FormModal from "@/components/shared/form-modal"

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type MovieFormValues = {
  title: string
  directorId: string
  releaseYear?: string
  description?: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  directors: Director[]
  mode: "add" | "edit"
  movieToEdit?: Movie
}

const steps: Array<{
  label: string
  render: (
    form: {
      control: any
      getValues: () => MovieFormValues
    },
    isPending: boolean,
    mode: "add" | "edit",
    directors: Director[]
  ) => React.ReactNode
}> = [
  {
    label: "Core Info",
    render: (form, isPending, mode, directors) => (
      <>
        <FormField
          control={form.control}
          name="title"
          render={({ field }: { field: any }) => (
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

        <FormField
          control={form.control}
          name="directorId"
          render={({ field }: { field: any }) => (
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
      </>
    ),
  },
  {
    label: "Details",
    render: (form, isPending) => (
      <>
        <FormField
          key="release-year-field"
          control={form.control}
          name="releaseYear"
          render={({ field }: { field: any }) => (
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

        <FormField
          key="description-field"
          control={form.control}
          name="description"
          render={({ field }: { field: any }) => (
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
      </>
    ),
  },
  {
    label: "Review",
    render: (form, isPending, mode, directors) => {
      const values = form.getValues()
      const selectedDirector = directors.find(
        (d: Director) => d.id.toString() === values.directorId
      )

      return (
        <>
          <h3 className="text-xl font-semibold mb-1">Review Details</h3>

          <p className="text-sm text-gray-400 mb-4">
            Confirm the details above and press <span className="font-bold">
              {mode === "edit" ? "Update" : "Add"} Movie
            </span> to save.
          </p>

          <div className="p-4 border rounded-lg bg-input/10">
            <p>
              <span className="font-semibold text-gray-300">Title:</span> {values.title}
            </p>
            <p>
              <span className="font-semibold text-gray-300">Director:</span> {selectedDirector ? selectedDirector.name : "N/A"}
            </p>
            {values.releaseYear && (
              <p>
                <span className="font-semibold text-gray-300">Release Year:</span> {values.releaseYear}
              </p>
            )}
            <p className="max-h-24 overflow-y-auto">
              <span className="font-semibold text-gray-300">Description:</span> {values.description || "None provided"}
            </p>
          </div>
        </>
      )
    },
  },
]

export default function MovieFormModal({
  open,
  onOpenChange,
  directors,
  mode,
  movieToEdit
}: Props) {
  const schema = z.object({
    title: z.string()
      .min(1, "Title is required!")
      .max(255, "Title must be 255 characters or less!"),
    directorId: z.string().min(1, "Director is required!"),
    releaseYear: z.string().optional()
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

  const handleSubmit = async (values: MovieFormValues, isEditMode: boolean) => {
    const formData = new FormData()
    formData.append("title", values.title);
    formData.append("directorId", values.directorId);

    if (values.releaseYear) formData.append("releaseYear", values.releaseYear);
    if (values.description) formData.append("description", values.description);

    return isEditMode && movieToEdit
      ? await updateMovie(movieToEdit.id, formData)
      : await createMovie(formData);
  };

  const movieToEditData: MovieFormValues | undefined = movieToEdit
    ? {
        title: movieToEdit.title,
        directorId: movieToEdit.directorId.toString(),
        releaseYear: movieToEdit.releaseYear?.toString(),
        description: movieToEdit.description || undefined,
      }
    : undefined

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      mode={mode}
      itemToEdit={movieToEditData}
      schema={schema}
      defaultValues={{
        title: movieToEdit?.title || "",
        directorId: movieToEdit?.directorId?.toString() || "",
        releaseYear: movieToEdit?.releaseYear?.toString() || "",
        description: movieToEdit?.description || "",
      }}
      steps={steps.map((step) => ({
        ...step,
        render: (form, isPending) => step.render(form, isPending, mode, directors),
      }))}
      onSubmit={handleSubmit}
      title="Movie"
      icon={<Film className="w-6 h-6" />}
    />
  )
}
