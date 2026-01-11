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