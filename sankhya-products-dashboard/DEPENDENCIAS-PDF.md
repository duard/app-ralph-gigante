# Dependências para Exportar PDF

Para habilitar a funcionalidade de exportar PDF nas páginas de consumo, execute:

```bash
npm install react-to-print
```

## Funcionalidade Implementada

✅ Componente reutilizável `PrintableReport` criado
✅ Botão "Exportar PDF" adicionado em:
  - V1: /produtos/:codprod/consumo
  - V2: /produtos/:codprod/consumo-v2
  - V3: /produtos/:codprod/consumo-v3

## Como Funciona

1. Usuário clica em "Exportar PDF"
2. Conteúdo é formatado para impressão (sem menus, com estilos otimizados)
3. Dialog nativa do navegador abre para salvar/imprimir PDF
4. Layout responsivo e profissional para relatórios

## Alternativas

Se `react-to-print` não atender, outras opções:
- **jsPDF** + **html2canvas**: Mais controle sobre o PDF
- **pdfmake**: Construir PDF do zero com API programática
- **@react-pdf/renderer**: Componentes React para PDF
