import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 uppercase tracking-wider shadow-sm",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-[#F36E21] to-[#EC5E25] text-white hover:from-[#EC5E25] hover:to-[#D94A1E] shadow-md",
        secondary:
          "border-transparent bg-gradient-to-r from-[#7A1F14] to-[#5A1810] text-white hover:from-[#5A1810] hover:to-[#3A100A] shadow-md",
        destructive:
          "border-transparent bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-md",
        outline: "text-[#F36E21] border-2 border-[#F36E21] bg-white hover:bg-orange-50",
        success: "border-transparent bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-md",
        warning: "border-transparent bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-700 hover:to-amber-800 shadow-md",
        info: "border-transparent bg-gradient-to-r from-[#F36E21] to-[#EC5E25] text-white hover:from-[#EC5E25] hover:to-[#D94A1E] shadow-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
