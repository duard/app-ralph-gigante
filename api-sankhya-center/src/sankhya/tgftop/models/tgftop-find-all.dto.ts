import { IsOptional, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { BaseFindAllDto } from '../../../common/dto/base-find-all.dto'

export class TgftopFindAllDto extends BaseFindAllDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descrtipoper?: string
}
