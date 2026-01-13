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
 * DTO para filtros de produtos no dashboard
 * Estende BaseFindAllDto para reutilizar paginação, ordenação e seleção de campos
 */
export class ProdutosFiltroDto extends BaseFindAllDto {
  @ApiProperty({ required: false, description: 'Código do produto' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  codprod?: number

  @ApiProperty({
    required: false,
    description: 'Descrição do produto (partial match)',
  })
  @IsOptional()
  @IsString()
  descrprod?: string

  @ApiProperty({ required: false, description: 'Referência do produto' })
  @IsOptional()
  @IsString()
  referencia?: string

  @ApiProperty({ required: false, description: 'Filtro por produtos ativos' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  ativo?: boolean

  @ApiProperty({ required: false, description: 'Código do grupo de produtos' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  codgrupoprod?: number

  @ApiProperty({ required: false, description: 'Data inicial para filtro' })
  @IsOptional()
  @IsDateString()
  dataInicial?: string

  @ApiProperty({ required: false, description: 'Data final para filtro' })
  @IsOptional()
  @IsDateString()
  dataFinal?: string

  @ApiProperty({
    required: false,
    description: 'Limite de estoque para alerta',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limiteEstoque?: number

  @ApiProperty({
    required: false,
    description: 'Ordenação padrão: DESCRPROD ASC',
  })
  @IsOptional()
  @IsString()
  sort?: string = 'DESCRPROD ASC'

  @ApiProperty({ required: false, description: 'Ordenação alternativa' })
  @IsOptional()
  @IsString()
  ordenacao?: string

  @ApiProperty({ required: false, description: 'Página' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pagina?: number

  @ApiProperty({ required: false, description: 'Itens por página' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  itensPorPagina?: number
}
