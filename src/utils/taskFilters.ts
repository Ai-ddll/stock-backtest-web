import type { BacktestTaskListItem } from '../types'
import { formatTaskStrategyParams } from './strategyParams'

export interface TaskFilters {
  taskNo: string
  batchNo: string
  symbol: string
  stockName: string
  params: string
  profit: '' | 'profit' | 'loss' | 'none'
}

export const emptyTaskFilters: TaskFilters = {
  taskNo: '',
  batchNo: '',
  symbol: '',
  stockName: '',
  params: '',
  profit: '',
}

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

function textMatch(fieldValue: string, pattern: string): boolean {
  const p = normalize(pattern)
  if (!p) return true
  return normalize(fieldValue).includes(p)
}

function profitText(row: BacktestTaskListItem): string {
  if (row.status !== 'SUCCESS' || row.totalReturn == null || row.finalEquity == null) {
    return 'none'
  }
  const profit = row.finalEquity - row.initialCapital
  return profit >= 0 ? 'profit' : 'loss'
}

export function filterTasks(
  tasks: BacktestTaskListItem[],
  filters: TaskFilters,
): BacktestTaskListItem[] {
  return tasks.filter((row) => {
    const paramsText = formatTaskStrategyParams(row)
    if (!textMatch(row.taskNo, filters.taskNo)) return false
    if (!textMatch(row.batchNo ?? '', filters.batchNo)) return false
    if (!textMatch(row.symbol, filters.symbol)) return false
    if (!textMatch(row.stockName ?? '', filters.stockName)) return false
    if (!textMatch(paramsText, filters.params)) return false

    if (filters.profit) {
      if (profitText(row) !== filters.profit) return false
    }

    return true
  })
}

export function hasActiveFilters(filters: TaskFilters): boolean {
  return (
    !!filters.taskNo ||
    !!filters.batchNo ||
    !!filters.symbol ||
    !!filters.stockName ||
    !!filters.params ||
    !!filters.profit
  )
}
