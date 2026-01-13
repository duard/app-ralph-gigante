import { IsOptional, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { BaseFindAllDto } from '../../../common/dto/base-find-all.dto'

export class PessoasFindAllDto extends BaseFindAllDto {
  @ApiProperty({
    required: false,
    default: 'funcionario_id DESC',
    description:
      'Ordenação. Exemplo: funcionario_id DESC, funcionario_nome ASC',
  })
  @IsOptional()
  @IsString()
  sort?: string = 'funcionario_id DESC'

  @ApiProperty({
    required: false,
    default: '*',
    description: 'Campos a retornar.',
  })
  @IsOptional()
  @IsString()
  fields?: string = '*'

  @ApiProperty({ required: false, description: 'Filtrar por nome' })
  @IsOptional()
  @IsString()
  search?: string

  @ApiProperty({
    required: false,
    description: 'Situação (0-Demitido, 1-Ativo)',
  })
  @IsOptional()
  @IsString()
  situacao?: string

  @ApiProperty({ required: false, description: 'Código da Empresa' })
  @IsOptional()
  @IsString()
  codemp?: string
}
