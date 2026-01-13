import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, IsNumber } from 'class-validator'
import { Type } from 'class-transformer'
import { BaseFindAllDto } from '../../../common/dto/base-find-all.dto'

export class TddligFindAllDto extends BaseFindAllDto {
  @ApiProperty({ required: false, description: 'Número da instância origem' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  nuinstorig?: number

  @ApiProperty({ required: false, description: 'Número da instância destino' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  nuinstdest?: number

  @ApiProperty({ required: false, description: 'Tipo de ligação' })
  @IsOptional()
  @IsString()
  tipligacao?: string
}
