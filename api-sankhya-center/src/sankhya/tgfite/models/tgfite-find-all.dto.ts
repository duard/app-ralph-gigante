import { Type } from 'class-transformer'
import { IsOptional, IsNumber } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { BaseFindAllDto } from '../../../common/dto/base-find-all.dto'

export class TgfiteFindAllDto extends BaseFindAllDto {
  @ApiProperty({ required: false })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  nunota?: number

  @ApiProperty({ required: false })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  codprod?: number

  @ApiProperty({ required: false })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  codgrupoprod?: number
}
