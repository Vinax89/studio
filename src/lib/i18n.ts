import { useCallback, useState } from "react"
import en from "../../public/locales/en.json"
import es from "../../public/locales/es.json"

export type Locale = "en" | "es"

const dictionaries: Record<Locale, Record<string, string>> = {
  en,
  es,
}

export function useTranslation(initialLocale: Locale = "en") {
  const [locale, setLocale] = useState<Locale>(initialLocale)
  const t = useCallback(
    (key: string) => dictionaries[locale][key] || key,
    [locale],
  )
  return { t, locale, setLocale }
}

export function getTranslation(locale: Locale) {
  return (key: string) => dictionaries[locale][key] || key
}
