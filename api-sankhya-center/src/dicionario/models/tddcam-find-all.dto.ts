import { IsOptional, IsString, IsNumber } from 'class-validator'
import { Type } from 'class-transformer'
import { BaseFindAllDto } from '../../common/dto/base-find-all.dto'

/**
 * DTO para busca de campos do dicionário de dados
 */
export class TddcamFindAllDto extends BaseFindAllDto {
  @IsOptional()
  @IsString()
  nometab?: string

  @IsOptional()
  @IsString()
  nomecampo?: string

  @IsOptional()
  @IsString()
  descrcampo?: string

  @IsOptional()
  @IsString()
  tipcampo?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  ordem?: number

  @IsOptional()
  @IsString()
  sistema?: string

  @IsOptional()
  @IsString()
  calculado?: string
}
