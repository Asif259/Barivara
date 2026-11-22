'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { propertiesApi, unitsApi } from '@/lib/api';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { Unit } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
import { UnitFormDialog } from '@/components/units/unit-form-dialog';
import { BulkUnitFormDialog } from '@/components/units/bulk-unit-form-dialog';
import { PropertyFormDialog } from '@/components/properties/property-form-dialog';
import {
  RiBuildingLine,
  RiArrowLeftLine,
  RiAddLine,
  RiHomeLine,
  RiMapPinLine,
  RiEditLine,
  RiDeleteBinLine,
  RiStackLine,
} from '@remixicon/react';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params?.id as string;

  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';

  const [unitDialogOpen, setUnitDialogOpen] = useState(false);
  const [bulkUnitDialogOpen, setBulkUnitDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [detailUnit, setDetailUnit] = useState<Unit | null>(null);
  const [propertyEditOpen, setPropertyEditOpen] = useState(false);

  // 1. Fetch Property Details
  const {
    data: property,
    isLoading: isPropLoading,
    refetch: refetchProperty,
  } = useQuery({
    queryKey: ['property-details', propertyId],
    queryFn: async () => {
      const res = await propertiesApi.get(propertyId);
      return res.data?.data;
    },
    enabled: !!propertyId,
  });

  // 2. Fetch Property Financial & Units Summary
  const {
    data: summary,
    refetch: refetchSummary,
  } = useQuery({
    queryKey: ['property-summary', propertyId],
    queryFn: async () => {
      const res = await propertiesApi.getSummary(propertyId);
      return res.data?.data;
    },
    enabled: !!propertyId,
  });

  // 3. Fetch Units for this property
  const {
    data: units,
    isLoading: isUnitsLoading,
    refetch: refetchUnits,
  } = useQuery({
    queryKey: ['property-units', propertyId],
    queryFn: async () => {
      const res = await unitsApi.listByProperty(propertyId);
      return res.data?.data || [];
    },
    enabled: !!propertyId,
  });

  const handleAddUnit = () => {
    setEditingUnit(null);
    setUnitDialogOpen(true);
  };

  const unitsByFloor = (units || []).reduce<Record<number, Unit[]>>((groups, unit) => {
    (groups[unit.floor] ||= []).push(unit);
    return groups;
  }, {});

  const handleEditUnit = (u: Unit) => {
    setEditingUnit(u);
    setUnitDialogOpen(true);
  };

  const refreshUnitViews = () => {
    refetchUnits();
    refetchProperty();
    refetchSummary();
  };

  const handleDeleteUnit = async (unitId: string, unitNumber: string) => {
    if (!confirm(isEn ? `Delete unit "${unitNumber}"?` : `আপনি কি ইউনিট "${unitNumber}" মুছে ফেলতে চান?`)) {
      return;
    }
    const deletePromise = unitsApi.remove(unitId);
    toast.promise(deletePromise, {
      loading: isEn ? 'Deleting unit...' : 'ইউনিট মুছে ফেলা হচ্ছে...',
      success: () => {
        refreshUnitViews();
        return isEn ? 'Unit deleted successfully' : 'ইউনিট মুছে ফেলা হয়েছে';
      },
      error: (error: unknown) => {
        const message = typeof error === 'object' && error !== null && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
        return message || (isEn ? 'Failed to delete unit' : 'ইউনিট মুছে ফেলা সম্ভব হয়নি');
      },
    });

    try {
      await deletePromise;
    } catch {
      // toast.promise displays error notification
    }
  };

  if (isPropLoading) {
    return (
      <div className="space-y-6 pb-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full rounded-3xl" />
        <Skeleton className="h-80 w-full rounded-3xl" />
      </div>
    );
  }

  if (!property) {
    return (
      <EmptyState
        icon={RiBuildingLine}
        title={t.noPropertiesFound}
        actionLabel={isEn ? 'Back to Properties' : 'সকল বাড়িতে ফিরে যান'}
        onAction={() => router.push('/properties')}
      />
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col gap-5 border-b border-separator-border pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-3">
          <Link href="/properties">
            <Button variant="outline" size="icon" className="mt-1 h-9 w-9 shrink-0" title={isEn ? 'Back to properties' : 'সকল বাড়িতে ফিরে যান'}>
              <RiArrowLeftLine className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-text-secondary">{isEn ? 'Property' : 'বাড়ি'}</p>
            <h1 className="text-[30px] font-semibold leading-tight tracking-tight text-text-primary">{property.name}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-text-secondary">
              <RiMapPinLine className="h-4 w-4 text-text-placeholder" />
              {property.address}{property.city ? `, ${property.city}` : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setPropertyEditOpen(true)} className="gap-1.5 h-10">
            <RiEditLine className="h-3.5 w-3.5" />
            {t.edit}
          </Button>
          <Button onClick={handleAddUnit} size="sm" className="gap-1.5 h-10">
            <RiAddLine className="h-4 w-4" />
            {t.addNewUnit}
          </Button>
          <Button onClick={() => setBulkUnitDialogOpen(true)} variant="outline" size="sm" className="gap-1.5 h-10">
            <RiStackLine className="h-4 w-4" />
            {t.addUnitsByFloor}
          </Button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-2 divide-x divide-y divide-separator-border rounded-3xl border border-border-button-default bg-background-primary-default sm:grid-cols-4 sm:divide-y-0">
          <SummaryMetric label={`${t.total} ${t.units}`} value={summary.totalUnits} detail={`${summary.occupiedUnits} ${t.occupied} · ${summary.vacantUnits} ${t.vacant}`} />
          <SummaryMetric label={t.activeAgreement} value={summary.activeTenants} detail={t.tenants} />
          <SummaryMetric label={isEn ? 'Monthly expected' : 'মাসিক প্রত্যাশিত'} value={formatCurrency(summary.currentMonth.expected, language)} detail={`${t.paid}: ${formatCurrency(summary.currentMonth.collected, language)}`} accent />
          <SummaryMetric label={t.collectionRate} value={`${summary.currentMonth.collectionRate}%`} detail={`${t.remaining}: ${formatCurrency(summary.currentMonth.outstanding, language)}`} accent={summary.currentMonth.collectionRate > 0} />
        </div>
      )}

      <Card className="rounded-3xl border border-border-button-default bg-background-primary-default">
        <CardHeader className="flex flex-col gap-3 border-b border-separator-border pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <RiHomeLine className="h-4 w-4 text-accent-700" />
              <CardTitle className="text-[17px] text-text-primary">{isEn ? 'Units' : 'ইউনিট'}</CardTitle>
            </div>
            <CardDescription className="mt-1 text-text-secondary">
              {isEn ? 'Units, occupancy, and rent settings for this property.' : 'এই বাড়ির ইউনিট, দখল এবং ভাড়ার তথ্য।'}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleAddUnit} variant="outline" size="sm" className="h-9 gap-1.5">
              <RiAddLine className="h-3.5 w-3.5" />
              {t.addNewUnit}
            </Button>
            <Button onClick={() => setBulkUnitDialogOpen(true)} variant="outline" size="sm" className="h-9 gap-1.5">
              <RiStackLine className="h-3.5 w-3.5" />
              {t.addByFloor}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 pt-0">
          {isUnitsLoading ? (
            <ResponsiveTableContainer className="border-0 rounded-none">
              <div className="hidden md:block overflow-x-auto">
                <Table className="min-w-[860px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">{t.unitNumber}</TableHead>
                      <TableHead align="left" className="min-w-[90px]">{t.floor}</TableHead>
                      <TableHead align="left" className="min-w-[110px]">{t.unitType}</TableHead>
                      <TableHead align="left" className="min-w-[120px]">{isEn ? 'Rooms' : 'রুম ও বাথ'}</TableHead>
                      <TableHead align="right" className="min-w-[110px]">{t.baseRent}</TableHead>
                      <TableHead align="right" className="min-w-[100px]">{t.serviceFee}</TableHead>
                      <TableHead align="center" className="min-w-[100px]">{t.status}</TableHead>
                      <TableHead align="right" className="min-w-[100px]">{t.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableSkeleton columns={8} rows={4} />
                  </TableBody>
                </Table>
              </div>
              <div className="block md:hidden">
                <MobileTableSkeleton rows={4} />
              </div>
            </ResponsiveTableContainer>
          ) : units && units.length > 0 ? (
            <ResponsiveTableContainer className="border-0 rounded-none">
              {/* Desktop Tabular View */}
              <div className="hidden md:block overflow-x-auto">
                <Table className="min-w-[860px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">{t.unitNumber}</TableHead>
                      <TableHead align="left" className="min-w-[90px]">{t.floor}</TableHead>
                      <TableHead align="left" className="min-w-[110px]">{t.unitType}</TableHead>
                      <TableHead align="left" className="min-w-[120px]">{isEn ? 'Rooms' : 'রুম ও বাথ'}</TableHead>
                      <TableHead align="right" className="min-w-[110px]">{t.baseRent}</TableHead>
                      <TableHead align="right" className="min-w-[100px]">{t.serviceFee}</TableHead>
                      <TableHead align="center" className="min-w-[100px]">{t.status}</TableHead>
                      <TableHead align="right" className="min-w-[100px]">{t.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(unitsByFloor).sort(([a], [b]) => Number(b) - Number(a)).flatMap(([floor, floorUnits]) => [
                      <TableRow key={`floor-${floor}`} className="bg-background-secondary-default hover:bg-background-secondary-default">
                        <TableCell colSpan={8} className="py-2 px-3.5 text-xs font-semibold text-text-secondary border-y border-separator-border">
                          <span className="inline-flex items-center gap-2">
                            <RiStackLine className="h-3.5 w-3.5 text-accent-600" />
                            <span>{isEn ? `Floor ${floor}` : `${floor} তলা`}</span>
                            <span className="font-normal text-text-secondary">({floorUnits.length} {t.units})</span>
                          </span>
                        </TableCell>
                      </TableRow>,
                      ...floorUnits.map((unit) => (
                        <TableRow key={unit.id}>
                          <TableCell className="font-semibold text-text-primary">{unit.unitNumber}</TableCell>
                          <TableCell align="left" className="text-xs text-text-secondary">{unit.floor} {isEn ? 'Floor' : 'তলা'}</TableCell>
                          <TableCell align="left" className="text-xs text-text-secondary">{unit.unitType}</TableCell>
                          <TableCell align="left" className="text-xs text-text-secondary">{unit.bedrooms || 0} Bed · {unit.bathrooms || 0} Bath</TableCell>
                          <TableCell align="right" className="font-semibold text-text-primary whitespace-nowrap">{formatCurrency(unit.monthlyBaseRent, language)}</TableCell>
                          <TableCell align="right" className="text-text-secondary whitespace-nowrap">{formatCurrency(unit.defaultServiceFee, language)}</TableCell>
                          <TableCell align="center"><StatusBadge status={unit.status} lang={language} /></TableCell>
                          <TableCell align="right">
                            <div className="flex items-center justify-end gap-1">
                              <Button size="icon" variant="ghost" onClick={() => handleEditUnit(unit)} className="h-8 w-8 text-text-secondary hover:text-text-primary" title={t.edit}>
                                <RiEditLine className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => handleDeleteUnit(unit.id, unit.unitNumber)} className="h-8 w-8 text-text-error-primary hover:bg-status-danger-subtle" title={t.delete}>
                                <RiDeleteBinLine className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )),
                    ])}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile 2-Line Rows Grouped by Floor */}
              <div className="block md:hidden divide-y divide-separator-border">
                {Object.entries(unitsByFloor).sort(([a], [b]) => Number(b) - Number(a)).flatMap(([floor, floorUnits]) => [
                  <div key={`mobile-floor-${floor}`} className="px-4 py-2 bg-background-secondary-default border-y border-separator-border flex items-center justify-between text-xs font-semibold text-text-secondary">
                    <span className="flex items-center gap-1.5">
                      <RiStackLine className="h-3.5 w-3.5 text-accent-600" />
                      <span>{isEn ? `Floor ${floor}` : `${floor} তলা`}</span>
                    </span>
                    <span className="text-text-secondary font-normal">({floorUnits.length} {t.units})</span>
                  </div>,
                  ...floorUnits.map((unit) => {
                    const statusLabel = unit.status === 'OCCUPIED' ? t.occupied : (unit.status === 'VACANT' ? t.vacant : unit.status);
                    const statusVariant = unit.status === 'OCCUPIED' ? 'info' : (unit.status === 'VACANT' ? 'success' : 'warning');

                    return (
                      <MobileDataRow
                        key={unit.id}
                        onClick={() => setDetailUnit(unit)}
                        showChevron
                        identity={
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-semibold text-sm text-text-primary">Unit {unit.unitNumber}</span>
                            {unit.unitType && <span className="text-xs text-text-secondary">· {unit.unitType}</span>}
                          </div>
                        }
                        value={formatCurrency(unit.monthlyBaseRent, language)}
                        stateAndDetail={
                          <>
                            <CompactStatus label={statusLabel} variant={statusVariant} />
                            <span className="text-text-tertiary">·</span>
                            <span>{isEn ? `Floor ${unit.floor}` : `${unit.floor} তলা`}</span>
                            {(unit.bedrooms || unit.bathrooms) ? (
                              <>
                                <span className="text-text-tertiary">·</span>
                                <span>{unit.bedrooms || 0}B/{unit.bathrooms || 0}B</span>
                              </>
                            ) : null}
                          </>
                        }
                        action={
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <Button size="sm" variant="ghost" onClick={() => handleEditUnit(unit)} className="h-10 w-10 p-0 text-text-secondary hover:text-text-primary">
                              <RiEditLine className="w-4 h-4" />
                            </Button>
                          </div>
                        }
                      />
                    );
                  }),
                ])}
              </div>
            </ResponsiveTableContainer>
          ) : (
            <div className="p-5">
              <EmptyState icon={RiHomeLine} title={isEn ? 'No units added' : 'কোনো ইউনিট নেই'} description={isEn ? 'Add your first flat or shop to this building' : 'এই বাড়ির জন্য ফ্ল্যাট বা দোকান যুক্ত করুন'} actionLabel={t.addNewUnit} onAction={handleAddUnit} />
            </div>
          )}
        </CardContent>

        {/* Row Details Bottom Sheet on Mobile */}
        <BottomSheet open={!!detailUnit} onOpenChange={(open) => !open && setDetailUnit(null)}>
          {detailUnit && (
            <BottomSheetContent>
              <BottomSheetHeader>
                <BottomSheetTitle>Unit {detailUnit.unitNumber}</BottomSheetTitle>
                <BottomSheetDescription>
                  {property.name} · {isEn ? `Floor ${detailUnit.floor}` : `${detailUnit.floor} তলা`}
                </BottomSheetDescription>
              </BottomSheetHeader>

              <div className="py-2">
                <DetailItem
                  label={isEn ? 'Base Rent' : 'মূল ভাড়া'}
                  value={formatCurrency(detailUnit.monthlyBaseRent, language)}
                  isNumeric
                  highlight
                />
                <DetailItem
                  label={isEn ? 'Service Fee' : 'সার্ভিস চার্জ'}
                  value={formatCurrency(detailUnit.defaultServiceFee, language)}
                  isNumeric
                />
                <DetailItem
                  label={isEn ? 'Total Monthly' : 'মোট মাসিক'}
                  value={formatCurrency((detailUnit.monthlyBaseRent || 0) + (detailUnit.defaultServiceFee || 0), language)}
                  isNumeric
                />
                <DetailItem
                  label={isEn ? 'Floor' : 'তলা'}
                  value={isEn ? `Floor ${detailUnit.floor}` : `${detailUnit.floor} তলা`}
                />
                <DetailItem
                  label={isEn ? 'Unit Type' : 'ইউনিটের ধরন'}
                  value={detailUnit.unitType || '—'}
                />
                <DetailItem
                  label={isEn ? 'Rooms & Baths' : 'রুম ও বাথ'}
                  value={`${detailUnit.bedrooms || 0} Bed · ${detailUnit.bathrooms || 0} Bath`}
                />
                <DetailItem
                  label={isEn ? 'Status' : 'অবস্থা'}
                  value={<StatusBadge status={detailUnit.status} lang={language} />}
                />
              </div>

              <BottomSheetFooter>
                <Button
                  onClick={() => {
                    const u = detailUnit;
                    setDetailUnit(null);
                    handleEditUnit(u);
                  }}
                  className="w-full sm:w-auto bg-accent-600 hover:bg-accent-700 min-h-[44px]"
                >
                  <RiEditLine className="w-4 h-4 mr-2" />
                  {t.edit}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const id = detailUnit.id;
                    const num = detailUnit.unitNumber;
                    setDetailUnit(null);
                    handleDeleteUnit(id, num);
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
      </Card>

      <UnitFormDialog propertyId={propertyId} unit={editingUnit} open={unitDialogOpen} onOpenChange={setUnitDialogOpen} onSuccess={() => { refetchUnits(); refetchProperty(); refetchSummary(); }} />
      <BulkUnitFormDialog propertyId={propertyId} units={units || []} open={bulkUnitDialogOpen} onOpenChange={setBulkUnitDialogOpen} onSuccess={refreshUnitViews} />
      <PropertyFormDialog property={property} open={propertyEditOpen} onOpenChange={setPropertyEditOpen} onSuccess={refetchProperty} />
    </div>
  );
}

function SummaryMetric({ label, value, detail, accent = false }: { label: string; value: string | number; detail: string; accent?: boolean }) {
  return (
    <div className="min-w-0 p-5">
      <p className="truncate text-xs font-medium text-text-secondary">{label}</p>
      <p className={`mt-2 truncate text-xl font-semibold tracking-tight tabular-nums ${accent ? 'text-accent-700' : 'text-text-primary'}`}>{value}</p>
      <p className="mt-1 truncate text-xs text-text-secondary">{detail}</p>
    </div>
  );
}
