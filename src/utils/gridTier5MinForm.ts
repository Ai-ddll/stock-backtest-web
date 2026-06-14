import dayjs from 'dayjs'
import type { BacktestTask } from '../types'
import { parseParamsJson } from './format'

const GRID_PARAM_NUMERIC_KEYS = [
  'initialPosition',
  'basePosition',
  'minPosition',
  'dropThresholdPct',
  'riseThresholdPct',
  'dropTierQty',
  'riseTierQty',
  'maxTier',
  'buyOverrideCostGapPct',
] as const

const GRID_PARAM_STRING_KEYS = ['sellLotMode'] as const

function toNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && !Number.isNaN(value)) return value
  if (typeof value === 'string' && value !== '' && !Number.isNaN(Number(value))) return Number(value)
  return undefined
}

export function taskToGridTier5MinFormValues(task: BacktestTask) {
  const params = parseParamsJson(task.paramsJson)
  const values: Record<string, unknown> = {
    symbol: task.symbol,
    dateRange: [dayjs(task.startDate), dayjs(task.endDate)],
    initialCapital: task.initialCapital,
    commissionRate: task.commissionRate,
  }

  for (const key of GRID_PARAM_NUMERIC_KEYS) {
    const v = toNumber(params[key])
    if (v != null) values[key] = v
  }

  for (const key of GRID_PARAM_STRING_KEYS) {
    const v = params[key]
    if (typeof v === 'string' && v !== '') values[key] = v
  }

  return values
}
