import { IsOptional, IsNumber, IsString } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { BaseFindAllDto } from '../../../common/dto/base-find-all.dto'

export class TfpdepFindAllDto extends BaseFindAllDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descrdep?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ativo?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  coddep?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  codcencus?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  analitico?: string

  @ApiProperty({
    required: false,
    default: '*',
    description:
      'Campos a retornar. Modo include: separados por vírgula. Modo exclude: comece com - (ex: -ativo,-dhalter). Use * para todos. Campos disponíveis: coddep, descrdep, codend, numend, complemento, codcencus, codregfis, coddeppai, grau, analitico, ativo, codparc, tipponto, diaapuraponto, tiplotacao, tpinscprop, nrinscprop, usadoesocial, nrinscontrat, tpinscontrat, codproj, dhalter, tsicus, tgpfis, tgfpar, tsiend, funcionariosCount',
  })
  @IsOptional()
  @IsString()
  fields?: string = '*'
}
