"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Calendar as CalendarIcon, Percent } from "lucide-react"
import type { Debt } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface AddDebtDialogProps {
  onSave: (debt: Omit<Debt, 'id'>) => void;
}

export function AddDebtDialog({ onSave }: AddDebtDialogProps) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [initialAmount, setInitialAmount] = useState("")
    const [currentAmount, setCurrentAmount] = useState("")
    const [interestRate, setInterestRate] = useState("")
    const [minimumPayment, setMinimumPayment] = useState("")
    const [dueDate, setDueDate] = useState<Date>()
    const [recurrence, setRecurrence] = useState<"once" | "monthly">("monthly")

    const handleSave = () => {
        if(name && initialAmount && currentAmount && interestRate && minimumPayment && dueDate) {
            onSave({
                name,
                initialAmount: parseFloat(initialAmount),
                currentAmount: parseFloat(currentAmount),
                interestRate: parseFloat(interestRate),
                minimumPayment: parseFloat(minimumPayment),
                dueDate: dueDate.toISOString().split('T')[0],
                recurrence
            })
            setOpen(false)
            // Reset form
            setName("")
            setInitialAmount("")
            setCurrentAmount("")
            setInterestRate("")
            setMinimumPayment("")
            setDueDate(undefined)
            setRecurrence("monthly")
        }
    }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Debt
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Debt</DialogTitle>
          <DialogDescription>
            Enter the details for your new debt.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Debt Name</Label>
            <Input id="name" placeholder="e.g. Student Loan" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="initial-amount">Initial Amount</Label>
                <Input id="initial-amount" type="number" placeholder="25000" value={initialAmount} onChange={e => setInitialAmount(e.target.value)} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="current-amount">Current Amount</Label>
                <Input id="current-amount" type="number" placeholder="18500" value={currentAmount} onChange={e => setCurrentAmount(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="min-payment">Min. Payment</Label>
                <Input id="min-payment" type="number" placeholder="350" value={minimumPayment} onChange={e => setMinimumPayment(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="interest-rate">Interest Rate</Label>
                <div className="relative">
                    <Input id="interest-rate" type="number" placeholder="5.8" value={interestRate} onChange={e => setInterestRate(e.target.value)} className="pr-8" />
                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
            </div>
          </div>
           <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="due-date">Next Due Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !dueDate && "text-muted-foreground"
                            )}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                            mode="single"
                            selected={dueDate}
                            onSelect={setDueDate}
                            initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="recurrence">Recurrence</Label>
                    <Select onValueChange={(value: "once" | "monthly") => setRecurrence(value)} defaultValue={recurrence}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select recurrence" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="once">Once</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>Save Debt</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
