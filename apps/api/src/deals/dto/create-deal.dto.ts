import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateDealDto {
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  product?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  stage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  partnerRole?: string;

  @IsOptional()
  @IsDateString()
  expectedCloseDate?: string;

  @IsString()
  tenantId!: string;

  @IsOptional()
  @IsString()
  partnerId?: string;

  @IsOptional()
  @IsString()
  customerId?: string;
}