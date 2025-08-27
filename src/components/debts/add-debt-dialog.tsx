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
import { PlusCircle } from "lucide-react"
import type { Debt } from "@/lib/types"

interface AddDebtDialogProps {
  onSave: (debt: Omit<Debt, 'id'>) => void;
}

export function AddDebtDialog({ onSave }: AddDebtDialogProps) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [totalAmount, setTotalAmount] = useState("")
    const [minimumPayment, setMinimumPayment] = useState("")
    const [dueDate, setDueDate] = useState("")

    const handleSave = () => {
        if(name && totalAmount && minimumPayment && dueDate) {
            onSave({
                name,
                totalAmount: parseFloat(totalAmount),
                minimumPayment: parseFloat(minimumPayment),
                dueDate: parseInt(dueDate)
            })
            setOpen(false)
            // Reset form
            setName("")
            setTotalAmount("")
            setMinimumPayment("")
            setDueDate("")
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
            <Label htmlFor="due-date" className="text-right">Due Day of Month</Label>
            <Input id="due-date" type="number" min="1" max="31" placeholder="e.g. 15" value={dueDate} onChange={e => setDueDate(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>Save Debt</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
