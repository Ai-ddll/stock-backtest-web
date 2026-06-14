import { getData, postData } from './client'
import type {
  BacktestResult,
  BacktestRunRequest,
  BacktestTask,
  BacktestTaskListItem,
  BacktestTrade,
  PageResult,
  TaskDetail,
  TaskListQuery,
} from '../types'

export function runBacktest(request: BacktestRunRequest) {
  return postData<BacktestTask, BacktestRunRequest>('/api/backtest/run', request)
}

export function searchTasks(query: TaskListQuery) {
  const params: Record<string, unknown> = { ...query }
  if (!params.profit) delete params.profit
  return getData<PageResult<BacktestTaskListItem>>('/api/backtest/tasks', params)
}

export function fetchTasks(limit = 20) {
  return searchTasks({
    page: 1,
    pageSize: limit,
    sortField: 'finishedAt',
    sortOrder: 'descend',
  }).then((result) => result.items)
}

export function fetchTaskDetail(taskId: number) {
  return getData<TaskDetail>(`/api/backtest/tasks/${taskId}`)
}

export function rerunBacktestTask(taskId: number) {
  return postData<BacktestTask, Record<string, never>>(`/api/backtest/tasks/${taskId}/rerun`, {})
}

export function fetchTaskResult(taskId: number) {
  return getData<BacktestResult>(`/api/backtest/tasks/${taskId}/result`)
}

export function fetchTaskTrades(taskId: number) {
  return getData<BacktestTrade[]>(`/api/backtest/tasks/${taskId}/trades`)
}
