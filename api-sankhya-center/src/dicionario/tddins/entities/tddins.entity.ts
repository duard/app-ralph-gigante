import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity({ tableName: 'TDDINS' })
export class Tddins {
  @PrimaryKey({ columnType: 'numeric' })
  nuinstancia: number

  @Property({ columnType: 'varchar' })
  nometab: string

  @Property({ columnType: 'varchar' })
  nomeinstancia: string

  @Property({ columnType: 'varchar' })
  descrinstancia: string

  @Property({ columnType: 'varchar', default: "'N'" })
  raiz: string

  @Property({ columnType: 'varchar', default: "'N'" })
  filtro: string

  @Property({ columnType: 'varchar', default: "'S'" })
  ativo: string

  @Property({ columnType: 'text', nullable: true })
  expressao?: string

  @Property({ columnType: 'numeric', nullable: true })
  nuinstanciapai?: number

  @Property({ columnType: 'varchar', nullable: true })
  nomescriptchave?: string

  @Property({ columnType: 'numeric', nullable: true })
  nuinstanciaext?: number

  @Property({ columnType: 'char', nullable: true })
  adicional?: string

  @Property({ columnType: 'varchar', nullable: true })
  resourceid?: string

  @Property({ columnType: 'char', default: "'L'" })
  definicaoinst: string

  @Property({ columnType: 'char', default: "'S'" })
  islib: string

  @Property({ columnType: 'char', nullable: true })
  controle?: string

  @Property({ columnType: 'varchar', nullable: true })
  descrtela?: string

  @Property({ columnType: 'varchar', nullable: true })
  categoria?: string

  @Property({ columnType: 'char', nullable: true })
  tipoform?: string

  @Property({ columnType: 'varchar', nullable: true })
  domain?: string
}
