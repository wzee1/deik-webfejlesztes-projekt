"use client"

import { createDirector, updateDirector } from "@/actions/directors.actions"
import { Director } from "@/actions/directors.actions"

import { z } from "zod"
import { PersonStanding } from "lucide-react"

import FormModal from "@/components/shared/form-modal"

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"

type FormType = {
  name: string
  birthYear?: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit"
  directorToEdit?: Director
}

export default function DirectorFormModal({
  open,
  onOpenChange,
  mode,
  directorToEdit
}: Props) {
  const schema = z.object({
    name: z.string()
      .min(1, "Name is required!")
      .max(255, "Name must be 255 characters or less!"),
    birthYear: z.string().optional()
      .refine(
        (val) => !val || val === "" || !isNaN(parseInt(val)),
        "Birth year must be a valid number!"
      )
      .refine(
        (val) => {
          if (!val || val === "") return true
          const year = parseInt(val)
          return year >= 1800 && year <= new Date().getFullYear()
        },
        `Birth year must be between 1800 and ${new Date().getFullYear()}!`
      ),
  })

  const steps: Array<{
    label: string
    render: (form: any, isPending: boolean) => React.ReactNode
  }> = [
    {
      label: "Core Info",
      render: (form, isPending) => (
        <>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter director name"
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
            name="birthYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Birth Year</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 1954"
                    disabled={isPending}
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
      render: (form) => {
        const values = form.getValues()

        return (
          <>
            <h3 className="text-xl font-semibold mb-1">Review Details</h3>

            <p className="text-sm text-gray-400 mb-4">
              Confirm the details above and press <span className="font-bold">
                {mode === "edit" ? "Update" : "Add"} Director
              </span> to save.
            </p>

            <div className="p-4 border rounded-lg bg-input/10">
              <p>
                <span className="font-semibold text-gray-300">Name:</span> {values.name}
              </p>
              {values.birthYear && (
                <p>
                  <span className="font-semibold text-gray-300">Birth Year:</span> {values.birthYear}
                </p>
              )}
            </div>
          </>
        )
      },
    },
  ]

  // Explicitly typing the handleSubmit parameters
  const handleSubmit = async (values: FormType, isEditMode: boolean) => {
    const formData = new FormData()
    formData.append("name", values.name)
    if (values.birthYear) formData.append("birthYear", values.birthYear)

    return isEditMode && directorToEdit
      ? await updateDirector(directorToEdit.id, formData)
      : await createDirector(formData)
  }

  // Adjusting the transformation logic for `directorToEdit` to match `FormType`
  const directorToEditData: FormType | undefined = directorToEdit
    ? {
        ...directorToEdit,
        // Convert number or null to string or undefined
        birthYear: directorToEdit.birthYear?.toString() || undefined,
      }
    : undefined

  const defaultValues: FormType = {
    // Ensure default value is an empty string
    name: directorToEdit?.name || "",
    // Ensure default value is an empty string
    birthYear: directorToEdit?.birthYear != null ? directorToEdit.birthYear.toString() : "",
  }

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      mode={mode}
      itemToEdit={directorToEditData}
      schema={schema}
      defaultValues={defaultValues}
      steps={steps}
      onSubmit={handleSubmit}
      title="Director"
      icon={<PersonStanding className="w-6 h-6" />}
    />
  )
}