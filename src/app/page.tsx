"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type AuthError,
} from "firebase/auth"
import { auth } from "@/lib/firebase"

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
      let errorMessage = "An unexpected error occurred. Please try again."
      switch (authError.code) {
          case "auth/user-not-found":
              errorMessage = "No account found with this email. Please sign up."
              break;
          case "auth/wrong-password":
              errorMessage = "Incorrect password. Please try again."
              break;
          case "auth/email-already-in-use":
              errorMessage = "This email is already registered. Please sign in."
              break;
          case "auth/weak-password":
              errorMessage = "The password is too weak. Please use at least 6 characters."
              break;
          case "auth/configuration-not-found":
              errorMessage = "Firebase Authentication is not yet configured. Please ensure Email/Password sign-in is enabled in the Firebase console."
              break;
          default:
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
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <NurseFinAILogo className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            {isLoginView ? "Welcome Back" : "Create an Account"}
          </CardTitle>
          <CardDescription>
            {isLoginView 
                ? "Sign in to access your financial dashboard."
                : "Your personal finance companion for a successful nursing career."}
          </CardDescription>
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
                className="h-12"
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
                className="h-12"
              />
            </div>
            <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
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
        </CardContent>
      </Card>
    </div>
  )
}
