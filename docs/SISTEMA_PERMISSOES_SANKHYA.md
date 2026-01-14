# Sistema de Controle de Acesso e Permissões - Sankhya

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Tabelas Principais](#tabelas-principais)
3. [Fluxo de Autenticação/Autorização](#fluxo-de-autenticaçãoautorização)
4. [Estrutura de Permissões](#estrutura-de-permissões)
5. [Exemplos Práticos](#exemplos-práticos)
6. [Diagrama de Relacionamento](#diagrama-de-relacionamento)

---

## 🎯 Visão Geral

O sistema de permissões do Sankhya é baseado em um modelo hierárquico que relaciona:
- **Usuários** (TSIUSU)
- **Grupos** (TSIGRU)
- **Acessos** (TDDIAC - Identificadores de Acesso)
- **Permissões** (TDDPER - Permissões efetivas)

### Conceitos Fundamentais

**IDACESSO**: Identificador único de uma funcionalidade/recurso do sistema
- Formato: `br.com.sankhya.<módulo>.<tela/recurso>`
- Exemplo: `br.com.sankhya.com.cac.Notas`

**ACESSO** (campo numérico): Representa o nível de permissão
- Valor `1249`: Permissão completa (comum)
- Valor `0`: Sem acesso
- Valor `9249`: Acesso especial (ex: DbExplorer)
- Outros valores representam permissões granulares

---

## 🗂️ Tabelas Principais

### 1. TSIUSU - Usuários

**Descrição**: Tabela principal de usuários do sistema

**Campos Principais**:
```sql
CODUSU      INT         -- Código único do usuário
NOMEUSU     VARCHAR     -- Nome/Login do usuário
CODEMP      INT         -- Código da empresa
CODGRU      INT         -- Código do grupo (FK para TSIGRU)
ATIVO       CHAR(1)     -- S/N - Status do usuário
```

**Exemplo - Usuário CONVIDADO**:
```json
{
  "CODUSU": 311,
  "NOMEUSU": "CONVIDADO",
  "CODEMP": 1,
  "CODGRU": 0,
  "ATIVO": "S"
}
```

**Queries Úteis**:
```sql
-- Buscar usuário específico
SELECT CODUSU, NOMEUSU, CODGRU, ATIVO
FROM TSIUSU
WHERE CODUSU = 311

-- Listar todos usuários ativos
SELECT CODUSU, NOMEUSU, CODEMP
FROM TSIUSU
WHERE ATIVO = 'S'
ORDER BY NOMEUSU ASC
```

---

### 2. TSIGRU - Grupos de Usuários

**Descrição**: Grupos para organização de usuários e permissões em massa

**Campos Principais**:
```sql
CODGRU      INT         -- Código único do grupo
DESCRGRU    VARCHAR     -- Descrição do grupo
```

**Exemplos de Grupos**:
```sql
SELECT TOP 10 CODGRU, DESCRGRU
FROM TSIGRU
ORDER BY CODGRU
```

---

### 3. TDDIAC - Identificadores de Acesso

**Descrição**: Catálogo de todos os recursos/funcionalidades acessíveis no sistema

**Campos Principais**:
```sql
IDACESSO    VARCHAR(255)  -- ID único do recurso (ex: br.com.sankhya.com.cac.Notas)
DESCRICAO   VARCHAR       -- Descrição da permissão
SIGLA       VARCHAR       -- Sigla/código curto
SEQUENCIA   INT           -- Ordem/sequência
```

**Exemplo de IDAcessos**:
```json
[
  {
    "IDACESSO": "br.com.sankhya.com.cac.Notas",
    "DESCRICAO": "Cancelar",
    "SIGLA": "Cancelar",
    "SEQUENCIA": 1
  },
  {
    "IDACESSO": "br.com.sankhya.DbExplorer",
    "DESCRICAO": "DB Explorer",
    "SIGLA": "DBExplorer",
    "SEQUENCIA": 1
  },
  {
    "IDACESSO": "br.com.sankhya.core.cfg.DicionarioDados",
    "DESCRICAO": "Dicionário de Dados",
    "SIGLA": "DicDados",
    "SEQUENCIA": 1
  }
]
```

**Query para buscar acessos**:
```sql
-- Buscar todos os acessos disponíveis
SELECT IDACESSO, DESCRICAO, SIGLA
FROM TDDIAC
ORDER BY DESCRICAO

-- Buscar acessos específicos de um módulo
SELECT IDACESSO, DESCRICAO
FROM TDDIAC
WHERE IDACESSO LIKE 'br.com.sankhya.com.cac%'
```

---

### 4. TDDPER - Permissões Efetivas

**Descrição**: Tabela que relaciona usuários/grupos com seus acessos (permissões)

**Campos Principais**:
```sql
IDACESSO    VARCHAR(255)  -- ID do recurso (FK para TDDIAC)
CODUSU      INT           -- Código do usuário (FK para TSIUSU)
CODGRUPO    INT           -- Código do grupo (FK para TSIGRU)
ACESSO      VARCHAR       -- Nível de acesso (1249, 0, 9249, etc)
VERSAO      INT           -- Versão da permissão
```

**Lógica de Permissão**:
- Se `CODUSU` > 0: Permissão específica para o usuário
- Se `CODGRUPO` > 0: Permissão para o grupo
- Permissões de usuário **sobrescrevem** permissões de grupo

**Exemplo - Permissões do Usuário 311**:
```json
[
  {
    "IDACESSO": "br.com.sankhya.com.cac.Notas",
    "CODUSU": 311,
    "CODGRUPO": 0,
    "ACESSO": "1249",
    "VERSAO": 2
  },
  {
    "IDACESSO": "br.com.sankhya.DbExplorer",
    "CODUSU": 311,
    "CODGRUPO": 0,
    "ACESSO": "9249",
    "VERSAO": 2
  },
  {
    "IDACESSO": "br.com.sankhya.core.cfg.AdministracaoServidor",
    "CODUSU": 311,
    "CODGRUPO": 0,
    "ACESSO": "0",
    "VERSAO": 2
  }
]
```

**Queries de Permissão**:
```sql
-- Buscar permissões de um usuário específico
SELECT
    IDACESSO,
    CODUSU,
    CODGRUPO,
    ACESSO,
    VERSAO
FROM TDDPER
WHERE CODUSU = 311
ORDER BY IDACESSO

-- Buscar permissão específica de usuário/grupo
SELECT
    ACESSO,
    CODGRUPO,
    CODUSU,
    VERSAO
FROM TDDPER
WHERE IDACESSO = 'br.com.sankhya.com.cac.Notas'
  AND CODUSU = 311
  AND CODGRUPO = 0

-- Buscar permissões do grupo de um usuário
SELECT
    P.IDACESSO,
    P.CODGRUPO,
    P.ACESSO,
    I.DESCRICAO
FROM TDDPER P
LEFT JOIN TDDIAC I ON P.IDACESSO = I.IDACESSO
WHERE P.CODGRUPO IN (
    SELECT CODGRU FROM TSIUSU WHERE CODUSU = 311
)
ORDER BY P.IDACESSO
```

---

## 📊 Tabelas Complementares

### TSIACM - Acesso a Menus

**Descrição**: Controla acesso aos menus/telas do sistema

**Campos**:
```sql
CODGRU      INT     -- Grupo
CODUSU      INT     -- Usuário
CODEMP      INT     -- Empresa
```

### TSIACI - Controle de Acesso a Relatórios

**Descrição**: Permissões específicas para relatórios

**Campos**:
```sql
CODTIP      INT     -- Tipo
CODUSU      INT     -- Usuário
CODRFE      INT     -- Código do relatório
```

### TSIPER - Permissão de Acesso (Legado)

**Descrição**: Tabela legada de permissões (substituída por TDDPER)

### TSILAC - Log de Acessos

**Descrição**: Registro de todos os acessos ao sistema

**Campos**:
```sql
CODUSU      INT         -- Usuário
DTHRLOG     DATETIME    -- Data/Hora do acesso
ACAO        VARCHAR     -- Ação realizada
```

**Query**:
```sql
-- Últimos acessos do usuário
SELECT TOP 10
    CODUSU,
    DTHRLOG,
    ACAO
FROM TSILAC
WHERE CODUSU = 311
ORDER BY DTHRLOG DESC
```

### TSIDSBAPER - Permissão do Analytics

**Descrição**: Permissões para dashboards/analytics

**Campos**:
```sql
IDDASH      INT     -- ID do dashboard
CODUSU      INT     -- Usuário
CODGRU      INT     -- Grupo
```

---

## 🔐 Fluxo de Autenticação/Autorização

### 1. Autenticação

```
┌──────────────┐
│   Cliente    │
│ (Frontend)   │
└──────┬───────┘
       │ POST /auth/login
       │ {username, password}
       ▼
┌──────────────┐
│  AuthService │
│   (NestJS)   │
└──────┬───────┘
       │ HTTP POST
       │ External Sankhya API
       ▼
┌──────────────┐
│  Sankhya API │
│   (Externa)  │
└──────┬───────┘
       │ Valida credenciais
       │ Consulta TSIUSU
       ▼
┌──────────────┐
│  JWT Token   │
│  access_token│
└──────────────┘
```

**Implementação (auth.service.ts)**:
```typescript
async authenticateWithSankhya(
  username: string,
  password: string
): Promise<{ access_token: string }> {
  const response = await this.httpService.post(
    `${this.sankhyaApiBaseUrl}/auth/login`,
    { username, password }
  );

  return {
    access_token: response.data.access_token,
    token_type: 'Bearer',
    expires_in: response.data.expires_in || 3600
  };
}
```

### 2. Autorização (Verificação de Permissões)

```
┌──────────────┐
│   Request    │
│ + JWT Token  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│TokenAuthGuard│ ─── Valida Token JWT
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Extrai CODUSU│ ─── Do payload do token
└──────┬───────┘
       │
       ▼
┌──────────────┐
│Consulta TDDPER│
│ + TDDIAC     │ ─── Verifica se usuário tem permissão
└──────┬────────┘
       │
       ├─── TEM permissão ──> Permite acesso
       │
       └─── NÃO TEM ──> HTTP 403 Forbidden
```

---

## 🛠️ Estrutura de Permissões

### Hierarquia de Verificação

```
1. Verifica permissão do USUÁRIO (TDDPER.CODUSU = X)
   ├─ Se ACESSO = "0" → NEGADO
   ├─ Se ACESSO = "1249" → PERMITIDO
   └─ Se não existe → Vai para grupo

2. Se não tem permissão de usuário, verifica GRUPO
   ├─ Busca CODGRU do usuário (TSIUSU.CODGRU)
   ├─ Verifica TDDPER.CODGRUPO = Y
   ├─ Se ACESSO = "0" → NEGADO
   └─ Se ACESSO = "1249" → PERMITIDO

3. Se não tem permissão de grupo → NEGADO (padrão)
```

### Códigos de Acesso

| Código | Significado | Uso |
|--------|-------------|-----|
| `0` | Sem acesso | Bloquear recurso |
| `1209` | Acesso parcial | Visualizar, mas não editar |
| `1249` | Acesso completo | Todas as operações |
| `9249` | Acesso especial | Recursos administrativos |

---

## 💻 Exemplos Práticos

### Exemplo 1: Verificar se usuário pode acessar "Notas"

```sql
-- Query completa de verificação
DECLARE @CODUSU INT = 311
DECLARE @IDACESSO VARCHAR(255) = 'br.com.sankhya.com.cac.Notas'

-- 1. Tenta permissão direta do usuário
SELECT ACESSO
FROM TDDPER
WHERE IDACESSO = @IDACESSO
  AND CODUSU = @CODUSU

-- 2. Se não encontrou, busca por grupo
SELECT P.ACESSO
FROM TDDPER P
INNER JOIN TSIUSU U ON U.CODGRU = P.CODGRUPO
WHERE P.IDACESSO = @IDACESSO
  AND U.CODUSU = @CODUSU
  AND P.CODUSU = 0  -- Permissão de grupo (não de usuário específico)
```

### Exemplo 2: Listar todos os acessos de um usuário

```sql
-- Acessos diretos do usuário
SELECT
    I.DESCRICAO,
    P.IDACESSO,
    P.ACESSO,
    'USUARIO' AS ORIGEM
FROM TDDPER P
LEFT JOIN TDDIAC I ON P.IDACESSO = I.IDACESSO
WHERE P.CODUSU = 311

UNION ALL

-- Acessos herdados do grupo
SELECT
    I.DESCRICAO,
    P.IDACESSO,
    P.ACESSO,
    'GRUPO' AS ORIGEM
FROM TDDPER P
LEFT JOIN TDDIAC I ON P.IDACESSO = I.IDACESSO
INNER JOIN TSIUSU U ON U.CODGRU = P.CODGRUPO
WHERE U.CODUSU = 311
  AND P.CODUSU = 0
ORDER BY DESCRICAO
```

### Exemplo 3: Implementação em TypeScript/NestJS

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class PermissionService {
  constructor(
    private readonly sankhyaApiService: SankhyaApiService
  ) {}

  async checkPermission(
    codUsu: number,
    idAcesso: string
  ): Promise<boolean> {
    // 1. Busca permissão direta do usuário
    const userPerm = await this.sankhyaApiService.executeQuery(`
      SELECT ACESSO
      FROM TDDPER
      WHERE IDACESSO = @param1
        AND CODUSU = @param2
    `, [idAcesso, codUsu]);

    if (userPerm && userPerm.length > 0) {
      return userPerm[0].ACESSO !== '0';
    }

    // 2. Busca permissão do grupo
    const groupPerm = await this.sankhyaApiService.executeQuery(`
      SELECT P.ACESSO
      FROM TDDPER P
      INNER JOIN TSIUSU U ON U.CODGRU = P.CODGRUPO
      WHERE P.IDACESSO = @param1
        AND U.CODUSU = @param2
        AND P.CODUSU = 0
    `, [idAcesso, codUsu]);

    if (groupPerm && groupPerm.length > 0) {
      return groupPerm[0].ACESSO !== '0';
    }

    // 3. Sem permissão
    return false;
  }
}
```

---

## 📐 Diagrama de Relacionamento

```
┌─────────────┐
│   TSIUSU    │
│  Usuários   │
├─────────────┤
│ CODUSU (PK) │───┐
│ NOMEUSU     │   │
│ CODGRU (FK) │───┼──────┐
│ ATIVO       │   │      │
└─────────────┘   │      │
                  │      │
                  │      │
                  │   ┌──▼──────────┐
                  │   │   TSIGRU    │
                  │   │   Grupos    │
                  │   ├─────────────┤
                  │   │ CODGRU (PK) │
                  │   │ DESCRGRU    │
                  │   └─────────────┘
                  │
                  │
      ┌───────────▼──────────┐
      │      TDDPER          │
      │    Permissões        │
      ├──────────────────────┤
      │ IDACESSO (FK) ───────┼───┐
      │ CODUSU (FK)          │   │
      │ CODGRUPO (FK)        │   │
      │ ACESSO               │   │
      │ VERSAO               │   │
      └──────────────────────┘   │
                                 │
                                 │
                        ┌────────▼────────┐
                        │     TDDIAC      │
                        │ID de Acessos    │
                        ├─────────────────┤
                        │ IDACESSO (PK)   │
                        │ DESCRICAO       │
                        │ SIGLA           │
                        │ SEQUENCIA       │
                        └─────────────────┘
```

---

## 🔍 Tabelas de Acesso Descobertas

Tabelas relacionadas a acesso e permissões encontradas no sistema:

### Tabelas Principais de Permissões

| Tabela | Descrição | Tipo |
|--------|-----------|------|
| `TSIUSU` | Usuários principais | Core |
| `TSIGRU` | Grupos de usuários | Core |
| `TDDPER` | Permissões (principal) | Core |
| `TDDIAC` | Identificadores de acesso | Core |
| `TDDPERBK` | Backup de permissões | Backup |

### Tabelas de Acesso Específico

| Tabela | Descrição | Módulo |
|--------|-----------|--------|
| `TSIACM` | Acesso a menus | Sistema |
| `TSIACI` | Controle de acesso a relatórios | Relatórios |
| `TSIACIBK` | Backup controle de acesso relatórios | Backup |
| `TSIDSBAPER` | Permissão do Analytics | Analytics |
| `TSIPER` | Permissão de acesso (legado) | Sistema |
| `GESTOR_REPORT` | Permissão Acesso Relatórios | Relatórios |
| `TASPAG` | Permissões de Agente | Agentes |
| `TGFPPO` | Permissões por Ocorrência | Gestão |

### Tabelas de Controle e Segurança

| Tabela | Descrição | Função |
|--------|-----------|--------|
| `TSILAC` | Log de acessos | Auditoria |
| `TSILBA` | Liberação de acesso por PC | Segurança |
| `TSIACR` | Acesso remoto | Segurança |
| `TSI001` | Autorização de API | API |
| `TSIACE` | Sugestão Acesso Cartão EVO | Sistema |
| `TSIAPRN` | Acesso servidor impressão | Sistema |

### Tabelas de Configuração e Grupos

| Tabela | Descrição | Tipo |
|--------|-----------|------|
| `TSICONF` | Configurações do Usuário | Configuração |
| `TSICONFBK` | Backup Configurações do Usuário | Backup |
| `TSIGPU` | Grupos Adicionais | Grupos |
| `TSIGRE` | Grupo de Relatórios | Grupos |
| `TSIUSUBK` | Backup Usuários | Backup |

### Tabelas de Funcionalidades Específicas

| Tabela | Descrição | Módulo |
|--------|-----------|--------|
| `TSIDSU` | DataSource por Usuário | Sistema |
| `TSIUFA` | Usuário Filtro API | API |
| `TSIUFI` | Fila de Impressão por TOP e Usuário | Sistema |
| `TSIUCT` | Contas por Usuário | Financeiro |
| `TSIEXU` | Exceções para usuários LGPD | LGPD |
| `TSISRH` | Usuário Portal RH | RH |
| `TSISUPL` | Usuário Suplementar | Sistema |
| `TSIPUE` | Perfil Usuário EVO | Sistema |
| `TSIILA` | Acessos - Importador de Dados | Importação |
| `TSIITA` | Acessos - Importador Dados Tabelas | Importação |
| `TSILBA` | Liberação de acesso por PC | Segurança |
| `TSIHCU` | Histórico Cópia Configuração Usu | Sistema |
| `TSIPVI` | Personalizações Usu Internalização Store | Sistema |
| `TSIRLG` | Log acessos | Auditoria |

**Total de Tabelas Descobertas**: 38 tabelas relacionadas ao sistema de permissões e acesso

---

## 🔐 Tabelas de Autorização Específicas

Além das permissões gerais, o sistema possui tabelas de autorização para processos específicos:

### Autorizações de Negócio

| Tabela | Descrição | Uso |
|--------|-----------|-----|
| `TCSAUT` | Autorizações | Autorizações gerais do sistema |
| `TCSAFO` | Autorizações de Faturamento de OS | Ordens de Serviço |
| `TGMAI` | Autorização de Investimento | Investimentos |
| `TGMAIB` | Bloqueio de Autorização de Investimento | Controle de investimentos |

### Autorizações de Documentos Fiscais

| Tabela | Descrição | Uso |
|--------|-----------|-----|
| `TGFAAXN` | Autorização Acesso XML NF-e | Notas Fiscais Eletrônicas |
| `TGFAAXNM` | Autorização Acesso XML NF-e p/ Marca | Por marca de produto |
| `TGFATX` | Autorização XML NFe | Controle XML |
| `TGFNPA` | Notas Pendentes de Autorização | Workflow fiscal |

### Observação sobre Tabelas de Autorização

As tabelas de **Autorização** (TCSAUT, TGFAAXN, etc.) são diferentes das tabelas de **Permissão** (TDDPER, TSIPER):

- **Permissões**: Controlam o acesso às funcionalidades do sistema (quem pode ver/editar telas)
- **Autorizações**: Controlam a aprovação de processos de negócio (workflow de aprovação de documentos, investimentos, etc.)

---

## 📊 Outras Tabelas Relacionadas ao Controle de Acesso

### Restrições e Controles

| Tabela | Descrição | Tipo |
|--------|-----------|------|
| `TGFREP` | Restrições da TOP | Tipo de Operação |
| `TGFREPBK` | Restrições da TOP Backup | Backup |
| `TGFRTT` | Restrição de Tipo de Título | Financeiro |
| `TFXRTP` | Restrições de Tipo de Negociação | Comercial |
| `TGFPRI` | Prioridades da restrição ICMS | Fiscal |

### Segurança Adicional

| Tabela | Descrição | Uso |
|--------|-----------|-----|
| `AD_SEGURANCA` | Segurança (customizada) | Controle customizado |
| `TSILBA` | Liberação de acesso por PC | Controle por máquina |

---

## 📝 Notas Importantes

### Usuário CONVIDADO (311)

- **CODUSU**: 311
- **NOMEUSU**: CONVIDADO
- **Password**: guest123
- **CODGRU**: 0 (sem grupo específico)
- **Uso**: Testes e demonstrações

### Valores de ACESSO Comuns

- **0**: Sem acesso
- **1209**: Leitura apenas
- **1249**: Acesso completo (mais comum)
- **9249**: Administrativo/especial

### Estrutura de IDACESSO

Formato padrão:
```
br.com.sankhya.<módulo>.<submódulo>.<recurso>

Exemplos:
br.com.sankhya.com.cac.Notas          → Notas (Comercial)
br.com.sankhya.DbExplorer             → DB Explorer
br.com.sankhya.core.cfg.DicionarioDados → Dicionário de Dados
```

---

## 🚀 Como Implementar Controle de Acesso

### 1. Criar Guard Customizado

```typescript
// permission.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<string>(
      'permission',
      context.getHandler()
    );

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Do TokenAuthGuard

    return this.permissionService.checkPermission(
      user.codUsu,
      requiredPermission
    );
  }
}
```

### 2. Usar no Controller

```typescript
@Controller('produtos')
@UseGuards(TokenAuthGuard, PermissionGuard)
export class ProdutosController {

  @Get()
  @SetMetadata('permission', 'br.com.sankhya.com.cac.Produtos')
  async listar() {
    // Só executa se usuário tiver permissão
  }
}
```

---

## 📚 Referências

- API Sankhya Externa: `https://api-nestjs-sankhya-read-producao.gigantao.net`
- Dicionário de Dados: Tabelas TDDTAB, TDDCAM, TDDIAC
- Código fonte: `/api-sankhya-center/src/sankhya/auth`

---

## 📊 Resumo da Investigação

### Descobertas Principais

Durante a investigação completa do sistema de permissões do Sankhya, foram descobertas:

- **4 tabelas core** do sistema de permissões (TSIUSU, TSIGRU, TDDIAC, TDDPER)
- **38 tabelas relacionadas** a permissões, acesso e segurança
- **8 tabelas de autorizações** de processos de negócio
- **5 tabelas de restrições** específicas de módulos
- **200+ tabelas TSI*** (Sistema/Usuários) no total
- **14 tabelas TDD*** (Dicionário de Dados) relacionadas

### Metodologia de Investigação

A investigação foi realizada através de:

1. **Análise do dicionário de dados** (TDDTAB, TDDCAM)
2. **Queries exploratórias** usando palavras-chave:
   - "PERMISS", "AUTORI", "ACESSO", "CONTROLE", "SEGUR"
   - "RESTRI", "PERFIL", "PAPEL", "GRUPO", "USUARIO"
3. **Análise de estruturas** de tabelas relacionadas
4. **Teste de queries** com usuário CONVIDADO (311)

### Arquitetura Identificada

```
Sistema de Permissões Sankhya
├── Core (Permissões)
│   ├── TSIUSU (Usuários)
│   ├── TSIGRU (Grupos)
│   ├── TDDIAC (IDs de Acesso)
│   └── TDDPER (Permissões)
│
├── Acesso Específico
│   ├── Menus (TSIACM)
│   ├── Relatórios (TSIACI, GESTOR_REPORT)
│   ├── Analytics (TSIDSBAPER)
│   └── API (TSI001, TSIUFA)
│
├── Controle e Auditoria
│   ├── Logs (TSILAC, TSIRLG)
│   ├── Segurança (TSILBA, TSIACR)
│   └── Configurações (TSICONF)
│
├── Autorizações (Workflow)
│   ├── Negócio (TCSAUT, TGMAI)
│   └── Fiscal (TGFAAXN, TGFNPA)
│
└── Backup
    ├── TDDPERBK
    ├── TSIACIBK
    ├── TSICONFBK
    └── TSIUSUBK
```

### Scripts de Investigação Criados

- `/tmp/investigate_access.sh` - Investigação inicial de tabelas TSI/TDD
- `/tmp/investigate_permissions.sh` - Análise de TSIPER e sistema de permissões
- `/tmp/investigate_tddper_tddiac.sh` - Detalhamento TDDPER e TDDIAC
- `/tmp/investigate_dictionary_permissions.sh` - Busca completa no dicionário
- `/tmp/investigate_new_permission_tables.sh` - Análise de tabelas adicionais

---

**Última Atualização**: 2026-01-14 07:00 UTC
**Autor**: Sistema de Documentação Automática Claude Code
**Versão**: 2.0 (Investigação Completa)
