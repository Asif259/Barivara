import { IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResetPasswordDirectDto {
  @ApiPropertyOptional({
    deprecated: true,
    description:
      'Ignored. The account is always the authenticated user; kept only so existing clients do not break.',
  })
  @IsOptional()
  @IsString()
  identifier?: string;

  @ApiProperty({ example: 'OldPassword123' })
  @IsString()
  @IsNotEmpty({ message: 'বর্তমান পাসওয়ার্ড প্রদান করুন' })
  currentPassword!: string;

  @ApiProperty({ example: 'NewSecurePassword123' })
  @IsString()
  @IsNotEmpty({ message: 'নতুন পাসওয়ার্ড প্রদান করুন' })
  @MinLength(8, { message: 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Password must contain uppercase, lowercase, and numbers/special characters',
  })
  newPassword!: string;

  @ApiProperty({ example: 'NewSecurePassword123' })
  @IsString()
  @IsNotEmpty({ message: 'নিশ্চিতকরণ পাসওয়ার্ড প্রদান করুন' })
  confirmPassword!: string;
}
