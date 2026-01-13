import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity({ tableName: 'TGFPAR' })
export class TgfparEntity {
  @PrimaryKey()
  codparc: number

  @Property({ fieldName: 'NOMEPARC', nullable: true })
  nomeparc?: string

  @Property({ fieldName: 'TIPPESSOA', nullable: true })
  tippessoa?: string

  @Property({ fieldName: 'CLIENTE', nullable: true })
  cliente?: string

  @Property({ fieldName: 'FORNECEDOR', nullable: true })
  fornecedor?: string

  @Property({ fieldName: 'VENDEDOR', nullable: true })
  vendedor?: string

  @Property({ fieldName: 'ATIVO', nullable: true })
  ativo?: string

  @Property({ fieldName: 'CODCID', nullable: true })
  codcid?: number

  @Property({ fieldName: 'CODBAI', nullable: true })
  codbai?: number

  @Property({ fieldName: 'CEP', nullable: true })
  cep?: string

  @Property({ fieldName: 'TELEFONE', nullable: true })
  telefone?: string

  @Property({ fieldName: 'EMAIL', nullable: true })
  email?: string

  @Property({ fieldName: 'CGC_CPF', nullable: true })
  cgcCpf?: string

  @Property({ fieldName: 'INSCRICAOESTADUAL', nullable: true })
  inscricaoestadual?: string

  @Property({ fieldName: 'ENDERECO', nullable: true })
  endereco?: string

  @Property({ fieldName: 'NUMERO', nullable: true })
  numero?: string

  @Property({ fieldName: 'BAIRRO', nullable: true })
  bairro?: string
}
