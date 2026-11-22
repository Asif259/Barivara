import * as React from "react";
import { cx } from "@/utils/cx";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cx(
          "flex h-10 w-full rounded-xl border border-border-button-default bg-background-primary-default px-3.5 py-2 text-body-medium text-text-primary ring-offset-background-primary-default file:border-0 file:bg-transparent file:text-caption-1-semibold file:font-medium placeholder:text-text-placeholder focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring focus-visible:border-border-button-hover disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-150 shadow-2xs",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
