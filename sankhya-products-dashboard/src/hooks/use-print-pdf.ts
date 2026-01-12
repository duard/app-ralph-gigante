import { useCallback } from 'react';

/**
 * Hook para exportar conteúdo como PDF usando a API nativa do navegador
 * Não requer dependências externas
 */
export function usePrintPDF() {
  const printPDF = useCallback((printableElementId: string) => {
    // Adicionar estilos de impressão
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        body * {
          visibility: hidden;
        }
        #${printableElementId}, #${printableElementId} * {
          visibility: visible;
        }
        #${printableElementId} {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
        /* Esconder elementos de navegação e botões */
        button, .no-print {
          display: none !important;
        }
        /* Otimizar quebras de página */
        table, .card {
          page-break-inside: avoid;
        }
        /* Estilos de tabela para impressão */
        table {
          border-collapse: collapse;
          width: 100%;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f3f4f6;
          font-weight: 600;
        }
      }
    `;
    document.head.appendChild(style);

    // Chamar impressão
    window.print();

    // Remover estilos após impressão
    setTimeout(() => {
      document.head.removeChild(style);
    }, 1000);
  }, []);

  return { printPDF };
}
