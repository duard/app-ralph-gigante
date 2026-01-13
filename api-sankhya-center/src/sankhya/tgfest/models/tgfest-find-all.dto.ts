import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsNumber, IsString } from 'class-validator'
import { BaseFindAllDto } from '../../../common/dto/base-find-all.dto'

export class TgfestFindAllDto extends BaseFindAllDto {
  @ApiPropertyOptional({ description: 'Código da empresa' })
  @IsOptional()
  @IsNumber()
  codemp?: number

  @ApiPropertyOptional({ description: 'Código do local' })
  @IsOptional()
  @IsNumber()
  codlocal?: number

  @ApiPropertyOptional({ description: 'Código do produto' })
  @IsOptional()
  @IsNumber()
  codprod?: number

  @ApiPropertyOptional({ description: 'Controle' })
  @IsOptional()
  @IsString()
  controle?: string

  @ApiPropertyOptional({ description: 'Código do parceiro' })
  @IsOptional()
  @IsNumber()
  codparc?: number

  @ApiPropertyOptional({ description: 'Tipo' })
  @IsOptional()
  @IsString()
  tipo?: string

  @ApiPropertyOptional({ description: 'Estoque mínimo' })
  @IsOptional()
  @IsNumber()
  estmin?: number

  @ApiPropertyOptional({ description: 'Estoque máximo' })
  @IsOptional()
  @IsNumber()
  estmax?: number

  @ApiPropertyOptional({ description: 'Ativo (S/N)' })
  @IsOptional()
  @IsString()
  ativo?: string

  @ApiPropertyOptional({
    description: 'Estoque máximo para filtro (ex: <=5 para baixo)',
  })
  @IsOptional()
  @IsNumber()
  estoqueMax?: number
}
