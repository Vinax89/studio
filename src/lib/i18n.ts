import en from "../../public/locales/en.json"
import es from "../../public/locales/es.json"

export type Locale = "en" | "es"

const dictionaries: Record<Locale, Record<string, string>> = {
  en,
  es,
}

let currentLocale: Locale = "en"

export const setLocale = (locale: Locale) => {
  currentLocale = locale
}

export function useTranslation() {
  const t = (key: string) => dictionaries[currentLocale][key] || key
  return { t, locale: currentLocale }
}

export function getTranslation(locale: Locale = currentLocale) {
  return (key: string) => dictionaries[locale][key] || key
}
