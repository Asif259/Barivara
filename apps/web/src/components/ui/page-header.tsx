import React from 'react';
import { cx } from '@/utils/cx';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cx("flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-border-separator-border mb-6", className)}>
      <div>
        <h1 className="text-title-1-medium font-semibold tracking-tight text-text-primary text-balance">{title}</h1>
        {description && (
          <p className="text-body-regular text-text-secondary mt-1.5 text-pretty max-w-2xl">{description}</p>
        )}
      </div>
      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  );
}
