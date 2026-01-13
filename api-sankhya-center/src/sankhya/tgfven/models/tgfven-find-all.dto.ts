import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsNumber, IsString } from 'class-validator'
import { BaseFindAllDto } from '../../../common/dto/base-find-all.dto'

export class TgfvenFindAllDto extends BaseFindAllDto {
  @ApiPropertyOptional({ description: 'Código do parceiro' })
  @IsOptional()
  @IsNumber()
  codparc?: number

  @ApiPropertyOptional({ description: 'Nome do parceiro' })
  @IsOptional()
  @IsString()
  nomeparc?: string

  @ApiPropertyOptional({ description: 'Apelido do vendedor' })
  @IsOptional()
  @IsString()
  apelido?: string

  @ApiPropertyOptional({ description: 'Tipo de vendedor' })
  @IsOptional()
  @IsString()
  tipvend?: string
}
