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
import type { Goal } from "@/lib/types"

interface AddGoalDialogProps {
  onSave: (goal: Omit<Goal, 'id'>) => void;
}

export function AddGoalDialog({ onSave }: AddGoalDialogProps) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [targetAmount, setTargetAmount] = useState("")
    const [currentAmount, setCurrentAmount] = useState("")
    const [deadline, setDeadline] = useState("")

    const handleSave = () => {
        if(name && targetAmount && currentAmount && deadline) {
            onSave({
                name,
                targetAmount: parseFloat(targetAmount),
                currentAmount: parseFloat(currentAmount),
                deadline
            })
            setOpen(false)
            // Reset form
            setName("")
            setTargetAmount("")
            setCurrentAmount("")
            setDeadline("")
        }
    }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Financial Goal</DialogTitle>
          <DialogDescription>
            What financial milestone are you aiming for?
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Goal Name</Label>
            <Input id="name" placeholder="e.g. Buy a new car" value={name} onChange={e => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="target" className="text-right">Target Amount</Label>
            <Input id="target" type="number" placeholder="25000" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="current" className="text-right">Current Amount</Label>
            <Input id="current" type="number" placeholder="5000" value={currentAmount} onChange={e => setCurrentAmount(e.target.value)} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="deadline" className="text-right">Deadline</Label>
            <Input id="deadline" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>Save Goal</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
