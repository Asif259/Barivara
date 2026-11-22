"use client";

import * as React from "react";
import { RiArrowRightSLine } from "@remixicon/react";
import { cx } from "@/utils/cx";
import { Skeleton } from "@/components/ui/skeleton";

interface MobileDataRowProps extends React.HTMLAttributes<HTMLDivElement> {
  identity: React.ReactNode;
  value?: React.ReactNode;
  stateAndDetail?: React.ReactNode;
  action?: React.ReactNode;
  onClick?: () => void;
  showChevron?: boolean;
}

export function MobileDataRow({
  identity,
  value,
  stateAndDetail,
  action,
  onClick,
  showChevron = false,
  className,
  ...props
}: MobileDataRowProps) {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className={cx(
        "group relative flex flex-col justify-center px-4 py-3 border-b border-border-separator-border bg-background-primary-default transition-colors",
        onClick && "cursor-pointer hover:bg-background-secondary-hover active:bg-background-secondary-default select-none",
        className
      )}
      {...props}
    >
      {/* LINE 1: Primary Identity (Left) & Primary Value (Right) */}
      <div className="flex items-baseline justify-between gap-3 min-w-0">
        <div className="text-body-medium font-medium text-text-primary truncate flex-1 leading-snug">
          {identity}
        </div>
        {value !== undefined && value !== null && (
          <div className="text-body-medium font-semibold text-text-primary shrink-0 tabular-nums text-right ml-2">
            {value}
          </div>
        )}
      </div>

      {/* LINE 2: State/Badge + Labeled Detail (Left) & Action / Chevron (Right) */}
      <div className="flex items-center justify-between gap-3 min-w-0 mt-1.5 text-caption-1-semibold text-text-secondary">
        <div className="flex items-center gap-2 truncate flex-1 min-w-0">
          {stateAndDetail}
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          {action}
          {showChevron && (
            <RiArrowRightSLine className="size-4 text-foreground-icon-tertiary transition-transform group-hover:translate-x-0.5" />
          )}
        </div>
      </div>
    </div>
  );
}

export function MobileDataRowSkeleton() {
  return (
    <div className="flex flex-col justify-center px-4 py-3.5 border-b border-border-separator-border bg-background-primary-default space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
    </div>
  );
}

export function MobileTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y divide-border-separator-border bg-background-primary-default rounded-2xl border border-border-table overflow-hidden">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="px-4 py-3 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-4 w-36 rounded-md" />
            <Skeleton className="h-4 w-20 rounded-md" />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Skeleton className="size-2 rounded-full" />
              <Skeleton className="h-3 w-28 rounded-md" />
            </div>
            <Skeleton className="h-4 w-6 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CompactStatus({
  label,
  variant = "neutral",
}: {
  label: string;
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
}) {
  const dotColor = {
    success: "bg-status-success",
    warning: "bg-status-warning",
    danger: "bg-status-error",
    info: "bg-status-info",
    neutral: "bg-text-tertiary",
  }[variant];

  const textColor = {
    success: "text-status-success",
    warning: "text-status-warning",
    danger: "text-text-error-primary",
    info: "text-status-info",
    neutral: "text-text-secondary",
  }[variant];

  return (
    <span className={cx("inline-flex items-center gap-1.5 font-medium text-caption-1-semibold", textColor)}>
      <span className={cx("size-1.5 rounded-full shrink-0", dotColor)} />
      <span>{label}</span>
    </span>
  );
}

export function MobileDataRowEmpty({
  message = "কোনো তথ্য পাওয়া যায়নি",
  action,
}: {
  message?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-background-primary-default border-b border-border-separator-border space-y-2">
      <p className="text-body-medium font-medium text-text-secondary">{message}</p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

export function ResponsiveTableContainer({
  children,
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        "table-container w-full rounded-2xl border border-border-table bg-background-primary-default overflow-hidden shadow-xs",
        className
      )}
      style={{ containerType: "inline-size" }}
    >
      {children}
    </div>
  );
}

interface ResponsiveTableProps {
  desktopContent: React.ReactNode;
  mobileContent: React.ReactNode;
  className?: string;
}

export function ResponsiveTable({
  desktopContent,
  mobileContent,
  className,
}: ResponsiveTableProps) {
  return (
    <div className={cx("w-full", className)}>
      <div className="hidden md:block">{desktopContent}</div>
      <div className="block md:hidden rounded-2xl border border-border-table bg-background-primary-default overflow-hidden divide-y divide-border-separator-border shadow-xs">
        {mobileContent}
      </div>
    </div>
  );
}
