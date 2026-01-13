import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity({ tableName: 'TDDPCO' })
export class Tddpco {
  @PrimaryKey({ columnType: 'numeric' })
  nucampo: number

  @PrimaryKey({ columnType: 'varchar' })
  nome: string

  @Property({ columnType: 'text', nullable: true })
  valor?: string

  @Property({ columnType: 'char', nullable: true })
  controle?: string

  @Property({ columnType: 'varchar', nullable: true })
  domain?: string
}
