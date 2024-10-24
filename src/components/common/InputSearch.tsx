import * as React from "react"

import { cn } from "@/lib/utils"
import { FaSearch } from "react-icons/fa"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const InputSearch = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <div className={cn(
        "relative",
        className
      )}>
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        )}
        ref={ref}
        {...props}
      />
      <FaSearch className="absolute top-3 right-3 text-gray-500" />
      </div>
    )
  }
)
InputSearch.displayName = "InputSearch"

export { InputSearch }
