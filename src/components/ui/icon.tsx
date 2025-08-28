import * as React from "react"
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Camera,
  Calculator,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  CircleUser,
  Clock,
  CreditCard,
  DollarSign,
  File,
  FileText,
  LayoutDashboard,
  Landmark,
  Lightbulb,
  Loader2,
  Menu,
  Moon,
  PanelLeft,
  Percent,
  PiggyBank,
  PlusCircle,
  Repeat,
  ScanLine,
  Search,
  Settings,
  Sparkles,
  Sun,
  Target,
  TrendingDown,
  TrendingUp,
  Upload,
  Wand2,
  Wallet,
  X,
  Scale,
} from "lucide-react"

const icons = {
  arrowDownLeft: ArrowDownLeft,
  arrowLeft: ArrowLeft,
  arrowLeftRight: ArrowLeftRight,
  arrowRight: ArrowRight,
  arrowUpRight: ArrowUpRight,
  calendar: Calendar,
  camera: Camera,
  calculator: Calculator,
  check: Check,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronUp: ChevronUp,
  circle: Circle,
  circleUser: CircleUser,
  clock: Clock,
  creditCard: CreditCard,
  dollarSign: DollarSign,
  file: File,
  fileText: FileText,
  layoutDashboard: LayoutDashboard,
  landmark: Landmark,
  lightbulb: Lightbulb,
  loader2: Loader2,
  menu: Menu,
  moon: Moon,
  panelLeft: PanelLeft,
  percent: Percent,
  piggyBank: PiggyBank,
  plusCircle: PlusCircle,
  repeat: Repeat,
  scanLine: ScanLine,
  search: Search,
  settings: Settings,
  sparkles: Sparkles,
  sun: Sun,
  target: Target,
  trendingDown: TrendingDown,
  trendingUp: TrendingUp,
  upload: Upload,
  wand2: Wand2,
  wallet: Wallet,
  x: X,
  scale: Scale,
}

export type IconName = keyof typeof icons

export interface IconProps
  extends Omit<React.SVGProps<SVGSVGElement>, "color" | "width" | "height"> {
  name: IconName
  size?: number | string
  color?: string
  label?: string
}

export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ name, size = 24, color = "currentColor", label, className, ...props }, ref) => {
    const LucideIcon = icons[name]

    if (!LucideIcon) {
      return null
    }

    return (
      <LucideIcon
        ref={ref}
        width={size}
        height={size}
        color={color}
        strokeWidth={1.5}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        role="img"
        className={className}
        {...props}
      />
    )
  },
)
Icon.displayName = "Icon"

export const IconRegistry = icons
