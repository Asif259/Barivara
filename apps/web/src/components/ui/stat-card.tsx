import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from './card';
import { RiArrowRightUpLine } from '@remixicon/react';
import { cx } from '@/utils/cx';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: any;
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
  iconColor,
  iconBgColor,
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
      className={cx(
        'group relative overflow-hidden rounded-3xl border-border-button-default bg-background-primary-default shadow-xs transition-all duration-200',
        (href || onClick) && 'cursor-pointer hover:border-accent-900/50 hover:shadow-sm active:scale-[0.99]',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-caption-1-semibold text-text-secondary truncate">{title}</p>
              {badge && (
                <span
                  className={cx(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-caption-1-semibold',
                    badge.variant === 'success' && 'bg-status-success/10 text-status-success',
                    badge.variant === 'warning' && 'bg-status-warning/10 text-status-warning',
                    badge.variant === 'danger' && 'bg-status-error/10 text-text-error-primary',
                    badge.variant === 'info' && 'bg-status-info/10 text-status-info',
                    (!badge.variant || badge.variant === 'neutral') && 'bg-background-secondary-default text-text-secondary'
                  )}
                >
                  {badge.text}
                </span>
              )}
            </div>
            <p className={cx('text-title-1-medium text-text-primary tracking-tight font-semibold tabular-nums', valueClassName)}>
              {value}
            </p>
          </div>

          {Icon && (
            <div
              className={cx(
                'flex size-10 shrink-0 items-center justify-center rounded-2xl bg-background-secondary-default text-foreground-icon-primary transition-transform group-hover:scale-105',
                iconBgColor,
                iconColor
              )}
            >
              <Icon className="size-5" />
            </div>
          )}
        </div>

        {(trend || subtitle) && (
          <div className="mt-3 flex items-center gap-2 pt-2 border-t border-border-separator-border text-caption-1-semibold">
            {trend && (
              <span
                className={cx(
                  'inline-flex items-center gap-0.5 font-medium',
                  trend.isPositive ? 'text-status-success' : 'text-text-error-primary'
                )}
              >
                <RiArrowRightUpLine
                  className={cx('size-3.5', !trend.isPositive && 'rotate-90')}
                />
                {trend.value}
              </span>
            )}
            <span className="text-text-tertiary truncate">
              {subtitle || (trend?.label ? `${comparisonLabel}` : '')}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-border-focus-ring rounded-3xl">
        {content}
      </Link>
    );
  }

  return content;
}
