export interface TfpfunEnrichedResponse {
  // Funcionário/Colaborador
  funcionario_id: number
  funcionario_nome: string
  funcionario_nascimento?: string
  funcionario_idade?: number
  funcionario_admissao?: string
  funcionario_dias_na_empresa?: number
  funcionario_cpf?: string
  funcionario_celular?: string
  funcionario_email_pessoal?: string
  funcionario_situacao: string
  funcionario_usuario_id?: number
  funcionario_nomeusu?: string
  funcionario_email?: string
  funcionario_foto?: string
  funcionario_telefone_corp?: string
  funcionario_carga_horaria?: string
  funcionario_departamento?: string
  funcionario_cargo?: string
  funcionario_setor?: string

  // Gestor (via Centro de Resultado)
  gestor_usuario_id?: number
  gestor_nome?: string
  gestor_email?: string
  gestor_formatado?: string
  gestor_nascimento?: string
  gestor_idade?: number
  gestor_cpf?: string
  gestor_celular?: string
  gestor_departamento?: string
  gestor_cargo?: string
  gestor_setor?: string
  gestor_admissao?: string
  gestor_dias_na_empresa?: number

  // Empresa
  empresa_id: number
  empresa_nome: string
  empresa_cnpj?: string
  empresa_formatada?: string
}
