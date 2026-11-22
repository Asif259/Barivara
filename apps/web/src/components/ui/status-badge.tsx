import React from "react";
import { UnitStatus, RentStatus, AgreementStatus, PaymentStatus } from "@/lib/types";
import { Chip } from "@/components/base/badges/chip";
import { StatusDot } from "@/components/base/badges/status-dot";

interface StatusBadgeProps {
  status: UnitStatus | RentStatus | AgreementStatus | PaymentStatus | string;
  lang?: "bn" | "en";
}

export function StatusBadge({ status, lang = "bn" }: StatusBadgeProps) {
  const isEn = lang === "en";

  switch (status) {
    case "PAID":
      return (
        <Chip color="lime" className="gap-1.5">
          <StatusDot color="green" />
          {isEn ? "Paid" : "পরিশোধিত"}
        </Chip>
      );
    case "PARTIAL":
      return (
        <Chip color="yellow" className="gap-1.5">
          <StatusDot color="yellow" />
          {isEn ? "Partial" : "আংশিক পরিশোধ"}
        </Chip>
      );
    case "PENDING":
      return (
        <Chip color="neutral" className="gap-1.5">
          <StatusDot color="indigo" />
          {isEn ? "Pending" : "অপেক্ষমান"}
        </Chip>
      );
    case "OVERDUE":
      return (
        <Chip color="rose" className="gap-1.5">
          <span className="size-1.5 rounded-full bg-status-error" />
          {isEn ? "Overdue" : "মেয়াদোত্তীর্ণ"}
        </Chip>
      );
    case "CANCELLED":
      return (
        <Chip color="neutral">
          {isEn ? "Cancelled" : "বাতিল"}
        </Chip>
      );
    case "VACANT":
      return (
        <Chip color="cyan" className="gap-1.5">
          <StatusDot color="indigo" />
          {isEn ? "Vacant" : "খালি"}
        </Chip>
      );
    case "OCCUPIED":
      return (
        <Chip color="lime" className="gap-1.5">
          <StatusDot color="green" />
          {isEn ? "Occupied" : "ভাড়া দেওয়া"}
        </Chip>
      );
    case "MAINTENANCE":
      return (
        <Chip color="yellow" className="gap-1.5">
          <StatusDot color="yellow" />
          {isEn ? "Maintenance" : "মেরামত"}
        </Chip>
      );
    case "ACTIVE":
      return (
        <Chip color="lime" className="gap-1.5">
          <StatusDot color="green" />
          {isEn ? "Active" : "সক্রিয়"}
        </Chip>
      );
    case "ENDED":
      return (
        <Chip color="neutral">
          {isEn ? "Ended" : "সমাপ্ত"}
        </Chip>
      );
    case "COMPLETED":
      return (
        <Chip color="lime" className="gap-1.5">
          <StatusDot color="green" />
          {isEn ? "Completed" : "সম্পন্ন"}
        </Chip>
      );
    case "REVERSED":
      return (
        <Chip color="rose" className="line-through gap-1.5">
          <span className="size-1.5 rounded-full bg-status-error" />
          {isEn ? "Reversed" : "রিভার্সড (বাতিল)"}
        </Chip>
      );
    default:
      return (
        <Chip color="neutral">
          {status}
        </Chip>
      );
  }
}
