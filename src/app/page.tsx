"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
  type AuthError,
} from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"
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
  const [view, setView] = useState<'login' | 'signup' | 'reset'>('login')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (view === 'login') {
        await signInWithEmailAndPassword(auth, email, password)
        router.push("/dashboard")
      } else if (view === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password)
        router.push("/dashboard")
      } else {
        await sendPasswordResetEmail(auth, email)
        toast({
          title: "Password Reset Email Sent",
          description: "Check your inbox for reset instructions.",
        })
        setView('login')
      }
    } catch (error) {
      const authError = error as AuthError
      const errorMessage = authErrorMessages[authError.code] ?? DEFAULT_AUTH_ERROR_MESSAGE
      if (!authErrorMessages[authError.code]) {
        console.error(authError.code, authError.message)
      }
      toast({
        title:
          view === 'login'
            ? "Sign In Failed"
            : view === 'signup'
              ? "Sign Up Failed"
              : "Password Reset Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signInWithPopup(auth, googleProvider)
      router.push("/dashboard")
    } catch (error) {
      const authError = error as AuthError
      const errorMessage = authErrorMessages[authError.code] ?? DEFAULT_AUTH_ERROR_MESSAGE
      if (!authErrorMessages[authError.code]) {
        console.error(authError.code, authError.message)
      }
      toast({
        title: "Google Sign In Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <NurseFinAILogo className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold tracking-tight">
              {view === 'login'
                ? "Welcome Back"
                : view === 'signup'
                  ? "Create an Account"
                  : "Reset Your Password"}
            </CardTitle>
            <CardDescription>
              {view === 'login'
                ? "Sign in to access your financial dashboard."
                : view === 'signup'
                  ? "Your personal finance companion for a successful nursing career."
                  : "Enter your email to receive password reset instructions."}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            {view !== 'reset' && (
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
            )}
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : view === 'login' ? (
                "Sign In"
              ) : view === 'signup' ? (
                "Sign Up"
              ) : (
                "Send Reset Email"
              )}
            </Button>
          </form>
          {view !== 'reset' && (
            <Button
              type="button"
              variant="outline"
              className="w-full mt-4"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : (
                "Continue with Google"
              )}
            </Button>
          )}
          {view === 'login' && (
            <div className="mt-2 text-right text-sm">
              <button
                onClick={() => setView('reset')}
                className="underline font-semibold text-primary"
              >
                Forgot password?
              </button>
            </div>
          )}
          <div className="mt-6 text-center text-sm">
            {view === 'login' && (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => setView('signup')}
                  className="underline font-semibold text-primary"
                >
                  Sign up
                </button>
              </>
            )}
            {view === 'signup' && (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setView('login')}
                  className="underline font-semibold text-primary"
                >
                  Sign in
                </button>
              </>
            )}
            {view === 'reset' && (
              <>
                Remembered your password?{' '}
                <button
                  onClick={() => setView('login')}
                  className="underline font-semibold text-primary"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
