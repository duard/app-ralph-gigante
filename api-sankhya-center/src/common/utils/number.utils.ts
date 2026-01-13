export function formatBRL(value: number): string {
  try {
    const nf = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    return nf.format(Number(value || 0))
  } catch (e) {
    // Fallback
    return `R$ ${Number(value || 0).toFixed(2)}`
  }
}
