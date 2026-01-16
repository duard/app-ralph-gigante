# Componentes de Seleção de Locais (TGFLOC)

Conjunto de componentes reutilizáveis para seleção de locais de estoque do Sankhya.

## Componentes Disponíveis

### 1. LocalSingleSelect

Seleção única de local usando dropdown simples.

**Características:**
- Dropdown nativo do shadcn/ui
- Opção de limpar seleção
- Loading state automático
- Tratamento de erros
- Ícone de local (MapPin)
- Filtro customizado de locais

**Uso:**
```tsx
import { LocalSingleSelect } from '@/components/sankhya/selects/locais'

function MyComponent() {
  const [selectedLocal, setSelectedLocal] = useState<number | null>(null)

  return (
    <LocalSingleSelect
      value={selectedLocal}
      onChange={setSelectedLocal}
      placeholder="Selecione um local"
      clearable
    />
  )
}
```

**Props:**
- `value?: number | null` - Código do local selecionado
- `onChange?: (value: number | null) => void` - Callback de mudança
- `placeholder?: string` - Texto placeholder (padrão: "Selecione um local")
- `clearable?: boolean` - Permite limpar seleção (padrão: true)
- `disabled?: boolean` - Desabilita o select
- `className?: string` - Classes CSS adicionais
- `showLoadingIcon?: boolean` - Mostra ícone de loading (padrão: true)
- `filterLocais?: (local: Local) => boolean` - Filtro customizado

---

### 2. LocalMultiSelect

Seleção múltipla de locais com popover e checkboxes.

**Características:**
- Interface de popover com lista de checkboxes
- Contador de selecionados
- Limite máximo de seleções
- Botões "Todos" e "Limpar"
- ScrollArea para listas grandes
- Badge com contagem

**Uso:**
```tsx
import { LocalMultiSelect } from '@/components/sankhya/selects/locais'

function MyComponent() {
  const [selectedLocais, setSelectedLocais] = useState<number[]>([])

  return (
    <LocalMultiSelect
      value={selectedLocais}
      onChange={setSelectedLocais}
      placeholder="Selecione locais"
      showCount
      maxSelections={5}
    />
  )
}
```

**Props:**
- `value?: number[]` - Códigos dos locais selecionados
- `onChange?: (value: number[]) => void` - Callback de mudança
- `placeholder?: string` - Texto placeholder
- `maxSelections?: number` - Limite máximo de seleções
- `showCount?: boolean` - Mostra badge com contador (padrão: true)
- `disabled?: boolean` - Desabilita o select
- `className?: string` - Classes CSS adicionais
- `showLoadingIcon?: boolean` - Mostra ícone de loading
- `filterLocais?: (local: Local) => boolean` - Filtro customizado

---

### 3. LocalCombobox

Combobox com busca e autocomplete para locais.

**Características:**
- Campo de busca integrado
- Autocomplete enquanto digita
- Busca por código ou descrição
- Case-sensitive opcional
- Interface de Command do shadcn/ui
- Opção de limpar seleção

**Uso:**
```tsx
import { LocalCombobox } from '@/components/sankhya/selects/locais'

function MyComponent() {
  const [selectedLocal, setSelectedLocal] = useState<number | null>(null)

  return (
    <LocalCombobox
      value={selectedLocal}
      onChange={setSelectedLocal}
      placeholder="Buscar local..."
      emptyMessage="Nenhum local encontrado"
    />
  )
}
```

**Props:**
- `value?: number | null` - Código do local selecionado
- `onChange?: (value: number | null) => void` - Callback de mudança
- `placeholder?: string` - Texto placeholder
- `clearable?: boolean` - Permite limpar seleção (padrão: true)
- `emptyMessage?: string` - Mensagem quando não há resultados
- `caseSensitive?: boolean` - Busca case-sensitive (padrão: false)
- `disabled?: boolean` - Desabilita o combobox
- `className?: string` - Classes CSS adicionais
- `showLoadingIcon?: boolean` - Mostra ícone de loading
- `filterLocais?: (local: Local) => boolean` - Filtro customizado

---

## Características Comuns

### Loading Automático
Todos os componentes usam o hook `useLocais()` que gerencia automaticamente:
- Estado de carregamento
- Cache de 10 minutos
- Tratamento de erros
- Revalidação automática

### Tratamento de Erros
Quando há erro ao carregar locais, os componentes exibem:
- Ícone de alerta
- Mensagem de erro clara
- Border vermelha para destaque

### Filtros Customizados
Todos aceitam a prop `filterLocais` para filtrar quais locais aparecem:
```tsx
<LocalSingleSelect
  filterLocais={(local) => local.ativo === 'S'}
  // Mostra apenas locais ativos
/>
```

### Acessibilidade
- Labels ARIA apropriados
- Navegação por teclado
- Focus management
- Screen reader friendly

---

## Exemplos de Uso

### Filtro de Toolbar
```tsx
<div className="grid gap-4 md:grid-cols-3">
  <div>
    <Label>Grupo</Label>
    <GrupoSelect value={grupo} onChange={setGrupo} />
  </div>
  <div>
    <Label>Local</Label>
    <LocalSingleSelect
      value={local}
      onChange={setLocal}
      placeholder="Todos os locais"
      clearable
    />
  </div>
  <div>
    <Label>Status</Label>
    <StatusSelect value={status} onChange={setStatus} />
  </div>
</div>
```

### Formulário de Produto
```tsx
<form>
  <div className="space-y-4">
    <div>
      <Label>Local Principal *</Label>
      <LocalCombobox
        value={produto.codlocal}
        onChange={(value) => setProduto({ ...produto, codlocal: value })}
        placeholder="Buscar local..."
      />
    </div>

    <div>
      <Label>Locais Adicionais</Label>
      <LocalMultiSelect
        value={produto.locaisAdicionais}
        onChange={(value) => setProduto({ ...produto, locaisAdicionais: value })}
        maxSelections={3}
      />
    </div>
  </div>
</form>
```

### Relatório com Múltiplos Locais
```tsx
<Card>
  <CardHeader>
    <CardTitle>Gerar Relatório de Estoque</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      <div>
        <Label>Selecione os locais</Label>
        <LocalMultiSelect
          value={selectedLocais}
          onChange={setSelectedLocais}
          showCount
          placeholder="Selecione um ou mais locais"
        />
      </div>

      <Button
        onClick={() => generateReport(selectedLocais)}
        disabled={selectedLocais.length === 0}
      >
        Gerar Relatório
      </Button>
    </div>
  </CardContent>
</Card>
```

---

## TypeScript

Todos os componentes são totalmente tipados:

```typescript
import type {
  LocalSingleSelectProps,
  LocalMultiSelectProps,
  LocalComboboxProps,
} from '@/components/sankhya/selects/locais'
```

---

## Hook useLocais()

Os componentes utilizam internamente o hook `useLocais()`:

```typescript
const { data, isLoading, error } = useLocais()

// data: Local[] | undefined
// isLoading: boolean
// error: Error | null
```

Tipo `Local`:
```typescript
interface Local {
  codlocal: number
  descrlocal: string
  ativo?: 'S' | 'N'
}
```

---

## Customização de Estilo

Todos os componentes aceitam `className` para customização:

```tsx
<LocalSingleSelect
  className="w-[200px]"
  // ou
  className="col-span-2"
  // ou
  className="border-primary focus-within:ring-primary"
/>
```

---

## Performance

- **Cache:** 10 minutos de cache via React Query
- **Memoização:** Listas filtradas são memoizadas
- **Lazy Loading:** Componentes carregam sob demanda
- **Debounce:** Busca no combobox não faz requests excessivos

---

## Quando Usar Cada Componente

| Componente | Quando Usar |
|------------|-------------|
| **LocalSingleSelect** | Filtros de toolbar, formulários simples, seleção rápida |
| **LocalMultiSelect** | Relatórios, configurações, seleção de múltiplos destinos |
| **LocalCombobox** | Listas grandes de locais, quando usuário conhece o nome, busca avançada |

---

## Próximas Melhorias

- [ ] LocalFilter - Componente avançado com agrupamento
- [ ] Modo de visualização em grid
- [ ] Suporte a favoritos/recentes
- [ ] Integração com permissões de usuário
- [ ] Exportação de seleção
