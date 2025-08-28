"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type AuthError,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { authErrorMessages, DEFAULT_AUTH_ERROR_MESSAGE } from "@/lib/auth-errors"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NurseFinAILogo } from "@/components/icons"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoginView, setIsLoginView] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isLoginView) {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
      }
      router.push("/dashboard")
    } catch (error) {
      const authError = error as AuthError
      const errorMessage = authErrorMessages[authError.code] ?? DEFAULT_AUTH_ERROR_MESSAGE
      if (!authErrorMessages[authError.code]) {
        console.error(authError.code, authError.message)
      }
      toast({
        title: isLoginView ? "Sign In Failed" : "Sign Up Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4" role="main">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <NurseFinAILogo className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold tracking-tight">
              {isLoginView ? "Welcome Back" : "Create an Account"}
            </CardTitle>
            <CardDescription>
              {isLoginView
                  ? "Sign in to access your financial dashboard."
                  : "Your personal finance companion for a successful nursing career."}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" aria-label={isLoginView ? 'Sign in form' : 'Sign up form'}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nurse@hospital.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Please wait...
                </>
              ) : isLoginView ? (
                "Sign In"
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            {isLoginView ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsLoginView(!isLoginView)}
              className="inline-block p-2 min-w-[44px] min-h-[44px] underline font-semibold text-primary"
              aria-label={isLoginView ? "Switch to sign up form" : "Switch to sign in form"}
            >
              {isLoginView ? "Sign up" : "Sign in"}
            </button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
