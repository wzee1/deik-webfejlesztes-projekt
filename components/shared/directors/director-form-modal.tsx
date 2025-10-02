"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { motion, AnimatePresence } from "framer-motion"

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

import { PersonStanding, Loader2, ArrowLeft, ArrowRight, Check } from "lucide-react"
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
  open,
  onOpenChange,
  mode,
  directorToEdit
}: Props) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  // Multi-step state vars:
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 2
  const [direction, setDirection] = useState(0) // 1 for next, -1 for back

  const isEditMode = mode === "edit"

  const form = useForm<DirectorFormValues>({
    resolver: zodResolver(directorFormSchema),
    defaultValues: {
      name: "",
      birthYear: "",
    },
    // We use onChange mode to allow fields to be validated before pressing "Next"
    mode: "onChange",
  })

  // Reset form and step when modal opens or movieToEdit changes
  useEffect(() => {
    if (open) {
      setCurrentStep(1) // Reset to step 1 when opening
      form.reset({
        name: directorToEdit?.name || "",
        birthYear: directorToEdit?.birthYear?.toString() || "",
      })
    }
  }, [open, directorToEdit, form])

  // Step nav logic:
  const handleNext = async () => {
    setDirection(1)
    if (currentStep === 1) {
      // Validate Step 1 fields
      const isValid = await form.trigger(["name", "birthYear"])
      if (isValid) setCurrentStep(2)
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

  const onSubmit = async (values: DirectorFormValues) => {
    // Only proceed with API submission if we are on the final step
    if (currentStep < totalSteps) return

    setIsPending(true)

    const formData = new FormData()
    formData.append("name", values.name)
    if (values.birthYear) formData.append("birthYear", values.birthYear)

    const result = isEditMode && directorToEdit
      ? await updateDirector(directorToEdit.id, formData)
      : await createDirector(formData)

    if (result.success) {
      toast.success(
        isEditMode ? "Director updated successfully!" : "Director added successfully!"
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
          >
            <h3 className="text-xl font-semibold mb-1">Review Details</h3>

            <p className="text-sm text-gray-400 mb-4">
              Confirm the details above and press <span className="font-bold">
                {isEditMode ? "Update" : "Add"} Director
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
            <PersonStanding className="w-6 h-6" />
            {isEditMode ? "Edit Director" : "Add New Director"}
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <div className="flex justify-between items-center mx-4 mb-2">
          <StepIndicator step={1} label="Core Info" />
          <div className={cn(
            "flex-1 h-0.5 rounded-full mx-2 mb-4 transition-colors duration-300",
            currentStep > 1 ? "bg-primaryColor" : "bg-gray-700"
          )} />
          <StepIndicator step={2} label="Review" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="relative overflow-x-hidden min-h-[280px]">
              <AnimatePresence initial={false} custom={direction}>
                <div key={currentStep} className="absolute w-full top-0">
                  {renderStepContent()}
                </div>
              </AnimatePresence>
            </div>

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
                    isEditMode ? "Update Director" : "Add Director"
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