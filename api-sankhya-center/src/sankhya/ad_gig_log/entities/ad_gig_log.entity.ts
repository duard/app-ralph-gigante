import { Entity, PrimaryKey, Property } from '@mikro-orm/core'

@Entity({ tableName: 'AD_GIG_LOG' })
export class AdGigLogEntity {
  @PrimaryKey()
  id: number

  @Property({ fieldName: 'ACAO', nullable: true })
  acao?: string

  @Property({ fieldName: 'TABELA', nullable: true })
  tabela?: string

  @Property({ fieldName: 'CODUSU', nullable: true })
  codusu?: number

  @Property({ fieldName: 'NOMEUSU', nullable: true })
  nomeusu?: string

  @Property({ fieldName: 'CAMPOS_ALTERADOS', nullable: true })
  camposAlterados?: string

  @Property({ fieldName: 'VERSAO_NOVA', nullable: true })
  versaoNova?: string

  @Property({ fieldName: 'VERSAO_ANTIGA', nullable: true })
  versaoAntiga?: string

  @Property({ fieldName: 'DTCREATED', nullable: true })
  dtcreated?: Date
}
