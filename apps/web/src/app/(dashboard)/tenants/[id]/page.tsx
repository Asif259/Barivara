'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { Tenant, RentalAgreement, ApiResponse } from '@/lib/types';
import { formatCurrency, formatBnDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import {
  ResponsiveTableContainer,
  MobileDataRow,
  CompactStatus,
} from '@/components/ui/responsive-table';
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetDescription,
  BottomSheetFooter,
  DetailItem,
} from '@/components/ui/bottom-sheet';
import { TenantFormDialog } from '@/components/tenants/tenant-form-dialog';
import { ImagePreviewDialog } from '@/components/ui/image-preview-dialog';
import { getFileDownloadUrl } from '@/lib/file-upload';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  RiArrowLeftLine,
  RiUser3Line,
  RiPhoneLine,
  RiMailLine,
  RiMapPinLine,
  RiBriefcaseLine,
  RiShieldCheckLine,
  RiEditLine,
  RiFileList3Line,
  RiCheckboxCircleLine,
  RiEyeLine,
  RiForbidLine,
  RiLoader4Line,
  RiAlertLine,
  RiImageLine,
} from '@remixicon/react';

/**
 * Shared thumbnail for a document/photo field on the tenant profile.
 * Renders an empty-state placeholder when no URL is available yet.
 * Uses object-contain on a light background so NID documents aren't cropped.
 */
function DocumentThumbnail({
  url,
  label,
  alt,
  emptyLabel,
  viewLabel,
  onView,
}: {
  url: string | null | undefined;
  label: string;
  alt: string;
  emptyLabel: string;
  viewLabel: string;
  onView: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-[13px] text-text-secondary block font-medium">{label}</span>
      {url ? (
        <button
          onClick={onView}
          className="group relative h-24 w-full rounded-2xl overflow-hidden border border-border-button-default bg-background-secondary-default hover:border-accent-400 transition-colors cursor-pointer"
          aria-label={alt}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={alt} className="w-full h-full object-contain p-1.5" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
            <span className="text-white text-xs font-medium flex items-center gap-1">
              <RiEyeLine className="w-3 h-3" />
              {viewLabel}
            </span>
          </div>
        </button>
      ) : (
        <div className="h-24 w-full rounded-2xl border-2 border-dashed border-border-button-default bg-background-secondary-default flex flex-col items-center justify-center text-text-tertiary">
          <RiImageLine className="w-6 h-6 mb-1" />
          <span className="text-xs">{emptyLabel}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Shown when a document ID exists on the tenant but its signed URL
 * failed to load (e.g. fetch error, expired/broken link) — distinct from
 * "no document uploaded" so it doesn't look like the file never existed.
 */
function DocumentThumbnailError({ label, isEn }: { label: string; isEn: boolean }) {
  return (
    <div className="space-y-1.5">
      <span className="text-[13px] text-text-secondary block font-medium">{label}</span>
      <div className="h-24 w-full rounded-2xl border border-dashed border-status-warning-subtle bg-status-warning-subtle flex flex-col items-center justify-center text-status-warning-foreground">
        <RiAlertLine className="w-5 h-5 mb-1" />
        <span className="text-xs font-medium">{isEn ? 'Preview unavailable' : 'প্রিভিউ দেখানো যাচ্ছে না'}</span>
      </div>
    </div>
  );
}

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();

  const rawTenantId = params?.id;
  const tenantId = Array.isArray(rawTenantId) ? rawTenantId[0] : rawTenantId;

  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailAgreement, setDetailAgreement] = useState<RentalAgreement | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [previewOpen, setPreviewOpen] = useState(false);

  // End-agreement confirmation + per-row busy state
  const [confirmEndAgreementId, setConfirmEndAgreementId] = useState<string | null>(null);
  const [endingAgreementId, setEndingAgreementId] = useState<string | null>(null);

  const openPreview = (url: string | null, title: string) => {
    if (url) {
      setPreviewImageUrl(url);
      setPreviewTitle(title);
      setPreviewOpen(true);
    }
  };

  // 1. Fetch Tenant Profile
  const {
    data: tenant,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['tenant-details', tenantId],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Tenant>>(`/tenants/${tenantId}`);
      return res.data?.data;
    },
    enabled: !!tenantId,
  });

  // 2. Fetch document URLs
  const { data: profilePictureUrl } = useQuery({
    queryKey: ['file-download-url', tenant?.profilePictureId],
    queryFn: () => getFileDownloadUrl(tenant!.profilePictureId!),
    enabled: !!tenant?.profilePictureId,
  });

  const { data: nidFrontUrl } = useQuery({
    queryKey: ['file-download-url', tenant?.nidFrontImageId],
    queryFn: () => getFileDownloadUrl(tenant!.nidFrontImageId!),
    enabled: !!tenant?.nidFrontImageId,
  });

  const { data: nidBackUrl } = useQuery({
    queryKey: ['file-download-url', tenant?.nidBackImageId],
    queryFn: () => getFileDownloadUrl(tenant!.nidBackImageId!),
    enabled: !!tenant?.nidBackImageId,
  });

  const handleEndAgreement = async (agreementId: string) => {
    setEndingAgreementId(agreementId);
    const endPromise = apiClient.post(`/rental-agreements/${agreementId}/end`);

    toast.promise(endPromise, {
      loading: isEn ? 'Ending agreement...' : 'চুক্তি সমাপ্ত করা হচ্ছে...',
      success: () => {
        refetch();
        return isEn ? 'Agreement ended successfully.' : 'চুক্তি সফলভাবে সমাপ্ত হয়েছে।';
      },
      error: (error: unknown) => {
        console.error('Failed to end agreement:', error);
        return isEn ? 'Failed to end agreement. Please try again.' : 'চুক্তি সমাপ্ত করা যায়নি। আবার চেষ্টা করুন।';
      },
    });

    try {
      await endPromise;
    } catch {
      // toast.promise displays error notification
    } finally {
      setEndingAgreementId(null);
      setConfirmEndAgreementId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 pb-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full rounded-3xl" />
        <Skeleton className="h-80 w-full rounded-3xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={RiAlertLine}
        title={isEn ? 'Something went wrong' : 'কিছু একটা ভুল হয়েছে'}
        description={
          isEn
            ? "We couldn't load this tenant's details. Please try again."
            : 'এই ভাড়াটিয়ার তথ্য লোড করা যায়নি। আবার চেষ্টা করুন।'
        }
        actionLabel={isEn ? 'Retry' : 'আবার চেষ্টা করুন'}
        onAction={() => refetch()}
      />
    );
  }

  if (!tenant) {
    return (
      <EmptyState
        icon={RiUser3Line}
        title={t.noTenantsFound}
        actionLabel={isEn ? 'Back to Tenants' : 'সকল ভাড়াটিয়াদের তালিকায় ফিরুন'}
        onAction={() => router.push('/tenants')}
      />
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-5 border-b border-separator-border pb-6 sm:flex-row sm:items-center">
        <Link href="/tenants">
          <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
            <RiArrowLeftLine className="h-4 w-4" />
          </Button>
        </Link>

        <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center min-w-0">
          {/* Profile Picture */}
          <div className="relative shrink-0">
            {profilePictureUrl ? (
              <button
                onClick={() => openPreview(profilePictureUrl, t.profilePicture)}
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl overflow-hidden border border-accent-200 bg-accent-50 hover:border-accent-400 transition-colors cursor-pointer"
                aria-label={isEn ? 'View profile picture' : 'প্রোফাইল ছবি দেখুন'}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profilePictureUrl}
                  alt={`${tenant.name} ${t.profilePicture}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ) : (
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-accent-50 text-accent-700 flex items-center justify-center font-semibold text-2xl sm:text-3xl border border-accent-200">
                {tenant.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Tenant Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-[28px] sm:text-[30px] font-semibold leading-tight tracking-tight text-text-primary truncate">{tenant.name}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-sm text-text-secondary">
              <span className="flex items-center gap-1">
                <RiPhoneLine className="w-3.5 h-3.5" />
                {tenant.phone}
              </span>
              {tenant.email && (
                <span className="flex items-center gap-1">
                  <RiMailLine className="w-3.5 h-3.5" />
                  {tenant.email}
                </span>
              )}
              {tenant.occupation && (
                <span className="flex items-center gap-1">
                  <RiBriefcaseLine className="w-3.5 h-3.5" />
                  {tenant.occupation}
                </span>
              )}
            </div>
          </div>

          {/* Edit Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditDialogOpen(true)}
            className="gap-1.5 shrink-0 self-start sm:self-center"
          >
            <RiEditLine className="w-3.5 h-3.5" />
            {t.editTenant}
          </Button>
        </div>
      </div>

      {/* Personal & Contact Information */}
      <Card className="rounded-3xl border border-border-button-default bg-background-primary-default">
        <CardHeader className="pb-3">
          <CardTitle className="text-[17px] font-semibold text-text-primary flex items-center gap-2">
            <RiUser3Line className="w-4 h-4 text-accent-700" />
            {t.personalContact}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-3">
            <div className="space-y-1">
              <span className="text-[13px] text-text-secondary block">{t.tenantName}</span>
              <span className="font-medium text-text-primary block">{tenant.name}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[13px] text-text-secondary block">{t.phone}</span>
              <span className="font-medium text-text-primary block">{tenant.phone}</span>
            </div>
            {tenant.email && (
              <div className="space-y-1">
                <span className="text-[13px] text-text-secondary block">{t.email}</span>
                <span className="font-medium text-text-primary block">{tenant.email}</span>
              </div>
            )}
            {tenant.occupation && (
              <div className="space-y-1">
                <span className="text-[13px] text-text-secondary block">{t.occupation}</span>
                <span className="font-medium text-text-primary block">{tenant.occupation}</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-separator-border space-y-1">
            <span className="text-[13px] text-text-secondary flex items-center gap-1.5">
              <RiMapPinLine className="w-3.5 h-3.5 text-accent-700" />
              {t.address}
            </span>
            <p className="text-sm font-medium text-text-primary whitespace-pre-wrap">
              {tenant.permanentAddress || (isEn ? 'Not provided' : 'প্রদান করা হয়নি')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Documents */}
      <Card className="rounded-3xl border border-border-button-default bg-background-primary-default">
        <CardHeader className="pb-3">
          <CardTitle className="text-[17px] font-semibold text-text-primary flex items-center gap-2">
            <RiFileList3Line className="w-4 h-4 text-accent-700" />
            {t.documents}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tenant.nidFrontImageId && (
              <div>
                {nidFrontUrl ? (
                  <DocumentThumbnail
                    url={nidFrontUrl}
                    label={t.nidFront}
                    alt={`${tenant.name} ${t.nidFront}`}
                    emptyLabel={isEn ? 'No NID front image' : 'এনআইডি সামনের ছবি নেই'}
                    viewLabel={t.view}
                    onView={() => openPreview(nidFrontUrl ?? null, t.nidFront)}
                  />
                ) : (
                  <DocumentThumbnailError label={t.nidFront} isEn={isEn} />
                )}
              </div>
            )}

            {tenant.nidBackImageId && (
              <div>
                {nidBackUrl ? (
                  <DocumentThumbnail
                    url={nidBackUrl}
                    label={t.nidBack}
                    alt={`${tenant.name} ${t.nidBack}`}
                    emptyLabel={isEn ? 'No NID back image' : 'এনআইডি পেছনের ছবি নেই'}
                    viewLabel={t.view}
                    onView={() => openPreview(nidBackUrl ?? null, t.nidBack)}
                  />
                ) : (
                  <DocumentThumbnailError label={t.nidBack} isEn={isEn} />
                )}
              </div>
            )}

            {!tenant.nidFrontImageId && !tenant.nidBackImageId && (
              <div className="col-span-full text-center py-4 text-text-secondary">
                <RiFileList3Line className="w-8 h-8 mx-auto mb-2 text-text-tertiary" />
                <p className="text-sm">{isEn ? 'No documents uploaded' : 'কোনো ডকুমেন্ট আপলোড করা হয়নি'}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card className="rounded-3xl border border-border-button-default bg-background-primary-default">
        <CardHeader className="pb-3">
          <CardTitle className="text-[17px] font-semibold text-text-primary flex items-center gap-2">
            <RiShieldCheckLine className="w-4 h-4 text-accent-700" />
            {t.emergencyContactSection}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            <div className="space-y-1">
              <span className="text-[13px] text-text-secondary block">{isEn ? 'Contact Person' : 'ব্যক্তির নাম'}</span>
              <span className="font-medium text-text-primary block">{tenant.emergencyContactName || (isEn ? 'Not provided' : 'প্রদান করা হয়নি')}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[13px] text-text-secondary block">{isEn ? 'Emergency Phone' : 'জরুরি ফোন'}</span>
              <span className="font-medium text-text-primary block">{tenant.emergencyContactPhone || (isEn ? 'Not provided' : 'প্রদান করা হয়নি')}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rental Agreements */}
      <Card className="rounded-3xl border border-border-button-default bg-background-primary-default">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-text-primary">
            <RiFileList3Line className="w-5 h-5 text-accent-700" />
            {isEn ? 'Rental Agreements' : 'ভাড়া চুক্তিসমূহ'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-0">
          {tenant.agreements && tenant.agreements.length > 0 ? (
            <ResponsiveTableContainer className="border-0 rounded-none">
              {/* Desktop Tabular View */}
              <div className="hidden md:block overflow-x-auto">
                <Table className="min-w-[860px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[140px]">{t.unitNumber}</TableHead>
                      <TableHead align="right" className="min-w-[105px]">{t.baseRent}</TableHead>
                      <TableHead align="right" className="min-w-[95px]">{t.serviceFee}</TableHead>
                      <TableHead align="right" className="min-w-[105px]">{t.securityDeposit}</TableHead>
                      <TableHead align="left" className="min-w-[100px]">{t.startDate}</TableHead>
                      <TableHead align="left" className="min-w-[100px]">{t.endDate}</TableHead>
                      <TableHead align="center" className="min-w-[95px]">{t.status}</TableHead>
                      <TableHead align="right" className="min-w-[160px]">{t.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenant.agreements.map((agr) => {
                      const isEndingThisRow = endingAgreementId === agr.id;
                      return (
                        <TableRow key={agr.id}>
                          <TableCell className="min-w-[140px]">
                            <div className="font-semibold text-text-primary">{agr.unit?.unitNumber || '—'}</div>
                            {agr.unit?.property?.name && (
                              <div className="text-xs text-text-secondary truncate max-w-[160px]" title={agr.unit.property.name}>
                                {agr.unit.property.name}
                              </div>
                            )}
                          </TableCell>
                          <TableCell align="right" className="font-semibold text-text-primary whitespace-nowrap">
                            {formatCurrency(agr.monthlyRent, language)}
                          </TableCell>
                          <TableCell align="right" className="text-text-secondary whitespace-nowrap">
                            {formatCurrency(agr.serviceFee, language)}
                          </TableCell>
                          <TableCell align="right" className="text-accent-600 font-medium whitespace-nowrap">
                            {formatCurrency(agr.securityDeposit, language)}
                          </TableCell>
                          <TableCell align="left" className="text-xs text-text-secondary whitespace-nowrap">
                            {formatBnDate(agr.startDate, language)}
                          </TableCell>
                          <TableCell align="left" className="text-xs text-text-secondary whitespace-nowrap">
                            {agr.endDate ? formatBnDate(agr.endDate, language) : '—'}
                          </TableCell>
                          <TableCell align="center">
                            <StatusBadge status={agr.status} lang={language} />
                          </TableCell>
                          <TableCell align="right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/agreements/${agr.id}`)}
                                className="h-8 px-2.5 text-xs text-accent-700 hover:text-accent-800 hover:bg-accent-50 gap-1.5 border border-accent-200"
                                title={t.view}
                                aria-label={`${t.view} — ${agr.unit?.unitNumber ?? ''}`}
                              >
                                <RiEyeLine className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">{t.view}</span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/agreements/${agr.id}/edit`)}
                                className="h-8 px-2.5 text-xs text-text-secondary hover:text-text-primary hover:bg-background-secondary-default gap-1.5 border border-border-button-default"
                                title={t.edit}
                                aria-label={`${t.edit} — ${agr.unit?.unitNumber ?? ''}`}
                              >
                                <RiEditLine className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">{t.edit}</span>
                              </Button>
                              {agr.status === 'ACTIVE' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setConfirmEndAgreementId(agr.id)}
                                  disabled={isEndingThisRow}
                                  className="h-8 px-2.5 text-xs text-text-error-primary hover:bg-status-danger-subtle gap-1.5 border border-status-danger-subtle"
                                  title={t.endAgreement}
                                  aria-label={`${t.endAgreement} — ${agr.unit?.unitNumber ?? ''}`}
                                >
                                  {isEndingThisRow ? (
                                    <RiLoader4Line className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <RiForbidLine className="w-3.5 h-3.5" />
                                  )}
                                  <span className="hidden sm:inline">{t.endAgreement}</span>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile 2-Line Rows */}
              <div className="block md:hidden divide-y divide-separator-border">
                {tenant.agreements.map((agr) => {
                  const isActive = agr.status === 'ACTIVE';
                  return (
                    <MobileDataRow
                      key={agr.id}
                      onClick={() => setDetailAgreement(agr)}
                      showChevron
                      identity={
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-semibold text-sm text-text-primary">Unit {agr.unit?.unitNumber || '—'}</span>
                          {agr.unit?.property?.name && (
                            <span className="text-xs text-text-secondary truncate max-w-[130px]">· {agr.unit.property.name}</span>
                          )}
                        </div>
                      }
                      value={`${formatCurrency(agr.monthlyRent, language)}${isEn ? '/mo' : '/মাস'}`}
                      stateAndDetail={
                        <>
                          <CompactStatus
                            label={isActive ? (isEn ? 'Active' : 'সক্রিয়') : (isEn ? 'Ended' : 'সমাপ্ত')}
                            variant={isActive ? 'success' : 'neutral'}
                          />
                          <span className="text-text-tertiary">·</span>
                          <span>{isEn ? `Started ${formatBnDate(agr.startDate, language)}` : `শুরু ${formatBnDate(agr.startDate, language)}`}</span>
                        </>
                      }
                      action={
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/agreements/${agr.id}`)}
                            className="h-8 min-h-[38px] px-2.5 text-xs text-accent-700 border-accent-200 hover:bg-accent-50 gap-1"
                          >
                            <RiEyeLine className="w-3.5 h-3.5" />
                            <span>{t.view}</span>
                          </Button>
                        </div>
                      }
                    />
                  );
                })}
              </div>
            </ResponsiveTableContainer>
          ) : (
            <p className="text-sm text-text-secondary py-5 text-center">
              {isEn ? 'No rental agreements found for this tenant.' : 'এই ভাড়াটিয়ার কোনো সক্রিয় বা পূর্বের চুক্তি পাওয়া যায়নি।'}
            </p>
          )}
        </CardContent>

        {/* Row Details Bottom Sheet on Mobile */}
        <BottomSheet open={!!detailAgreement} onOpenChange={(open) => !open && setDetailAgreement(null)}>
          {detailAgreement && (
            <BottomSheetContent>
              <BottomSheetHeader>
                <BottomSheetTitle>
                  Unit {detailAgreement.unit?.unitNumber || '—'}
                </BottomSheetTitle>
                <BottomSheetDescription>
                  {detailAgreement.unit?.property?.name || 'Rental Agreement'}
                </BottomSheetDescription>
              </BottomSheetHeader>

              <div className="py-2">
                <DetailItem
                  label={isEn ? 'Monthly Rent' : 'মাসিক ভাড়া'}
                  value={formatCurrency(detailAgreement.monthlyRent, language)}
                  isNumeric
                  highlight
                />
                <DetailItem
                  label={isEn ? 'Service Fee' : 'সার্ভিস চার্জ'}
                  value={formatCurrency(detailAgreement.serviceFee, language)}
                  isNumeric
                />
                <DetailItem
                  label={isEn ? 'Security Deposit' : 'অগ্রিম জামানত'}
                  value={formatCurrency(detailAgreement.securityDeposit, language)}
                  isNumeric
                />
                <DetailItem
                  label={isEn ? 'Start Date' : 'শুরুর তারিখ'}
                  value={formatBnDate(detailAgreement.startDate, language)}
                />
                {detailAgreement.endDate && (
                  <DetailItem
                    label={isEn ? 'End Date' : 'সমাপ্তির তারিখ'}
                    value={formatBnDate(detailAgreement.endDate, language)}
                  />
                )}
                <DetailItem
                  label={isEn ? 'Status' : 'অবস্থা'}
                  value={<StatusBadge status={detailAgreement.status} lang={language} />}
                />
              </div>

              <BottomSheetFooter>
                <Button
                  onClick={() => {
                    const id = detailAgreement.id;
                    setDetailAgreement(null);
                    router.push(`/agreements/${id}`);
                  }}
                  className="w-full sm:w-auto bg-accent-600 hover:bg-accent-700 min-h-[44px]"
                >
                  <RiEyeLine className="w-4 h-4 mr-2" />
                  {t.view}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const id = detailAgreement.id;
                    setDetailAgreement(null);
                    router.push(`/agreements/${id}/edit`);
                  }}
                  className="w-full sm:w-auto min-h-[44px]"
                >
                  <RiEditLine className="w-4 h-4 mr-2" />
                  {t.edit}
                </Button>
                {detailAgreement.status === 'ACTIVE' && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      const id = detailAgreement.id;
                      setDetailAgreement(null);
                      setConfirmEndAgreementId(id);
                    }}
                    className="w-full sm:w-auto min-h-[44px] text-text-error-primary hover:bg-status-danger-subtle border-status-danger-subtle"
                  >
                    <RiForbidLine className="w-4 h-4 mr-2" />
                    {t.endAgreement}
                  </Button>
                )}
              </BottomSheetFooter>
            </BottomSheetContent>
          )}
        </BottomSheet>
      </Card>

      {/* Tenant Edit Dialog */}
      <TenantFormDialog
        tenant={tenant}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={refetch}
      />

      {/* Image Preview Dialog */}
      <ImagePreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        imageUrl={previewImageUrl}
        title={previewTitle}
      />

      {/* End Agreement Confirmation Dialog */}
      <Dialog
        open={!!confirmEndAgreementId}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && endingAgreementId === null) {
            setConfirmEndAgreementId(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-text-error-primary">
              <RiForbidLine className="w-5 h-5" />
              {t.endAgreement}
            </DialogTitle>
            <DialogDescription>
              {isEn
                ? `End agreement for ${tenant.name}? This cannot be undone.`
                : `${tenant.name}-এর চুক্তি সমাপ্ত করবেন? এটি পূর্বাবস্থায় ফেরানো যাবে না।`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmEndAgreementId(null)}
              disabled={endingAgreementId !== null}
            >
              {t.cancel}
            </Button>
            <Button
              size="sm"
              onClick={() => confirmEndAgreementId && handleEndAgreement(confirmEndAgreementId)}
              disabled={endingAgreementId !== null}
              className="bg-status-danger-foreground hover:opacity-90 text-white gap-2"
            >
              {endingAgreementId ? <RiLoader4Line className="w-4 h-4 animate-spin" /> : <RiCheckboxCircleLine className="w-4 h-4" />}
              {isEn ? 'End Agreement' : 'চুক্তি সমাপ্ত করুন'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
