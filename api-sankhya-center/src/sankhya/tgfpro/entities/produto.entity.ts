import { Entity, PrimaryKey, Property, Index } from '@mikro-orm/core'

@Entity({ tableName: 'TGFPRO' })
@Index({ properties: ['descrprod'] })
@Index({ properties: ['referencia'] })
@Index({ properties: ['marca'] })
@Index({ properties: ['codgrupoprod'] })
export class Produto {
  @PrimaryKey({ columnType: 'numeric' })
  codprod: number

  @Property({ columnType: 'varchar' })
  descrprod: string

  @Property({ columnType: 'varchar', nullable: true })
  compldesc?: string

  @Property({ columnType: 'varchar', nullable: true })
  referencia?: string

  @Property({ columnType: 'numeric' })
  codgrupoprod: number

  @Property({ columnType: 'varchar', nullable: true })
  marca?: string

  @Property({ columnType: 'char' })
  ativo: string

  @Property({ columnType: 'varchar' })
  codvol: string

  @Property({ columnType: 'decimal' })
  pesobruto: number

  @Property({ columnType: 'decimal' })
  pesoliq: number

  @Property({ columnType: 'varchar', nullable: true })
  tipcontest?: string

  @Property({ columnType: 'text', nullable: true })
  liscontest?: string
}
