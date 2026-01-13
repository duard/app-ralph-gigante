import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, IsNumber } from 'class-validator'
import { Type } from 'class-transformer'
import { BaseFindAllDto } from '../../../common/dto/base-find-all.dto'

export class TddinsFindAllDto extends BaseFindAllDto {
  @ApiProperty({ required: false, description: 'Número da instância' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  nuinstancia?: number

  @ApiProperty({ required: false, description: 'Nome da tabela' })
  @IsOptional()
  @IsString()
  nometab?: string

  @ApiProperty({ required: false, description: 'Nome da instância' })
  @IsOptional()
  @IsString()
  nomeinstancia?: string

  @ApiProperty({ required: false, description: 'Ativo (S/N)' })
  @IsOptional()
  @IsString()
  ativo?: string
}
