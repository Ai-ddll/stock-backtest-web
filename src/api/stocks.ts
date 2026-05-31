import { getData } from './client'
import type { DailyBar, StockSymbol } from '../types'

export function fetchStocks() {
  return getData<StockSymbol[]>('/api/stocks')
}

export function fetchStock(symbol: string) {
  return getData<StockSymbol | null>(`/api/stocks/${symbol}`)
}

export function fetchBars(symbol: string, startDate: string, endDate: string) {
  return getData<DailyBar[]>(`/api/stocks/${symbol}/bars`, { startDate, endDate })
}
