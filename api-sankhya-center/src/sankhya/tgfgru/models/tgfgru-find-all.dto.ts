import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsNumber, IsString, IsIn } from 'class-validator'
import { BaseFindAllDto } from '../../../common/dto/base-find-all.dto'

export class TgfgruFindAllDto extends BaseFindAllDto {
  @ApiPropertyOptional({ description: 'Descrição do grupo de produto' })
  @IsOptional()
  @IsString()
  descrgrupoprod?: string

  @ApiPropertyOptional({ description: 'Código do grupo pai' })
  @IsOptional()
  @IsNumber()
  codgrupai?: number

  @ApiPropertyOptional({ description: 'Analítico (S/N)', enum: ['S', 'N'] })
  @IsOptional()
  @IsIn(['S', 'N'])
  analitico?: string

  @ApiPropertyOptional({ description: 'Grupo ativo (S/N)', enum: ['S', 'N'] })
  @IsOptional()
  @IsIn(['S', 'N'])
  ativo?: string

  @ApiPropertyOptional({ description: 'Código da natureza' })
  @IsOptional()
  @IsNumber()
  codnat?: number

  @ApiPropertyOptional({ description: 'Centro de custo' })
  @IsOptional()
  @IsNumber()
  codcencus?: number

  @ApiPropertyOptional({ description: 'Projeto' })
  @IsOptional()
  @IsNumber()
  codproj?: number

  @ApiPropertyOptional({
    description: 'Solicitação de compra (S/N)',
    enum: ['S', 'N'],
  })
  @IsOptional()
  @IsIn(['S', 'N'])
  solcompra?: string

  @ApiPropertyOptional({ description: 'Regra WMS' })
  @IsOptional()
  @IsString()
  regrawms?: string

  @ApiPropertyOptional({
    description: 'Aprovação produto venda (S/N)',
    enum: ['S', 'N'],
  })
  @IsOptional()
  @IsIn(['S', 'N'])
  aprprodvda?: string
}
