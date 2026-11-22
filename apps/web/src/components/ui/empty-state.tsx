import React from 'react';
import { RiFolderOpenLine } from '@remixicon/react';
import { Button } from './button';
import { cx } from '@/utils/cx';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = RiFolderOpenLine,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cx("flex flex-col items-center justify-center p-10 text-center rounded-3xl border border-dashed border-border-button-default bg-background-secondary-default/50", className)}>
      <div className="flex size-12 items-center justify-center rounded-2xl bg-background-primary-default border border-border-button-default text-foreground-icon-secondary mb-4 shadow-xs">
        <Icon className="size-6" />
      </div>
      <h3 className="text-title-3-semibold text-text-primary mb-1">{title}</h3>
      {description && (
        <p className="text-body-regular text-text-secondary max-w-sm mb-6">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="default">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
