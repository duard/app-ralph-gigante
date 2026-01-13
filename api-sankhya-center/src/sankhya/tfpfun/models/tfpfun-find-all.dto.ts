import { IsOptional, IsNumber, IsString } from 'class-validator'
import { Type } from 'class-transformer'
import { IsArray, ArrayNotEmpty } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { BaseFindAllDto } from '../../../common/dto/base-find-all.dto'

export class TfpfunFindAllDto extends BaseFindAllDto {
  @ApiProperty({
    required: false,
    default: 'DTADM DESC',
    description: 'Ordenação. Exemplo: DTADM DESC, NOMEFUNC ASC',
  })
  @IsOptional()
  @IsString()
  sort?: string = 'DTADM DESC'

  @ApiProperty({
    required: false,
    default: '*',
    description:
      'Campos a retornar. Modo include: separados por vírgula. Modo exclude: comece com - (ex: -nomefunc,-dtadm). Use * para todos.',
  })
  @IsOptional()
  @IsString()
  fields?: string = '*'

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nomefunc?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  situacao?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  codcargo?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  coddep?: number

  @ApiProperty({
    required: false,
    description: 'Data de admissão a partir de (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  dtadmFrom?: string

  @ApiProperty({
    required: false,
    description: 'Data de admissão até (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  dtadmTo?: string

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
  @IsString()
  emailusu?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  codparc?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nomeparc?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  codcencus?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  emailCorporativo?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsArray()
  @ArrayNotEmpty()
  coddeps?: number[]

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsArray()
  @ArrayNotEmpty()
  codcargos?: number[]

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsArray()
  @ArrayNotEmpty()
  codcencusList?: number[]

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  nome?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  email?: string

  @ApiProperty({
    required: false,
    description: 'Data de nascimento de (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  dtNascFrom?: string

  @ApiProperty({
    required: false,
    description: 'Data de nascimento até (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  dtNascTo?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  idadeMin?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  idadeMax?: number
}
