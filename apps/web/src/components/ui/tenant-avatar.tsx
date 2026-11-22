'use client';

import React from 'react';
import { useFileDownloadUrl } from '@/hooks/use-file-download-url';
import { cx } from '@/utils/cx';

interface TenantAvatarProps {
  profilePictureId: string | undefined | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
}

const sizeClasses = {
  sm: 'size-7 text-caption-1-semibold',
  md: 'size-9 text-body-medium',
  lg: 'size-12 text-headline-medium',
};

export function TenantAvatar({ profilePictureId, name, size = 'md', onClick, disabled, ariaLabel }: TenantAvatarProps) {
  const { data: imageUrl, isLoading } = useFileDownloadUrl(profilePictureId);

  const fallback = name.charAt(0).toUpperCase();

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isLoading || !imageUrl}
      className={cx(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border-button-default bg-background-secondary-default font-semibold text-text-primary disabled:cursor-default transition-transform hover:scale-105 active:scale-95',
        sizeClasses[size]
      )}
      aria-label={ariaLabel}
    >
      {isLoading ? (
        <div className="size-full animate-pulse bg-background-secondary-hover" />
      ) : imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- Dynamic presigned Supabase storage URL
        <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        fallback
      )}
    </button>
  );
}
