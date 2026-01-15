import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para produto com dados detalhados agregados
 * Inclui informações de estoque, preços, consumo e variações
 */
export class ProdutoDetalhadoDto {
  // ========== INFORMAÇÕES BÁSICAS ==========

  @ApiProperty({
    example: 3680,
    description: 'Código único do produto',
  })
  codprod: number;

  @ApiProperty({
    example: 'LUVA DE SEGURANÇA LATEX',
    description: 'Descrição do produto',
  })
  descrprod: string;

  @ApiProperty({
    example: 'VOLK',
    description: 'Marca do produto',
    nullable: true,
  })
  marca: string | null;

  @ApiProperty({
    example: 3010000,
    description: 'Código do grupo do produto',
    nullable: true,
  })
  codgrupoprod: number | null;

  @ApiProperty({
    example: 'EPI - LUVAS',
    description: 'Descrição do grupo do produto',
    nullable: true,
  })
  descrgrupoprod: string | null;

  @ApiProperty({
    example: 'S',
    description: 'Status do produto (S=Ativo, N=Inativo)',
    enum: ['S', 'N'],
  })
  ativo: 'S' | 'N';

  // ========== SISTEMA DE CONTROLE ==========

  @ApiProperty({
    example: 'N',
    description:
      'Tipo de controle: N=Simples, S=Lista, E=Série, L=Lote, P=Parceiro',
    enum: ['N', 'S', 'E', 'L', 'P'],
  })
  tipcontest: 'N' | 'S' | 'E' | 'L' | 'P';

  @ApiProperty({
    example: 'P;M;G;GG;XG',
    description: 'Lista de variações disponíveis (quando TIPCONTEST=S)',
    nullable: true,
  })
  liscontest: string | null;

  @ApiProperty({
    example: false,
    description: 'Indica se o produto tem controle de variações (TIPCONTEST !== N)',
  })
  hasControle: boolean;

  @ApiProperty({
    example: 0,
    description: 'Quantidade de variações distintas (se houver controle)',
  })
  controleCount: number;

  // ========== DADOS DE ESTOQUE ==========

  @ApiProperty({
    example: 175.0,
    description: 'Estoque total somado de todos os locais',
  })
  estoqueTotal: number;

  @ApiProperty({
    example: true,
    description: 'Indica se o produto tem estoque disponível',
  })
  temEstoque: boolean;

  // ========== ANÁLISE DE PREÇO (ÚLTIMOS 6 MESES) ==========

  @ApiProperty({
    example: 22.5,
    description: 'Preço médio ponderado das compras no período (por quantidade)',
    nullable: true,
  })
  precoMedioPonderado: number | null;

  @ApiProperty({
    example: 23.0,
    description: 'Preço da última compra DENTRO do período',
    nullable: true,
  })
  precoUltimaCompra: number | null;

  @ApiProperty({
    example: 20.0,
    description: 'Menor preço de compra no período',
    nullable: true,
  })
  precoMinimo: number | null;

  @ApiProperty({
    example: 25.0,
    description: 'Maior preço de compra no período',
    nullable: true,
  })
  precoMaximo: number | null;

  @ApiProperty({
    example: -3.01,
    description: 'Variação percentual do preço entre primeira e última compra',
    nullable: true,
  })
  variacaoPrecoPercentual: number | null;

  @ApiProperty({
    example: 'QUEDA',
    description: 'Tendência de preço: AUMENTO, QUEDA ou ESTAVEL',
    enum: ['AUMENTO', 'QUEDA', 'ESTAVEL'],
    nullable: true,
  })
  tendenciaPreco: 'AUMENTO' | 'QUEDA' | 'ESTAVEL' | null;

  // ========== INDICADORES DE CONSUMO ==========

  @ApiProperty({
    example: 12,
    description: 'Quantidade de compras realizadas nos últimos 6 meses',
  })
  qtdComprasUltimos6Meses: number;

  @ApiProperty({
    example: 5600.0,
    description: 'Total gasto em compras nos últimos 6 meses',
  })
  totalGastoUltimos6Meses: number;

  // ========== METADADOS ==========

  @ApiProperty({
    example: '2025-12-15T10:30:00.000Z',
    description: 'Data da última alteração do produto',
    nullable: true,
  })
  dtalter: string | null;

  @ApiProperty({
    example: 'CARLOS AQUINO',
    description: 'Nome do usuário que fez a última alteração',
    nullable: true,
  })
  nomeusualt: string | null;
}

/**
 * Metadados de paginação
 */
export class ProdutosDetalhadosMetaDto {
  @ApiProperty({
    example: 13281,
    description: 'Total de produtos que atendem aos filtros',
  })
  total: number;

  @ApiProperty({
    example: 1,
    description: 'Página atual',
  })
  page: number;

  @ApiProperty({
    example: 50,
    description: 'Quantidade de itens por página',
  })
  pageSize: number;

  @ApiProperty({
    example: 266,
    description: 'Total de páginas disponíveis',
  })
  totalPages: number;
}

/**
 * Estatísticas gerais dos produtos
 */
export class ProdutosDetalhadosStatsDto {
  @ApiProperty({
    example: 13281,
    description: 'Total de produtos cadastrados',
  })
  totalProdutos: number;

  @ApiProperty({
    example: 4920,
    description: 'Produtos com estoque disponível',
  })
  comEstoque: number;

  @ApiProperty({
    example: 8361,
    description: 'Produtos sem estoque',
  })
  semEstoque: number;

  @ApiProperty({
    example: 2407,
    description: 'Produtos com controle de variações (TIPCONTEST !== N)',
  })
  comControle: number;

  @ApiProperty({
    example: 11500,
    description: 'Produtos ativos',
  })
  ativos: number;

  @ApiProperty({
    example: 1781,
    description: 'Produtos inativos',
  })
  inativos: number;
}

/**
 * Response completo do endpoint de produtos detalhados
 */
export class ProdutosDetalhadosResponseDto {
  @ApiProperty({
    type: [ProdutoDetalhadoDto],
    description: 'Lista de produtos com dados detalhados',
  })
  data: ProdutoDetalhadoDto[];

  @ApiProperty({
    type: ProdutosDetalhadosMetaDto,
    description: 'Metadados de paginação',
  })
  meta: ProdutosDetalhadosMetaDto;

  @ApiProperty({
    type: ProdutosDetalhadosStatsDto,
    description: 'Estatísticas gerais',
  })
  stats: ProdutosDetalhadosStatsDto;
}
