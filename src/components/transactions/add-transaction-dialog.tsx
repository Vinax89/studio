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
import { mockAccounts } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"

interface AddTransactionDialogProps {
  onSave: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
}

export function AddTransactionDialog({ onSave }: AddTransactionDialogProps) {
    const [open, setOpen] = useState(false)
    const [description, setDescription] = useState("")
    const [amount, setAmount] = useState("")
    const [type, setType] = useState<"Income" | "Expense">("Expense")
    const [category, setCategory] = useState("")
    const [accountId, setAccountId] = useState(mockAccounts[0]?.id || "")
    const [currency, setCurrency] = useState(mockAccounts[0]?.currency || "USD")
    const [isRecurring, setIsRecurring] = useState(false)
    const { toast } = useToast()

    const handleSave = () => {
        const numericAmount = Number(amount)

        if (!description || !amount || !type || !category || !accountId) {
            toast({ title: "Missing fields", description: "Please complete all fields.", variant: "destructive" })
            return
        }

        if (!Number.isFinite(numericAmount)) {
            toast({ title: "Invalid amount", description: "Please enter a valid amount.", variant: "destructive" })
            return
        }

        const currencyCode = currency.trim().toUpperCase()
        try {
            new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode }).format(1)
        } catch {
            toast({ title: "Invalid currency", description: "Please enter a valid ISO currency code.", variant: "destructive" })
            return
        }

        onSave({
            description,
            amount: numericAmount,
            type,
            category,
            accountId,
            currency: currencyCode,
            isRecurring,
        })
        setOpen(false)
        // Reset form
        setDescription("")
        setAmount("")
        setType("Expense")
        setCategory("")
        setAccountId(mockAccounts[0]?.id || "")
        setCurrency(mockAccounts[0]?.currency || "USD")
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
            <Label htmlFor="category" className="text-right">Category</Label>
            <Input id="category" placeholder="e.g. Uniforms, Salary" value={category} onChange={(e) => setCategory(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="account" className="text-right">Account</Label>
            <Select onValueChange={(value) => {
              setAccountId(value);
              const acc = mockAccounts.find(a => a.id === value);
              if (acc) setCurrency(acc.currency);
            }} value={accountId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {mockAccounts.map(acc => (
                  <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="currency" className="text-right">Currency</Label>
            <Input id="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} className="col-span-3" />
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
