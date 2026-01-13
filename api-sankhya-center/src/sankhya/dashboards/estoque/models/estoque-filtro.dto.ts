import {
  IsOptional,
  IsNumber,
  IsString,
  IsDateString,
  IsBoolean,
} from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { BaseFindAllDto } from '../../../../common/dto/base-find-all.dto'

/**
 * DTO para filtros de estoque
 */
export class EstoqueFiltroDto extends BaseFindAllDto {
  @ApiProperty({ required: false, description: 'Código do produto' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  codprod?: number

  @ApiProperty({ required: false, description: 'Descrição do produto' })
  @IsOptional()
  @IsString()
  descrprod?: string

  @ApiProperty({ required: false, description: 'Filtro por produtos ativos' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  ativo?: boolean

  @ApiProperty({
    required: false,
    description: 'Filtro por produtos com contestação',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  comContestacao?: boolean

  @ApiProperty({
    required: false,
    description: 'Filtro por estoque abaixo do mínimo',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  abaixoMinimo?: boolean

  @ApiProperty({
    required: false,
    description: 'Filtro por estoque acima do máximo',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  acimaMaximo?: boolean

  @ApiProperty({
    required: false,
    description: 'Data inicial para filtro de movimentação',
  })
  @IsOptional()
  @IsDateString()
  dataInicial?: string

  @ApiProperty({
    required: false,
    description: 'Data final para filtro de movimentação',
  })
  @IsOptional()
  @IsDateString()
  dataFinal?: string

  @ApiProperty({
    required: false,
    description: 'Ordenação padrão: diasEmEstoque DESC',
  })
  @IsOptional()
  @IsString()
  sort?: string = 'diasEmEstoque DESC'
}
