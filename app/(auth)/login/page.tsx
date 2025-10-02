"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

import { signIn } from "@/lib/auth/auth-client"
import { toast } from "sonner"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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
import { Loader2 } from "lucide-react"

import BackToGivenPage from "@/components/shared/back-to-given-page/back-to-given-page"

// Define the schema for login (only email and password)
const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const searchParams = useSearchParams()
  const returnTo = searchParams.get("returnTo")

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setIsPending(true)

    try {
      const result = await signIn.email({
        email: values.email,
        password: values.password,
      })

      if (result.error) {
        toast.error(result.error.message || "Failed to sign in")
      } else {
        toast.success("Signed in successfully!")
        router.push(
          returnTo ? `/${returnTo}` : "/"
        )
        router.refresh()
      }
    } catch (error) {
      toast.error("An unexpected error occurred during login")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center">
      <div className="w-[80vw]">
        <Card className="w-full max-w-md mx-auto relative shadow-2xl bg-input/30 backdrop-blur-[3px] border border-input">
          <CardHeader>
            <BackToGivenPage />

            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          className="backdrop-blur-xs"
                          placeholder="you@example.com"
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
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          className="backdrop-blur-xs"
                          placeholder="••••••••"
                          disabled={isPending}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                <div className="text-sm">
                  <span>
                    Don't have an account?{" "}
                    <Button
                      variant="link"
                      className="p-0 h-auto text-white"
                      onClick={(e) => {
                        e.preventDefault()
                        e.currentTarget.blur()
                        
                        router.push(
                          returnTo ? `/register?returnTo=${returnTo}` : "/register"
                        )
                      }}
                    >
                      Sign up
                    </Button>
                  </span>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}