import { BadRequestException } from '@nestjs/common';
import { ErrorCode } from '../constants/error-codes';

/**
 * Builds a Prisma `orderBy` from a client-supplied sort column.
 *
 * The column is checked against an explicit allowlist of scalar fields so a
 * client cannot sort by relation names or unknown keys (which makes Prisma
 * throw a 500) or use ordering as an oracle on columns it should not see.
 */
export function buildOrderBy<T>(
  sortBy: string | undefined,
  allowed: readonly string[],
  sortOrder: 'asc' | 'desc' | undefined,
  fallback: T,
  defaultOrder: 'asc' | 'desc' = 'desc',
): Record<string, 'asc' | 'desc'> | T {
  if (!sortBy) return fallback;
  if (!allowed.includes(sortBy)) {
    throw new BadRequestException({
      errorCode: ErrorCode.VALIDATION_ERROR,
      message: `sortBy অবৈধ। অনুমোদিত: ${allowed.join(', ')}`,
    });
  }
  return { [sortBy]: sortOrder || defaultOrder };
}
