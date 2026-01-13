import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity({ tableName: 'TFPDEP' })
export class TfpdepEntity {
  @PrimaryKey()
  coddep: number

  @Property({ fieldName: 'DESCRDEP' })
  descrdep: string

  @Property({ fieldName: 'CODEND', nullable: true })
  codend?: number

  @Property({ fieldName: 'NUMEND', nullable: true })
  numend?: string

  @Property({ fieldName: 'COMPLEMENTO', nullable: true })
  complemento?: string

  @Property({ fieldName: 'CODCENCUS' })
  codcencus: number

  @Property({ fieldName: 'CODREGFIS', nullable: true })
  codregfis?: number

  @Property({ fieldName: 'CODDEPPAI' })
  coddeppai: number

  @Property({ fieldName: 'GRAU' })
  grau: number

  @Property({ fieldName: 'ANALITICO' })
  analitico: string

  @Property({ fieldName: 'ATIVO' })
  ativo: string

  @Property({ fieldName: 'CODPARC' })
  codparc: number

  @Property({ fieldName: 'TIPPONTO' })
  tipponto: string

  @Property({ fieldName: 'DIAAPURAPONTO' })
  diaapuraponto: number

  @Property({ fieldName: 'TIPLOTACAO' })
  tiplotacao: number

  @Property({ fieldName: 'TPINSCPROP', nullable: true })
  tpinscprop?: number

  @Property({ fieldName: 'NRINSCPROP', nullable: true })
  nrinscprop?: string

  @Property({ fieldName: 'USADOESOCIAL' })
  usadoesocial: string

  @Property({ fieldName: 'NRINSCCONTRAT', nullable: true })
  nrinscontrat?: string

  @Property({ fieldName: 'TPINSCCONTRAT', nullable: true })
  tpinscontrat?: number

  @Property({ fieldName: 'CODPROJ', nullable: true })
  codproj?: number

  @Property({ fieldName: 'DHALTER' })
  dhalter: Date
}
