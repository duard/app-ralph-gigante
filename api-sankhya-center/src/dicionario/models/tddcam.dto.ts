import { ApiProperty } from '@nestjs/swagger'

/**
 * DTO para documentação e tipagem de resposta de Tddcam
 */
export class TddcamDto {
  @ApiProperty({
    description: 'Indica se o campo é adicional',
    required: false,
  })
  adicional?: string

  @ApiProperty({
    description: 'Tipo de apresentação do campo',
    required: false,
  })
  apresentacao?: string

  @ApiProperty({
    description: 'Indica se o campo é calculado',
    required: false,
  })
  calculado?: string

  @ApiProperty({ description: 'Descrição do campo', required: false })
  descrcampo?: string

  @ApiProperty({
    description: 'Expressão para cálculo do campo',
    required: false,
  })
  expressao?: string

  @ApiProperty({
    description: 'Máscara de formatação do campo',
    required: false,
  })
  mascara?: string

  @ApiProperty({ description: 'Nome do campo', required: false })
  nomecampo?: string

  @ApiProperty({ description: 'Nome da tabela', required: false })
  nometab?: string

  @ApiProperty({
    description: 'Número sequencial do campo',
    required: false,
    type: Number,
  })
  nucampo?: number

  @ApiProperty({
    description: 'Ordem de exibição do campo',
    required: false,
    type: Number,
  })
  ordem?: number

  @ApiProperty({
    description: 'Indica se permite valor padrão',
    required: false,
  })
  permitepadrao?: string

  @ApiProperty({ description: 'Indica se permite pesquisa', required: false })
  permitepesquisa?: string

  @ApiProperty({ description: 'Indica se é campo do sistema', required: false })
  sistema?: string

  @ApiProperty({
    description: 'Tamanho do campo',
    required: false,
    type: Number,
  })
  tamanho?: number

  @ApiProperty({ description: 'Tipo do campo', required: false })
  tipcampo?: string

  @ApiProperty({ description: 'Tipo de apresentação', required: false })
  tipoapresentacao?: string

  @ApiProperty({
    description: 'Indica se é visível no grid de pesquisa',
    required: false,
  })
  visivelgridpesquisa?: string
}
