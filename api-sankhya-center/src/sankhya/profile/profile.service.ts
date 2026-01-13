import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { SankhyaApiService } from '../shared/sankhya-api.service'

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name)

  constructor(private readonly sankhyaApiService: SankhyaApiService) {}

  async getProfile(userId: number): Promise<any> {
    this.logger.log(`Buscando perfil completo do usuário: ${userId}`)

    const query = `
      SELECT
        --------------------------------------------------------------------------------------
        -- 1️⃣ FUNCIONARIO · IDENTIFICAÇÃO
        --------------------------------------------------------------------------------------
        funcionarios.CODFUNC,
        funcionarios.CODEMP,
        funcionarios.NOMEFUNC,

        --------------------------------------------------------------------------------------
        -- 2️⃣ FUNCIONARIO · DADOS PESSOAIS
        --------------------------------------------------------------------------------------
        FORMAT(CAST(funcionarios.DTNASC AS DATE), 'dd/MM/yyyy') AS funcionarioDataNascimento,

        DATEDIFF(YEAR, CAST(funcionarios.DTNASC AS DATE), GETDATE())
            - CASE
                WHEN MONTH(CAST(funcionarios.DTNASC AS DATE)) > MONTH(GETDATE())
                  OR (MONTH(CAST(funcionarios.DTNASC AS DATE)) = MONTH(GETDATE())
                  AND DAY(CAST(funcionarios.DTNASC AS DATE)) > DAY(GETDATE()))
                THEN 1 ELSE 0
              END AS funcionarioIdade,

        SUBSTRING(funcionarios.CPF,1,3) + '.' +
        SUBSTRING(funcionarios.CPF,4,3) + '.' +
        SUBSTRING(funcionarios.CPF,7,3) + '-' +
        SUBSTRING(funcionarios.CPF,10,2) AS funcionarioCPF,

        funcionarios.CELULAR,
        funcionarios.EMAIL,

        --------------------------------------------------------------------------------------
        -- 3️⃣ FUNCIONARIO · VÍNCULO / SITUAÇÃO
        --------------------------------------------------------------------------------------
        FORMAT(funcionarios.DTADM, 'dd/MM/yyyy') AS funcionarioDataAdmissao,
        DATEDIFF(DAY, funcionarios.DTADM, GETDATE()) AS funcionarioDiasEmpresa,
        funcionarios.SITUACAO,

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
        END AS funcionarioSituacaoDescricao,

        --------------------------------------------------------------------------------------
        -- 4️⃣ USUÁRIO SANKHYA
        --------------------------------------------------------------------------------------
        usuarios.CODUSU,
        usuarios.NOMEUSU,
        usuarios.EMAIL AS usuarioEmail,
        usuarios.FOTO,
        usuarios.AD_TELEFONECORP AS usuarioTelefoneCorp,

        --------------------------------------------------------------------------------------
        -- 5️⃣ ESTRUTURA ORGANIZACIONAL
        --------------------------------------------------------------------------------------
        cargaHoraria.DESCRCARGAHOR AS cargaHorariaDescricao,
        departamento.DESCRDEP AS departamentoDescricao,
        COALESCE(cargo.DESCRCARGO, 'Nao informado') AS cargoDescricao,
        centroResultado.DESCRCENCUS AS centroResultadoDescricao,

        --------------------------------------------------------------------------------------
        -- 6️⃣ GESTOR
        --------------------------------------------------------------------------------------
        gestorUsuarios.CODUSU AS gestorCodigoUsuario,
        gestorUsuarios.NOMEUSU AS gestorNome,
        gestorUsuarios.EMAIL AS gestorEmail,

        CONCAT(
            RIGHT('000000' + CAST(gestorUsuarios.CODUSU AS VARCHAR(6)), 6),
            ' ',
            gestorUsuarios.NOMEUSU
        ) AS gestorFormatado,

        FORMAT(CAST(gestorFunc.DTNASC AS DATE), 'dd/MM/yyyy') AS gestorDataNascimento,

        DATEDIFF(YEAR, CAST(gestorFunc.DTNASC AS DATE), GETDATE())
            - CASE
                WHEN MONTH(CAST(gestorFunc.DTNASC AS DATE)) > MONTH(GETDATE())
                  OR (MONTH(CAST(gestorFunc.DTNASC AS DATE)) = MONTH(GETDATE())
                  AND DAY(CAST(gestorFunc.DTNASC AS DATE)) > DAY(GETDATE()))
                THEN 1 ELSE 0
              END AS gestorIdade,

        SUBSTRING(gestorFunc.CPF,1,3) + '.' +
        SUBSTRING(gestorFunc.CPF,4,3) + '.' +
        SUBSTRING(gestorFunc.CPF,7,3) + '-' +
        SUBSTRING(gestorFunc.CPF,10,2) AS gestorCPF,

        gestorFunc.CELULAR AS gestorCelular,
        gestorDepto.DESCRDEP AS gestorDepartamento,
        COALESCE(gestorCargo.DESCRCARGO, 'Nao informado') AS gestorCargo,
        gestorCentroResultado.DESCRCENCUS AS gestorCentroResultado,
        FORMAT(gestorFunc.DTADM, 'dd/MM/yyyy') AS gestorDataAdmissao,
        DATEDIFF(DAY, gestorFunc.DTADM, GETDATE()) AS gestorDiasEmpresa,

        --------------------------------------------------------------------------------------
        -- 7️⃣ EMPRESA
        --------------------------------------------------------------------------------------
        empresa.CODEMP AS empresaCodigo,
        empresa.NOMEFANTASIA,

        SUBSTRING(empresa.CGC, 1, 2) + '.' +
        SUBSTRING(empresa.CGC, 3, 3) + '.' +
        SUBSTRING(empresa.CGC, 6, 3) + '/' +
        SUBSTRING(empresa.CGC, 9, 4) + '-' +
        SUBSTRING(empresa.CGC, 13, 2) AS empresaCNPJ,

        CONCAT(
            RIGHT('000' + CAST(empresa.CODEMP AS VARCHAR(3)), 3),
            ' ',
            empresa.NOMEFANTASIA
        ) AS empresaFormatada,

        --------------------------------------------------------------------------------------
        -- 8️⃣ PARCEIRO (TGFPAR)
        --------------------------------------------------------------------------------------
        parceiro.CODPARC,
        parceiro.NOMEPARC,
        parceiro.RAZAOSOCIAL,
        parceiro.TELEFONE AS parceiroTelefone

      FROM TSIUSU usuarios
      LEFT JOIN TFPFUN funcionarios
          ON funcionarios.CODEMP = usuarios.CODEMP
         AND funcionarios.CODFUNC = usuarios.CODFUNC
      LEFT JOIN TFPDEP departamento
          ON departamento.CODDEP = funcionarios.CODDEP
      LEFT JOIN TFPCAR cargo
          ON cargo.CODCARGO = funcionarios.CODCARGO
      LEFT JOIN TSICUS centroResultado
          ON centroResultado.CODCENCUS = usuarios.CODCENCUSPAD
      LEFT JOIN TSIUSU gestorUsuarios
          ON gestorUsuarios.CODUSU = centroResultado.CODUSURESP
      LEFT JOIN TFPFUN gestorFunc
          ON gestorFunc.CODEMP = gestorUsuarios.CODEMP
         AND gestorFunc.CODFUNC = gestorUsuarios.CODFUNC
      LEFT JOIN TFPDEP gestorDepto
          ON gestorDepto.CODDEP = gestorFunc.CODDEP
      LEFT JOIN TFPCAR gestorCargo
          ON gestorCargo.CODCARGO = gestorFunc.CODCARGO
      LEFT JOIN TSICUS gestorCentroResultado
          ON gestorCentroResultado.CODCENCUS = gestorUsuarios.CODCENCUSPAD
      LEFT JOIN TSIEMP empresa
          ON empresa.CODEMP = usuarios.CODEMP
      LEFT JOIN TFPCGH cargaHoraria
          ON cargaHoraria.CODCARGAHOR = funcionarios.CODCARGAHOR
      LEFT JOIN TGFPAR parceiro
          ON parceiro.CODPARC = funcionarios.CODPARC

      WHERE usuarios.CODUSU = @param1
    `

    this.logger.log(`Query: ${query}, params: [${userId}]`)
    const result = await this.sankhyaApiService.executeQuery(query, [userId])
    this.logger.log(`Result length: ${result.length}`)

    if (!result || result.length === 0) {
      throw new NotFoundException('Perfil não encontrado')
    }

    const userData = result[0]

    return {
      funcionario: userData.CODFUNC
        ? {
            CODFUNC: userData.CODFUNC,
            CODEMP: userData.CODEMP,
            NOMEFUNC: userData.NOMEFUNC,
            funcionarioDataNascimento: userData.funcionarioDataNascimento,
            funcionarioIdade: userData.funcionarioIdade,
            funcionarioCPF: userData.funcionarioCPF,
            CELULAR: userData.CELULAR,
            EMAIL: userData.EMAIL,
            funcionarioDataAdmissao: userData.funcionarioDataAdmissao,
            funcionarioDiasEmpresa: userData.funcionarioDiasEmpresa,
            SITUACAO: userData.SITUACAO,
            funcionarioSituacaoDescricao: userData.funcionarioSituacaoDescricao,
          }
        : null,
      usuario: {
        CODUSU: userData.CODUSU,
        NOMEUSU: userData.NOMEUSU,
        usuarioEmail: userData.usuarioEmail,
        FOTO: userData.FOTO,
        usuarioTelefoneCorp: userData.usuarioTelefoneCorp,
      },
      estruturaOrganizacional: userData.CODFUNC
        ? {
            cargaHorariaDescricao: userData.cargaHorariaDescricao,
            departamentoDescricao: userData.departamentoDescricao,
            cargoDescricao: userData.cargoDescricao,
            centroResultadoDescricao: userData.centroResultadoDescricao,
          }
        : null,
      gestor: userData.CODFUNC
        ? {
            gestorCodigoUsuario: userData.gestorCodigoUsuario,
            gestorNome: userData.gestorNome,
            gestorEmail: userData.gestorEmail,
            gestorFormatado: userData.gestorFormatado,
            gestorDataNascimento: userData.gestorDataNascimento,
            gestorIdade: userData.gestorIdade,
            gestorCPF: userData.gestorCPF,
            gestorCelular: userData.gestorCelular,
            gestorDepartamento: userData.gestorDepartamento,
            gestorCargo: userData.gestorCargo,
            gestorCentroResultado: userData.gestorCentroResultado,
            gestorDataAdmissao: userData.gestorDataAdmissao,
            gestorDiasEmpresa: userData.gestorDiasEmpresa,
          }
        : null,
      empresa: {
        CODEMP: userData.empresaCodigo,
        NOMEFANTASIA: userData.NOMEFANTASIA,
        empresaCNPJ: userData.empresaCNPJ,
        empresaFormatada: userData.empresaFormatada,
      },
      parceiro: userData.CODPARC
        ? {
            CODPARC: userData.CODPARC,
            NOMEPARC: userData.NOMEPARC,
            RAZAOSOCIAL: userData.RAZAOSOCIAL,
            TELEFONE: userData.parceiroTelefone,
          }
        : null,
    }
  }
}
