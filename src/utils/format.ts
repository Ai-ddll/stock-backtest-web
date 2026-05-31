export function formatPercent(value?: number | null, digits = 2): string {
  if (value == null) return '-'
  return `${(value * 100).toFixed(digits)}%`
}

export function formatMoney(value?: number | null, digits = 2): string {
  if (value == null) return '-'
  return value.toLocaleString('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

export function formatDate(value?: string | null): string {
  if (!value) return '-'
  return value.slice(0, 10)
}

export function formatDateTime(value?: string | null): string {
  if (!value) return '-'
  return value.replace('T', ' ').slice(0, 19)
}

export function parseParamsJson(paramsJson?: string): Record<string, unknown> {
  if (!paramsJson) return {}
  try {
    return JSON.parse(paramsJson) as Record<string, unknown>
  } catch {
    return {}
  }
}

export const statusColor: Record<string, string> = {
  PENDING: 'default',
  RUNNING: 'processing',
  SUCCESS: 'success',
  FAILED: 'error',
}

export const statusLabel: Record<string, string> = {
  PENDING: '待执行',
  RUNNING: '运行中',
  SUCCESS: '成功',
  FAILED: '失败',
}
