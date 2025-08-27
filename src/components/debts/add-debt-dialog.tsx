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
import { PlusCircle, Calendar as CalendarIcon } from "lucide-react"
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
    const [totalAmount, setTotalAmount] = useState("")
    const [minimumPayment, setMinimumPayment] = useState("")
    const [dueDate, setDueDate] = useState<Date>()
    const [recurrence, setRecurrence] = useState<"once" | "monthly">("monthly")

    const handleSave = () => {
        if(name && totalAmount && minimumPayment && dueDate) {
            onSave({
                name,
                totalAmount: parseFloat(totalAmount),
                minimumPayment: parseFloat(minimumPayment),
                dueDate: dueDate.toISOString().split('T')[0],
                recurrence
            })
            setOpen(false)
            // Reset form
            setName("")
            setTotalAmount("")
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Debt</DialogTitle>
          <DialogDescription>
            Enter the details for your new debt.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Debt Name</Label>
            <Input id="name" placeholder="e.g. Student Loan" value={name} onChange={e => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="total" className="text-right">Total Amount</Label>
            <Input id="total" type="number" placeholder="25000" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="min-payment" className="text-right">Min. Payment</Label>
            <Input id="min-payment" type="number" placeholder="350" value={minimumPayment} onChange={e => setMinimumPayment(e.target.value)} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="due-date" className="text-right">Due Date</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                    variant={"outline"}
                    className={cn(
                        "col-span-3 justify-start text-left font-normal",
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
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="recurrence" className="text-right">Recurrence</Label>
             <Select onValueChange={(value: "once" | "monthly") => setRecurrence(value)} defaultValue={recurrence}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select recurrence" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="once">Once</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>Save Debt</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
