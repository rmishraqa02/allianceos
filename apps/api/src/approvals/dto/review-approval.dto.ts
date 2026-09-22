import {
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ReviewApprovalDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comments?: string;
}