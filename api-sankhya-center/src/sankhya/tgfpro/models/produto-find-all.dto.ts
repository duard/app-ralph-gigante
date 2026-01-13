import { ApiProperty } from '@nestjs/swagger'
import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsIn,
} from 'class-validator'
import { Type } from 'class-transformer'
import { BaseFindAllDto } from '../../../common/dto/base-find-all.dto'

export class ProdutoFindAllDto extends BaseFindAllDto {
  // Search global poderoso
  @ApiProperty({
    required: false,
    description:
      'Busca global em múltiplos campos (código, descrição, referência, marca, etc.)',
    example: 'parafuso',
  })
  @IsOptional()
  @IsString()
  search?: string

  // Filtros específicos
  @ApiProperty({
    required: false,
    description: 'Código do produto',
    example: 123,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  codprod?: number

  @ApiProperty({
    required: false,
    description: 'Descrição do produto (busca parcial)',
    example: 'PARAFUSO',
  })
  @IsOptional()
  @IsString()
  descrprod?: string

  @ApiProperty({
    required: false,
    description: 'Referência do produto',
    example: 'P12345',
  })
  @IsOptional()
  @IsString()
  referencia?: string

  @ApiProperty({
    required: false,
    description: 'Código do grupo de produto',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  codgrupoprod?: number

  @ApiProperty({
    required: false,
    description: 'Marca do produto',
    example: 'GENERICO',
  })
  @IsOptional()
  @IsString()
  marca?: string

  @ApiProperty({
    required: false,
    description: 'Status ativo',
    enum: ['S', 'N'],
    example: 'S',
  })
  @IsOptional()
  @IsIn(['S', 'N'])
  ativo?: string

  // Filtros de controle TITCONTEST/LISCONTEST
  @ApiProperty({
    required: false,
    description: 'Tipo de controle (TITCONTEST)',
    example: 'MEDIDA',
  })
  @IsOptional()
  @IsString()
  tipcontest?: string

  @ApiProperty({
    required: false,
    description: 'Lista de controle contém (busca em LISCONTEST)',
    example: '500ML',
  })
  @IsOptional()
  @IsString()
  liscontest?: string
}
