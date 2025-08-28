import * as React from "react"

/**
 * Screen width (in pixels) below which layout is considered mobile.
 * Exported for reuse to ensure consistent breakpoint behavior.
 */
export const MOBILE_BREAKPOINT = 768

/**
 * React hook that reports whether the viewport width is below `MOBILE_BREAKPOINT`.
 *
 * During server-side rendering the hook always returns `false` since `window`
 * is not available. On the client it checks the viewport on mount and listens
 * for subsequent resizes.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useLayoutEffect(() => {
    if (typeof window === "undefined") return

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      if (typeof window === "undefined") return
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    onChange()
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
