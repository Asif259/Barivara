'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { MonthlyReport, Property, ApiResponse } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/ui/stat-card';
import {
  RiDownloadLine,
  RiLineChartLine,
  RiErrorWarningLine,
  RiCheckboxCircleLine,
  RiWallet3Line,
  RiBuildingLine,
  RiPieChartLine,
} from '@remixicon/react';

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

export default function ReportsPage() {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);

  // 1. Fetch Properties
  const { data: properties } = useQuery({
    queryKey: ['properties-reports-dropdown'],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<Property[]>>('/properties?limit=100');
      return res.data?.data || [];
    },
  });

  // 2. Fetch Monthly Comprehensive Report
  const {
    data: report,
    isLoading,
  } = useQuery({
    queryKey: ['monthly-report', selectedYear, selectedMonth, selectedPropertyId],
    queryFn: async () => {
      let url = `/reports/monthly?year=${selectedYear}&month=${selectedMonth}`;
      if (selectedPropertyId) url += `&propertyId=${selectedPropertyId}`;
      const res = await apiClient.get<ApiResponse<MonthlyReport>>(url);
      return res.data?.data;
    },
  });

  // Export CSV
  const handleExportCSV = async () => {
    setIsExporting(true);
    let url = `/reports/monthly/export?year=${selectedYear}&month=${selectedMonth}`;
    if (selectedPropertyId) url += `&propertyId=${selectedPropertyId}`;

    const exportPromise = apiClient
      .get(url, { responseType: 'blob' })
      .then((response) => {
        const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `BariVara_Report_${selectedYear}_${selectedMonth}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });

    toast.promise(exportPromise, {
      loading: isEn ? 'Generating CSV report...' : 'CSV রিপোর্ট প্রস্তুত করা হচ্ছে...',
      success: isEn ? 'CSV Report downloaded!' : 'রিপোর্ট CSV ফাইলে ডাউনলোড হয়েছে!',
      error: isEn ? 'Failed to export CSV' : 'CSV ডাউনলোড করা সম্ভব হয়নি',
    });

    try {
      await exportPromise;
    } catch {
      // toast.promise displays error notification
    } finally {
      setIsExporting(false);
    }
  };

  const fin = report?.financialSummary;
  const netIncome = (fin?.collectedRent || 0) - (fin?.totalExpenses || 0);

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title={t.reports}
        description={isEn ? 'Financial statements, revenue vs expenses, and audit reports' : 'মাসিক সমন্বিত আর্থিক হিসাব, আয়-ব্যয় এবং সিএসভি রিপোর্ট'}
        action={
          <Button
            onClick={handleExportCSV}
            variant="default"
            className="h-10 gap-2"
            disabled={isExporting}
          >
            <RiDownloadLine className="w-4 h-4" />
            {isEn ? 'Export CSV' : 'CSV রিপোর্ট ডাউনলোড'}
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-background-primary-default p-3 rounded-2xl border border-border-button-default">
        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-secondary">{isEn ? 'Month:' : 'মাস:'}</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="h-9 rounded-lg border border-border-button-default bg-background-secondary-default px-3 text-xs font-semibold text-text-primary outline-none"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(2026, m - 1).toLocaleString(isEn ? 'en-US' : 'bn-BD', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-secondary">{isEn ? 'Year:' : 'সাল:'}</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="h-9 rounded-lg border border-border-button-default bg-background-secondary-default px-3 text-xs font-semibold text-text-primary outline-none"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Property Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-text-secondary">{t.properties}:</span>
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className="h-9 rounded-lg border border-border-button-default bg-background-secondary-default px-3 text-xs font-semibold text-text-primary outline-none max-w-[200px]"
          >
            <option value="">{isEn ? 'All Properties' : 'সকল বাড়ি'}</option>
            {properties?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-3xl" />)
        ) : (
          <>
            <StatCard
              title={isEn ? 'Collected Revenue' : 'আদায়কৃত মোট ভাড়া'}
              value={formatCurrency(fin?.collectedRent || 0, language)}
              subtitle={`${isEn ? 'Expected:' : 'প্রত্যাশিত:'} ${formatCurrency(fin?.expectedRent || 0, language)}`}
              icon={RiCheckboxCircleLine}
              iconColor="text-accent-700"
              iconBgColor="bg-accent-50"
              valueClassName="text-accent-700"
              badge={{
                text: `${fin?.collectionRate || 0}%`,
                variant: (fin?.collectionRate || 0) >= 90 ? 'success' : 'info',
              }}
              href="/payments"
            />
            <StatCard
              title={isEn ? 'Total Expenses' : 'মোট খরচাপাতি'}
              value={formatCurrency(fin?.totalExpenses || 0, language)}
              subtitle={isEn ? 'Electricity, repairs & maintenance' : 'বিদ্যুৎ, মেরামত ও পরিচালনা'}
              icon={RiWallet3Line}
              iconColor="text-text-error-primary"
              iconBgColor="bg-status-danger-subtle"
              valueClassName="text-text-error-primary"
              href="/expenses"
            />
            <StatCard
              title={isEn ? 'Net Operating Income' : 'নীট লাভ / আয়'}
              value={formatCurrency(netIncome, language)}
              subtitle={isEn ? 'Revenue minus operating costs' : 'মোট আদায় থেকে খরচ বাদ'}
              icon={RiLineChartLine}
              iconColor={netIncome >= 0 ? 'text-accent-700' : 'text-text-error-primary'}
              iconBgColor={netIncome >= 0 ? 'bg-accent-50' : 'bg-status-danger-subtle'}
              badge={netIncome >= 0 ? {
                text: isEn ? 'Profitable' : 'লাভজনক',
                variant: 'success',
              } : {
                text: isEn ? 'Deficit' : 'ঘাটতি',
                variant: 'danger',
              }}
            />
            <StatCard
              title={isEn ? 'Outstanding Due' : 'মোট বকেয়া'}
              value={formatCurrency(fin?.outstandingRent || 0, language)}
              subtitle={`${fin?.collectionRate || 0}% ${t.collectionRate}`}
              icon={RiErrorWarningLine}
              iconColor={fin?.outstandingRent ? 'text-text-error-primary' : 'text-accent-700'}
              iconBgColor={fin?.outstandingRent ? 'bg-status-danger-subtle' : 'bg-accent-50'}
              valueClassName={fin?.outstandingRent ? 'text-text-error-primary' : undefined}
              badge={fin?.outstandingRent ? {
                text: isEn ? 'Uncollected' : 'বকেয়া রয়েছে',
                variant: 'danger',
              } : {
                text: isEn ? 'Cleared' : 'পরিশোধিত',
                variant: 'success',
              }}
              href="/rents?status=OVERDUE"
            />
          </>
        )}
      </div>

      {/* Breakdown Details */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="rounded-3xl border border-border-button-default bg-background-primary-default">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-text-primary">
                <RiPieChartLine className="w-5 h-5 text-accent-700" />
                {isEn ? 'Rent Invoices by Status' : 'ভাড়ার বিলসমূহের বর্তমান অবস্থা'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-3 rounded-lg bg-accent-50 text-accent-800 font-medium">
                <span>{isEn ? 'Fully Paid Units' : 'সম্পূর্ণ পরিশোধিত ফ্ল্যাট'}:</span>
                <span className="font-bold">{report.rentsByStatus?.paid ?? '-'}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-status-warning-subtle text-status-warning-foreground font-medium">
                <span>{isEn ? 'Partial Paid Units' : 'আংশিক পরিশোধিত ফ্ল্যাট'}:</span>
                <span className="font-bold">{report.rentsByStatus?.partial ?? '-'}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-background-secondary-default text-text-primary font-medium">
                <span>{isEn ? 'Pending Units' : 'অপেক্ষমান ফ্ল্যাট'}:</span>
                <span className="font-bold">{report.rentsByStatus?.pending ?? '-'}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-status-danger-subtle text-text-error-primary font-medium">
                <span>{isEn ? 'Overdue Units' : 'মেয়াদোত্তীর্ণ ফ্ল্যাট'}:</span>
                <span className="font-bold">{report.rentsByStatus?.overdue ?? '-'}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-border-button-default bg-background-primary-default">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-text-primary">
                <RiBuildingLine className="w-5 h-5 text-accent-700" />
                {isEn ? 'Property Portfolio Stats' : 'বাড়ি ও ফ্ল্যাটের তথ্য'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-3 rounded-lg bg-background-secondary-default">
                <span className="text-text-secondary">{t.properties}:</span>
                <span className="font-bold text-text-primary">{report.totalProperties}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-background-secondary-default">
                <span className="text-text-secondary">{t.units}:</span>
                <span className="font-bold text-text-primary">{report.totalUnits}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-background-secondary-default">
                <span className="text-text-secondary">{t.tenants}:</span>
                <span className="font-bold text-text-primary">{report.totalTenants}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
