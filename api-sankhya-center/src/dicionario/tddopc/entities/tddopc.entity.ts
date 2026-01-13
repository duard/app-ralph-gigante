import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity({ tableName: 'TDDOPC' })
export class Tddopc {
  @PrimaryKey({ columnType: 'numeric' })
  nucampo: number

  @PrimaryKey({ columnType: 'varchar' })
  valor: string

  @Property({ columnType: 'varchar' })
  opcao: string

  @Property({ columnType: 'char', nullable: true, default: "'S'" })
  padrao?: string

  @Property({ columnType: 'smallint', nullable: true })
  ordem?: number

  @Property({ columnType: 'char', nullable: true })
  controle?: string

  @Property({ columnType: 'varchar', nullable: true })
  domain?: string
}
