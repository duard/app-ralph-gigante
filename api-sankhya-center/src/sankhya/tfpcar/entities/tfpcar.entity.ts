import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity({ tableName: 'TFPCAR' })
export class TfpcarEntity {
  @PrimaryKey()
  codcargo: number

  @Property({ fieldName: 'DESCRCARGO' })
  descrcargo: string

  @Property({ fieldName: 'DTALTER' })
  dtalter: Date

  @Property({ fieldName: 'CODUSU', nullable: true })
  codusu?: number

  @Property({ fieldName: 'CODCBO', nullable: true })
  codcbo?: number

  @Property({ fieldName: 'RESPONSABILIDADES', nullable: true })
  responsabilidades?: string

  @Property({ fieldName: 'OBS', nullable: true })
  obs?: string

  @Property({ fieldName: 'ATIVO' })
  ativo: string

  @Property({ fieldName: 'CODGRUPOCARGO' })
  codgrupocargo: number

  @Property({ fieldName: 'CODCARREIRA', nullable: true })
  codcarreira?: number

  @Property({ fieldName: 'CONTAGEMTEMPO' })
  contagemtempo: string

  @Property({ fieldName: 'TECNICOCIENTIFICO', nullable: true })
  tecnicocientifico?: string

  @Property({ fieldName: 'CODESCALA', nullable: true })
  codescala?: number

  @Property({ fieldName: 'ORIGATIV' })
  origativ: number

  @Property({ fieldName: 'CODNIVELINI', nullable: true })
  codnivelini?: number

  @Property({ fieldName: 'CODNIVELFIM', nullable: true })
  codnivelfim?: number

  @Property({ fieldName: 'DEDICACAOEXC' })
  dedicacaoexc: string

  @Property({ fieldName: 'APOSENTAESP' })
  aposentaesp: string

  @Property({ fieldName: 'POSSUINIVEL' })
  possuinivel: string

  @Property({ fieldName: 'ACUMCARGO', nullable: true })
  acumcargo?: number

  @Property({ fieldName: 'CONTAGEMESP', nullable: true })
  contagemesp?: number

  @Property({ fieldName: 'NRLEI', nullable: true })
  nrlei?: string

  @Property({ fieldName: 'DTLEI', nullable: true })
  dtlei?: Date

  @Property({ fieldName: 'SITCARGO', nullable: true })
  sitcargo?: number

  @Property({ fieldName: 'USADOESOCIAL' })
  usadoesocial: string

  @Property({ fieldName: 'TEMPOASO', nullable: true })
  tempoaso?: number

  @Property({ fieldName: 'AD_EXIGECNH', nullable: true })
  adExigecn?: string

  @Property({ fieldName: 'AD_SALBASE', nullable: true })
  adSalbase?: number

  @Property({ fieldName: 'AD_CODEMP', nullable: true })
  adCodemp?: number
}
