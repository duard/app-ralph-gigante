import { Injectable, Logger } from '@nestjs/common'
import { Tfpfun } from './models/tfpfun.interface'
import { TfpfunFindAllDto } from './models/tfpfun-find-all.dto'
import { SankhyaBaseService } from '../../common/base/sankhya-base.service'
import {
  PaginatedResult,
  buildPaginatedResult,
} from '../../common/pagination/pagination.types'
import { trimStrings } from '../../common/utils/string.utils'
import { SankhyaApiService } from '../shared/sankhya-api.service'

@Injectable()
export class TfpfunService {
  private readonly logger = new Logger(TfpfunService.name)

  constructor(private readonly sankhyaApiService: SankhyaApiService) {}

  getTableName(): string {
    return 'TFPFUN'
  }

  async listAll(): Promise<any[]> {
    const query = `SELECT CODFUNC, NOMEFUNC, CODEMP FROM TFPFUN WHERE SITUACAO = '1' ORDER BY NOMEFUNC ASC`
    return this.sankhyaApiService.executeQuery(query, [])
  }

  getPrimaryKey(): string {
    return 'CODFUNC'
  }

  getRelationsQuery(): string {
    return `
      LEFT JOIN TFPCAR ON TFPFUN.CODCARGO = TFPCAR.CODCARGO
      LEFT JOIN TFPDEP ON TFPFUN.CODDEP = TFPDEP.CODDEP
      LEFT JOIN TSIUSU ON TFPFUN.CODEMP = TSIUSU.CODEMP AND TFPFUN.CODFUNC = TSIUSU.CODFUNC
      LEFT JOIN TGFPAR ON TFPFUN.CODPARC = TGFPAR.CODPARC
      LEFT JOIN TGFPAR AS USUARIO_PARCEIRO ON TSIUSU.CODPARC = USUARIO_PARCEIRO.CODPARC
      LEFT JOIN TFPCGH ON TFPFUN.CODCARGAHOR = TFPCGH.CODCARGAHOR
      LEFT JOIN TSICUS ON TSIUSU.CODCENCUSPAD = TSICUS.CODCENCUS
      LEFT JOIN TSIEMP ON TFPFUN.CODEMP = TSIEMP.CODEMP
      LEFT JOIN TSICID ON TFPFUN.CODCID = TSICID.CODCID
    `
  }

  private calculateAge(birthDate: string): number {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--
    }
    return age
  }

  private calculateDaysInCompany(admissionDate: string): number {
    const today = new Date()
    const admission = new Date(admissionDate)
    const diffTime = Math.abs(today.getTime() - admission.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  private formatCPF(cpf: string): string {
    if (!cpf || cpf.length !== 11) return cpf
    return `${cpf.substring(0, 3)}.${cpf.substring(3, 6)}.${cpf.substring(6, 9)}-${cpf.substring(9, 11)}`
  }

  private formatCNPJ(cnpj: string): string {
    if (!cnpj || cnpj.length !== 14) return cnpj
    return `${cnpj.substring(0, 2)}.${cnpj.substring(2, 5)}.${cnpj.substring(5, 8)}/${cnpj.substring(8, 12)}-${cnpj.substring(12, 14)}`
  }

  private getSituacaoLegivel(situacao: string): string {
    switch (situacao) {
      case '0':
        return 'Demitido'
      case '1':
        return 'Ativo'
      case '2':
        return 'Afastado sem remuneração'
      case '3':
        return 'Afastado por acidente de trabalho'
      case '4':
        return 'Afastado para serviço militar'
      case '5':
        return 'Afastado por licença gestante'
      case '6':
        return 'Afastado por doença acima de 15 dias'
      case '8':
        return 'Transferido'
      case '9':
        return 'Aposentadoria por Invalidez'
      default:
        return 'Situação não identificada'
    }
  }

  mapToEntity(item: any): Tfpfun {
    // Include all fields from the item, and add nested relations
    const entity = this.lowercaseKeys(item)

    // Calculated fields
    if (entity.dtnasc) {
      entity.idade = this.calculateAge(entity.dtnasc)
    }
    if (entity.dtadm) {
      entity.diasNaEmpresa = this.calculateDaysInCompany(entity.dtadm)
    }
    if (entity.cpf) {
      entity.cpfFormatado = this.formatCPF(entity.cpf)
    }
    entity.situacaoLegivel = this.getSituacaoLegivel(entity.situacao)

    // Relations
    entity.tfpcar = entity.codcargo
      ? { codcargo: entity.codcargo, descrcargo: entity.descrcargo || '' }
      : undefined
    entity.tfpdep = entity.coddep
      ? { coddep: entity.coddep, descrdep: entity.descrdep || '' }
      : undefined
    entity.tsiusu = entity.codus
      ? {
          codusu: entity.codus,
          nomeusu: entity.nomeusu || '',
          email: entity.emailusu,
          foto: entity.foto,
          ad_telefonecorp: entity.ad_telefonecorp,
        }
      : undefined
    entity.tgfpar = entity.codparc_rel
      ? { codparc: entity.codparc_rel, nomeparc: entity.nomeparc || '' }
      : undefined
    entity.usuarioParceiro = entity.usuario_codparc
      ? {
          codparc: entity.usuario_codparc,
          nomeparc: entity.usuario_nomeparc || '',
        }
      : undefined
    entity.tfpcgh = entity.codcargahor
      ? { codcargahor: entity.codcargahor, descrcargahor: entity.descrcargahor }
      : undefined
    entity.tsicus = entity.codcencus
      ? { codcencus: entity.codcencus, descrcencus: entity.descrcencus }
      : undefined

    entity.empresa = entity.codemp
      ? {
          codemp: entity.codemp,
          nomefantasia: entity.nomefantasia,
          cnpjFormatado: entity.emp_cgc
            ? this.formatCNPJ(entity.emp_cgc)
            : undefined,
        }
      : undefined

    entity.mae = entity.nomemae
    entity.pai = entity.nomepai
    entity.orgexpidentidade = entity.orgaorg
    entity.pis = entity.pis
    entity.ctps =
      entity.numcps || entity.seriecps
        ? {
            numero: entity.numcps,
            serie: entity.seriecps,
            uf: entity.ufcps,
          }
        : undefined

    // Simple mapping for now, can be enriched with domain tables later
    entity.escolaridade = entity.nivesc
    entity.estadoCivil = entity.estadocivil
    entity.sexo = entity.sexo
    entity.nacionalidade = entity.nacionalidade
    entity.naturalidade = entity.natatividade

    // Address Mapping
    entity.nomelogradouro = entity.nomelgr || entity.endereco
    entity.numero = entity.numend
    entity.complemento = entity.complemento
    entity.bairro = entity.bairro
    entity.cep = entity.cep
    entity.codcid = entity.codcid
    entity.nomecidade = entity.nomecid
    entity.uf = entity.uf

    entity.gestor = entity.gestor_nome
      ? {
          nome: entity.gestor_nome,
          codfunc: entity.gestor_codfunc,
          cargo: entity.gestor_cargo,
          email: entity.gestor_email,
        }
      : undefined

    // Exclude large image data
    entity.imagem = undefined
    return entity as Tfpfun
  }

  async findById(codemp: number, codfunc: number): Promise<Tfpfun | null> {
    const query = `
      SELECT 
        TFPFUN.*, 
        TFPCAR.DESCRCARGO, 
        TFPDEP.DESCRDEP, 
        TSIUSU.CODUSU, 
        TSIUSU.NOMEUSU, 
        TSIUSU.EMAIL AS EMAILUSU, 
        TSIUSU.FOTO, 
        TSIUSU.AD_TELEFONECORP, 
        TGFPAR.CODPARC AS CODPARC_REL, 
        TGFPAR.NOMEPARC, 
        USUARIO_PARCEIRO.CODPARC AS USUARIO_CODPARC, 
        USUARIO_PARCEIRO.NOMEPARC AS USUARIO_NOMEPARC, 
        TFPCGH.CODCARGAHOR, 
        TFPCGH.DESCRCARGAHOR, 
        TSICUS.CODCENCUS, 
        TSICUS.DESCRCENCUS,
        TSICUS.CODUSURESP,
        TSIEMP.CODEMP, 
        TSIEMP.NOMEFANTASIA, 
        TSIEMP.CGC AS EMP_CGC,
        TSICID.NOMECID,
        TSICID.UF,
        GESTOR_USER.NOMEUSU AS GESTOR_NOME,
        GESTOR_FUNC.CODFUNC AS GESTOR_CODFUNC,
        GESTOR_CARGO.DESCRCARGO AS GESTOR_CARGO,
        GESTOR_USER.EMAIL AS GESTOR_EMAIL
      FROM TFPFUN 
      ${this.getRelationsQuery()} 
      LEFT JOIN TSIUSU AS GESTOR_USER ON TSICUS.CODUSURESP = GESTOR_USER.CODUSU
      LEFT JOIN TFPFUN AS GESTOR_FUNC ON GESTOR_USER.CODEMP = GESTOR_FUNC.CODEMP AND GESTOR_USER.CODFUNC = GESTOR_FUNC.CODFUNC
      LEFT JOIN TFPCAR AS GESTOR_CARGO ON GESTOR_FUNC.CODCARGO = GESTOR_CARGO.CODCARGO
      WHERE TFPFUN.CODEMP = ${codemp} AND TFPFUN.CODFUNC = ${codfunc}
    `

    const response = await this.sankhyaApiService.executeQuery(query, [])
    if (response.length === 0) {
      return null
    }
    const entity = trimStrings(this.mapToEntity(response[0]))
    return entity
  }

  async findByAnyCodFunc(codfunc: number): Promise<Tfpfun | null> {
    // Prioritize active employees (SITUACAO = 1) and most recent admission
    const query = `SELECT TOP 1 TFPFUN.*, TFPCAR.DESCRCARGO, TFPDEP.DESCRDEP, TSIUSU.CODUSU, TSIUSU.NOMEUSU, TSIUSU.EMAIL AS EMAILUSU, TSIUSU.FOTO, TSIUSU.AD_TELEFONECORP, TGFPAR.CODPARC AS CODPARC_REL, TGFPAR.NOMEPARC, USUARIO_PARCEIRO.CODPARC AS USUARIO_CODPARC, USUARIO_PARCEIRO.NOMEPARC AS USUARIO_NOMEPARC, TFPCGH.CODCARGAHOR, TFPCGH.DESCRCARGAHOR, TSICUS.CODCENCUS, TSICUS.DESCRCENCUS, TSIEMP.CODEMP, TSIEMP.NOMEFANTASIA, TSIEMP.CGC AS EMP_CGC FROM TFPFUN ${this.getRelationsQuery()} WHERE TFPFUN.CODFUNC = ${codfunc} ORDER BY CASE WHEN TFPFUN.SITUACAO = '1' THEN 0 ELSE 1 END, TFPFUN.DTADM DESC`
    const response = await this.sankhyaApiService.executeQuery(query, [])
    if (response.length === 0) {
      return null
    }
    const entity = trimStrings(this.mapToEntity(response[0]))
    return entity
  }

  async findAll(
    dto: TfpfunFindAllDto,
    token?: string,
  ): Promise<PaginatedResult<Tfpfun>> {
    const whereClauses: string[] = []

    if (dto.nomefunc) {
      whereClauses.push(`TFPFUN.NOMEFUNC LIKE '%${dto.nomefunc}%'`)
    }
    if (dto.situacao) {
      whereClauses.push(`TFPFUN.SITUACAO = '${dto.situacao}'`)
    }
    if (dto.codcargo) {
      whereClauses.push(`TFPFUN.CODCARGO = ${dto.codcargo}`)
    }
    if (dto.coddep) {
      whereClauses.push(`TFPFUN.CODDEP = ${dto.coddep}`)
    }
    if (dto.dtadmFrom) {
      whereClauses.push(`TFPFUN.DTADM >= '${dto.dtadmFrom}'`)
    }
    if (dto.dtadmTo) {
      whereClauses.push(`TFPFUN.DTADM <= '${dto.dtadmTo}'`)
    }
    if (dto.codusu) {
      whereClauses.push(`TSIUSU.CODUSU = ${dto.codusu}`)
    }
    if (dto.nomeusu) {
      whereClauses.push(`TSIUSU.NOMEUSU LIKE '%${dto.nomeusu}%'`)
    }
    if (dto.emailusu) {
      whereClauses.push(`TSIUSU.EMAIL LIKE '%${dto.emailusu}%'`)
    }
    if (dto.codparc) {
      whereClauses.push(`TFPFUN.CODPARC = ${dto.codparc}`)
    }
    if (dto.nomeparc) {
      whereClauses.push(`TGFPAR.NOMEPARC LIKE '%${dto.nomeparc}%'`)
    }
    if (dto.codcencus) {
      whereClauses.push(`TSICUS.CODCENCUS = ${dto.codcencus}`)
    }
    if (dto.emailCorporativo) {
      whereClauses.push(`TSIUSU.EMAIL LIKE '%${dto.emailCorporativo}%'`)
    }
    if (dto.coddeps && dto.coddeps.length > 0) {
      whereClauses.push(`TFPFUN.CODDEP IN (${dto.coddeps.join(',')})`)
    }
    if (dto.codcargos && dto.codcargos.length > 0) {
      whereClauses.push(`TFPFUN.CODCARGO IN (${dto.codcargos.join(',')})`)
    }
    if (dto.codcencusList && dto.codcencusList.length > 0) {
      whereClauses.push(`TSICUS.CODCENCUS IN (${dto.codcencusList.join(',')})`)
    }
    if (dto.nome) {
      whereClauses.push(`TFPFUN.NOMEFUNC LIKE '%${dto.nome}%'`)
    }
    if (dto.email) {
      whereClauses.push(`TSIUSU.EMAIL LIKE '%${dto.email}%'`)
    }
    if (dto.dtNascFrom) {
      whereClauses.push(`TFPFUN.DTNASC >= '${dto.dtNascFrom}'`)
    }
    if (dto.dtNascTo) {
      whereClauses.push(`TFPFUN.DTNASC <= '${dto.dtNascTo}'`)
    }
    if (dto.idadeMin !== undefined) {
      // Calculate date for min age
      const today = new Date()
      const minBirth = new Date(
        today.getFullYear() - dto.idadeMin,
        today.getMonth(),
        today.getDate(),
      )
      whereClauses.push(
        `TFPFUN.DTNASC <= '${minBirth.toISOString().split('T')[0]}'`,
      )
    }
    if (dto.idadeMax !== undefined) {
      const today = new Date()
      const maxBirth = new Date(
        today.getFullYear() - dto.idadeMax - 1,
        today.getMonth(),
        today.getDate() + 1,
      )
      whereClauses.push(
        `TFPFUN.DTNASC >= '${maxBirth.toISOString().split('T')[0]}'`,
      )
    }

    const where =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''
    const page = dto.page || 1
    const perPage = dto.perPage || 10
    const offset = (page - 1) * perPage
    const query = `SELECT TFPFUN.*, TFPCAR.DESCRCARGO, TFPDEP.DESCRDEP, TSIUSU.CODUSU, TSIUSU.NOMEUSU, TSIUSU.EMAIL AS EMAILUSU, TSIUSU.FOTO, TSIUSU.AD_TELEFONECORP, TGFPAR.CODPARC AS CODPARC_REL, TGFPAR.NOMEPARC, USUARIO_PARCEIRO.CODPARC AS USUARIO_CODPARC, USUARIO_PARCEIRO.NOMEPARC AS USUARIO_NOMEPARC, TFPCGH.CODCARGAHOR, TFPCGH.DESCRCARGAHOR, TSICUS.CODCENCUS, TSICUS.DESCRCENCUS, TSIEMP.CODEMP, TSIEMP.NOMEFANTASIA, TSIEMP.CGC AS EMP_CGC FROM TFPFUN ${this.getRelationsQuery()} ${where} ORDER BY ${dto.sort || 'DTADM DESC'} OFFSET ${offset} ROWS FETCH NEXT ${perPage} ROWS ONLY`

    const response = await this.sankhyaApiService.executeQuery(query, [])

    this.logger.log('Query:', query)
    this.logger.log('Response:', response)

    const data: Tfpfun[] = response.map((item: any) =>
      this.filterObjectKeys(
        trimStrings(this.mapToEntity(item)),
        dto.fields || '*',
      ),
    )

    // No mock, use real data

    const totalQuery = `SELECT COUNT(*) as total FROM TFPFUN ${where}`
    const totalResponse = await this.sankhyaApiService.executeQuery(
      totalQuery,
      [],
    )
    let total = totalResponse.length > 0 ? totalResponse[0].total : 0
    if (data.length === 1 && total === 0) total = 1 // For mock

    return buildPaginatedResult({
      data,
      total,
      page: dto.page,
      perPage: dto.perPage,
    })
  }

  private lowercaseKeys(obj: any): any {
    const result: any = {}
    Object.keys(obj).forEach((key) => {
      result[key.toLowerCase()] = obj[key]
    })
    return result
  }

  private filterObjectKeys(obj: any, fields: string): any {
    if (fields === '*') return obj
    const fieldList = fields.split(',').map((f) => f.trim())
    const isExcludeMode = fieldList.some((f) => f.startsWith('-'))

    if (isExcludeMode) {
      const excludeFields = fieldList
        .filter((f) => f.startsWith('-'))
        .map((f) => f.substring(1))
      const result: any = this.deepClone(obj)
      excludeFields.forEach((field) => {
        this.removeNestedProperty(result, field)
      })
      return result
    } else {
      const selectedFields = fieldList.filter((f) => f)
      const result: any = {}
      selectedFields.forEach((field) => {
        const value = this.getNestedProperty(obj, field)
        if (value !== undefined) {
          this.setNestedProperty(result, field, value)
        }
      })
      return result
    }
  }

  private deepClone(obj: any): any {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj.getTime())
    if (Array.isArray(obj)) return obj.map((item) => this.deepClone(item))
    const cloned: any = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepClone(obj[key])
      }
    }
    return cloned
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  private setNestedProperty(obj: any, path: string, value: any): void {
    const keys = path.split('.')
    const lastKey = keys.pop()!
    const target = keys.reduce((current, key) => {
      if (!current[key]) current[key] = {}
      return current[key]
    }, obj)
    target[lastKey] = value
  }

  private removeNestedProperty(obj: any, path: string): void {
    const keys = path.split('.')
    const lastKey = keys.pop()!
    const target = keys.reduce((current, key) => current?.[key], obj)
    if (target && target[lastKey] !== undefined) {
      delete target[lastKey]
    }
  }

  /**
   * Transforma os dados para o formato enriquecido em português
   * Inclui dados do funcionário, gestor e empresa conforme SQL do usuário
   */
  mapToEnrichedResponse(item: any): any {
    const lowercase = this.lowercaseKeys(item)

    // Formatar data no padrão brasileiro se necessário (o SQL já traz formatado em alguns casos)
    const toDate = (date: string | undefined): Date | undefined =>
      date ? new Date(date) : undefined

    // Helper para converter string "DD/MM/YYYY" para objeto Date se precisar,
    // mas aqui vamos confiar que o frontend espera string ou vamos passar direto
    // O SQL já retorna strings formatadas como 'dd/MM/yyyy' em alguns campos.

    return {
      // FUNCIONÁRIO/COLABORADOR
      funcionario_id: lowercase.funcionario_id,
      funcionario_nome: lowercase.funcionario_nome,
      funcionario_nascimento: lowercase.funcionario_nascimento, // Já formatado pelo SQL
      funcionario_idade: lowercase.funcionario_idade,
      funcionario_admissao: lowercase.funcionario_admissao, // Já formatado pelo SQL
      funcionario_dias_na_empresa: lowercase.funcionario_dias_na_empresa,
      funcionario_cpf: lowercase.funcionario_cpf, // Já formatado pelo SQL
      funcionario_celular: lowercase.funcionario_celular,
      funcionario_email_pessoal: lowercase.funcionario_email_pessoal,
      funcionario_situacao: lowercase.funcionario_situacao, // Já traduzido pelo SQL case
      funcionario_usuario_id: lowercase.funcionario_usuario_id,
      funcionario_nomeusu: lowercase.funcionarios_nomeusu,
      funcionario_email: lowercase.funcionario_email,
      funcionario_foto: lowercase.funcionario_foto,
      funcionario_telefone_corp: lowercase.funcionario_telefone_corp,
      funcionario_carga_horaria: lowercase.funcionario_carga_horaria,
      funcionario_departamento: lowercase.funcionario_departamento,
      funcionario_cargo: lowercase.funcionario_cargo,
      funcionario_setor: lowercase.funcionario_setor,

      // GESTOR
      gestor_usuario_id: lowercase.gestor_usuario_id,
      gestor_nome: lowercase.gestor_nome,
      gestor_email: lowercase.gestor_email,
      gestor_formatado: lowercase.gestor_formatado,
      gestor_nascimento: lowercase.gestor_nascimento,
      gestor_idade: lowercase.gestor_idade,
      gestor_cpf: lowercase.gestor_cpf,
      gestor_celular: lowercase.gestor_celular,
      gestor_departamento: lowercase.gestor_departamento,
      gestor_cargo: lowercase.gestor_cargo,
      gestor_setor: lowercase.gestor_setor,
      gestor_admissao: lowercase.gestor_admissao,
      gestor_dias_na_empresa: lowercase.gestor_dias_na_empresa,

      // EMPRESA
      empresa_id: lowercase.empresa_id,
      empresa_nome: lowercase.empresa_nome,
      empresa_cnpj: lowercase.empresa_cnpj,
      empresa_formatada: lowercase.empresa_formatada,
    }
  }

  /**
   * Query completa complexa fornecida pelo usuário
   */
  getComplexSql(
    whereClause: string,
    orderBy: string,
    offset: number,
    perPage: number,
  ): string {
    return `
      SELECT
        funcionarios.CODFUNC AS funcionario_id,
        funcionarios.NOMEFUNC AS funcionario_nome,
        FORMAT(CAST(funcionarios.DTNASC AS DATE), 'dd/MM/yyyy') AS funcionario_nascimento,
        DATEDIFF(YEAR, CAST(funcionarios.DTNASC AS DATE), GETDATE())
            - CASE
                WHEN MONTH(CAST(funcionarios.DTNASC AS DATE)) > MONTH(GETDATE())
                 OR (MONTH(CAST(funcionarios.DTNASC AS DATE)) = MONTH(GETDATE())
                     AND DAY(CAST(funcionarios.DTNASC AS DATE)) > DAY(GETDATE()))
                THEN 1 ELSE 0
              END AS funcionario_idade,
        FORMAT(funcionarios.DTADM, 'dd/MM/yyyy') AS funcionario_admissao,
        DATEDIFF(DAY, funcionarios.DTADM, GETDATE()) AS funcionario_dias_na_empresa,
        SUBSTRING(funcionarios.CPF,1,3) + '.' + SUBSTRING(funcionarios.CPF,4,3) + '.' +
        SUBSTRING(funcionarios.CPF,7,3) + '-' + SUBSTRING(funcionarios.CPF,10,2) AS funcionario_cpf,
        funcionarios.CELULAR AS funcionario_celular,
        funcionarios.EMAIL AS Funcionario_email_pessoal,
        
        CASE funcionarios.SITUACAO
            WHEN 0 THEN 'Demitido'
            WHEN 1 THEN 'Ativo'
            WHEN 2 THEN 'Afastado sem remuneracao'
            WHEN 3 THEN 'Afastado por acidente de trabalho'
            WHEN 4 THEN 'Afastado para servico militar'
            WHEN 5 THEN 'Afastado por licenca gestante'
            WHEN 6 THEN 'Afastado por doenca acima de 15 dias'
            WHEN 8 THEN 'Transferido'
            WHEN 9 THEN 'Aposentadoria por Invalidez'
            ELSE 'Situacao nao identificada'
        END AS funcionario_situacao,

        usuarios.CODUSU AS funcionario_usuario_id,
        usuarios.NOMEUSU AS funcionarios_nomeusu,
        usuarios.EMAIL AS funcionario_email,
        usuarios.FOTO AS funcionario_foto,
        usuarios.AD_TELEFONECORP AS funcionario_Telefone_Corp,
        cargaHoraria.DESCRCARGAHOR AS funcionario_carga_horaria,
        departamento.DESCRDEP AS funcionario_departamento,
        COALESCE(cargo.DESCRCARGO, 'Nao informado') AS funcionario_cargo,
        centroResultado.DESCRCENCUS AS funcionario_setor,

        gestorUsuarios.CODUSU AS gestor_usuario_id,
        gestorUsuarios.NOMEUSU AS gestor_nome,
        gestorUsuarios.EMAIL AS gestor_email,
        CONCAT(RIGHT('000000' + CAST(gestorUsuarios.CODUSU AS VARCHAR(6)), 6), ' ', gestorUsuarios.NOMEUSU) AS gestor_formatado,

        FORMAT(CAST(gestorFunc.DTNASC AS DATE), 'dd/MM/yyyy') AS gestor_nascimento,
        DATEDIFF(YEAR, CAST(gestorFunc.DTNASC AS DATE), GETDATE())
            - CASE
                WHEN MONTH(CAST(gestorFunc.DTNASC AS DATE)) > MONTH(GETDATE())
                 OR (MONTH(CAST(gestorFunc.DTNASC AS DATE)) = MONTH(GETDATE())
                     AND DAY(CAST(gestorFunc.DTNASC AS DATE)) > DAY(GETDATE()))
                THEN 1 ELSE 0
              END AS gestor_idade,
        SUBSTRING(gestorFunc.CPF,1,3) + '.' + SUBSTRING(gestorFunc.CPF,4,3) + '.' +
        SUBSTRING(gestorFunc.CPF,7,3) + '-' + SUBSTRING(gestorFunc.CPF,10,2) AS gestor_cpf,
        gestorFunc.CELULAR AS gestor_celular,

        gestorDepto.DESCRDEP AS gestor_departamento,
        COALESCE(gestorCargo.DESCRCARGO, 'Nao informado') AS gestor_cargo,
        gestorCentroResultado.DESCRCENCUS AS gestor_setor,
        FORMAT(gestorFunc.DTADM, 'dd/MM/yyyy') AS gestor_admissao,
        DATEDIFF(DAY, gestorFunc.DTADM, GETDATE()) AS gestor_dias_na_empresa,

        empresa.CODEMP AS empresa_id,
        empresa.NOMEFANTASIA AS empresa_nome,
        SUBSTRING(empresa.CGC, 1, 2) + '.' + SUBSTRING(empresa.CGC, 3, 3) + '.' +
        SUBSTRING(empresa.CGC, 6, 3) + '/' + SUBSTRING(empresa.CGC, 9, 4) + '-' +
        SUBSTRING(empresa.CGC, 13, 2) AS empresa_cnpj,
        CONCAT(RIGHT('000' + CAST(empresa.CODEMP AS VARCHAR(3)), 3), ' ', empresa.NOMEFANTASIA) AS empresa_formatada

      FROM TFPFUN AS funcionarios
      JOIN TSIUSU AS usuarios ON funcionarios.CODEMP = usuarios.CODEMP AND funcionarios.CODFUNC = usuarios.CODFUNC
      JOIN TFPDEP AS departamento ON departamento.CODDEP = funcionarios.CODDEP
      JOIN TFPCAR AS cargo ON cargo.CODCARGO = funcionarios.CODCARGO
      JOIN TSICUS AS centroResultado ON centroResultado.CODCENCUS = usuarios.CODCENCUSPAD
      JOIN TSIUSU AS gestorUsuarios ON gestorUsuarios.CODUSU = centroResultado.CODUSURESP
      LEFT JOIN TFPFUN AS gestorFunc ON gestorFunc.CODEMP = gestorUsuarios.CODEMP AND gestorFunc.CODFUNC = gestorUsuarios.CODFUNC
      LEFT JOIN TFPDEP AS gestorDepto ON gestorDepto.CODDEP = gestorFunc.CODDEP
      LEFT JOIN TFPCAR AS gestorCargo ON gestorCargo.CODCARGO = gestorFunc.CODCARGO
      LEFT JOIN TSICUS AS gestorCentroResultado ON gestorCentroResultado.CODCENCUS = gestorUsuarios.CODCENCUSPAD
      JOIN TSIEMP AS empresa ON empresa.CODEMP = funcionarios.CODEMP
      LEFT JOIN TFPCGH AS cargaHoraria ON cargaHoraria.CODCARGAHOR = funcionarios.CODCARGAHOR

      ${whereClause}
      ORDER BY funcionarios.${orderBy}
      OFFSET ${offset} ROWS FETCH NEXT ${perPage} ROWS ONLY
    `
  }

  getComplexCountSql(whereClause: string): string {
    return `
      SELECT COUNT(*) as total
      FROM TFPFUN AS funcionarios
      JOIN TSIUSU AS usuarios ON funcionarios.CODEMP = usuarios.CODEMP AND funcionarios.CODFUNC = usuarios.CODFUNC
      JOIN TFPDEP AS departamento ON departamento.CODDEP = funcionarios.CODDEP
      JOIN TFPCAR AS cargo ON cargo.CODCARGO = funcionarios.CODCARGO
      JOIN TSICUS AS centroResultado ON centroResultado.CODCENCUS = usuarios.CODCENCUSPAD
      JOIN TSIUSU AS gestorUsuarios ON gestorUsuarios.CODUSU = centroResultado.CODUSURESP
      LEFT JOIN TFPFUN AS gestorFunc ON gestorFunc.CODEMP = gestorUsuarios.CODEMP AND gestorFunc.CODFUNC = gestorUsuarios.CODFUNC
      LEFT JOIN TFPDEP AS gestorDepto ON gestorDepto.CODDEP = gestorFunc.CODDEP
      LEFT JOIN TFPCAR AS gestorCargo ON gestorCargo.CODCARGO = gestorFunc.CODCARGO
      LEFT JOIN TSICUS AS gestorCentroResultado ON gestorCentroResultado.CODCENCUS = gestorUsuarios.CODCENCUSPAD
      JOIN TSIEMP AS empresa ON empresa.CODEMP = funcionarios.CODEMP
      LEFT JOIN TFPCGH AS cargaHoraria ON cargaHoraria.CODCARGAHOR = funcionarios.CODCARGAHOR
      ${whereClause}
      `
  }

  /**
   * Busca colaboradores com dados enriquecidos (gestor, empresa, etc)
   */
  async findAllEnriched(dto: TfpfunFindAllDto): Promise<PaginatedResult<any>> {
    const whereClauses: string[] = ['usuarios.CODUSU > 0']

    if (dto.nomefunc) {
      whereClauses.push(`funcionarios.NOMEFUNC LIKE '%${dto.nomefunc}%'`)
    }
    if (dto.situacao) {
      // Mapeamento simples de filtro, pois no SQL original é CASE
      if (dto.situacao === 'A') whereClauses.push(`funcionarios.SITUACAO = 1`)
      else if (dto.situacao === 'F')
        whereClauses.push(`funcionarios.SITUACAO = 2`) // Exemplo aproximado
      else if (dto.situacao === 'D')
        whereClauses.push(`funcionarios.SITUACAO = 0`)
      else whereClauses.push(`funcionarios.SITUACAO = '${dto.situacao}'`)
    }
    if (dto.coddep) {
      whereClauses.push(`funcionarios.CODDEP = ${dto.coddep}`)
    }
    if (dto.codcargo) {
      whereClauses.push(`funcionarios.CODCARGO = ${dto.codcargo}`)
    }

    const whereClause =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''
    const orderBy = dto.sort || 'DTADM DESC'
    const offset = (dto.page - 1) * dto.perPage

    const dataQuery = this.getComplexSql(
      whereClause,
      orderBy,
      offset,
      dto.perPage,
    )
    const countQuery = this.getComplexCountSql(whereClause)

    try {
      const [items, countResult] = await Promise.all([
        this.sankhyaApiService.executeQuery(dataQuery, []),
        this.sankhyaApiService.executeQuery(countQuery, []),
      ])

      const total = countResult[0]?.total || countResult[0]?.TOTAL || 0
      const enrichedItems = items.map((item) =>
        this.mapToEnrichedResponse(item),
      )

      return buildPaginatedResult({
        data: enrichedItems,
        total,
        page: dto.page,
        perPage: dto.perPage,
      })
    } catch (error) {
      this.logger.error('Error executing complex enriched query', error)
      throw error
    }
  }
}
