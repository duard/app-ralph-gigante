import { IsOptional, IsNumber, IsString, IsDateString } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { BaseFindAllDto } from '../../../common/dto/base-find-all.dto'

export class AdGigLogFindAllDto extends BaseFindAllDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  acao?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tabela?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  codusu?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nomeusu?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dtcreatedStart?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dtcreatedEnd?: string

  @ApiProperty({
    required: false,
    default: '*',
    description:
      'Campos a retornar. Modo include: separados por vírgula. Modo exclude: comece com - (ex: -camposAlterados,-versaoNova). Use * para todos. Campos disponíveis: id, acao, tabela, codusu, nomeusu, camposAlterados, versaoNova, versaoAntiga, dtcreated, tsiusu',
  })
  @IsOptional()
  @IsString()
  fields?: string = '*'
}
