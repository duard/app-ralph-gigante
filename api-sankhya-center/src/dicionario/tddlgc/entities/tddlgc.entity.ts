import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity({ tableName: 'TDDLGC' })
export class Tddlgc {
  @PrimaryKey({ columnType: 'numeric' })
  nuinstorig: number

  @PrimaryKey({ columnType: 'numeric' })
  nucampoorig: number

  @PrimaryKey({ columnType: 'numeric' })
  nuinstdest: number

  @PrimaryKey({ columnType: 'numeric' })
  nucampodest: number

  @Property({ columnType: 'varchar', default: "'S'" })
  orig_obrigatoria: string

  @Property({ columnType: 'smallint', nullable: true })
  ordem?: number

  @Property({ columnType: 'char', nullable: true })
  controle?: string

  @Property({ columnType: 'varchar', nullable: true })
  domain?: string
}
