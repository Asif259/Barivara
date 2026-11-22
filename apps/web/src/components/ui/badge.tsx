import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cx } from "@/utils/cx";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-caption-1-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-border-focus-ring",
  {
    variants: {
      variant: {
        default:
          "bg-background-secondary-default text-text-primary border border-border-button-default",
        secondary:
          "bg-background-secondary-default text-text-secondary border border-border-button-default",
        destructive:
          "bg-status-error/10 text-text-error-primary border border-status-error/20",
        warning:
          "bg-status-warning/10 text-status-warning border border-status-warning/20",
        info:
          "bg-status-info/10 text-status-info border border-status-info/20",
        outline:
          "border border-border-button-default text-text-secondary bg-background-primary-default",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cx(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
