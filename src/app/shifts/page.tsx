"use client";

import { useState } from "react";
import { mockShifts, mockShiftTemplates } from "@/lib/data";
import type { Shift, ShiftTemplate } from "@/lib/types";
import { add, format } from "date-fns";

import { ShiftCalendar } from "@/components/shifts/shift-calendar";
import { ShiftTemplateForm } from "@/components/shifts/shift-template-form";
import { ApplyTemplateDialog } from "@/components/shifts/apply-template-dialog";

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>(mockShifts);
  const [templates, setTemplates] = useState<ShiftTemplate[]>(mockShiftTemplates);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  
  const addTemplate = (template: Omit<ShiftTemplate, "id">) => {
    setTemplates((prev) => [
      ...prev,
      { ...template, id: `template-${prev.length + 1}` },
    ]);
  };
  
  const applyTemplate = (templateId: string, startDate: Date) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    let currentDate = startDate;
    const newShifts: Shift[] = [];
    
    // Simple repeating pattern for 4 weeks
    for (let i = 0; i < 28; i++) {
        const dayOfWeek = format(currentDate, 'EEEE');
        const templateDay = template.days.find(d => d.day === dayOfWeek);

        if (templateDay?.isWorking) {
             newShifts.push({
                id: `shift-${shifts.length + i + 1}`,
                date: format(currentDate, 'yyyy-MM-dd'),
                type: template.shiftType,
                hours: template.hours
             });
        }
        currentDate = add(currentDate, { days: 1 });
    }

    setShifts(prev => [...prev, ...newShifts]);
  };


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shift Planner</h1>
          <p className="text-muted-foreground">
            Manage your work schedule and apply templates.
          </p>
        </div>
        <ApplyTemplateDialog templates={templates} onApply={applyTemplate} />
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
            <ShiftCalendar 
                shifts={shifts}
                month={selectedMonth}
                onMonthChange={setSelectedMonth}
            />
        </div>
        <div className="md:col-span-1">
            <ShiftTemplateForm onSave={addTemplate} />
        </div>
      </div>
    </div>
  );
}
