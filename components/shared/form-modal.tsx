"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { AnimatePresence } from "framer-motion"

import { ZodType } from "zod"
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

import { Form } from "@/components/ui/form"

import { Button } from "@/components/ui/button"

import {
  Loader2, ArrowLeft,
  ArrowRight, Check
} from "lucide-react"
import { cn } from "@/lib/utils"

type FormModalProps<T> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit"
  itemToEdit?: T
  schema: ZodType<any>
  defaultValues: Partial<T>
  steps: Array<{
    label: string
    render: (form: any, isPending: boolean) => React.ReactNode
  }>
  onSubmit: (values: T, isEditMode: boolean) => Promise<{
    success: boolean
    message: string
  }>
  title: string
  icon: React.ReactNode
}

/**
 * Unified modal handler for director-form-modal.tsx and movie-form-modal.tsx. 
 */
export default function FormModal<T>({
  open,
  onOpenChange,
  mode,
  itemToEdit,
  schema,
  defaultValues,
  steps,
  onSubmit,
  title,
  icon
}: FormModalProps<T>) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = steps.length
  const [direction, setDirection] = useState(0)

  const isEditMode = mode === "edit"

  // Adjusting the schema type to align with Zod's expected input and output types
  const form = useForm({
    resolver: zodResolver(schema as ZodType<any, any, any>),
    defaultValues: defaultValues as Record<string, any>,
    mode: "onChange",
  })

  useEffect(() => {
    if (open) {
      setCurrentStep(1)
      form.reset(defaultValues)
    }
  }, [open, defaultValues, form])

  const handleNext = async () => {
    setDirection(1)
    const isValid = await form.trigger()
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
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

  const handleSubmit = async (values: any) => {
    if (currentStep < totalSteps) return

    setIsPending(true)
    const result = await onSubmit(values, isEditMode)

    if (result.success) {
      toast.success(
        isEditMode ? `${title} updated successfully!` : `${title} added successfully!`
      )
      form.reset()
      onOpenChange(false)
      router.refresh()
    } else {
      toast.error(result.message)
    }

    setIsPending(false)
  }

  const StepIndicator = ({ step, label }: {
    step: number
    label: string
  }) => {
    const isActive = currentStep === step
    const isCompleted = currentStep > step

    return (
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "w-8 h-8 rounded-full border-2 grid place-items-center transition-colors duration-300",
            isCompleted
              ? "bg-primaryColor border-secondaryColor"
              : isActive
              ? "border-primaryColor backdrop-blur-xs"
              : "bg-transparent border-input"
          )}
        >
          {isCompleted ? (
            <Check className="w-4 h-4 text-white" />
          ) : (
            <span className="text-sm font-semibold text-white">{step}</span>
          )}
        </div>
        <p
          className={cn(
            "text-xs mt-1 transition-colors",
            isActive ? "text-white" : "text-gray-400"
          )}
        >
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
            {icon}
            {isEditMode ? `Edit ${title}` : `Add New ${title}`}
          </DialogTitle>
          <DialogDescription />
        </DialogHeader>

        <div className="flex justify-between items-center mx-4 mb-2">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <StepIndicator step={index + 1} label={step.label} />
              {index < steps.length - 1 && (
                <div
                  key={`connector-${index}`}
                  className={cn(
                    "flex-1 h-0.5 rounded-full mx-2 mb-4 transition-colors duration-300",
                    currentStep > index + 1 ? "bg-primaryColor" : "bg-gray-700"
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="relative overflow-x-hidden min-h-[280px]">
              <AnimatePresence initial={false} custom={direction}>
                <div key={currentStep} className="absolute w-full top-0 space-y-4">
                  {steps[currentStep - 1].render(form, isPending)}
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
                <Button type="submit" variant="primary" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isEditMode ? `Updating...` : `Adding...`}
                    </>
                  ) : isEditMode ? `Update ${title}` : `Add ${title}`}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}