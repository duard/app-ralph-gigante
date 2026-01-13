import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator'
import { BaseFindAllDto } from '../../../common/dto/base-find-all.dto'

export class TgfproFindAllDto extends BaseFindAllDto {
  @ApiPropertyOptional({ description: 'Código do grupo de produto' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  codgrupoprod?: number

  @ApiPropertyOptional({ description: 'Descrição do produto' })
  @IsOptional()
  @IsString()
  descrprod?: string

  @ApiPropertyOptional({ description: 'Referência do produto' })
  @IsOptional()
  @IsString()
  referencia?: string

  @ApiPropertyOptional({ description: 'Código NCM' })
  @IsOptional()
  @IsString()
  ncm?: string

  @ApiPropertyOptional({ description: 'Produto ativo (S/N)', enum: ['S', 'N'] })
  @IsOptional()
  @IsIn(['S', 'N'])
  ativo?: string

  @ApiPropertyOptional({ description: 'Código do centro de custo' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  codcencus?: number

  // === CAMPOS PARA SEARCH ULTRA PODEROSO ===
  @ApiPropertyOptional({
    description:
      'Busca global em múltiplos campos (código, descrição, referência, marca, controle, etc.)',
    example: 'parafuso',
  })
  @IsOptional()
  @IsString()
  search?: string

  // === FILTROS DE CONTROLE ===
  @ApiPropertyOptional({
    description: 'Tipo de controle (TIPCONTEST) - ex: MEDIDA, PESO',
    example: 'MEDIDA',
  })
  @IsOptional()
  @IsString()
  tipcontest?: string

  @ApiPropertyOptional({
    description: 'Lista de controle contém (LISCONTEST) - ex: 500ML, 1KG',
    example: '500ML',
  })
  @IsOptional()
  @IsString()
  liscontest?: string

  // === FILTROS ADICIONAIS ===
  @ApiPropertyOptional({ description: 'Marca do produto' })
  @IsOptional()
  @IsString()
  marca?: string

  @ApiPropertyOptional({ description: 'Localização' })
  @IsOptional()
  @IsString()
  localizacao?: string

  @ApiPropertyOptional({
    description: 'Incluir agregados de estoque (S/N)',
    enum: ['S', 'N'],
  })
  @IsOptional()
  @IsIn(['S', 'N'])
  includeEstoque?: string

  @ApiPropertyOptional({
    description: 'Incluir joins de grupo/volume (S/N)',
    enum: ['S', 'N'],
  })
  @IsOptional()
  @IsIn(['S', 'N'])
  includeJoins?: string
}
