export const getVeiculosComMultiplasOSQuery = `
-- Veículos com múltiplas OS COMERCIAIS abertas (usando CTE para eliminar duplicatas)
;WITH OSPorVeiculo AS (
    SELECT DISTINCT
        v.CODVEICULO,
        v.PLACA,
        v.MARCAMODELO,
        o.NUMOS,
        o.DHCHAMADA
    FROM SANKHYA.TGFVEI v
    INNER JOIN SANKHYA.TCSITE i ON i.AD_CODVEICULO = v.CODVEICULO
    INNER JOIN SANKHYA.TCSOSE o ON o.NUMOS = i.NUMOS
    WHERE o.SITUACAO = 'P'
      AND o.DTFECHAMENTO IS NULL
      AND (v.AD_EXIBEDASH = 'S' OR (v.AD_EXIBEDASH IS NULL AND v.ATIVO = 'S'))
),
VeiculosMultiplasOS AS (
    SELECT
        CODVEICULO,
        PLACA,
        MARCAMODELO,
        COUNT(*) AS QtdOSAbertas
    FROM OSPorVeiculo
    GROUP BY CODVEICULO, PLACA, MARCAMODELO
    HAVING COUNT(*) > 1
)
SELECT
    'MULTIPLAS_OS_COMERCIAIS' AS TipoProblema,
    vm.CODVEICULO,
    vm.PLACA,
    LTRIM(RTRIM(vm.MARCAMODELO)) AS Equipamento,
    vm.QtdOSAbertas,
    -- Lista ÚNICA de OS (sem duplicatas)
    STUFF((SELECT DISTINCT ', ' + CAST(opv.NUMOS AS VARCHAR)
           FROM OSPorVeiculo opv
           WHERE opv.CODVEICULO = vm.CODVEICULO
           ORDER BY ', ' + CAST(opv.NUMOS AS VARCHAR)
           FOR XML PATH('')), 1, 2, '') AS NumsOS,
    (SELECT MIN(opv2.DHCHAMADA) FROM OSPorVeiculo opv2 WHERE opv2.CODVEICULO = vm.CODVEICULO) AS PrimeiraOS,
    'CRITICO' AS Severidade
FROM VeiculosMultiplasOS vm

UNION ALL

-- Veículos com OS COMERCIAL + MANUTENÇÃO simultâneas (usando DISTINCT para evitar duplicatas)
SELECT DISTINCT
    'OS_COMERCIAL_E_MANUTENCAO' AS TipoProblema,
    v.CODVEICULO,
    v.PLACA,
    LTRIM(RTRIM(v.MARCAMODELO)) AS Equipamento,
    2 AS QtdOSAbertas,
    'OS Comercial: ' + 
        STUFF((SELECT DISTINCT ', ' + CAST(o2.NUMOS AS VARCHAR)
               FROM SANKHYA.TCSITE i2
               INNER JOIN SANKHYA.TCSOSE o2 ON o2.NUMOS = i2.NUMOS
               WHERE i2.AD_CODVEICULO = v.CODVEICULO
               AND o2.SITUACAO = 'P'
               AND o2.DTFECHAMENTO IS NULL
               FOR XML PATH('')), 1, 2, '')
    + ' | Manutenção: ' +
        STUFF((SELECT DISTINCT ', ' + CAST(m2.NUOS AS VARCHAR)
               FROM SANKHYA.TCFOSCAB m2
               WHERE m2.CODVEICULO = v.CODVEICULO
               AND m2.STATUS IN ('A', 'E')
               AND m2.DATAFIN IS NULL
               FOR XML PATH('')), 1, 2, '') AS NumsOS,
    (SELECT MIN(o3.DHCHAMADA) 
     FROM SANKHYA.TCSOSE o3 
     INNER JOIN SANKHYA.TCSITE i3 ON i3.NUMOS = o3.NUMOS 
     WHERE i3.AD_CODVEICULO = v.CODVEICULO 
     AND o3.SITUACAO = 'P') AS PrimeiraOS,
    'ATENCAO' AS Severidade
FROM SANKHYA.TGFVEI v
WHERE (v.AD_EXIBEDASH = 'S' OR (v.AD_EXIBEDASH IS NULL AND v.ATIVO = 'S'))
  -- Tem OS comercial ativa
  AND EXISTS (
      SELECT 1 FROM SANKHYA.TCSITE i
      INNER JOIN SANKHYA.TCSOSE o ON o.NUMOS = i.NUMOS
      WHERE i.AD_CODVEICULO = v.CODVEICULO
      AND o.SITUACAO = 'P'
      AND o.DTFECHAMENTO IS NULL
      AND CAST(GETDATE() AS DATE) BETWEEN
          (SELECT MIN(CAST(i2.DHPREVISTA AS DATE)) FROM SANKHYA.TCSITE i2 WHERE i2.NUMOS = o.NUMOS AND i2.AD_CODVEICULO = v.CODVEICULO)
          AND
          (SELECT MAX(CAST(i2.DHPREVISTA AS DATE)) FROM SANKHYA.TCSITE i2 WHERE i2.NUMOS = o.NUMOS AND i2.AD_CODVEICULO = v.CODVEICULO)
  )
  -- E também tem manutenção ativa
  AND EXISTS (
      SELECT 1 FROM SANKHYA.TCFOSCAB m
      WHERE m.CODVEICULO = v.CODVEICULO
      AND m.STATUS IN ('A', 'E')
      AND m.DATAFIN IS NULL
  )

ORDER BY Severidade DESC, PrimeiraOS ASC
`;
