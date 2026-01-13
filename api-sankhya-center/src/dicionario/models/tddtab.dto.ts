import { ApiProperty } from '@nestjs/swagger'

/**
 * DTO para documentação e tipagem de resposta de Tddtab
 */
export class TddtabDto {
  @ApiProperty({
    description: 'Indica se a tabela é adicional',
    required: false,
  })
  adicional?: string

  @ApiProperty({ description: 'Descrição da tabela', required: false })
  descrtab?: string

  @ApiProperty({ description: 'Nome da tabela', required: false })
  nometab?: string

  @ApiProperty({
    description: 'Número do campo de numeração',
    required: false,
    type: Number,
  })
  nucamponumeracao?: number

  @ApiProperty({ description: 'Tipo de numeração', required: false })
  tiponumeracao?: string
}
