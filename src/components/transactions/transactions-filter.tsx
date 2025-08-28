
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

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

  return (
    <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
            type="search"
            placeholder="Search by description..."
            aria-label="Search transactions"
            className="pl-8"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            />
        </div>
        <div className="flex gap-4">
            <Select value={filterType} onValueChange={onTypeChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Income">Income</SelectItem>
                    <SelectItem value="Expense">Expense</SelectItem>
                </SelectContent>
            </Select>
            <Select value={filterCategory} onValueChange={onCategoryChange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                    {categories.map(category => (
                         <SelectItem key={category} value={category} className="capitalize">
                            {category === 'all' ? 'All Categories' : category}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    </div>
  )
}
