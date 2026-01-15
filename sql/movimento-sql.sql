SELECT TOP (1000)

    /* =======================================================
       HISTÓRICO DO DOCUMENTO
       ======================================================= */
    VAR.NUNOTA        AS HIST_NUNOTA_ATUAL,
    VAR.SEQUENCIA     AS HIST_SEQUENCIA,
    VAR.NUNOTAORIG    AS HIST_NUNOTA_ORIGEM,
    VAR.SEQUENCIAORIG AS HIST_SEQUENCIA_ORIGEM,

    /* =======================================================
       DOCUMENTO
       ======================================================= */
    CAB.NUNOTA        AS DOC_NUNOTA_INTERNO,
    CAB.NUMNOTA       AS DOC_NUMERO,
    CAB.CODEMP        AS DOC_EMPRESA,
    CAB.DTNEG         AS DOC_DATA_NEGOCIACAO,

    CONVERT(VARCHAR(10), CAB.DTMOV, 120) + ' ' +
    CONVERT(VARCHAR(8),  CAB.HRMOV, 108) AS DOC_DATA_HORA_MOVIMENTO,

    /* =======================================================
       PARCEIROS POR PAPEL
       ======================================================= */
    CAB.CODPARC                AS PARC_PRINCIPAL_COD,
    PAR_PRINCIPAL.NOMEPARC     AS PARC_PRINCIPAL_NOME,

    CAB.CODPARCTRANSP          AS PARC_TRANSPORTADOR_COD,
    PAR_TRANSP.NOMEPARC        AS PARC_TRANSPORTADOR_NOME,

    CAB.CODPARCDEST            AS PARC_DESTINO_COD,
    PAR_DEST.NOMEPARC          AS PARC_DESTINO_NOME,

    CAB.CODPARCREMETENTE       AS PARC_REMETENTE_COD,
    PAR_REMETENTE.NOMEPARC     AS PARC_REMETENTE_NOME,

    CAB.CODPARCCONSIGNATARIO   AS PARC_CONSIGNATARIO_COD,
    PAR_CONSIGNATARIO.NOMEPARC AS PARC_CONSIGNATARIO_NOME,

    CAB.CODPARCREDESPACHO      AS PARC_REDESPACHO_COD,
    PAR_REDESPACHO.NOMEPARC    AS PARC_REDESPACHO_NOME,

    CAB.CODPARCDESCARGAMDFE    AS PARC_DESCARGA_MDFE_COD,
    PAR_DESCARGA_MDFE.NOMEPARC AS PARC_DESCARGA_MDFE_NOME,

    CAB.CODPARCDEPO            AS PARC_DEPOSITO_COD,
    PAR_DEPOSITO.NOMEPARC      AS PARC_DEPOSITO_NOME,

    CAB.CODPARCRETIRADA        AS PARC_RETIRADA_COD,
    PAR_RETIRADA.NOMEPARC      AS PARC_RETIRADA_NOME,

    /* =======================================================
       STATUS
       ======================================================= */
    CAB.STATUSNOTA AS DOC_STATUS_CODIGO,

    CASE CAB.STATUSNOTA
        WHEN 'A' THEN 'Atendimento'
        WHEN 'L' THEN 'Liberada'
        WHEN 'P' THEN 'Pendente'
        ELSE 'Outro'
    END AS DOC_STATUS_DESCRICAO,

    /* =======================================================
       TIPO DE OPERAÇÃO
       ======================================================= */
    CAB.CODTIPOPER AS TOP_CODIGO,
    TOPV.DESCROPER AS TOP_DESCRICAO,

    /* =======================================================
       ESTOQUE
       ======================================================= */
    TOPV.ATUALEST AS ESTOQUE_CODIGO,

    CASE TOPV.ATUALEST
        WHEN 'B' THEN 'Baixar estoque'
        WHEN 'E' THEN 'Entrar no estoque'
        WHEN 'N' THEN 'Não movimenta estoque'
        WHEN 'R' THEN 'Reservar estoque'
        ELSE 'Indefinido'
    END AS ESTOQUE_DESCRICAO,

    /* =======================================================
       USUÁRIO
       ======================================================= */
    CAB.CODUSUINC AS USU_CODIGO,
    USU.NOMEUSU   AS USU_NOME

FROM TGFVAR VAR

INNER JOIN TGFCAB CAB
        ON CAB.NUNOTA = VAR.NUNOTA

/* ===========================================================
   PARCEIROS
   =========================================================== */
LEFT JOIN TGFPAR PAR_PRINCIPAL
       ON PAR_PRINCIPAL.CODPARC = CAB.CODPARC

LEFT JOIN TGFPAR PAR_TRANSP
       ON PAR_TRANSP.CODPARC = CAB.CODPARCTRANSP

LEFT JOIN TGFPAR PAR_DEST
       ON PAR_DEST.CODPARC = CAB.CODPARCDEST

LEFT JOIN TGFPAR PAR_REMETENTE
       ON PAR_REMETENTE.CODPARC = CAB.CODPARCREMETENTE

LEFT JOIN TGFPAR PAR_CONSIGNATARIO
       ON PAR_CONSIGNATARIO.CODPARC = CAB.CODPARCCONSIGNATARIO

LEFT JOIN TGFPAR PAR_REDESPACHO
       ON PAR_REDESPACHO.CODPARC = CAB.CODPARCREDESPACHO

LEFT JOIN TGFPAR PAR_DESCARGA_MDFE
       ON PAR_DESCARGA_MDFE.CODPARC = CAB.CODPARCDESCARGAMDFE

LEFT JOIN TGFPAR PAR_DEPOSITO
       ON PAR_DEPOSITO.CODPARC = CAB.CODPARCDEPO

LEFT JOIN TGFPAR PAR_RETIRADA
       ON PAR_RETIRADA.CODPARC = CAB.CODPARCRETIRADA

/* ===========================================================
   TIPO DE OPERAÇÃO HISTÓRICO
   =========================================================== */
LEFT JOIN TGFTOP TOPV
       ON TOPV.CODTIPOPER = CAB.CODTIPOPER
      AND TOPV.DHALTER = (
            SELECT MAX(TOP2.DHALTER)
            FROM TGFTOP TOP2
            WHERE TOP2.CODTIPOPER = CAB.CODTIPOPER
              AND TOP2.DHALTER <= CAB.DTNEG
      )

/* ===========================================================
   USUÁRIO
   =========================================================== */
LEFT JOIN TSIUSU USU
       ON USU.CODUSU = CAB.CODUSUINC

ORDER BY
    VAR.NUNOTA DESC,
    VAR.SEQUENCIA DESC;

