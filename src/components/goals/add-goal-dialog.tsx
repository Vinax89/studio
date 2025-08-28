
"use client"

import { useEffect, useState, type ReactNode } from "react"
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
import { Slider } from "@/components/ui/slider"
import { PlusCircle } from "lucide-react"
import type { Goal } from "@/lib/types"

interface AddGoalDialogProps {
  onSave: (goal: Goal) => void;
  goal?: Goal;
  trigger?: ReactNode;
}

export function AddGoalDialog({ onSave, goal, trigger }: AddGoalDialogProps) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState("")
    const [targetAmount, setTargetAmount] = useState("")
    const [currentAmount, setCurrentAmount] = useState("")
    const [deadline, setDeadline] = useState("")
    const [importance, setImportance] = useState([3]) // Default importance

    useEffect(() => {
        if (open) {
            setName(goal?.name ?? "")
            setTargetAmount(goal?.targetAmount?.toString() ?? "")
            setCurrentAmount(goal?.currentAmount?.toString() ?? "")
            setDeadline(goal?.deadline ?? "")
            setImportance([goal?.importance ?? 3])
        }
    }, [goal, open])

    const handleSave = () => {
        if(name && targetAmount && currentAmount && deadline) {
            onSave({
                id: goal?.id ?? "",
                name,
                targetAmount: parseFloat(targetAmount),
                currentAmount: parseFloat(currentAmount),
                deadline,
                importance: importance[0]
            })
            setOpen(false)
        }
    }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Goal
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{goal ? "Edit Goal" : "Add New Financial Goal"}</DialogTitle>
          <DialogDescription>
            {goal ? "Update your goal details" : "What financial milestone are you aiming for?"}
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="importance" className="text-right">Importance</Label>
            <div className="col-span-3 flex items-center gap-4">
              <Slider
                id="importance"
                min={1}
                max={5}
                step={1}
                value={importance}
                onValueChange={setImportance}
              />
              <span className="font-bold w-4">{importance[0]}</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>{goal ? "Save Changes" : "Save Goal"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
