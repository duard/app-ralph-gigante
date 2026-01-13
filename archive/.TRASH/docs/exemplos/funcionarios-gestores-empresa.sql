SELECT

    --------------------------------------------------------------------------------------
    -- ? FUNCIONARIO
    --------------------------------------------------------------------------------------
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

    -- Situacao do Funcionario (legenda)
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

    --------------------------------------------------------------------------------------
    -- ??? GESTOR (VIA CENTRO DE RESULTADO)
    --------------------------------------------------------------------------------------
    gestorUsuarios.CODUSU AS gestor_usuario_id,
    gestorUsuarios.NOMEUSU AS gestor_nome,
    gestorUsuarios.EMAIL AS gestor_email,
    --gestorUsuarios.FOTO AS gestor_foto,
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

    --------------------------------------------------------------------------------------
    -- ? EMPRESA
    --------------------------------------------------------------------------------------
    empresa.CODEMP AS empresa_id,
    empresa.NOMEFANTASIA AS empresa_nome,
    SUBSTRING(empresa.CGC, 1, 2) + '.' + SUBSTRING(empresa.CGC, 3, 3) + '.' +
    SUBSTRING(empresa.CGC, 6, 3) + '/' + SUBSTRING(empresa.CGC, 9, 4) + '-' +
    SUBSTRING(empresa.CGC, 13, 2) AS empresa_cnpj,
    CONCAT(RIGHT('000' + CAST(empresa.CODEMP AS VARCHAR(3)), 3), ' ', empresa.NOMEFANTASIA) AS empresa_formatada

FROM TFPFUN AS funcionarios
JOIN TSIUSU AS usuarios
    ON funcionarios.CODEMP = usuarios.CODEMP
    AND funcionarios.CODFUNC = usuarios.CODFUNC
JOIN TFPDEP AS departamento
    ON departamento.CODDEP = funcionarios.CODDEP
JOIN TFPCAR AS cargo
    ON cargo.CODCARGO = funcionarios.CODCARGO
JOIN TSICUS AS centroResultado
    ON centroResultado.CODCENCUS = usuarios.CODCENCUSPAD
JOIN TSIUSU AS gestorUsuarios
    ON gestorUsuarios.CODUSU = centroResultado.CODUSURESP
LEFT JOIN TFPFUN AS gestorFunc
    ON gestorFunc.CODEMP = gestorUsuarios.CODEMP
    AND gestorFunc.CODFUNC = gestorUsuarios.CODFUNC
LEFT JOIN TFPDEP AS gestorDepto
    ON gestorDepto.CODDEP = gestorFunc.CODDEP
LEFT JOIN TFPCAR AS gestorCargo
    ON gestorCargo.CODCARGO = gestorFunc.CODCARGO
LEFT JOIN TSICUS AS gestorCentroResultado
    ON gestorCentroResultado.CODCENCUS = gestorUsuarios.CODCENCUSPAD
JOIN TSIEMP AS empresa
    ON empresa.CODEMP = funcionarios.CODEMP
LEFT JOIN TFPCGH AS cargaHoraria
    ON cargaHoraria.CODCARGAHOR = funcionarios.CODCARGAHOR

WHERE usuarios.CODUSU > 0

  -- Padrão: apenas ativos, se não informado
  AND ($P{ATIVOS} IS NULL OR $P{ATIVOS} = 0 OR usuarios.DTLIMACESSO IS NULL)

  -- Filtros opcionais por empresa, funcionário ou centro de custo
  AND ($P{CODEMP} IS NULL OR funcionarios.CODEMP = $P{CODEMP})
  AND ($P{CODFUNC} IS NULL OR funcionarios.CODFUNC = $P{CODFUNC})
  AND ($P{CODCENCUS} IS NULL OR centroResultado.CODCENCUS = $P{CODCENCUS})

  -- Filtro opcional de emails corporativos
  AND ($P{EMAIL_CORPORATIVO} IS NULL OR $P{EMAIL_CORPORATIVO} = 0
       OR (usuarios.EMAIL IS NOT NULL AND usuarios.EMAIL LIKE '%@%'))

  -- Excluir funcionários específicos
  AND funcionarios.CODFUNC NOT IN (72539, 72539946, 360983, 239319, 71229806, 651132266);