'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { DashboardOverview, MonthlyRent, Property, ApiResponse } from '@/lib/types';
import { formatCurrency, formatNumber, formatBnDate } from '@/lib/utils';
import { StatCard } from '@/components/ui/stat-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
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
import { CollectPaymentDialog } from '@/components/payments/collect-payment-dialog';
import {
  RiBuildingLine as Building2,
  RiHomeLine as Home,
  RiGroupLine as Users,
  RiPercentLine as Percent,
  RiWallet3Line as Wallet,
  RiCheckboxCircleLine as CheckCircle2,
  RiErrorWarningLine as AlertCircle,
  RiLineChartLine as TrendingUp,
  RiMoneyDollarCircleLine as DollarSign,
  RiReceiptLine as Receipt,
  RiArrowRightUpLine as ArrowUpRight,
  RiFilterLine as Filter,
} from '@remixicon/react';
import { cx } from '@/utils/cx';

export default function DashboardPage() {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';

  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedRentForPayment, setSelectedRentForPayment] = useState<MonthlyRent | null>(null);
  const [detailRent, setDetailRent] = useState<MonthlyRent | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  // 1. Fetch Properties for the filter dropdown
  const { data: propertiesData } = useQuery({
    queryKey: ['properties-list-filter'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Property[]>>('/properties?limit=100');
      return res.data?.data || [];
    },
  });

  // 2. Fetch Dashboard Overview Stats
  const {
    data: overviewData,
    isLoading: isOverviewLoading,
    refetch: refetchOverview,
  } = useQuery({
    queryKey: ['dashboard-overview', selectedPropertyId],
    queryFn: async () => {
      const queryParam = selectedPropertyId ? `?propertyId=${selectedPropertyId}` : '';
      const res = await apiClient.get<ApiResponse<DashboardOverview>>(`/dashboard/overview${queryParam}`);
      return res.data?.data;
    },
  });

  // 3. Fetch Outstanding Rents
  const {
    data: outstandingRents,
    isLoading: isOutstandingLoading,
    refetch: refetchOutstanding,
  } = useQuery({
    queryKey: ['outstanding-rents', selectedPropertyId],
    queryFn: async () => {
      const queryParam = selectedPropertyId ? `?propertyId=${selectedPropertyId}&limit=10` : '?limit=10';
      const res = await apiClient.get<ApiResponse<MonthlyRent[]>>(`/monthly-rents/outstanding${queryParam}`);
      return res.data?.data || [];
    },
  });

  const handleOpenPayment = (rent: MonthlyRent) => {
    setSelectedRentForPayment(rent);
    setPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = () => {
    refetchOverview();
    refetchOutstanding();
  };

  const currentMonth = overviewData?.currentMonth;
  const collectionRate = currentMonth?.collectionRate || 0;
  const outstandingCount =
    (currentMonth?.pendingCount || 0) + (currentMonth?.overdueCount || 0) + (currentMonth?.partialCount || 0);

  return (
    <div className="space-y-10 pb-8">
      <div className="flex flex-col gap-5 border-b border-separator-border pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-caption-1-medium uppercase tracking-[0.14em] text-text-tertiary">BariVara</p>
          <h1 className="text-title-1-semibold leading-tight tracking-tight text-text-primary">{t.dashboard}</h1>
          <p className="mt-2 max-w-2xl text-body-medium text-text-secondary">
            {isEn
              ? 'A clear view of your properties, occupancy, and rent collection.'
              : 'আপনার বাড়ি, ভাড়াটিয়া এবং ভাড়া আদায়ের সংক্ষিপ্ত সারাংশ।'}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="flex h-10 items-center gap-2 rounded-xl border border-border-button-default bg-background-primary-default px-3 text-body-medium text-text-secondary focus-within:ring-2 focus-within:ring-border-focus-ring">
            <Filter className="h-4 w-4 text-foreground-icon-tertiary" />
            <span className="sr-only">{isEn ? 'Filter by property' : 'বাড়ি দিয়ে ফিল্টার করুন'}</span>
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="min-w-[150px] bg-transparent text-body-medium font-medium text-text-primary outline-none"
            >
              <option value="">{isEn ? 'All properties' : 'সকল বাড়ি'}</option>
              {propertiesData?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <Link href="/rents">
            <Button size="sm" className="h-10 w-full gap-1.5 px-4 sm:w-auto">
              <Receipt className="h-4 w-4" />
              {t.generateRent}
            </Button>
          </Link>
        </div>
      </div>

      <section aria-labelledby="portfolio-overview-heading">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 id="portfolio-overview-heading" className="text-title-3-semibold text-text-primary">
              {isEn ? 'Portfolio overview' : 'সম্পত্তির সারাংশ'}
            </h2>
            <p className="mt-1 text-caption-1-regular text-text-tertiary">
              {isEn ? 'Current operating snapshot' : 'বর্তমান পরিচালনামূলক অবস্থা'}
            </p>
          </div>
        </div>

        {isOverviewLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="rounded-3xl border-border-button-default bg-background-primary-default p-5 shadow-none">
                <div className="space-y-3">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-7 w-20" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title={t.properties}
              value={formatNumber(overviewData?.totalProperties || 0, language)}
              subtitle={isEn ? 'Registered properties' : 'মোট নিবন্ধিত বাড়ি'}
              icon={Building2}
              href="/properties"
            />
            <StatCard
              title={t.units}
              value={formatNumber(overviewData?.totalUnits || 0, language)}
              subtitle={`${formatNumber(overviewData?.occupiedUnits || 0, language)} ${t.occupied} · ${formatNumber(overviewData?.vacantUnits || 0, language)} ${t.vacant}`}
              icon={Home}
              badge={(overviewData?.vacantUnits || 0) > 0 ? {
                text: `${formatNumber(overviewData?.vacantUnits || 0, language)} ${t.vacant}`,
                variant: 'warning',
              } : {
                text: isEn ? '100% Filled' : '১০০% পূর্ণ',
                variant: 'success',
              }}
              href="/properties"
            />
            <StatCard
              title={t.tenants}
              value={formatNumber(overviewData?.totalTenants || 0, language)}
              subtitle={isEn ? 'Active tenants' : 'সক্রিয় ভাড়াটিয়া'}
              icon={Users}
              href="/tenants"
            />
            <StatCard
              title={t.occupancyRate}
              value={`${formatNumber(overviewData?.occupancyRate || 0, language)}%`}
              subtitle={isEn ? 'Units occupied' : 'ভাড়া হওয়ার হার'}
              icon={Percent}
              badge={(overviewData?.occupancyRate || 0) >= 90 ? {
                text: isEn ? 'Optimal' : 'অনুকূল',
                variant: 'success',
              } : (overviewData?.occupancyRate || 0) >= 70 ? {
                text: isEn ? 'Moderate' : 'মাঝারি',
                variant: 'info',
              } : {
                text: isEn ? 'Low' : 'কম',
                variant: 'warning',
              }}
              href="/properties"
            />
          </div>
        )}
      </section>

      <section aria-labelledby="collection-heading">
        <div className="mb-4">
          <h2 id="collection-heading" className="text-title-3-semibold text-text-primary">
            {isEn ? 'Collection overview' : 'ভাড়া আদায়ের সারাংশ'}
          </h2>
          <p className="mt-1 text-caption-1-regular text-text-tertiary">
            {isEn ? 'Monthly financial performance at a glance' : 'চলতি মাসের আর্থিক অগ্রগতি'}
          </p>
        </div>

        {isOverviewLoading ? (
          <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
            <Skeleton className="h-52 rounded-3xl" />
            <Skeleton className="h-52 rounded-3xl" />
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
            <Card className="rounded-3xl border-border-button-default bg-background-primary-default shadow-xs">
              <CardHeader className="border-b border-separator-border pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-title-3-semibold text-text-primary">{isEn ? 'Monthly rent' : 'মাসিক ভাড়া'}</CardTitle>
                    <CardDescription className="mt-1 text-caption-1-regular text-text-tertiary">
                      {currentMonth?.month
                        ? new Date(currentMonth.year, currentMonth.month - 1).toLocaleString(isEn ? 'en-US' : 'bn-BD', { month: 'long', year: 'numeric' })
                        : (isEn ? 'Current billing period' : 'চলতি বিলিং সময়')}
                    </CardDescription>
                  </div>
                  <DollarSign className="h-5 w-5 text-accent-600" />
                </div>
              </CardHeader>
              <CardContent className="grid gap-6 pt-5 sm:grid-cols-3">
                <FinancialFigure label={isEn ? 'Expected' : 'প্রত্যাশিত'} value={formatCurrency(currentMonth?.expected || 0, language)} />
                <FinancialFigure label={isEn ? 'Collected' : 'আদায়কৃত'} value={formatCurrency(currentMonth?.collected || 0, language)} accent />
                <FinancialFigure label={isEn ? 'Outstanding' : 'বকেয়া'} value={formatCurrency(currentMonth?.outstanding || 0, language)} danger />
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-border-button-default bg-background-primary-default shadow-xs">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-title-3-semibold text-text-primary">{t.collectionRate}</CardTitle>
                    <CardDescription className="mt-1 text-caption-1-regular text-text-tertiary">{isEn ? 'Collected vs expected' : 'আদায়ের অগ্রগতি'}</CardDescription>
                  </div>
                  <TrendingUp className="h-5 w-5 text-accent-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between gap-4">
                  <span className="text-4xl font-semibold tracking-tight text-text-primary tabular-nums">{formatNumber(collectionRate, language)}%</span>
                  <span className="pb-1 text-caption-1-regular text-text-tertiary tabular-nums">{formatNumber(currentMonth?.paidCount || 0, language)} {isEn ? 'fully paid' : 'সম্পূর্ণ পরিশোধিত'}</span>
                </div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-background-secondary-default">
                  <div className="h-full rounded-full bg-accent-500 transition-all" style={{ width: `${Math.min(Math.max(collectionRate, 0), 100)}%` }} />
                </div>
                <div className="mt-3 flex items-center justify-between text-caption-1-regular text-text-tertiary">
                  <span>{isEn ? 'Collection progress' : 'আদায়ের অগ্রগতি'}</span>
                  <span>{formatNumber(outstandingCount, language)} {isEn ? 'pending' : 'বকেয়া'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Alert Banner for Overdue / Pending items */}
        {outstandingCount > 0 && (
          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-amber-300 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/30 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-body-medium font-semibold text-amber-900 dark:text-amber-200">
                  {formatNumber(outstandingCount, language)} {isEn ? 'unpaid or overdue invoices require attention' : 'টি অপরিশোধিত বা বকেয়া রসিদে মনোযোগ প্রয়োজন'}
                </p>
                <p className="text-caption-1-regular text-amber-700 dark:text-amber-400">
                  {isEn
                    ? `Total outstanding due: ${formatCurrency(currentMonth?.outstanding || 0, language)}`
                    : `মোট বকেয়া টাকার পরিমাণ: ${formatCurrency(currentMonth?.outstanding || 0, language)}`}
                </p>
              </div>
            </div>
            <Link
              href="/rents?status=OVERDUE"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-caption-1-medium font-medium text-white transition-colors hover:bg-amber-700 shrink-0"
            >
              <span>{isEn ? 'Review Invoices & Send Notices' : 'বকেয়া রসিদ দেখুন ও নোটিশ পাঠান'}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </section>

      <section aria-labelledby="outstanding-heading">
        <Card className="rounded-3xl border-border-button-default bg-background-primary-default shadow-xs overflow-hidden">
          <CardHeader className="flex flex-col gap-3 border-b border-separator-border pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <CardTitle id="outstanding-heading" className="text-title-3-semibold text-text-primary">
                  {isEn ? 'Outstanding rent' : 'বকেয়া ভাড়া'}
                </CardTitle>
              </div>
              <CardDescription className="mt-1 text-caption-1-regular text-text-tertiary">
                {isEn ? 'Invoices that need attention' : 'যেসব বিলের জন্য পদক্ষেপ প্রয়োজন'}
              </CardDescription>
            </div>
            <Link href="/rents" className="inline-flex items-center gap-1 text-body-medium font-medium text-accent-600 hover:text-accent-700">
              {isEn ? 'View all rents' : 'সকল ভাড়া দেখুন'} <ArrowUpRight className="h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent className="p-0 pt-0">
            {isOutstandingLoading ? (
              <ResponsiveTableContainer className="border-0 rounded-none">
                <div className="hidden md:block overflow-x-auto">
                  <Table className="min-w-[850px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">{t.tenantName}</TableHead>
                        <TableHead className="min-w-[120px]">{t.unitNumber}</TableHead>
                        <TableHead align="left" className="min-w-[95px]">{isEn ? 'Month / Year' : 'মাস ও সাল'}</TableHead>
                        <TableHead align="right" className="min-w-[100px]">{t.total}</TableHead>
                        <TableHead align="right" className="min-w-[95px]">{t.paid}</TableHead>
                        <TableHead align="right" className="min-w-[95px]">{t.remaining}</TableHead>
                        <TableHead align="center" className="min-w-[95px]">{t.status}</TableHead>
                        <TableHead align="right" className="min-w-[120px]">{t.actions}</TableHead>
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
            ) : outstandingRents && outstandingRents.length > 0 ? (
              <ResponsiveTableContainer className="border-0 rounded-none">
                {/* Desktop Tabular View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table className="min-w-[850px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">{t.tenantName}</TableHead>
                        <TableHead className="min-w-[120px]">{t.unitNumber}</TableHead>
                        <TableHead align="left" className="min-w-[95px]">{isEn ? 'Month / Year' : 'মাস ও সাল'}</TableHead>
                        <TableHead align="right" className="min-w-[100px]">{t.total}</TableHead>
                        <TableHead align="right" className="min-w-[95px]">{t.paid}</TableHead>
                        <TableHead align="right" className="min-w-[95px]">{t.remaining}</TableHead>
                        <TableHead align="center" className="min-w-[95px]">{t.status}</TableHead>
                        <TableHead align="right" className="min-w-[120px]">{t.actions}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {outstandingRents.map((rent) => (
                        <TableRow key={rent.id}>
                          <TableCell className="min-w-[200px]">
                            <div className="min-w-0 max-w-[180px]">
                              <span className="font-semibold text-text-primary block truncate" title={rent.agreement?.tenant?.name || 'Tenant'}>
                                {rent.agreement?.tenant?.name || 'Tenant'}
                              </span>
                              <span className="block text-caption-1-regular font-normal text-text-tertiary truncate" title={rent.agreement?.tenant?.phone || ''}>
                                {rent.agreement?.tenant?.phone || '—'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="min-w-[120px]">
                            <div className="min-w-0">
                              <span className="font-semibold text-text-primary block">
                                {rent.agreement?.unit?.unitNumber || '—'}
                              </span>
                              <span className="block text-caption-1-regular text-text-tertiary truncate max-w-[120px]" title={rent.agreement?.unit?.property?.name || ''}>
                                {rent.agreement?.unit?.property?.name || '—'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell align="left" className="text-caption-1-regular text-text-tertiary whitespace-nowrap">
                            {rent.month}/{rent.year}
                          </TableCell>
                          <TableCell align="right" className="font-semibold text-text-primary whitespace-nowrap">
                            {formatCurrency(rent.totalAmount, language)}
                          </TableCell>
                          <TableCell align="right" className="font-medium text-accent-600 whitespace-nowrap">
                            {formatCurrency(rent.paidAmount, language)}
                          </TableCell>
                          <TableCell align="right" className="font-semibold text-text-error-primary whitespace-nowrap">
                            {formatCurrency(rent.remainingAmount, language)}
                          </TableCell>
                          <TableCell align="center">
                            <StatusBadge status={rent.status} lang={language} />
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenPayment(rent)}
                              className="h-8 gap-1.5 whitespace-nowrap text-caption-1-medium px-2.5 rounded-xl border-border-button-default hover:bg-background-secondary-hover"
                            >
                              <Wallet className="h-3.5 w-3.5 text-accent-600" />
                              <span>{isEn ? 'Collect' : 'আদায়'}</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile 2-Line Rows */}
                <div className="block md:hidden divide-y divide-separator-border">
                  {outstandingRents.map((rent) => {
                    const statusLabel =
                      rent.status === 'PAID' ? (isEn ? 'Paid' : 'পরিশোধিত') :
                        rent.status === 'PARTIAL' ? (isEn ? 'Partial' : 'আংশিক') :
                          rent.status === 'OVERDUE' ? (isEn ? 'Overdue' : 'বকেয়া') : (isEn ? 'Pending' : 'অপেক্ষমাণ');
                    const statusVariant =
                      rent.status === 'PAID' ? 'success' :
                        rent.status === 'PARTIAL' ? 'warning' :
                          rent.status === 'OVERDUE' ? 'danger' : 'neutral';

                    return (
                      <MobileDataRow
                        key={rent.id}
                        onClick={() => setDetailRent(rent)}
                        showChevron
                        identity={
                          <div className="min-w-0">
                            <span className="font-semibold text-body-medium text-text-primary truncate block">
                              {rent.agreement?.tenant?.name || 'Tenant'}
                            </span>
                          </div>
                        }
                        value={formatCurrency(rent.remainingAmount, language)}
                        stateAndDetail={
                          <>
                            <CompactStatus label={statusLabel} variant={statusVariant} />
                            <span className="text-text-quaternary">·</span>
                            <span>Unit {rent.agreement?.unit?.unitNumber || '—'}</span>
                            <span className="text-text-quaternary">·</span>
                            <span>{rent.month}/{rent.year}</span>
                          </>
                        }
                        action={
                          <Button
                            size="sm"
                            variant="default"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenPayment(rent);
                            }}
                            className="h-8 min-h-[40px] px-2.5 text-caption-1-medium rounded-xl gap-1"
                          >
                            <Wallet className="w-3.5 h-3.5" />
                            <span>{isEn ? 'Collect' : 'আদায়'}</span>
                          </Button>
                        }
                      />
                    );
                  })}
                </div>
              </ResponsiveTableContainer>
            ) : (
              <div className="p-5">
                <EmptyState
                  icon={CheckCircle2}
                  title={isEn ? 'No outstanding rents' : 'কোনো বকেয়া ভাড়া নেই'}
                  description={isEn ? 'All rent invoices for the current period have been fully collected.' : 'চলতি সময়ের সকল ফ্ল্যাটের ভাড়া শতভাগ আদায় সম্পন্ন হয়েছে।'}
                />
              </div>
            )}
          </CardContent>

          {/* Row Details Bottom Sheet on Mobile */}
          <BottomSheet open={!!detailRent} onOpenChange={(open) => !open && setDetailRent(null)}>
            {detailRent && (
              <BottomSheetContent>
                <BottomSheetHeader>
                  <BottomSheetTitle>
                    {detailRent.agreement?.tenant?.name || 'Tenant'}
                  </BottomSheetTitle>
                  <BottomSheetDescription>
                    {detailRent.agreement?.unit?.property?.name ? `${detailRent.agreement.unit.property.name} · ` : ''}
                    Unit {detailRent.agreement?.unit?.unitNumber || '—'}
                  </BottomSheetDescription>
                </BottomSheetHeader>

                <div className="py-2">
                  <DetailItem
                    label={isEn ? 'Billing Period' : 'ভাড়ার মাস'}
                    value={`${detailRent.month}/${detailRent.year}`}
                  />
                  <DetailItem
                    label={isEn ? 'Total Rent' : 'মোট ভাড়া'}
                    value={formatCurrency(detailRent.totalAmount, language)}
                    isNumeric
                  />
                  <DetailItem
                    label={isEn ? 'Paid Amount' : 'পরিশোধিত'}
                    value={formatCurrency(detailRent.paidAmount, language)}
                    isNumeric
                  />
                  <DetailItem
                    label={isEn ? 'Remaining Due' : 'বকেয়া'}
                    value={formatCurrency(detailRent.remainingAmount, language)}
                    isNumeric
                    highlight
                  />
                  {detailRent.dueDate && (
                    <DetailItem
                      label={isEn ? 'Due Date' : 'পরিশোধের তারিখ'}
                      value={formatBnDate(detailRent.dueDate, language)}
                    />
                  )}
                  <DetailItem
                    label={isEn ? 'Status' : 'অবস্থা'}
                    value={<StatusBadge status={detailRent.status} lang={language} />}
                  />
                  {detailRent.agreement?.tenant?.phone && (
                    <DetailItem
                      label={isEn ? 'Phone' : 'ফোন'}
                      value={detailRent.agreement.tenant.phone}
                    />
                  )}
                </div>

                <BottomSheetFooter>
                  <Button
                    onClick={() => {
                      const r = detailRent;
                      setDetailRent(null);
                      handleOpenPayment(r);
                    }}
                    className="w-full sm:w-auto min-h-[44px]"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    {isEn ? 'Collect Payment' : 'ভাড়া আদায় করুন'}
                  </Button>
                </BottomSheetFooter>
              </BottomSheetContent>
            )}
          </BottomSheet>
        </Card>
      </section>

      <CollectPaymentDialog rent={selectedRentForPayment} open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen} onSuccess={handlePaymentSuccess} />
    </div>
  );
}

function FinancialFigure({ label, value, accent = false, danger = false }: { label: string; value: string; accent?: boolean; danger?: boolean }) {
  return (
    <div>
      <p className="text-caption-1-medium text-text-secondary">{label}</p>
      <p className={cx('mt-2 text-title-2-semibold tracking-tight tabular-nums', danger ? 'text-text-error-primary' : accent ? 'text-accent-600' : 'text-text-primary')}>
        {value}
      </p>
    </div>
  );
}
