import 'reflect-metadata';
import { validate } from './env.validation';

describe('environment validation', () => {
  const required = {
    DATABASE_URL: 'postgresql://localhost:5432/barivara',
    JWT_ACCESS_SECRET: 'a'.repeat(40),
    JWT_REFRESH_SECRET: 'r'.repeat(40),
    SUPABASE_URL: 'https://project.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
    SMTP_USER: 'test@gmail.com',
    SMTP_PASS: 'mock-google-app-password',
  };

  it('requires runtime secrets outside test', () => {
    expect(() => validate({ NODE_ENV: 'production' })).toThrow('Environment validation failed');
  });

  it('permits isolated tests without production infrastructure', () => {
    expect(validate({ NODE_ENV: 'test' }).NODE_ENV).toBe('test');
  });

  it('accepts a complete production configuration', () => {
    expect(validate({ NODE_ENV: 'production', ...required }).NODE_ENV).toBe('production');
  });

  it('rejects short JWT secrets in production', () => {
    expect(() =>
      validate({ NODE_ENV: 'production', ...required, JWT_ACCESS_SECRET: 'short' }),
    ).toThrow('JWT_ACCESS_SECRET');
  });

  it('rejects identical access and refresh secrets in production', () => {
    expect(() =>
      validate({
        NODE_ENV: 'production',
        ...required,
        JWT_REFRESH_SECRET: required.JWT_ACCESS_SECRET,
      }),
    ).toThrow('must differ');
  });

  it('does not enforce secret strength outside production', () => {
    expect(() =>
      validate({
        NODE_ENV: 'development',
        ...required,
        JWT_ACCESS_SECRET: 'x',
        JWT_REFRESH_SECRET: 'x',
      }),
    ).not.toThrow();
  });
});
