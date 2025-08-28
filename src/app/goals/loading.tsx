import { Icon } from "@/components/ui/icon"

export default function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Icon
        name="loader2"
        size={32}
        className="animate-spin text-muted-foreground"
      />
    </div>
  )
}
