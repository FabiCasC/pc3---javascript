import { cn } from "@/lib/utils"

interface CategoryBadgeProps {
  category: "illustration" | "design" | "photography" | "concept-art" | "drawing"
  className?: string
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const categoryColors = {
    illustration: "bg-purple-500/10 text-purple-600 border-purple-200",
    design: "bg-blue-500/10 text-blue-600 border-blue-200",
    photography: "bg-amber-500/10 text-amber-600 border-amber-200",
    "concept-art": "bg-rose-500/10 text-rose-600 border-rose-200",
    drawing: "bg-green-500/10 text-green-600 border-green-200",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border",
        categoryColors[category],
        className,
      )}
    >
      {category
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")}
    </span>
  )
}
