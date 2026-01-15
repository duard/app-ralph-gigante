# ⚠️ PROBLEMA IDENTIFICADO: Campo CODDEP Bloqueado pelo Sankhya

## 🎯 O Que o Gestor Quer Saber

**"Qual setor/departamento gastou mais?"**

## ❌ Problema Encontrado

O Sankhya **BLOQUEIA** consultas ao campo `CODDEP` (Código do Departamento) na tabela `TGFCAB`.

### Evidência
```
Erro: Internal server error
Query bloqueada: SELECT CAB.CODDEP...
```

## 🔍 O Que Temos Disponível Agora

### 1. Consumo por USUÁRIO (QUEM consumiu)

**Dezembro/2025 - Top 5 Usuários:**

| Posição | Usuário | Quantidade | Valor | % do Total |
|---------|---------|------------|-------|------------|
| 🥇 1º | MICHELLE.DUARTE | 10 un | R$ 236,90 | 27% |
| 🥈 2º | DANUBIA.O | 6 un | R$ 142,14 | 16% |
| 🥉 3º | ANA.SENA | 5 un | R$ 118,45 | 14% |
| 4º | PATRICIA.OLIVEIRA | 4 un | R$ 94,76 | 11% |
| 5º | ELIANE.SANTOS | 4 un | R$ 94,76 | 11% |

### 2. Consumo por GRUPO de Usuário

**Dezembro/2025 - Top 5 Grupos:**

| Posição | Grupo | Quantidade | Valor | % do Total |
|---------|-------|------------|-------|------------|
| 🥇 1º | Grupo 4 | 14 un | R$ 331,66 | 38% |
| 🥈 2º | Grupo 8 | 11 un | R$ 260,59 | 30% |
| 🥉 3º | Grupo 20 | 6 un | R$ 142,14 | 16% |
| 4º | Grupo 14 | 4 un | R$ 94,76 | 11% |
| 5º | Grupo 24 | 2 un | R$ 47,38 | 5% |

### 3. Consumo por PARCEIRO (Quem recebeu)

Disponível via `groupBy=parceiro`

### 4. Consumo por MÊS

Disponível via `groupBy=mes`

### 5. Consumo por TIPO DE OPERAÇÃO

Disponível via `groupBy=tipooper`

## 🔧 Soluções Possíveis

### Opção 1: Usar GRUPO de Usuário como Proxy de Departamento ✅

**Se os Grupos representam Departamentos:**
- Grupo 4 = Financeiro?
- Grupo 8 = RH?
- Grupo 20 = TI?
- etc...

**Ação**: Mapear códigos de grupo para nomes de departamento

### Opção 2: Investigar Tabela TSIUSU ✅

A tabela de usuários (`TSIUSU`) pode ter um campo que liga o usuário ao departamento.

**Possíveis campos:**
- `TSIUSU.CODGRUPO` → Grupo do usuário (JÁ TEMOS)
- `TSIUSU.CODFUNC` → Código do funcionário
- JOIN com `TFPFUN` (Funcionários) → Pode ter CODDEP

### Opção 3: Adicionar Agrupamento por Departamento via TFPFUN 🚀

**Nova Query Proposta:**
```sql
SELECT
  FUN.CODDEP,
  DEP.DESCRDEP,
  SUM(CASE WHEN ITE.ATUALESTOQUE<0 THEN ITE.QTDNEG ELSE 0 END) AS CONSUMO
FROM TGFITE ITE
JOIN TGFCAB CAB ON CAB.NUNOTA = ITE.NUNOTA
JOIN TSIUSU USU ON USU.CODPARC = CAB.CODPARC
LEFT JOIN TFPFUN FUN ON FUN.CODFUNC = USU.CODFUNC
LEFT JOIN TGFDEP DEP ON DEP.CODDEP = FUN.CODDEP
WHERE ITE.CODPROD = {codprod}
  AND CAB.DTNEG >= '{dataInicio}'
  AND CAB.DTNEG <= '{dataFim}'
  AND CAB.STATUSNOTA = 'L'
  AND ITE.ATUALESTOQUE < 0
GROUP BY FUN.CODDEP, DEP.DESCRDEP
ORDER BY CONSUMO DESC
```

## 📊 Dados Atuais Disponíveis para o Gestor

### Endpoint Atual
```
GET /tgfpro2/produtos/:codprod/consumo/analise?groupBy=grupo
```

### Response
```json
{
  "agrupamento": {
    "tipo": "grupo",
    "dados": [
      {
        "codigoGrupo": 4,
        "nomeGrupo": "Grupo 4",
        "quantidadeConsumo": 14,
        "valorConsumo": 331.66,
        "percentual": 37.84
      },
      {
        "codigoGrupo": 8,
        "nomeGrupo": "Grupo 8",
        "quantidadeConsumo": 11,
        "valorConsumo": 260.59,
        "percentual": 29.73
      }
    ]
  }
}
```

## ✅ Próximos Passos

### 1. Confirmar com o Gestor

**Perguntas:**
1. Os GRUPOS de usuário representam DEPARTAMENTOS?
2. Se sim, qual o nome de cada grupo?
   - Grupo 4 = ?
   - Grupo 8 = ?
   - Grupo 20 = ?
   - etc.

### 2. Investigar Estrutura de Dados

- Verificar se `TSIUSU.CODFUNC` existe
- Tentar JOIN com `TFPFUN` (Funcionários)
- Ver se `TFPFUN.CODDEP` está acessível

### 3. Implementar Solução

**Se Grupos = Departamentos:**
- Criar mapeamento de nomes
- Atualizar response para mostrar nomes reais

**Se precisar de TFPFUN:**
- Criar novo agrupamento `groupBy=departamento`
- Fazer JOIN adicional via funcionários

## 📝 Resumo para o Gestor

### O Que Funciona Agora ✅

- ✅ Consumo por Usuário (quem pegou o produto)
- ✅ Consumo por Grupo de Usuário
- ✅ Consumo por Parceiro
- ✅ Consumo por Mês
- ✅ Consumo por Tipo de Operação

### O Que Precisa de Ajuste ⚠️

- ⚠️ **Departamento (CODDEP) está bloqueado pelo Sankhya**
- ⚠️ Precisamos usar **GRUPO** como proxy de Departamento
- ⚠️ OU investigar caminho via **TFPFUN** (Funcionários)

### Decisão Necessária

**Gestor, por favor confirme:**
1. GRUPO de usuário = DEPARTAMENTO?
2. Se sim, quais os nomes dos grupos?
3. Ou precisamos investigar outra forma de acessar o departamento?

---

**Status**: Aguardando retorno do gestor
**Data**: 15/01/2026
