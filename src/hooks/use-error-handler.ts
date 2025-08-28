import { handleError } from "../lib/error-helper"
import { useToast } from "./use-toast"

interface ErrorOptions {
  context?: string
  title?: string
  description?: string
}

export function useErrorHandler() {
  const { toast } = useToast()

  return (error: unknown, options: ErrorOptions = {}) => {
    const message = handleError(error, options.context)
    toast({
      title: options.title ?? "Something went wrong",
      description: options.description ?? message,
      variant: "destructive",
    })
    return message
  }
}
