"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { signUp } from "@/lib/auth/auth-client"
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
import { ArrowLeft, Loader2 } from "lucide-react"

// Define the schema for registration (name is mandatory)
const registerSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    setIsPending(true)
    
    try {
      const result = await signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
      })

      if (result.error) {
        toast.error(result.error.message || "Failed to create account")
      } else {
        toast.success("Account created successfully!")
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      toast.error("An unexpected error occurred during registration")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center">
      <div className="w-[80vw]">
        <Card className="w-full max-w-md mx-auto relative">
          <CardHeader>
            <Button variant="ghost" className="text-gray-300 hover:text-white p-0 absolute -top-12 left-0">
              <Link href="/" className="flex items-center p-2 rounded-lg">
                <ArrowLeft className="w-5 h-5 mr-1" />
                Back to home page
              </Link>
            </Button>

            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>
              Sign up to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
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
                      Creating account...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </Button>

                <div className="text-sm">
                  <span>
                    Already have an account?{" "}
                    <Button
                      variant="link"
                      className="p-0 h-auto text-white"
                      onClick={() => router.push("/login")}
                    >
                      Sign in
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