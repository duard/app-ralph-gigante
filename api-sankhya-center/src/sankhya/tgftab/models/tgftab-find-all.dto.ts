import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsNumber, IsString } from 'class-validator'
import { BaseFindAllDto } from '../../../common/dto/base-find-all.dto'

export class TgftabFindAllDto extends BaseFindAllDto {
  @ApiPropertyOptional({ description: 'Código da região' })
  @IsOptional()
  @IsNumber()
  codreg?: number

  @ApiPropertyOptional({ description: 'Nome da tabela' })
  @IsOptional()
  @IsString()
  nometab?: string
}
