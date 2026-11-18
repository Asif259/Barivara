import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from './card';
import { LucideIcon, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  comparisonLabel?: string;
  badge?: {
    text: string;
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  };
  valueClassName?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-[#12664F]',
  iconBgColor = 'bg-[#E8F3EF]',
  trend,
  comparisonLabel = 'vs last month',
  badge,
  valueClassName,
  href,
  onClick,
  className,
}: StatCardProps) {
  const content = (
    <Card
      className={cn(
        'group relative overflow-hidden rounded-[10px] border-[#E5E7EB] bg-white shadow-none transition-all duration-200',
        (href || onClick) && 'cursor-pointer hover:border-[#10B981]/50 hover:shadow-sm active:scale-[0.99]',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-medium text-[#6B7280] truncate">{title}</p>
              {badge && (
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums border',
                    badge.variant === 'danger' && 'border-red-200 bg-red-50 text-red-700',
                    badge.variant === 'warning' && 'border-amber-200 bg-amber-50 text-amber-700',
                    badge.variant === 'success' && 'border-emerald-200 bg-emerald-50 text-emerald-700',
                    badge.variant === 'info' && 'border-blue-200 bg-blue-50 text-blue-700',
                    (!badge.variant || badge.variant === 'neutral') && 'border-gray-200 bg-gray-50 text-gray-600'
                  )}
                >
                  {badge.text}
                </span>
              )}
            </div>
            <h3
              className={cn(
                'text-2xl font-semibold tracking-tight text-[#171717] tabular-nums',
                valueClassName
              )}
            >
              {value}
            </h3>
            {subtitle && (
              <p className="text-xs text-[#6B7280] truncate" title={subtitle}>
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] transition-colors',
                iconBgColor
              )}
            >
              <Icon className={cn('h-4 w-4', iconColor)} />
            </div>
            {href && (
              <ArrowUpRight className="h-4 w-4 text-[#9CA3AF] opacity-0 transition-all duration-150 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            )}
          </div>
        </div>

        {trend && (
          <div className="mt-4 flex items-center gap-1.5 text-xs">
            <span
              className={cn(
                'font-semibold tabular-nums',
                trend.isPositive ? 'text-[#15803D]' : 'text-[#DC2626]'
              )}
            >
              {trend.value}
            </span>
            <span className="text-[#9CA3AF]">{trend.label || comparisonLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] rounded-[10px]">
        {content}
      </Link>
    );
  }

  return content;
}
