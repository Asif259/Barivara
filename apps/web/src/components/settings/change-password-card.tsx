'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  RiLockLine,
  RiKey2Line,
  RiEyeLine,
  RiEyeOffLine,
  RiLoader4Line,
  RiShieldCheckLine,
  RiCheckboxCircleLine,
} from '@remixicon/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguageStore } from '@/stores/language-store';
import { useTranslation } from '@/lib/translations';
import { authApi, getApiErrorMessage } from '@/lib/api';
import { cx } from '@/utils/cx';

const passwordPattern = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;

export function ChangePasswordCard() {
  const { language } = useLanguageStore();
  const t = useTranslation(language);
  const isEn = language === 'en';

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const changePasswordSchema = z
    .object({
      currentPassword: z.string().min(1, {
        message: isEn ? 'Current password is required' : 'বর্তমান পাসওয়ার্ড প্রদান করুন',
      }),
      newPassword: z
        .string()
        .min(8, {
          message: isEn
            ? 'Password must be at least 8 characters'
            : 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে',
        })
        .regex(passwordPattern, {
          message: isEn
            ? 'Must include uppercase, lowercase, and a number or symbol'
            : 'পাসওয়ার্ডে বড় হাতের অক্ষর, ছোট হাতের অক্ষর এবং সংখ্যা বা বিশেষ চিহ্ন থাকতে হবে',
        }),
      confirmPassword: z.string().min(1, {
        message: isEn ? 'Please confirm your new password' : 'নতুন পাসওয়ার্ড নিশ্চিত করুন',
      }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: isEn ? 'Passwords do not match' : 'নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মিলছে না',
      path: ['confirmPassword'],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: isEn
        ? 'New password cannot be the same as current password'
        : 'নতুন পাসওয়ার্ড বর্তমান পাসওয়ার্ডের সমান হতে পারবে না',
      path: ['newPassword'],
    });

  type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    const changePromise = authApi.changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });

    toast.promise(changePromise, {
      loading: isEn ? 'Changing password...' : 'পাসওয়ার্ড পরিবর্তন করা হচ্ছে...',
      success: (response) => {
        reset();
        return response.data?.message || t.passwordChangedSuccess;
      },
      error: (error) => {
        return getApiErrorMessage(
          error,
          isEn ? 'Failed to change password.' : 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।'
        );
      },
    });

    try {
      await changePromise;
    } catch {
      // toast.promise displays error notification
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="rounded-3xl border-border-button-default bg-background-primary-default shadow-xs">
      <CardHeader>
        <CardTitle className="text-title-3-semibold text-text-primary flex items-center gap-2">
          <RiKey2Line className="w-5 h-5 text-accent-600" />
          {t.securitySettingsTitle}
        </CardTitle>
        <CardDescription className="text-body-medium text-text-tertiary">
          {t.securitySettingsDesc}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
          {/* Current Password */}
          <div className="space-y-1.5">
            <Label htmlFor="settingsCurrentPassword" className="text-caption-1-medium text-text-secondary">
              {t.currentPassword}
            </Label>
            <div className="relative">
              <RiLockLine className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-icon-tertiary" />
              <Input
                id="settingsCurrentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={cx(
                  'pl-9 pr-10 rounded-xl',
                  errors.currentPassword && 'border-border-error-default'
                )}
                {...register('currentPassword')}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-icon-tertiary hover:text-text-primary cursor-pointer"
                tabIndex={-1}
              >
                {showCurrentPassword ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-caption-1-regular text-text-error-primary">{errors.currentPassword.message}</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <Label htmlFor="settingsNewPassword" className="text-caption-1-medium text-text-secondary">
              {t.newPassword}
            </Label>
            <div className="relative">
              <RiKey2Line className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-icon-tertiary" />
              <Input
                id="settingsNewPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={cx(
                  'pl-9 pr-10 rounded-xl',
                  errors.newPassword && 'border-border-error-default'
                )}
                {...register('newPassword')}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-icon-tertiary hover:text-text-primary cursor-pointer"
                tabIndex={-1}
              >
                {showNewPassword ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-caption-1-regular text-text-error-primary">{errors.newPassword.message}</p>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <Label htmlFor="settingsConfirmPassword" className="text-caption-1-medium text-text-secondary">
              {t.confirmNewPassword}
            </Label>
            <div className="relative">
              <RiShieldCheckLine className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-icon-tertiary" />
              <Input
                id="settingsConfirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={cx(
                  'pl-9 pr-10 rounded-xl',
                  errors.confirmPassword && 'border-border-error-default'
                )}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-icon-tertiary hover:text-text-primary cursor-pointer"
                tabIndex={-1}
              >
                {showConfirmPassword ? <RiEyeOffLine className="w-4 h-4" /> : <RiEyeLine className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-caption-1-regular text-text-error-primary">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-linear-to-b from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white rounded-xl font-medium text-caption-1-medium h-9 px-4 gap-1.5 shadow-xs"
            >
              {isLoading ? (
                <>
                  <RiLoader4Line className="w-4 h-4 animate-spin" />
                  {t.changingPassword}
                </>
              ) : (
                <>
                  <RiCheckboxCircleLine className="w-4 h-4" />
                  {t.changePassword}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
