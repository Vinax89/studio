import { useMemo } from "react"
import { Recurrence, Debt } from "@/lib/types"
import {
  addDays,
  addMonths,
  differenceInCalendarDays,
  differenceInMonths,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
} from "date-fns"

// Maximum number of occurrences to generate for a single debt
export const DEFAULT_MAX_OCCURRENCES = 400

const iso = (d: Date) => d.toISOString().slice(0, 10)

/**
 * Computes the next occurrence of a recurring debt on or after a target date.
 *
 * Supported recurrence modes are:
 * - `"none"` – a one-time occurrence that must match the anchor date exactly.
 * - `"weekly"` – repeats every seven days.
 * - `"biweekly"` – repeats every fourteen days.
 * - `"monthly"` – repeats on the same day of each month.
 *
 * @param anchorISO - ISO date string representing the first occurrence.
 * @param recurrence - Recurrence frequency of the debt.
 * @param onOrAfter - Date to search for the next occurrence from.
 * @returns The first occurrence on or after `onOrAfter`, or `null` if none.
 */
function nextOccurrenceOnOrAfter(
  anchorISO: string,
  recurrence: Recurrence,
  onOrAfter: Date
): Date | null {
  const anchor = parseISO(anchorISO)
  if (recurrence === "none")
    return isSameDay(anchor, onOrAfter) || isAfter(anchor, onOrAfter)
      ? anchor
      : null
  if (recurrence === "monthly") {
    if (isBefore(onOrAfter, anchor)) return anchor
    const monthsDiff = differenceInMonths(onOrAfter, anchor)
    let candidate = addMonths(anchor, monthsDiff)
    if (isBefore(candidate, onOrAfter)) {
      candidate = addMonths(candidate, 1)
    }
    return candidate
  }
  const step = recurrence === "weekly" ? 7 : 14
  const diffDays = differenceInCalendarDays(onOrAfter, anchor)
  const k = diffDays <= 0 ? 0 : Math.ceil(diffDays / step)
  const candidate = addDays(anchor, k * step)
  return isBefore(candidate, onOrAfter) ? addDays(candidate, step) : candidate
}

/**
 * Generates all occurrences of a debt within the given date range.
 *
 * The iteration stops after `maxOccurrences` cycles; if more occurrences
 * exist within the range after that point, a console warning is emitted to
 * signal truncation.
 *
 * @param debt - Debt to expand into individual occurrences.
 * @param from - Start of the date range (inclusive).
 * @param to - End of the date range (inclusive).
 * @param maxOccurrences - Maximum number of iterations to perform.
 * @returns Array of occurrence dates within the specified range.
 */
function allOccurrencesInRange(
  debt: Debt,
  from: Date,
  to: Date,
  maxOccurrences: number = DEFAULT_MAX_OCCURRENCES
): Date[] {
  const out: Date[] = []
  if (debt.recurrence === "none") {
    const d = parseISO(debt.dueDate)
    if (!isBefore(d, from) && !isAfter(d, to)) out.push(d)
    return out
  }
  let cur = nextOccurrenceOnOrAfter(debt.dueDate, debt.recurrence, from)
  let iter = 0
  const stepDays =
    debt.recurrence === "weekly" ? 7 : debt.recurrence === "biweekly" ? 14 : 0

  while (cur && !isAfter(cur, to) && iter < maxOccurrences) {
    out.push(cur)
    iter++
    cur =
      debt.recurrence === "monthly"
        ? addMonths(cur, 1)
        : addDays(cur, stepDays)
  }
  if (cur && !isAfter(cur, to)) {
    console.warn(
      `Debt occurrences truncated at ${maxOccurrences} iterations for debt ${debt.name}`
    )
  }
  return out
}

function computeDebtOccurrences(
  debts: Debt[],
  from: Date,
  to: Date,
  maxOccurrences: number = DEFAULT_MAX_OCCURRENCES
) {
  const occurrences: Occurrence[] = []
  const grouped = new Map<string, Occurrence[]>()
  debts.forEach(d => {
    const occ = allOccurrencesInRange(d, from, to, maxOccurrences)
    occ.forEach(dt => {
      const oc = { date: iso(dt), debt: d }
      occurrences.push(oc)
      const arr = grouped.get(oc.date) ?? []
      arr.push(oc)
      grouped.set(oc.date, arr)
    })
  })
  occurrences.sort((a, b) => a.date.localeCompare(b.date))
  return { occurrences, grouped } as const
}

export type Occurrence = { date: string; debt: Debt }

/**
 * React hook that expands debts into dated occurrences and groups them by day.
 *
 * The grouped map is filtered by `query`, which matches against a debt's name
 * and optional notes. The returned `occurrences` list is unaffected by this
 * filtering.
 *
 * @param debts - Debts to compute occurrences for.
 * @param from - Start of the date range (inclusive).
 * @param to - End of the date range (inclusive).
 * @param query - Search string used to filter the grouped map by debt info.
 * @param maxOccurrences - Maximum occurrences to generate per debt.
 * @returns An object containing the flat `occurrences` list and a `grouped`
 * map keyed by ISO date string after filtering.
 */
export function useDebtOccurrences(
  debts: Debt[],
  from: Date,
  to: Date,
  query: string,
  maxOccurrences: number = DEFAULT_MAX_OCCURRENCES
) {
  const fromTime = from.getTime()
  const toTime = to.getTime()
  const { occurrences, grouped } = useMemo(
    () =>
      computeDebtOccurrences(
        debts,
        new Date(fromTime),
        new Date(toTime),
        maxOccurrences
      ),
    [debts, fromTime, toTime, maxOccurrences]
  )

  const filtered = useMemo(() => {
    if (!query) return grouped
    const map = new Map<string, Occurrence[]>()
    grouped.forEach((arr, date) => {
      const filteredArr = arr.filter(oc =>
        `${oc.debt.name} ${oc.debt.notes ?? ""}`
          .toLowerCase()
          .includes(query.toLowerCase())
      )
      if (filteredArr.length) map.set(date, filteredArr)
    })
    return map
  }, [grouped, query])

  return { occurrences, grouped: filtered } as const
}

