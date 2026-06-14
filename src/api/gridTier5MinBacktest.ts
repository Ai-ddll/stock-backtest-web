import { postData } from './client'
import type {
  BacktestTask,
  GridTier5MinBacktestRequest,
  GridTier5MinBatchBacktestRequest,
} from '../types'

export function runGridTier5MinBacktest(request: GridTier5MinBacktestRequest) {
  return postData<BacktestTask, GridTier5MinBacktestRequest>(
    '/api/backtest/grid-tier-5min/run',
    request,
  )
}

/** 批量回测最多 50000 组，单次请求超时 72 小时 */
const BATCH_BACKTEST_TIMEOUT_MS = 259_200_000

export function runGridTier5MinBacktestBatch(request: GridTier5MinBatchBacktestRequest) {
  return postData<BacktestTask[], GridTier5MinBatchBacktestRequest>(
    '/api/backtest/grid-tier-5min/run-batch',
    request,
    { timeout: BATCH_BACKTEST_TIMEOUT_MS },
  )
}
