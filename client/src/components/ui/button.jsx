import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-3xl text-sm font-bold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-md hover:shadow-lg",
    {
        variants: {
            variant: {
                default: "bg-gradient-to-br from-[#F36E21] to-[#EC5E25] text-white hover:from-[#EC5E25] hover:to-[#D94A1E] active:from-[#D94A1E] active:to-[#C13F1A] transform hover:-translate-y-0.5",
                destructive:
                    "bg-gradient-to-br from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 active:from-red-800 active:to-red-900 transform hover:-translate-y-0.5",
                outline:
                    "border-2 border-[#F36E21] bg-white text-[#F36E21] hover:bg-orange-50 hover:border-[#EC5E25] active:bg-orange-100",
                secondary:
                    "bg-gradient-to-br from-[#7A1F14] to-[#5A1810] text-white hover:from-[#5A1810] hover:to-[#3A100A] active:from-[#3A100A] active:to-[#2A0A05] transform hover:-translate-y-0.5",
                ghost: "hover:bg-orange-100 text-[#F36E21] hover:text-[#EC5E25]",
                link: "text-[#F36E21] underline-offset-4 hover:underline hover:text-[#EC5E25] font-bold",
                success: "bg-gradient-to-br from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 active:from-green-800 active:to-green-900 transform hover:-translate-y-0.5",
            },
            size: {
                default: "h-10 px-8 py-2",
                sm: "h-9 rounded-2xl px-4 text-sm",
                lg: "h-12 rounded-3xl px-10 text-base font-bold",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

const Button = React.forwardRef(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
