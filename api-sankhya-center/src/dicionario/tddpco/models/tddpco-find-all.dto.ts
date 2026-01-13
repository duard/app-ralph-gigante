import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, IsNumber } from 'class-validator'
import { Type } from 'class-transformer'
import { BaseFindAllDto } from '../../../common/dto/base-find-all.dto'

/**
 * DTO para filtros de parâmetros de campos (TDDPCO)
 */
export class TddpcoFindAllDto extends BaseFindAllDto {
  @ApiProperty({ required: false, description: 'Número do campo' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  nucampo?: number

  @ApiProperty({ required: false, description: 'Nome do parâmetro' })
  @IsOptional()
  @IsString()
  nome?: string

  @ApiProperty({ required: false, description: 'Valor do parâmetro' })
  @IsOptional()
  @IsString()
  valor?: string

  @ApiProperty({ required: false, description: 'Controle (S/N)' })
  @IsOptional()
  @IsString()
  controle?: string
}
