import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateApprovalDto {
  @IsString()
  @IsIn([
    'DEAL',
    'PARTNER',
    'GTM_PROPOSAL',
    'CONTRACT',
    'CAMPAIGN',
  ])
  entityType!: string;

  @IsString()
  entityId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comments?: string;
}