function reportToMonitoring(_error: unknown, _context?: string) {
  // Placeholder for external error monitoring service
}

export function handleError(error: unknown, context?: string): string {
  if (context) {
    console.error(`Error in ${context}:`, error)
  } else {
    console.error(error)
  }

  reportToMonitoring(error, context)
  return "An unexpected error occurred"
}
