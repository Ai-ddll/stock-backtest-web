import { postData } from './client'
import type { BacktestTask, GridTier5MinBacktestRequest } from '../types'

export function runGridTier5MinBacktest(request: GridTier5MinBacktestRequest) {
  return postData<BacktestTask, GridTier5MinBacktestRequest>(
    '/api/backtest/grid-tier-5min/run',
    request,
  )
}
