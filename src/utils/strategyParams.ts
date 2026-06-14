import type { BacktestTaskListItem } from '../types'
import { formatMoney, parseParamsJson } from './format'

const GRID_PARAM_ORDER = [
  'initialPosition',
  'basePosition',
  'minPosition',
  'dropThresholdPct',
  'riseThresholdPct',
  'dropTierQty',
  'riseTierQty',
  'maxTier',
  'buyOverrideCostGapPct',
  'sellLotMode',
] as const

const PARAM_LABELS: Record<string, string> = {
  initialPosition: '初始持仓',
  basePosition: '底仓',
  minPosition: '最低持仓',
  dropThresholdPct: '下跌触发档位',
  riseThresholdPct: '上涨触发档位',
  dropTierQty: '跌档数量/档',
  riseTierQty: '涨档数量/档',
  maxTier: '最大档数',
  buyOverrideCostGapPct: '买入放宽阈值',
  sellLotMode: '卖出批次规则',
}

function formatParamValue(key: string, value: unknown): string {
  if (value == null) return '-'
  if (key === 'sellLotMode') {
    if (value === 'MIN_PROFITABLE') return '浮盈优先'
    if (value === 'MIN_PRICE') return '低价优先'
    return String(value)
  }
  if (key.endsWith('Pct')) return `${value}%`
  if (key.includes('Position') || key.includes('Qty')) return `${value} 股`
  return String(value)
}

export interface StrategyParamEntry {
  label: string
  value: string
}

export function getStrategyParamEntries(
  params: Record<string, unknown>,
  initialCapital?: number,
): StrategyParamEntry[] {
  const entries: StrategyParamEntry[] = []

  if (initialCapital != null) {
    entries.push({ label: '初始资金', value: `${formatMoney(initialCapital, 0)} 元` })
  }

  const knownKeys = new Set<string>(GRID_PARAM_ORDER)
  for (const key of GRID_PARAM_ORDER) {
    if (params[key] != null) {
      entries.push({
        label: PARAM_LABELS[key] ?? key,
        value: formatParamValue(key, params[key]),
      })
    }
  }

  for (const [key, value] of Object.entries(params)) {
    if (!knownKeys.has(key) && value != null && value !== '') {
      entries.push({ label: key, value: String(value) })
    }
  }

  return entries
}

export function formatTaskStrategyParams(row: BacktestTaskListItem): string {
  const params = parseParamsJson(row.paramsJson)
  if (Object.keys(params).length === 0 && row.barCode == null) {
    return '-'
  }

  const entries = getStrategyParamEntries(params, row.initialCapital)
  return entries.length > 0 ? entries.map((e) => `${e.label}${e.value}`).join(' · ') : '-'
}
