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