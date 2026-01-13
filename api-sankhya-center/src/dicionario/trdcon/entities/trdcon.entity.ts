import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity({ tableName: 'TRDCON' })
export class Trdcon {
  @PrimaryKey({ columnType: 'numeric' })
  nucontrole: number

  @Property({ columnType: 'varchar', nullable: true })
  descrcontrole?: string

  @Property({ columnType: 'varchar', nullable: true })
  tipocontrole?: string

  @Property({ columnType: 'varchar', nullable: true })
  tipofilhhos?: string

  @Property({ columnType: 'varchar', nullable: true })
  orifilhos?: string

  @Property({ columnType: 'varchar', nullable: true })
  nome?: string

  @Property({ columnType: 'varchar', nullable: true })
  adicional?: string

  @Property({ columnType: 'char', nullable: true })
  controle?: string

  @Property({ columnType: 'varchar', nullable: true })
  domain?: string
}
