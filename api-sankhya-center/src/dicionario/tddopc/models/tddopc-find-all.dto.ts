import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsNumber, IsString } from 'class-validator'
import { Type } from 'class-transformer'
import { BaseFindAllDto } from '../../../common/dto/base-find-all.dto'

/**
 * DTO para filtros de opções de campos (TDDOPC)
 */
export class TddopcFindAllDto extends BaseFindAllDto {
  @ApiProperty({ required: false, description: 'Número do campo' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  nucampo?: number

  @ApiProperty({ required: false, description: 'Valor da opção' })
  @IsOptional()
  @IsString()
  valor?: string

  @ApiProperty({ required: false, description: 'Descrição da opção' })
  @IsOptional()
  @IsString()
  opcao?: string

  @ApiProperty({ required: false, description: 'É padrão (S/N)' })
  @IsOptional()
  @IsString()
  padrao?: string
}
