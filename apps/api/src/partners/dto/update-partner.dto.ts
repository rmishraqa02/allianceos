import {
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';

export class UpdatePartnerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsUUID()
  partnerTypeId?: string | null;

  @IsOptional()
  @IsUUID()
  tierId?: string | null;

  @IsOptional()
  @IsUUID()
  statusId?: string | null;

  @IsOptional()
  @IsUUID()
  industryId?: string | null;

  @IsOptional()
  @IsUUID()
  regionId?: string | null;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  capabilityIds?: string[];
}