import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61E0] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-[#4A2C8C] to-[#7B61E0] text-white hover:from-[#3a1f6b] hover:to-[#6b4fd1] shadow-lg hover:shadow-xl",
        destructive:
          "bg-[#ef4444] text-white hover:bg-[#dc2626] shadow-lg hover:shadow-xl",
        outline:
          "border border-[#e5e7eb] bg-white hover:bg-[#f8f9fa] hover:border-[#7B61E0] text-[#1a1a1a]",
        secondary:
          "bg-[#7B61E0] text-white hover:bg-[#6b4fd1] shadow-lg hover:shadow-xl",
        ghost: "hover:bg-[#f8f9fa] hover:text-[#4A2C8C] text-[#6b7280]",
        link: "text-[#4A2C8C] underline-offset-4 hover:underline hover:text-[#7B61E0]",
        accent: "bg-[#32C896] text-white hover:bg-[#2bb085] shadow-lg hover:shadow-xl",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
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
