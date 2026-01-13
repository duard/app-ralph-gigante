import { IsOptional, IsNumber, IsString, IsDateString } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { BaseFindAllDto } from '../../../common/dto/base-find-all.dto'

export class TfpcarFindAllDto extends BaseFindAllDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  descrcargo?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ativo?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  codgrupocargo?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  codcarreira?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  contagemtempo?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tecnicocientifico?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  codescala?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  origativ?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  codnivelini?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  codnivelfim?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  dedicacaoexc?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  aposentaesp?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  possuinivel?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  acumcargo?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  contagemesp?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nrlei?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dtlei?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sitcargo?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  usadoesocial?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tempoaso?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  adExigecn?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  adSalbase?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  adCodemp?: number

  @ApiProperty({
    required: false,
    default: '*',
    description:
      'Campos a retornar. Modo include: separados por vírgula. Modo exclude: comece com - (ex: -ativo,-codusu). Use * para todos. Campos disponíveis: codcargo, descrcargo, dtalter, codusu, codcbo, responsabilidades, obs, ativo, codgrupocargo, codcarreira, contagemtempo, tecnicocientifico, codescala, origativ, codnivelini, codnivelfim, dedicacaoexc, aposentaesp, possuinivel, acumcargo, contagemesp, nrlei, dtlei, sitcargo, usadoesocial, tempoaso, adExigecn, adSalbase, adCodemp, tfpcbo, tfpcrr, tfpgca, tgpesc, tfpnivIni, tfpnivFim, tsiusu, funcionariosCount',
  })
  @IsOptional()
  @IsString()
  fields?: string = '*'
}
