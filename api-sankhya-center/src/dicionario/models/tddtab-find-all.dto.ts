import { IsOptional, IsString } from 'class-validator'
import { BaseFindAllDto } from '../../common/dto/base-find-all.dto'

/**
 * DTO para busca de tabelas do dicionário de dados
 */
export class TddtabFindAllDto extends BaseFindAllDto {
  @IsOptional()
  @IsString()
  nometab?: string

  @IsOptional()
  @IsString()
  descrtab?: string

  @IsOptional()
  @IsString()
  adicional?: string
}
