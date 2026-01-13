import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsIn, IsOptional, IsString } from 'class-validator'
import { BaseFindAllDto } from '../../../common/dto/base-find-all.dto'

function TransformCsvToArray(): (target: any, key: string) => void {
  return Transform(({ value }) => {
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
    }
    return value
  })
}

export class TgfproBuscaAvancadaDto extends BaseFindAllDto {
  @ApiPropertyOptional({
    description:
      'Busca full text em campos relevantes (descrição, referência, características, marca, etc.)',
    example: 'parafuso aço inox',
  })
  @IsOptional()
  @IsString()
  busca?: string

  @ApiPropertyOptional({
    description:
      'Lista de códigos de produtos para incluir (separados por vírgula)',
    example: '1001,1002,1003',
  })
  @IsOptional()
  @TransformCsvToArray()
  incluirCodigos?: string[]

  @ApiPropertyOptional({
    description:
      'Lista de códigos de produtos para excluir (separados por vírgula)',
    example: '999,998,997',
  })
  @IsOptional()
  @TransformCsvToArray()
  excluirCodigos?: string[]

  @ApiPropertyOptional({
    description:
      'Lista de códigos de grupos de produtos para incluir (separados por vírgula)',
    example: '1,5,10',
  })
  @IsOptional()
  @TransformCsvToArray()
  incluirGrupos?: string[]

  @ApiPropertyOptional({
    description:
      'Lista de códigos de grupos de produtos para excluir (separados por vírgula)',
    example: '99,98,97',
  })
  @IsOptional()
  @TransformCsvToArray()
  excluirGrupos?: string[]

  @ApiPropertyOptional({
    description: 'Descrição do produto (busca parcial)',
    example: 'parafuso',
  })
  @IsOptional()
  @IsString()
  descrprod?: string

  @ApiPropertyOptional({
    description: 'Referência do produto (busca parcial)',
    example: 'PAR-001',
  })
  @IsOptional()
  @IsString()
  referencia?: string

  @ApiPropertyOptional({
    description: 'Marca do produto (busca parcial)',
    example: 'Vonder',
  })
  @IsOptional()
  @IsString()
  marca?: string

  @ApiPropertyOptional({
    description: 'Localização do produto (busca parcial)',
    example: 'A01-B02',
  })
  @IsOptional()
  @IsString()
  localizacao?: string

  @ApiPropertyOptional({
    description: 'Código NCM (busca parcial)',
    example: '7318',
  })
  @IsOptional()
  @IsString()
  ncm?: string

  @ApiPropertyOptional({
    description: 'Produto ativo',
    enum: ['S', 'N'],
    example: 'S',
  })
  @IsOptional()
  @IsIn(['S', 'N'])
  ativo?: string

  @ApiPropertyOptional({
    description: 'Produto em promoção',
    enum: ['S', 'N'],
    example: 'N',
  })
  @IsOptional()
  @IsIn(['S', 'N'])
  promocao?: string

  @ApiPropertyOptional({
    description: 'Usa controle de estoque mínimo',
    enum: ['S', 'N'],
    example: 'S',
  })
  @IsOptional()
  @IsIn(['S', 'N'])
  alertaestmin?: string

  @ApiPropertyOptional({
    description: 'Código do centro de custo',
    example: '1',
  })
  @IsOptional()
  @IsString()
  codcencus?: string

  @ApiPropertyOptional({
    description: 'Código do projeto',
    example: '10',
  })
  @IsOptional()
  @IsString()
  codproj?: string

  @ApiPropertyOptional({
    description: 'Ordenação dos resultados',
    example: 'DESCRPROD ASC',
    default: 'CODPROD DESC',
  })
  @IsOptional()
  @IsString()
  sort?: string

  @ApiPropertyOptional({
    description: 'Campos a retornar (separados por vírgula, ou * para todos)',
    example: 'CODPROD,DESCRPROD,CODGRUPOPROD,ATIVO',
    default: '*',
  })
  @IsOptional()
  @IsString()
  fields?: string
}
