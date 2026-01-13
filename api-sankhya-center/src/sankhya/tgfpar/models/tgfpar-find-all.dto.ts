import { IsOptional, IsNumber, IsString } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { BaseFindAllDto } from '../../../common/dto/base-find-all.dto'

export class TgfparFindAllDto extends BaseFindAllDto {
  @ApiProperty({
    required: false,
    default: '*',
    description:
      'Campos a retornar. Modo include: separados por vírgula. Modo exclude: comece com - (ex: -cliente,-fornecedor). Use * para todos. Campos disponíveis: codparc, nomeparc, razaosocial, nomefantasia, tippessoa, cliente, fornecedor, vendedor, ativo, codcid, codbai, cep, telefone, email, cgcCpf, inscricaoestadual, endereco, numero, bairro, tcicid, tsibai, tsicus, tgpfis, tsiemp, tsiusu',
  })
  @IsOptional()
  @IsString()
  fields?: string = '*'

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nomeparc?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cliente?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fornecedor?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  vendedor?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ativo?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  email?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cep?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cgcCpf?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  tippessoa?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  codcid?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  codbai?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  inscricaoestadual?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  endereco?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  numero?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  codus?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  codemp?: number

  @ApiProperty({
    required: false,
    description: 'Data de cadastro a partir de (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  dtcadFrom?: string

  @ApiProperty({
    required: false,
    description: 'Data de cadastro até (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  dtcadTo?: string

  @ApiProperty({
    required: false,
    description: 'Data de alteração a partir de (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  dtalterFrom?: string

  @ApiProperty({
    required: false,
    description: 'Data de alteração até (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  dtalterTo?: string
}
