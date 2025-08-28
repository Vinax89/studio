"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { useTranslation } from "@/lib/i18n"

interface TransactionsFilterProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    filterType: string;
    onTypeChange: (value: string) => void;
    filterCategory: string;
    onCategoryChange: (value: string) => void;
    categories: string[];
}

export function TransactionsFilter({
    searchTerm,
    onSearchChange,
    filterType,
    onTypeChange,
    filterCategory,
    onCategoryChange,
    categories
}: TransactionsFilterProps) {

  const { t } = useTranslation()

  return (
    <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
            type="search"
            placeholder={t("filter.searchPlaceholder")}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            />
        </div>
        <div className="flex gap-4">
            <Select value={filterType} onValueChange={onTypeChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder={t("filter.byType")} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{t("filter.allTypes")}</SelectItem>
                    <SelectItem value="Income">{t("filter.typeIncome")}</SelectItem>
                    <SelectItem value="Expense">{t("filter.typeExpense")}</SelectItem>
                </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={onCategoryChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder={t("filter.byCategory")} />
                </SelectTrigger>
                <SelectContent>
                    {categories.map(category => (
                         <SelectItem key={category} value={category} className="capitalize">
                            {category === 'all' ? t("filter.allCategories") : category}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    </div>
  )
}
