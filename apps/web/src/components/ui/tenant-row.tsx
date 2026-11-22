'use client';

import React from 'react';
import Link from 'next/link';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { TenantAvatar } from '@/components/ui/tenant-avatar';
import { useFileDownloadUrl } from '@/hooks/use-file-download-url';
import { Tenant } from '@/lib/types';
import { formatBnDate } from '@/lib/utils';
import {
  RiPhoneLine,
  RiMailLine,
  RiBriefcaseLine,
  RiEditLine,
  RiDeleteBinLine,
  RiExternalLinkLine,
} from '@remixicon/react';

interface TenantRowProps {
  tenant: Tenant;
  language: 'bn' | 'en';
  onEdit: (tenant: Tenant) => void;
  onDelete: (id: string, name: string) => void;
  onPreview: (url: string | null, title: string) => void;
}

export function TenantRow({ tenant, language, onEdit, onDelete, onPreview }: TenantRowProps) {
  const isEn = language === 'en';
  const { data: imageUrl } = useFileDownloadUrl(tenant.profilePictureId);

  return (
    <TableRow>
      <TableCell className="min-w-[220px]">
        <div className="flex items-center gap-2.5">
          <TenantAvatar
            profilePictureId={tenant.profilePictureId}
            name={tenant.name}
            size="sm"
            onClick={() => onPreview(imageUrl || null, tenant.name)}
            ariaLabel={isEn ? 'View profile picture' : 'প্রোফাইল ছবি দেখুন'}
          />
          <div className="min-w-0 max-w-[170px]">
            <p className="truncate font-medium text-text-primary text-body-medium" title={tenant.name}>
              {tenant.name}
            </p>
            <p className="truncate text-caption-1-semibold text-text-secondary" title={tenant.phone || ''}>
              {tenant.phone || '—'}
            </p>
          </div>
        </div>
      </TableCell>
      <TableCell align="left" className="text-caption-1-semibold text-text-secondary whitespace-nowrap">
        <span className="inline-flex items-center gap-1.5">
          <RiPhoneLine className="size-3.5 text-foreground-icon-tertiary" />
          <span>{tenant.phone || '—'}</span>
        </span>
      </TableCell>
      <TableCell align="left" className="text-caption-1-semibold text-text-secondary">
        <span className="inline-flex items-center gap-1.5 truncate max-w-[200px]" title={tenant.email || ''}>
          <RiMailLine className="size-3.5 shrink-0 text-foreground-icon-tertiary" />
          <span className="truncate">{tenant.email || '—'}</span>
        </span>
      </TableCell>
      <TableCell align="left" className="text-caption-1-semibold text-text-secondary">
        <span className="inline-flex items-center gap-1.5 truncate max-w-[160px]" title={tenant.occupation || ''}>
          <RiBriefcaseLine className="size-3.5 shrink-0 text-foreground-icon-tertiary" />
          <span className="truncate">{tenant.occupation || '—'}</span>
        </span>
      </TableCell>
      <TableCell align="left" className="text-caption-1-semibold text-text-secondary whitespace-nowrap">
        {formatBnDate(tenant.createdAt, language)}
      </TableCell>
      <TableCell align="right">
        <div className="flex items-center justify-end gap-1">
          <Link href={`/tenants/${tenant.id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0"
              title={isEn ? 'View Details' : 'বিস্তারিত দেখুন'}
            >
              <RiExternalLinkLine className="size-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="size-8 p-0"
            onClick={() => onEdit(tenant)}
            title={isEn ? 'Edit' : 'সম্পাদনা'}
          >
            <RiEditLine className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="size-8 p-0 text-text-error-primary hover:bg-status-error/10"
            onClick={() => onDelete(tenant.id, tenant.name)}
            title={isEn ? 'Delete' : 'মুছুন'}
          >
            <RiDeleteBinLine className="size-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
