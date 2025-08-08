import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

const statusBadgeVariants = cva(
  "inline-flex items-center gap-x-2.5 rounded-full border px-2 py-1 text-xs font-medium",
  {
    variants: {
      status: {
        success: "border-gray-300 bg-gray-100 text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200",
        error: "border-gray-300 bg-gray-100 text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200",
        default: "border-gray-300 bg-gray-100 text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200",
      },
    },
    defaultVariants: {
      status: "default",
    },
  }
)

interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  leftIcon?: LucideIcon
  rightIcon?: LucideIcon
  leftLabel: string
  rightLabel: string
}

export function StatusBadge({
  className,
  status,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  leftLabel,
  rightLabel,
  ...props
}: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ status }), className)} {...props}>
      <span className="inline-flex items-center gap-1.5 font-medium">
        {LeftIcon && (
          <LeftIcon 
            className={cn(
              "w-3 h-3 shrink-0 text-gray-700 dark:text-gray-300"
            )} 
            aria-hidden={true}
          />
        )}
        {leftLabel}
      </span>
      <span className="h-3 w-px bg-gray-300 dark:bg-gray-600" />
      <span className="inline-flex items-center gap-1.5">
        {RightIcon && (
          <RightIcon 
            className="w-3 h-3 shrink-0 text-gray-700 dark:text-gray-300" 
            aria-hidden={true}
          />
        )}
        {rightLabel}
      </span>
    </span>
  )
}