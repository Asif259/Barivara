import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cx } from "@/utils/cx";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-body-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-800 shadow-xs",
        destructive:
          "bg-text-error-primary text-white hover:opacity-90 active:opacity-100 shadow-xs",
        outline:
          "border border-border-button-default bg-background-primary-default text-text-primary hover:bg-background-secondary-hover hover:border-border-button-hover active:bg-background-secondary-default shadow-xs",
        secondary:
          "border border-border-button-default bg-background-secondary-default text-text-primary hover:bg-background-secondary-hover active:bg-background-tertiary-default",
        ghost:
          "text-text-secondary hover:bg-background-secondary-hover hover:text-text-primary",
        link:
          "text-accent-700 underline-offset-4 hover:underline hover:text-accent-800",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-caption-1-semibold",
        lg: "h-11 rounded-xl px-8 text-headline-medium",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cx(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
