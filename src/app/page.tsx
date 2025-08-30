"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type AuthError,
} from "firebase/auth"
import { getFirebase } from "@/lib/firebase"
import { authErrorMessages, DEFAULT_AUTH_ERROR_MESSAGE } from "@/lib/auth-errors"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NurseFinAILogo } from "@/components/icons"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { logger } from "@/lib/logger"

const { auth } = getFirebase()

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoginView, setIsLoginView] = useState(true) // toggles between login and registration modes
  const [isLoading, setIsLoading] = useState(false) // disables form while authenticating

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isLoginView) {
        // Existing user attempting to sign in
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        // New user creating an account
        await createUserWithEmailAndPassword(auth, email, password)
      }
      router.push("/dashboard")
    } catch (error) {
      const authError = error as AuthError
      const errorMessage = authErrorMessages[authError.code] ?? DEFAULT_AUTH_ERROR_MESSAGE
      // If we don't have a user-friendly message for this error, log it for debugging
      // while showing a generic message to the user to avoid exposing raw error codes.
      if (!authErrorMessages[authError.code]) {
        logger.error(authError.code, authError.message)
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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <NurseFinAILogo className="h-12 w-12 text-primary" />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={isLoginView ? "login-header" : "signup-header"}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-1"
            >
              <CardTitle className="text-3xl font-bold tracking-tight">
                {isLoginView ? "Welcome Back" : "Create an Account"}
              </CardTitle>
              <CardDescription>
                {isLoginView
                    ? "Sign in to access your financial dashboard."
                    : "Your personal finance companion for a successful nursing career."}
              </CardDescription>
            </motion.div>
          </AnimatePresence>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={isLoginView ? "login-form" : "signup-form"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
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
                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
                <button onClick={() => setIsLoginView(!isLoginView)} className="underline font-semibold text-primary">
                  {isLoginView ? "Sign up" : "Sign in"}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}
