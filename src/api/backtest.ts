import { getData, postData } from './client'
import type {
  BacktestResult,
  BacktestRunRequest,
  BacktestTask,
  BacktestTrade,
  TaskDetail,
} from '../types'

export function runBacktest(request: BacktestRunRequest) {
  return postData<BacktestTask, BacktestRunRequest>('/api/backtest/run', request)
}

export function fetchTasks(limit = 20) {
  return getData<BacktestTask[]>('/api/backtest/tasks', { limit })
}

export function fetchTaskDetail(taskId: number) {
  return getData<TaskDetail>(`/api/backtest/tasks/${taskId}`)
}

export function fetchTaskResult(taskId: number) {
  return getData<BacktestResult>(`/api/backtest/tasks/${taskId}/result`)
}

export function fetchTaskTrades(taskId: number) {
  return getData<BacktestTrade[]>(`/api/backtest/tasks/${taskId}/trades`)
}
