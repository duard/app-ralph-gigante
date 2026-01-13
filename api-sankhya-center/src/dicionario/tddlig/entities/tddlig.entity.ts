import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity({ tableName: 'TDDLIG' })
export class Tddlig {
  @PrimaryKey({ columnType: 'numeric' })
  nuinstorig: number

  @PrimaryKey({ columnType: 'numeric' })
  nuinstdest: number

  @Property({ columnType: 'varchar', default: "'I'" })
  tipligacao: string

  @Property({ columnType: 'text', nullable: true })
  expressao?: string

  @Property({ columnType: 'varchar', default: "'N'" })
  inserir: string

  @Property({ columnType: 'varchar', default: "'N'" })
  alterar: string

  @Property({ columnType: 'varchar', default: "'N'" })
  excluir: string

  @Property({ columnType: 'varchar', nullable: true, default: "'S'" })
  obrigatoria?: string

  @Property({ columnType: 'text', nullable: true })
  condicao?: string

  @Property({ columnType: 'char', nullable: true })
  adicional?: string

  @Property({ columnType: 'varchar', nullable: true })
  nomeligacao?: string

  @Property({ columnType: 'char', nullable: true })
  controle?: string

  @Property({ columnType: 'varchar', nullable: true })
  domain?: string
}
