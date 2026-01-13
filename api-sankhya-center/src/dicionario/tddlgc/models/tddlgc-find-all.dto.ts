import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, IsNumber } from 'class-validator'
import { Type } from 'class-transformer'
import { BaseFindAllDto } from '../../../common/dto/base-find-all.dto'

export class TddlgcFindAllDto extends BaseFindAllDto {
  @ApiProperty({ required: false, description: 'Número da instância origem' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  nuinstorig?: number

  @ApiProperty({ required: false, description: 'Número do campo origem' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  nucampoorig?: number

  @ApiProperty({ required: false, description: 'Número da instância destino' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  nuinstdest?: number

  @ApiProperty({ required: false, description: 'Número do campo destino' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  nucampodest?: number
}
