"use client"

import { useState, useEffect, useRef } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { PlusCircle } from "lucide-react"
import type { Transaction } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { recordCategoryFeedback } from "@/lib/category-feedback"

interface AddTransactionDialogProps {
  onSave: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
}

export function AddTransactionDialog({ onSave }: AddTransactionDialogProps) {
    const [open, setOpen] = useState(false)
    const [description, setDescription] = useState("")
    const [amount, setAmount] = useState("")
    const [type, setType] = useState<"Income" | "Expense">("Expense")
    const [category, setCategory] = useState("")
    const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null)
    const userModifiedCategory = useRef(false)
    const [currency, setCurrency] = useState("USD")
    const [isRecurring, setIsRecurring] = useState(false)
    const { toast } = useToast()

    useEffect(() => {
        if (!description) {
            setSuggestedCategory(null)
            setCategory("")
            userModifiedCategory.current = false
            return
        }
        if (process.env.NODE_ENV === "test") {
            return
        }
        let active = true
        import("@/ai/flows/suggest-category").then(({ suggestCategory }) =>
            suggestCategory({ description }).then(res => {
                if (active) {
                    setSuggestedCategory(res.category)
                    if (!userModifiedCategory.current) {
                        setCategory(res.category)
                    }
                }
            })
        )
        return () => { active = false }
    }, [description])

    const handleSave = () => {
        const numericAmount = Number(amount)

        if (!description || !amount || !type || !category || !Number.isFinite(numericAmount)) {
            toast({ title: "Invalid amount", description: "Please enter a valid amount.", variant: "destructive" })
            return
        }

        onSave({
            description,
            amount: numericAmount,
            currency,
            type,
            category,
            isRecurring
        })
        if(suggestedCategory && category !== suggestedCategory){
            recordCategoryFeedback(description, category)
        }
        setOpen(false)
        // Reset form
        setDescription("")
        setAmount("")
        setType("Expense")
        setCategory("")
        setSuggestedCategory(null)
        userModifiedCategory.current = false
        setCurrency("USD")
        setIsRecurring(false)
    }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogDescription>
            Enter the details of your transaction below. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">Description</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">Amount</Label>
            <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">Type</Label>
             <Select onValueChange={(value: "Income" | "Expense") => setType(value)} value={type}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Income">Income</SelectItem>
                    <SelectItem value="Expense">Expense</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="currency" className="text-right">Currency</Label>
            <Select onValueChange={setCurrency} value={currency}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">Category</Label>
            <Input id="category" placeholder="e.g. Uniforms, Salary" value={category} onChange={(e) => {setCategory(e.target.value); userModifiedCategory.current = true;}} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="recurring" className="text-right">Recurring</Label>
            <Switch id="recurring" checked={isRecurring} onCheckedChange={setIsRecurring} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>Save Transaction</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
