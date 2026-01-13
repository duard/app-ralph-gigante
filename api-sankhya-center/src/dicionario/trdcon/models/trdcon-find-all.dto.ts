import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, IsNumber } from 'class-validator'
import { Type } from 'class-transformer'
import { BaseFindAllDto } from '../../../common/dto/base-find-all.dto'

export class TrdconFindAllDto extends BaseFindAllDto {
  @ApiProperty({ required: false, description: 'Número do controle' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  nucontrole?: number

  @ApiProperty({ required: false, description: 'Descrição do controle' })
  @IsOptional()
  @IsString()
  descrcontrole?: string

  @ApiProperty({ required: false, description: 'Tipo de controle' })
  @IsOptional()
  @IsString()
  tipocontrole?: string
}
