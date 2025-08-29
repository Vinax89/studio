import * as React from "react"

/**
 * Screen width (in pixels) below which layout is considered mobile.
 * Exported for reuse to ensure consistent breakpoint behavior.
 */
export const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(() => {
    return typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT
  })

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches)
    }
    const supportsEventListener = typeof mql.addEventListener === "function"
    if (supportsEventListener) {
      mql.addEventListener("change", onChange)
    } else {
      mql.addListener(onChange)
    }
    setIsMobile(mql.matches)
    return () =>
      supportsEventListener
        ? mql.removeEventListener("change", onChange)
        : mql.removeListener(onChange)
  }, [])

  return isMobile
}
