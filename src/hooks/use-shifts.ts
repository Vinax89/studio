'use client'

import { useState, useMemo } from 'react'
import type { DateRange } from 'react-day-picker'
import { useToast } from '@/hooks/use-toast'
import {
  calculateOvertimeDates,
  getPayPeriodStart,
  type Shift,
} from '@/lib/payroll'

const payPeriodAnchor = new Date('2024-01-07T00:00:00.000Z')

export function useShifts() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [payPeriod, setPayPeriod] = useState<DateRange | undefined>(undefined)
  const [cursorDate, setCursorDate] = useState(new Date())

  const [shiftHours, setShiftHours] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [premiumPay, setPremiumPay] = useState('')
  const [differentials, setDifferentials] = useState('')
  const [lastEnteredShift, setLastEnteredShift] = useState<Omit<Shift, 'date'> | null>(null)

  const { toast } = useToast()

  const overtimeShifts = useMemo(() => calculateOvertimeDates(shifts), [shifts])

  const monthlyStats = useMemo(() => {
    const month = cursorDate.getMonth()
    const year = cursorDate.getFullYear()
    const shiftsInMonth = shifts.filter(
      s => s.date.getMonth() === month && s.date.getFullYear() === year
    )

    let totalMonthlyIncome = 0
    let totalMonthlyHours = 0
    let totalMonthlyOvertimeHours = 0

    const weeklyShifts: { [weekStart: string]: Shift[] } = {}
    shiftsInMonth.forEach(shift => {
      const shiftDay = shift.date.getDay()
      const weekStart = new Date(shift.date)
      weekStart.setDate(shift.date.getDate() - shiftDay)
      weekStart.setHours(0, 0, 0, 0)
      const weekStartStr = weekStart.toISOString()
      if (!weeklyShifts[weekStartStr]) weeklyShifts[weekStartStr] = []
      weeklyShifts[weekStartStr].push(shift)
    })

    for (const weekStartStr in weeklyShifts) {
      const week = weeklyShifts[weekStartStr]
      let weeklyHours = 0
      let weeklyPremiumPay = 0

      week.forEach(shift => {
        weeklyHours += shift.hours
        weeklyPremiumPay += shift.premiumPay || 0
      })

      const regularHours = Math.min(weeklyHours, 40)
      const overtimeHours = Math.max(0, weeklyHours - 40)
      totalMonthlyHours += weeklyHours
      totalMonthlyOvertimeHours += overtimeHours

      if (week.length > 0) {
        const avgRate =
          week.reduce((acc, s) => acc + s.rate * s.hours, 0) / weeklyHours
        const regularPay = regularHours * avgRate
        const overtimePay = overtimeHours * avgRate * 1.5
        totalMonthlyIncome += regularPay + overtimePay + weeklyPremiumPay
      }
    }

    const burnoutIndex =
      totalMonthlyHours > 0
        ? (totalMonthlyOvertimeHours / totalMonthlyHours) * 100
        : 0

    return {
      totalMonthlyIncome,
      totalMonthlyHours,
      burnoutIndex,
    }
  }, [shifts, cursorDate])


  const handleAddShift = (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedDate || !shiftHours || !hourlyRate) {
      toast({
        title: 'Missing Shift Info',
        description: 'Please select a date and enter hours and rate.',
        variant: 'destructive',
      })
      return
    }

    const existingShiftIndex = shifts.findIndex(
      s => s.date.getTime() === selectedDate.getTime()
    )

    const newShift: Shift = {
      date: selectedDate,
      hours: parseFloat(shiftHours),
      rate: parseFloat(hourlyRate),
      premiumPay: premiumPay ? parseFloat(premiumPay) : undefined,
      differentials: differentials || undefined,
    }

    if (existingShiftIndex > -1) {
      const updatedShifts = [...shifts]
      updatedShifts[existingShiftIndex] = newShift
      setShifts(updatedShifts)
    } else {
      setShifts([...shifts, newShift])
    }

    const { date: _date, ...shiftDetails } = newShift
    void _date
    setLastEnteredShift(shiftDetails)
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)

    if (date) {
      const start = getPayPeriodStart(date, payPeriodAnchor)
      const end = new Date(start)
      end.setDate(start.getDate() + 13)
      setPayPeriod({ from: start, to: end })

      const existingShift = shifts.find(
        s => s.date.getTime() === date.getTime()
      )
      if (existingShift) {
        setShiftHours(String(existingShift.hours))
        setHourlyRate(String(existingShift.rate))
        setPremiumPay(existingShift.premiumPay ? String(existingShift.premiumPay) : '')
        setDifferentials(existingShift.differentials || '')
      } else if (lastEnteredShift) {
        setShiftHours(String(lastEnteredShift.hours))
        setHourlyRate(String(lastEnteredShift.rate))
        setPremiumPay(
          lastEnteredShift.premiumPay ? String(lastEnteredShift.premiumPay) : ''
        )
        setDifferentials(lastEnteredShift.differentials || '')
      } else {
        setShiftHours('')
        setHourlyRate('')
        setPremiumPay('')
        setDifferentials('')
      }
    } else {
      setPayPeriod(undefined)
    }
  }

  return {
    shifts,
    selectedDate,
    payPeriod,
    cursorDate,
    setCursorDate,
    shiftHours,
    setShiftHours,
    hourlyRate,
    setHourlyRate,
    premiumPay,
    setPremiumPay,
    differentials,
    setDifferentials,
    handleAddShift,
    handleDateSelect,
    overtimeShifts,
    monthlyStats,
  }
}

export type UseShiftsReturn = ReturnType<typeof useShifts>
