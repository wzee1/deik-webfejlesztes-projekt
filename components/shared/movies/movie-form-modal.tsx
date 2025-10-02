"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { motion, AnimatePresence } from "framer-motion"

import { Movie, createMovie, updateMovie } from "@/actions/movies.actions"
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

import { Film, Loader2, ArrowLeft, ArrowRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const pageVariants = {
  enter: {
    opacity: 1,
    x: 0,
    transition: { type: "tween" as const, duration: 0.3 }
  },
  exit: (direction: number) => {
    return {
      opacity: 0,
      // Slide left when going forward, right when going back:
      x: direction > 0 ? -20 : 20,
      transition: { type: "tween" as const, duration: 0.2 }
    }
  },
  initial: (direction: number) => {
    return {
      opacity: 0,
      x: direction > 0 ? 20 : -20,
    }
  },
}

// Zod schema for client-side validation
const movieFormSchema = z.object({
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

type MovieFormValues = z.infer<typeof movieFormSchema>

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  directors: Director[]
  mode: "add" | "edit"
  movieToEdit?: Movie
}

export default function MovieFormModal({
  open,
  onOpenChange,
  directors,
  mode,
  movieToEdit
}: Props) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()
  
  // Multi-step state vars:
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3
  const [direction, setDirection] = useState(0) // 1 for next, -1 for back

  const isEditMode = mode === "edit"

  const form = useForm<MovieFormValues>({
    resolver: zodResolver(movieFormSchema),
    defaultValues: {
      title: "",
      directorId: "",
      releaseYear: "",
      description: "",
    },
    // We use onChange mode to allow fields to be validated before pressing "Next"
    mode: "onChange",
  })

  // Reset form and step when modal opens or movieToEdit changes
  useEffect(() => {
    if (open) {
      setCurrentStep(1) // Reset to step 1 when opening
      form.reset({
        title: movieToEdit?.title || "",
        directorId: movieToEdit?.directorId.toString() || "",
        releaseYear: movieToEdit?.releaseYear?.toString() || "",
        description: movieToEdit?.description || "",
      })
    }
  }, [open, movieToEdit, form])

  // Step nav logic:
  const handleNext = async () => {
    setDirection(1)
    if (currentStep === 1) {
      // Validate Step 1 fields
      const isValid = await form.trigger(["title", "directorId"])
      if (isValid) setCurrentStep(2)
    } else if (currentStep === 2) {
      // Optionally validate Step 2 fields (releaseYear/description are optional)
      // We only trigger to show errors if invalid optional data was entered.
      await form.trigger(["releaseYear", "description"]) 
      setCurrentStep(3)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setDirection(-1)
      setCurrentStep(currentStep - 1)
    }
  }

  const handleCancel = () => {
    form.reset()
    onOpenChange(false)
  }

  const onSubmit = async (values: MovieFormValues) => {
    // Only proceed with API submission if we are on the final step
    if (currentStep < totalSteps) return

    setIsPending(true)

    const formData = new FormData()
    formData.append("title", values.title)
    formData.append("directorId", values.directorId)
    
    if (values.releaseYear)
      formData.append("releaseYear", values.releaseYear)
    
    if (values.description)
      formData.append("description", values.description)

    const result = isEditMode && movieToEdit
      ? await updateMovie(movieToEdit.id, formData)
      : await createMovie(formData)

    if (result.success) {
      toast.success(
        isEditMode ? "Movie updated successfully!" : "Movie added successfully!"
      )
      
      form.reset()
      onOpenChange(false)
      router.refresh()
    } else {
      toast.error(result.message)
    }

    setIsPending(false)
  }

  const renderStepContent = () => {
    const values = form.getValues()

    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step1"
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            className="space-y-4"
          >
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
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            key="step2"
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            className="space-y-4"
          >
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
          </motion.div>
        )

      case 3:
        const selectedDirector = directors.find(
          d => d.id.toString() === values.directorId
        )

        return (
          <motion.div
            key="step3"
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="enter"
            exit="exit"
          >
            <h3 className="text-xl font-semibold mb-1">Review Details</h3>

            <p className="text-sm text-gray-400 mb-4">
              Confirm the details above and press <span className="font-bold">
                {isEditMode ? "Update" : "Add"} Movie
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
          </motion.div>
        )
      default:
        return null
    }
  }

  const StepIndicator = ({ step, label }: { step: number, label: string }) => {
    const isActive = currentStep === step
    const isCompleted = currentStep > step
    
    return (
      <div className="flex flex-col items-center">
        <div className={cn(
          "w-8 h-8 rounded-full border-2 grid place-items-center transition-colors duration-300",
          isCompleted 
            ? "bg-primaryColor border-secondaryColor" 
            : isActive 
              ? "border-primaryColor backdrop-blur-xs" 
              : "bg-transparent border-input"
        )}>
          {isCompleted ? (
            <Check className="w-4 h-4 text-white" />
          ) : (
            <span className="text-sm font-semibold text-white">{step}</span>
          )}
        </div>
        <p className={cn(
          "text-xs mt-1 transition-colors",
          isActive ? "text-white" : "text-gray-400"
        )}>
          {label}
        </p>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Film className="w-6 h-6" />
            {isEditMode ? "Edit Movie" : "Add New Movie"}
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>

        {/* Progress bar: */}
        <div className="flex justify-between items-center mx-4 mb-2">
          <StepIndicator step={1} label="Core Info" />
          <div className={cn(
            "flex-1 h-0.5 rounded-full mx-2 mb-4 transition-colors duration-300",
            currentStep > 1 ? "bg-primaryColor" : "bg-gray-700"
          )} />
          <StepIndicator step={2} label="Details" />
          <div className={cn(
            "flex-1 h-0.5 rounded-full mx-2 mb-4 transition-colors duration-300",
            currentStep > 1 ? "bg-primaryColor" : "bg-gray-700"
          )} />
          <StepIndicator step={3} label="Review" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Fomr content with animation handler: */}
            <div className="relative overflow-x-hidden min-h-[280px]">
              <AnimatePresence initial={false} custom={direction}>
                <div key={currentStep} className="absolute w-full top-0">
                  {renderStepContent()}
                </div>
              </AnimatePresence>
            </div>

            {/* Action buttons: */}
            <div className="flex gap-3 pt-4">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isPending}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isPending || currentStep === 1}
                className={cn("flex-1", currentStep === 1 ? "w-full" : "flex-grow")}
              >
                Cancel
              </Button>

              {currentStep < totalSteps && (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNext}
                  disabled={isPending}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}

              {currentStep === totalSteps && (
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isEditMode ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    isEditMode ? "Update Movie" : "Add Movie"
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
