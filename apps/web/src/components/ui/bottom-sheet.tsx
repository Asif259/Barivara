"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { RiCloseLine } from "@remixicon/react";
import { cx } from "@/utils/cx";

const BottomSheet = DialogPrimitive.Root;
const BottomSheetTrigger = DialogPrimitive.Trigger;
const BottomSheetPortal = DialogPrimitive.Portal;
const BottomSheetClose = DialogPrimitive.Close;

const BottomSheetOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cx(
      "fixed inset-0 z-50 bg-background-full/60 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
BottomSheetOverlay.displayName = DialogPrimitive.Overlay.displayName;

const BottomSheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <BottomSheetPortal>
    <BottomSheetOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cx(
        // Mobile: Bottom sheet slide-up
        "fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-border-button-default bg-background-primary-default p-5 shadow-2xl duration-200 text-text-primary",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        // Desktop / Tablet: Centered modal dialog
        "sm:bottom-auto sm:top-[50%] sm:left-[50%] sm:max-w-lg sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-3xl sm:border sm:border-border-button-default",
        "sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:slide-out-to-left-1/2 sm:data-[state=closed]:slide-out-to-top-[48%] sm:data-[state=open]:slide-in-from-left-1/2 sm:data-[state=open]:slide-in-from-top-[48%]",
        className
      )}
      {...props}
    >
      {/* Mobile drag handle */}
      <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-border-separator-border sm:hidden" />
      
      {children}

      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-lg p-2 text-foreground-icon-secondary hover:bg-background-secondary-hover hover:text-foreground-icon-primary focus:outline-none min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer">
        <RiCloseLine className="size-5" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </BottomSheetPortal>
));
BottomSheetContent.displayName = DialogPrimitive.Content.displayName;

const BottomSheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      "flex flex-col space-y-1 pb-3 text-left border-b border-border-separator-border",
      className
    )}
    {...props}
  />
);
BottomSheetHeader.displayName = "BottomSheetHeader";

const BottomSheetTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cx(
      "text-title-3-semibold leading-tight tracking-tight text-text-primary",
      className
    )}
    {...props}
  />
));
BottomSheetTitle.displayName = DialogPrimitive.Title.displayName;

const BottomSheetDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cx("text-caption-1-semibold text-text-secondary", className)}
    {...props}
  />
));
BottomSheetDescription.displayName = DialogPrimitive.Description.displayName;

const BottomSheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cx(
      "flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t border-border-separator-border mt-4",
      className
    )}
    {...props}
  />
);
BottomSheetFooter.displayName = "BottomSheetFooter";

export function DetailItem({
  label,
  value,
  isNumeric = false,
  highlight = false,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  isNumeric?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border-separator-border last:border-0 text-body-medium">
      <span className="text-text-secondary text-caption-1-semibold">{label}</span>
      <span
        className={cx(
          "text-text-primary font-medium text-right",
          isNumeric && "tabular-nums font-semibold",
          highlight && "text-status-success font-semibold"
        )}
      >
        {value ?? "—"}
      </span>
    </div>
  );
}

export {
  BottomSheet,
  BottomSheetTrigger,
  BottomSheetPortal,
  BottomSheetOverlay,
  BottomSheetClose,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetFooter,
  BottomSheetTitle,
  BottomSheetDescription,
};
