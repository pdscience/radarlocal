export function formatNumber(value: number): string {
  return value.toLocaleString('pt-BR');
}

export function formatCurrency(value: number): string {
  return `R$ ${value.toLocaleString('pt-BR')}`;
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits).replace('.', ',')}%`;
}

export function sanitizeFileName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '_');
}
