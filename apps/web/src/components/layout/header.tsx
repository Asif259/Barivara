'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  RiMenuLine,
  RiGlobalLine,
  RiSettings4Line,
  RiLogoutBoxRLine,
} from '@remixicon/react';
import { Button } from '@/components/ui/button';
import { SearchField } from '@/components/base/search-field/search-field';
import { ThemeToggle } from '@/components/application/theme/theme-toggle';
import {
  Dropdown,
  DropdownTrigger,
  DropdownPopover,
  DropdownGroup,
  DropdownItem,
  DropdownDivider,
} from '@/components/base/dropdown/dropdown';
import { useLanguageStore } from '@/stores/language-store';
import { useAuthStore } from '@/stores/auth-store';
import { useTranslation } from '@/lib/translations';

export function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { language, setLanguage } = useLanguageStore();
  const t = useTranslation(language);
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const pageContext = pathname.startsWith('/properties')
    ? t.properties
    : pathname.startsWith('/tenants')
      ? t.tenants
      : pathname.startsWith('/agreements')
        ? t.agreements
        : pathname.startsWith('/rents')
          ? t.monthlyRents
          : pathname.startsWith('/payments')
            ? t.payments
            : pathname.startsWith('/expenses')
              ? t.expenses
              : pathname.startsWith('/reports')
                ? t.reports
                : pathname.startsWith('/settings')
                  ? t.settings
                  : t.dashboard;

  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-separator-border bg-background-primary-default px-4 md:px-7">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg text-text-tertiary hover:bg-background-secondary-hover hover:text-text-primary transition-colors cursor-pointer"
          aria-label="Toggle Navigation"
        >
          <RiMenuLine className="h-5 w-5" />
        </button>
        <div className="hidden sm:block">
          <div className="flex items-center gap-2 text-caption-1-medium text-text-tertiary">
            <span>BariVara</span>
            <span className="text-text-tertiary">/</span>
            <span className="font-medium text-text-secondary">{pageContext}</span>
          </div>
          <p className="mt-0.5 text-caption-1-regular text-text-tertiary">
            {language === 'bn' ? 'স্বাগতম, ' : 'Welcome back, '}
            <span className="font-medium text-text-primary">{user?.name || 'Owner'}</span>
            <span className="mx-1.5 text-text-tertiary">·</span>
            {new Date().toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search Field */}
        <SearchField
          aria-label="Search"
          placeholder={t.search || 'Search...'}
          size="small"
          className="hidden md:flex w-44 lg:w-60"
        />

        {/* Theme Toggle */}
        <div className="hidden sm:flex items-center">
          <ThemeToggle appearance="segmented" size="small" />
        </div>

        {/* Language Switcher */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={toggleLanguage}
          className="gap-1.5 text-caption-1-medium text-text-secondary rounded-xl border-border-button-default hover:bg-background-secondary-hover"
        >
          <RiGlobalLine className="w-3.5 h-3.5 text-foreground-icon-secondary" />
          {language === 'bn' ? 'English' : 'বাংলা'}
        </Button>

        {/* User Dropdown */}
        <Dropdown>
          <DropdownTrigger className="flex h-9 w-9 items-center justify-center rounded-xl bg-background-secondary-default hover:bg-background-secondary-hover border border-border-button-default text-text-primary font-semibold text-body-medium transition-colors">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </DropdownTrigger>
          <DropdownPopover aria-label="User Menu" placement="bottom end" className="w-56">
            <DropdownGroup>
              <div className="px-2 py-1.5">
                <p className="text-body-medium font-semibold text-text-primary truncate">{user?.name || 'Owner'}</p>
                <p className="text-caption-1-regular text-text-tertiary truncate">{user?.email || user?.phone || 'Landlord'}</p>
              </div>
            </DropdownGroup>
            <DropdownDivider />
            <DropdownItem onSelect={() => router.push('/settings')} className="flex items-center gap-2">
              <RiSettings4Line className="h-4 w-4 text-foreground-icon-secondary" />
              <span>{t.settings}</span>
            </DropdownItem>
            <DropdownItem onSelect={handleLogout} className="flex items-center gap-2 text-text-error-primary">
              <RiLogoutBoxRLine className="h-4 w-4 text-foreground-icon-error" />
              <span>{t.logout}</span>
            </DropdownItem>
          </DropdownPopover>
        </Dropdown>
      </div>
    </header>
  );
}
