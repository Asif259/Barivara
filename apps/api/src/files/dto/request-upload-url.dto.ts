import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsString,
  IsNotEmpty,
  IsPositive,
  IsOptional,
  IsUUID,
  MaxLength,
  Max,
} from 'class-validator';
import { FileCategory } from '@prisma/client';
import { Transform } from 'class-transformer';

export const UPLOAD_ENTITY_TYPES = ['tenant', 'property', 'unit', 'agreement'] as const;

export class RequestUploadUrlDto {
  @ApiProperty({
    enum: FileCategory,
    description: 'File category determines the target bucket and validation rules',
    example: 'TENANT_FRONT_NID',
  })
  @IsEnum(FileCategory)
  @IsNotEmpty()
  category: FileCategory;

  @ApiProperty({
    description: 'Original file name from the client',
    example: 'nid-front.jpg',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  originalName: string;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'image/jpeg',
  })
  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1048576,
  })
  @IsInt()
  @IsPositive()
  // Hard ceiling only; the per-category limit (images 5MB, documents 10MB, ...)
  // is enforced in FilesService so documents are not capped at the image limit.
  @Max(10 * 1024 * 1024, { message: 'ফাইলের আকার 10MB সীমা অতিক্রম করতে পারবে না।' })
  size: number;

  @ApiPropertyOptional({
    description: 'Entity type this file belongs to (e.g. "tenant", "property")',
    example: 'tenant',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase() : value))
  @IsIn(UPLOAD_ENTITY_TYPES as unknown as string[], {
    message: 'entityType অবশ্যই tenant, property, unit অথবা agreement হতে হবে',
  })
  @IsOptional()
  entityType?: string;

  @ApiPropertyOptional({
    description: 'UUID of the entity this file belongs to',
    example: 'a7043104-5dce-4969-a8bc-c33ff894bbbb',
  })
  @IsUUID()
  @IsOptional()
  entityId?: string;
}
