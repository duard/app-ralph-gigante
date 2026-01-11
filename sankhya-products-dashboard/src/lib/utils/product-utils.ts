import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatProductCode(code: string): string {
  return code.toUpperCase().padStart(6, '0');
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

export function formatProductStatus(status: string): string {
  return status === 'active' ? 'Ativo' : 'Inativo';
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