import * as React from "react";
import { cx } from "@/utils/cx";
import { Skeleton } from "@/components/ui/skeleton";

export const EMPTY_VALUE = "—";

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  containerClassName?: string;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, containerClassName, ...props }, ref) => (
    <div
      className={cx(
        "table-container relative w-full overflow-x-auto rounded-2xl border border-border-table bg-background-primary-default shadow-xs",
        containerClassName
      )}
    >
      <table
        ref={ref}
        className={cx("w-full caption-bottom text-body-medium data-table text-text-primary", className)}
        {...props}
      />
    </div>
  )
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cx(
      "bg-background-secondary-default border-b border-border-table text-caption-1-semibold text-text-secondary",
      className
    )}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cx("[&_tr:last-child]:border-0 divide-y divide-border-separator-border", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cx(
      "border-t border-border-table bg-background-secondary-default font-medium text-text-primary",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cx(
      "border-b border-border-separator-border transition-colors hover:bg-background-secondary-hover data-[state=selected]:bg-background-secondary-default",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cx(
      "h-11 px-4 text-left align-middle font-medium text-text-secondary [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cx("p-4 align-middle text-text-primary [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cx("mt-4 text-caption-1-semibold text-text-tertiary", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export function TableLoadingRows({
  columns = 5,
  rows = 4,
}: {
  columns?: number;
  rows?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <TableRow key={`loading-row-${r}`}>
          {Array.from({ length: columns }).map((__, c) => (
            <TableCell key={`loading-cell-${r}-${c}`}>
              <Skeleton className="h-4 w-full max-w-[120px]" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function TableSkeleton({
  columns,
  rows = 5,
}: {
  columns: number;
  rows?: number;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <TableRow key={r} className="hover:bg-transparent">
          {Array.from({ length: columns }).map((_, c) => (
            <TableCell key={c} className="py-3">
              <Skeleton
                className={cx(
                  "h-4 rounded-md",
                  c === 0
                    ? "w-28 sm:w-36"
                    : c === columns - 1
                    ? "w-16 ml-auto"
                    : "w-20"
                )}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function TableEmptyState({
  colSpan,
  message = "কোনো তথ্য পাওয়া যায়নি",
  description,
  action,
}: {
  colSpan: number;
  message?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-48 text-center">
        <div className="flex flex-col items-center justify-center space-y-1.5 py-6">
          <p className="text-body-medium font-medium text-text-secondary">{message}</p>
          {description && (
            <p className="text-caption-1-semibold text-text-tertiary">{description}</p>
          )}
          {action && <div className="pt-2">{action}</div>}
        </div>
      </TableCell>
    </TableRow>
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
