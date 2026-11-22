'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { RiLoader4Line, RiImageLine } from '@remixicon/react';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';

interface ImagePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string | null;
  title?: string;
}

export function ImagePreviewDialog({
  open,
  onOpenChange,
  imageUrl,
  title,
}: ImagePreviewDialogProps) {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';

  const [loadedUrl, setLoadedUrl] = React.useState<string | null>(null);
  const [hasError, setHasError] = React.useState(false);
  const [prevUrl, setPrevUrl] = React.useState<string | null>(null);

  if (open && imageUrl !== prevUrl) {
    setPrevUrl(imageUrl);
    setHasError(false);
  }

  const isCurrentLoaded = open && imageUrl ? loadedUrl === imageUrl : true;
  const isLoading = open && !!imageUrl && !isCurrentLoaded && !hasError;

  const handleImageLoad = () => {
    setLoadedUrl(imageUrl || null);
    setHasError(false);
  };

  const handleImageError = () => {
    setHasError(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          w-[calc(100%-2rem)]
          max-w-5xl
          h-auto
          max-h-[90vh]
          p-0
          overflow-hidden
          bg-background-primary-default
          border-border-button-default
        "
      >
        <div className="p-4 border-b border-border-separator-border">
          <DialogTitle className="text-title-3-semibold text-text-primary truncate">
            {title || t.imagePreview}
          </DialogTitle>
        </div>

        {/* Image Area */}
        <div
          className="
            relative
            flex
            items-center
            justify-center
            w-full
            min-h-[300px]
            max-h-[calc(90vh-64px)]
            p-4
            sm:p-6
            bg-background-secondary-default
            overflow-auto
          "
        >
          {/* Loading */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background-secondary-default z-10">
              <RiLoader4Line className="size-8 animate-spin text-accent-900" />
              <p className="mt-3 text-body-medium text-text-secondary">
                {isEn ? 'Loading image...' : 'ছবি লোড হচ্ছে...'}
              </p>
            </div>
          )}

          {/* Error */}
          {hasError && (
            <div className="flex flex-col items-center justify-center text-center px-6 py-12">
              <div className="size-16 rounded-full bg-status-warning/10 flex items-center justify-center mb-4">
                <RiImageLine className="size-8 text-status-warning" />
              </div>
              <p className="text-body-medium font-medium text-text-primary">
                {t.imageLoadError}
              </p>
              <p className="text-caption-1-semibold text-text-secondary mt-1">
                {isEn
                  ? 'The image could not be loaded.'
                  : 'ছবিটি লোড করা সম্ভব হয়নি।'}
              </p>
            </div>
          )}

          {/* No Image */}
          {!imageUrl && !hasError && !isLoading && (
            <div className="flex flex-col items-center justify-center text-center px-6 py-12">
              <div className="size-16 rounded-full bg-background-secondary-default border border-border-button-default flex items-center justify-center mb-4">
                <RiImageLine className="size-8 text-foreground-icon-tertiary" />
              </div>
              <p className="text-body-medium font-medium text-text-secondary">
                {t.noImageAvailable}
              </p>
            </div>
          )}

          {/* Image */}
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- Dynamic presigned Supabase storage URL
            <img
              key={imageUrl}
              src={imageUrl}
              alt={title || 'Image preview'}
              onLoad={handleImageLoad}
              onError={handleImageError}
              className={`
                block
                max-w-full
                max-h-[calc(90vh-112px)]
                w-auto
                h-auto
                object-contain
                rounded-xl
                shadow-sm
                transition-opacity
                duration-200
                ${isLoading || hasError ? 'opacity-0' : 'opacity-100'}
              `}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
