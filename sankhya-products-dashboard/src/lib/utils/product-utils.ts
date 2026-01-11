import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatProductCode(code: string | number): string {
  return String(code).toUpperCase().padStart(6, '0');
}

export function formatProductName(name: string): string {
  return name.trim();
}

export function formatProductPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
}

export function formatCurrency(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price);
}

export function formatProductStatus(status: string): string {
  return status === 'S' ? 'Ativo' : 'Inativo';
}

export function formatProductUnit(unit: string): string {
  const units = {
    unit: 'Unidade',
    kg: 'Kg',
    liter: 'Litro',
    meter: 'Metro',
  };
  return units[unit as keyof typeof units] || unit;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR');
}

export interface CSVProductRow {
  codprod: number;
  descrprod: string;
  reffab?: string;
  codvol?: string;
  vlrvenda?: number;
  vlrcusto?: number;
  estoque?: number;
  estmin?: number;
  ativo: 'S' | 'N';
  descrgrupoprod?: string;
  ncm?: string;
  pesoliq?: number;
  pesobruto?: number;
}

export function productsToCSV(products: CSVProductRow[]): string[][] {
  const headers = [
    'Código',
    'Nome/Descrição',
    'Ref. Fabricante',
    'Unidade',
    'Preço Venda',
    'Preço Custo',
    'Estoque',
    'Estoque Mínimo',
    'Status',
    'Categoria',
    'NCM',
    'Peso Líquido',
    'Peso Bruto'
  ];

  const rows = products.map(product => [
    String(product.codprod),
    product.descrprod,
    product.reffab || '',
    product.codvol || '',
    product.vlrvenda ? String(product.vlrvenda).replace('.', ',') : '',
    product.vlrcusto ? String(product.vlrcusto).replace('.', ',') : '',
    String(product.estoque || 0),
    String(product.estmin || 0),
    product.ativo === 'S' ? 'Ativo' : 'Inativo',
    product.descrgrupoprod || '',
    product.ncm || '',
    product.pesoliq ? String(product.pesoliq).replace('.', ',') : '',
    product.pesobruto ? String(product.pesobruto).replace('.', ',') : ''
  ]);

  return [headers, ...rows];
}

export function downloadCSV(products: CSVProductRow[], filename: string = 'produtos.csv'): void {
  const data = productsToCSV(products);

  const csvContent = data
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function productsToExcelData(products: CSVProductRow[]): (string | number)[][] {
  const headers = [
    'Código',
    'Nome/Descrição',
    'Ref. Fabricante',
    'Unidade',
    'Preço Venda',
    'Preço Custo',
    'Estoque',
    'Estoque Mínimo',
    'Status',
    'Categoria',
    'NCM',
    'Peso Líquido',
    'Peso Bruto'
  ];

  const rows = products.map(product => [
    product.codprod,
    product.descrprod,
    product.reffab || '',
    product.codvol || '',
    product.vlrvenda || 0,
    product.vlrcusto || 0,
    product.estoque || 0,
    product.estmin || 0,
    product.ativo === 'S' ? 'Ativo' : 'Inativo',
    product.descrgrupoprod || '',
    product.ncm || '',
    product.pesoliq || 0,
    product.pesobruto || 0
  ]);

  return [headers, ...rows];
}

export async function downloadExcel(products: CSVProductRow[], filename: string = 'produtos.xlsx'): Promise<void> {
  try {
    // Dynamically import xlsx to avoid SSR issues
    const XLSX = await import('xlsx');
    
    const data = productsToExcelData(products);
    
    // Create workbook and worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths
    const colWidths = [
      { wch: 10 }, // Código
      { wch: 40 }, // Nome/Descrição
      { wch: 15 }, // Ref. Fabricante
      { wch: 10 }, // Unidade
      { wch: 12 }, // Preço Venda
      { wch: 12 }, // Preço Custo
      { wch: 10 }, // Estoque
      { wch: 12 }, // Estoque Mínimo
      { wch: 10 }, // Status
      { wch: 20 }, // Categoria
      { wch: 15 }, // NCM
      { wch: 12 }, // Peso Líquido
      { wch: 12 }, // Peso Bruto
    ];
    ws['!cols'] = colWidths;
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Produtos');
    
    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    
    // Create and download blob
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up URL
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao exportar Excel:', error);
    throw new Error('Falha ao exportar arquivo Excel');
  }
}

export async function downloadPDF(products: CSVProductRow[], filename: string = 'produtos.pdf'): Promise<void> {
  try {
    // Dynamically import jsPDF and autotable to avoid SSR issues
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable')
    ]);

    // Create new PDF document
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Add custom font for better UTF-8 support (optional)
    // For Brazilian Portuguese characters, you might need to add a font that supports them
    
    // Prepare data for the table
    const headers = [
      'Código',
      'Descrição',
      'Ref. Fab',
      'Un',
      'Preço Venda',
      'Preço Custo',
      'Estoque',
      'Est. Mín',
      'Status',
      'Categoria',
      'NCM'
    ];

    const rows = products.map(product => [
      String(product.codprod),
      product.descrprod || '',
      product.reffab || '',
      product.codvol || '',
      formatCurrency(product.vlrvenda || 0),
      formatCurrency(product.vlrcusto || 0),
      String(product.estoque || 0),
      String(product.estmin || 0),
      product.ativo === 'S' ? 'Ativo' : 'Inativo',
      product.descrgrupoprod || '',
      product.ncm || ''
    ]);

    // Add title
    doc.setFontSize(16);
    doc.text('Relatório de Produtos', 148, 15, { align: 'center' });

    // Add generation date
    doc.setFontSize(10);
    doc.text(`Data: ${formatDate(new Date())}`, 148, 22, { align: 'center' });

    // Add total count
    doc.text(`Total de produtos: ${products.length}`, 148, 29, { align: 'center' });

    // Add table using autoTable
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 35,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        font: 'helvetica'
      },
      headStyles: {
        fillColor: [59, 130, 246], // blue-500
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251] // gray-50
      },
      columnStyles: {
        0: { cellWidth: 15 }, // Código
        1: { cellWidth: 45 }, // Descrição
        2: { cellWidth: 20 }, // Ref. Fab
        3: { cellWidth: 10 }, // Un
        4: { cellWidth: 25 }, // Preço Venda
        5: { cellWidth: 25 }, // Preço Custo
        6: { cellWidth: 15 }, // Estoque
        7: { cellWidth: 15 }, // Est. Mín
        8: { cellWidth: 15 }, // Status
        9: { cellWidth: 30 }, // Categoria
        10: { cellWidth: 20 } // NCM
      },
      margin: { top: 35, right: 10, bottom: 20, left: 10 }
    });

    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Página ${i} de ${pageCount}`,
        148,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
      doc.text(
        'Gerado por Sankhya Products Dashboard',
        148,
        doc.internal.pageSize.height - 5,
        { align: 'center' }
      );
    }

    // Save the PDF
    doc.save(filename);
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    throw new Error('Falha ao exportar arquivo PDF');
  }
}