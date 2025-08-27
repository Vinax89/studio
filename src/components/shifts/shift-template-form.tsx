"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import type { ShiftTemplate } from "@/lib/types"

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface ShiftTemplateFormProps {
    onSave: (template: Omit<ShiftTemplate, 'id'>) => void
}

export function ShiftTemplateForm({ onSave }: ShiftTemplateFormProps) {
  const [templateName, setTemplateName] = useState("")
  const [shiftType, setShiftType] = useState<"Day" | "Night" | "Evening">("Day")
  const [hours, setHours] = useState("12")
  const [workingDays, setWorkingDays] = useState<{ [key: string]: boolean }>({
      Monday: false, Tuesday: false, Wednesday: false, Thursday: false, Friday: false, Saturday: false, Sunday: false
  });

  const handleSave = () => {
    if (!templateName || !shiftType || !hours) return;

    const days = weekdays.map(day => ({
        day,
        isWorking: workingDays[day] || false
    }))

    onSave({
        name: templateName,
        shiftType,
        hours: parseInt(hours),
        days
    })
    // Reset form
    setTemplateName("");
    setShiftType("Day");
    setHours("12");
    setWorkingDays({ Monday: false, Tuesday: false, Wednesday: false, Thursday: false, Friday: false, Saturday: false, Sunday: false });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Shift Template</CardTitle>
        <CardDescription>
          Create a reusable template for your common work schedules.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input id="template-name" placeholder="e.g. 3 on, 4 off" value={templateName} onChange={(e) => setTemplateName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="shift-type">Shift Type</Label>
                <Select value={shiftType} onValueChange={(v: "Day" | "Night" | "Evening") => setShiftType(v)}>
                    <SelectTrigger id="shift-type">
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Day">Day</SelectItem>
                        <SelectItem value="Evening">Evening</SelectItem>
                        <SelectItem value="Night">Night</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="hours">Hours</Label>
                <Input id="hours" type="number" value={hours} onChange={e => setHours(e.target.value)} />
            </div>
        </div>
        <div>
            <Label>Working Days</Label>
            <div className="space-y-2 mt-2">
            {weekdays.map(day => (
                <div key={day} className="flex items-center justify-between rounded-lg border p-3">
                    <Label htmlFor={`day-${day}`}>{day}</Label>
                    <Switch id={`day-${day}`} checked={workingDays[day]} onCheckedChange={(checked) => setWorkingDays(prev => ({...prev, [day]: checked}))}/>
                </div>
            ))}
            </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} className="w-full">Save Template</Button>
      </CardFooter>
    </Card>
  )
}
