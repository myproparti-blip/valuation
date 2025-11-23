import * as React from "react"
import { cn } from "../../lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
    const hasValue = props.value && props.value.toString().length > 0;
    
    return (
        <input
            type={type}
            className={cn(
                "flex h-11 w-full rounded-lg border-2 border-[#E5E7EB] bg-white px-4 py-2 text-base ring-offset-background placeholder:text-[#9CA3AF] focus-visible:outline-none focus-visible:border-[#F36E21] focus-visible:ring-2 focus-visible:ring-[#F36E21]/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed md:text-sm font-medium transition-all duration-200 shadow-sm text-[#3A3A3A]",
                !hasValue && "disabled:opacity-50 disabled:bg-[#F9FAFB]",
                hasValue && "disabled:opacity-100 disabled:bg-orange-50 disabled:border-orange-300",
                className
            )}
            ref={ref}
            {...props}
        />
    );
})
Input.displayName = "Input"

export { Input }
