'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { Property, ApiResponse } from '@/lib/types';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { StatusBadge } from '@/components/ui/status-badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableSkeleton } from '@/components/ui/table';
import {
  ResponsiveTableContainer,
  MobileDataRow,
  MobileTableSkeleton,
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
import { PropertyFormDialog } from '@/components/properties/property-form-dialog';
import {
  RiBuildingLine,
  RiAddLine,
  RiSearchLine,
  RiMapPinLine,
  RiHomeLine,
  RiStackLine,
  RiEditLine,
  RiDeleteBinLine,
  RiExternalLinkLine,
} from '@remixicon/react';

export default function PropertiesPage() {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';

  const [search, setSearch] = useState('');
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [detailProperty, setDetailProperty] = useState<Property | null>(null);

  const {
    data: properties,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['properties-list', search],
    queryFn: async () => {
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const res = await apiClient.get<ApiResponse<Property[]>>(`/properties?limit=50${searchParam}`);
      return res.data?.data || [];
    },
  });

  const handleEdit = (p: Property) => {
    setEditingProperty(p);
    setPropertyDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingProperty(null);
    setPropertyDialogOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(isEn ? `Are you sure you want to delete "${name}"?` : `আপনি কি নিশ্চিতভাবে "${name}" মুছে ফেলতে চান?`)) {
      return;
    }
    const deletePromise = apiClient.delete(`/properties/${id}`);
    toast.promise(deletePromise, {
      loading: isEn ? 'Deleting property...' : 'বাড়ি মুছে ফেলা হচ্ছে...',
      success: () => {
        refetch();
        return isEn ? 'Property deleted successfully' : 'বাড়ি মুছে ফেলা হয়েছে';
      },
      error: (error: unknown) => {
        const message = typeof error === 'object' && error !== null && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
        return message || (isEn ? 'Failed to delete' : 'মুছে ফেলা সম্ভব হয়নি');
      },
    });

    try {
      await deletePromise;
    } catch {
      // toast.promise displays error notification
    }
  };

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title={t.properties}
        description={isEn ? 'Manage buildings, addresses, and units from one place.' : 'বাড়ি, ঠিকানা এবং ইউনিট এক জায়গা থেকে পরিচালনা করুন।'}
        action={
          <Button onClick={handleCreate} className="h-10 gap-2">
            <RiAddLine className="h-4 w-4" />
            {t.addNewProperty}
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <RiSearchLine className="absolute left-3.5 top-3 h-4 w-4 text-text-placeholder" />
          <Input
            placeholder={isEn ? 'Search by name, address, or city' : 'নাম, ঠিকানা বা শহর দিয়ে খুঁজুন'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <p className="text-xs text-text-secondary">
          {properties ? `${properties.length} ${isEn ? 'properties' : 'টি বাড়ি'}` : ''}
        </p>
      </div>

      {/* Responsive Properties Table */}
      {isLoading ? (
        <ResponsiveTableContainer>
          <div className="hidden md:block overflow-x-auto">
            <Table className="min-w-[840px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[220px]">{isEn ? 'Property' : 'বাড়ি'}</TableHead>
                  <TableHead className="min-w-[220px]">{isEn ? 'Address' : 'ঠিকানা'}</TableHead>
                  <TableHead align="right" className="min-w-[90px]">{t.units}</TableHead>
                  <TableHead align="right" className="min-w-[90px]">{t.floor}</TableHead>
                  <TableHead align="center" className="min-w-[100px]">{t.status}</TableHead>
                  <TableHead align="right" className="min-w-[160px]">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableSkeleton columns={6} rows={5} />
              </TableBody>
            </Table>
          </div>
          <div className="block md:hidden">
            <MobileTableSkeleton rows={5} />
          </div>
        </ResponsiveTableContainer>
      ) : properties && properties.length > 0 ? (
        <ResponsiveTableContainer>
          {/* Desktop Tabular View */}
          <div className="hidden md:block overflow-x-auto">
            <Table className="min-w-[840px]">
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[220px]">{isEn ? 'Property' : 'বাড়ি'}</TableHead>
                  <TableHead className="min-w-[220px]">{isEn ? 'Address' : 'ঠিকানা'}</TableHead>
                  <TableHead align="right" className="min-w-[90px]">{t.units}</TableHead>
                  <TableHead align="right" className="min-w-[90px]">{t.floor}</TableHead>
                  <TableHead align="center" className="min-w-[100px]">{t.status}</TableHead>
                  <TableHead align="right" className="min-w-[160px]">{t.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => {
                  const unitCount = property._count?.units || 0;
                  return (
                    <TableRow key={property.id}>
                      <TableCell className="min-w-[220px]">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-700">
                            <RiBuildingLine className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 max-w-[170px]">
                            <p className="truncate font-medium text-text-primary text-sm" title={property.name}>
                              {property.name}
                            </p>
                            {property.description && (
                              <p className="truncate text-xs text-text-secondary" title={property.description}>
                                {property.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-[220px]">
                        <div className="flex items-center gap-1.5 text-text-secondary text-xs">
                          <RiMapPinLine className="h-3.5 w-3.5 shrink-0 text-text-tertiary" />
                          <span className="truncate max-w-[200px]" title={`${property.address}${property.city ? `, ${property.city}` : ''}`}>
                            {property.address}{property.city ? `, ${property.city}` : ''}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell align="right" className="tabular-nums font-medium text-text-secondary">
                        <span className="inline-flex items-center gap-1.5 justify-end">
                          <RiHomeLine className="h-3.5 w-3.5 text-text-tertiary" />
                          {unitCount}
                        </span>
                      </TableCell>
                      <TableCell align="right" className="tabular-nums text-text-secondary">
                        <span className="inline-flex items-center gap-1.5 justify-end">
                          <RiStackLine className="h-3.5 w-3.5 text-text-tertiary" />
                          {property.totalFloors}
                        </span>
                      </TableCell>
                      <TableCell align="center">
                        <StatusBadge status="ACTIVE" lang={language} />
                      </TableCell>
                      <TableCell align="right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(property)}
                            className="h-8 w-8 text-text-secondary hover:text-text-primary"
                            title={t.edit}
                          >
                            <RiEditLine className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(property.id, property.name)}
                            className="h-8 w-8 text-text-error-primary hover:bg-status-danger-subtle"
                            title={t.delete}
                          >
                            <RiDeleteBinLine className="h-3.5 w-3.5" />
                          </Button>
                          <Link href={`/properties/${property.id}`}>
                            <Button size="sm" variant="outline" className="h-8 gap-1.5 whitespace-nowrap text-xs px-2.5">
                              {isEn ? 'Units' : 'ইউনিট'} <RiExternalLinkLine className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
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
            {properties.map((property) => {
              const unitCount = property._count?.units || 0;
              return (
                <MobileDataRow
                  key={property.id}
                  onClick={() => setDetailProperty(property)}
                  showChevron
                  identity={
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent-50 text-accent-700">
                        <RiBuildingLine className="h-3.5 w-3.5" />
                      </div>
                      <span className="truncate font-semibold text-sm text-text-primary">
                        {property.name}
                      </span>
                    </div>
                  }
                  value={`${unitCount} ${isEn ? (unitCount === 1 ? 'Unit' : 'Units') : 'টি ইউনিট'}`}
                  stateAndDetail={
                    <>
                      <CompactStatus label={isEn ? 'Active' : 'সক্রিয়'} variant="success" />
                      <span className="text-text-tertiary">·</span>
                      <span className="truncate max-w-[140px]">
                        {property.address}{property.city ? `, ${property.city}` : ''}
                      </span>
                      <span className="text-text-tertiary">·</span>
                      <span>{property.totalFloors} {isEn ? 'Floors' : 'তলা'}</span>
                    </>
                  }
                  action={
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Link href={`/properties/${property.id}`}>
                        <Button size="sm" variant="outline" className="h-8 min-h-[38px] px-2.5 text-xs gap-1 border-border-button-default">
                          <span>{isEn ? 'Units' : 'ইউনিট'}</span>
                          <RiExternalLinkLine className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  }
                />
              );
            })}
          </div>
        </ResponsiveTableContainer>
      ) : (
        <Card className="rounded-3xl border border-border-button-default bg-background-primary-default">
          <CardContent className="p-0">
            <EmptyState
              icon={RiBuildingLine}
              title={t.noPropertiesFound}
              description={t.addFirstProperty}
              actionLabel={t.addNewProperty}
              onAction={handleCreate}
            />
          </CardContent>
        </Card>
      )}

      {/* Row Details Bottom Sheet on Mobile */}
      <BottomSheet open={!!detailProperty} onOpenChange={(open) => !open && setDetailProperty(null)}>
        {detailProperty && (
          <BottomSheetContent>
            <BottomSheetHeader>
              <BottomSheetTitle>{detailProperty.name}</BottomSheetTitle>
              <BottomSheetDescription>
                {detailProperty.address}{detailProperty.city ? `, ${detailProperty.city}` : ''}
              </BottomSheetDescription>
            </BottomSheetHeader>

            <div className="py-2">
              <DetailItem
                label={isEn ? 'Total Units' : 'মোট ইউনিট'}
                value={detailProperty._count?.units || 0}
                isNumeric
                highlight
              />
              <DetailItem
                label={isEn ? 'Total Floors' : 'মোট তলা'}
                value={detailProperty.totalFloors}
                isNumeric
              />
              <DetailItem
                label={isEn ? 'Address' : 'ঠিকানা'}
                value={detailProperty.address}
              />
              {detailProperty.city && (
                <DetailItem
                  label={isEn ? 'City' : 'শহর'}
                  value={detailProperty.city}
                />
              )}
              {detailProperty.description && (
                <DetailItem
                  label={isEn ? 'Description' : 'বিবরণ'}
                  value={detailProperty.description}
                />
              )}
              <DetailItem
                label={isEn ? 'Status' : 'অবস্থা'}
                value={<StatusBadge status="ACTIVE" lang={language} />}
              />
            </div>

            <BottomSheetFooter>
              <Link href={`/properties/${detailProperty.id}`} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-accent-600 hover:bg-accent-700 min-h-[44px]">
                  <RiHomeLine className="w-4 h-4 mr-2" />
                  {isEn ? 'Manage Units' : 'ইউনিট পরিচালনা করুন'}
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  const p = detailProperty;
                  setDetailProperty(null);
                  handleEdit(p);
                }}
                className="w-full sm:w-auto min-h-[44px]"
              >
                <RiEditLine className="w-4 h-4 mr-2" />
                {t.edit}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const id = detailProperty.id;
                  const name = detailProperty.name;
                  setDetailProperty(null);
                  handleDelete(id, name);
                }}
                className="w-full sm:w-auto min-h-[44px] text-text-error-primary hover:bg-status-danger-subtle border-status-danger-subtle"
              >
                <RiDeleteBinLine className="w-4 h-4 mr-2" />
                {t.delete}
              </Button>
            </BottomSheetFooter>
          </BottomSheetContent>
        )}
      </BottomSheet>

      <PropertyFormDialog property={editingProperty} open={propertyDialogOpen} onOpenChange={setPropertyDialogOpen} onSuccess={refetch} />
    </div>
  );
}
