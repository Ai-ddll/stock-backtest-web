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

const SHANGHAI = 'Asia/Shanghai'

/** 将 API 时间统一格式化为北京时间（YYYY-MM-DD HH:mm:ss） */
export function formatDateTime(value?: string | null): string {
  if (!value) return '-'
  const normalized = value.trim().replace(' ', 'T')
  const hasOffset = /(\.\d+)?([Zz]|[+-]\d{2}:\d{2})$/.test(normalized)
  const iso = hasOffset ? normalized : `${normalized}+08:00`
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) {
    return value.replace('T', ' ').slice(0, 19)
  }
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: SHANGHAI,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(d)
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
