export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface StockSymbol {
  id: number
  symbol: string
  name: string
  market: string
  industry?: string
  listDate?: string
  status: string
  createdAt?: string
  updatedAt?: string
}

export interface DailyBar {
  id: number
  symbol: string
  tradeDate: string
  openPrice: number
  highPrice: number
  lowPrice: number
  closePrice: number
  volume: number
  amount?: number
  adjFactor?: number
  createdAt?: string
}

export interface StrategyDefinition {
  id: number
  code: string
  name: string
  description?: string
  strategyType: string
  paramsJson?: string
  scriptContent?: string
  version?: number
  enabled: boolean
  createdAt?: string
  updatedAt?: string
}

export interface BacktestRunRequest {
  strategyCode: string
  symbol: string
  startDate: string
  endDate: string
  initialCapital?: number
  commissionRate?: number
  slippageRate?: number
}

export interface GridTier5MinParams {
  initialPosition: number
  minPosition: number
  dropThresholdPct: number
  riseThresholdPct: number
  dropTierQty: number
  riseTierQty: number
  maxTier: number
}

export interface GridTier5MinBacktestRequest {
  barCode: string
  symbol?: string
  startDate: string
  endDate: string
  initialCapital?: number
  commissionRate?: number
  params: GridTier5MinParams
}

export interface GridTier5MinMetrics {
  buyCount?: number
  sellCount?: number
  buyHoldReturn?: number
  excessReturn?: number
  strategyType?: string
}

export interface BacktestTask {
  id: number
  taskNo: string
  strategyId: number
  symbol: string
  startDate: string
  endDate: string
  initialCapital: number
  commissionRate: number
  slippageRate: number
  barCode?: string
  paramsJson?: string
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED'
  errorMessage?: string
  startedAt?: string
  finishedAt?: string
  createdAt?: string
}

export interface BacktestResult {
  id: number
  taskId: number
  totalReturn?: number
  annualizedReturn?: number
  maxDrawdown?: number
  sharpeRatio?: number
  winRate?: number
  tradeCount?: number
  finalEquity?: number
  metricsJson?: string
  createdAt?: string
}

export interface BacktestTrade {
  id: number
  taskId: number
  tradeDate: string
  tradeTime?: string
  side: 'BUY' | 'SELL'
  price: number
  benchmarkPrice?: number
  changePct?: number
  quantity: number
  commission: number
  slippage: number
  pnl?: number
  cashAfter?: number
  positionAfter?: number
  equityAfter: number
  signalReason?: string
  createdAt?: string
}

export interface TaskDetail {
  task: BacktestTask
  result: BacktestResult | null
  trades: BacktestTrade[]
}

export interface StrategyAnalyzeRequest {
  taskId: number
  question?: string
}

export interface Bar5Min {
  id: string
  tradeTime: string
  code: string
  name: string
  openPrice: number
  closePrice: number
  highPrice: number
  lowPrice: number
  volume: number
  amount: number
  changePct?: number
  amplitude?: number
  remark?: string
  createdAt?: string
  updatedAt?: string
}

export interface Bar5MinImportResult {
  fileName: string
  totalRows: number
  inserted: number
  skipped: number
  symbolsCreated: number
  errors: string[]
}

export interface Bar5MinFolderImportResult {
  totalFiles: number
  successFiles: number
  failedFiles: number
  ignoredFiles: number
  totalRows: number
  inserted: number
  skipped: number
  symbolsCreated: number
  fileResults: Bar5MinImportResult[]
  errors: string[]
}
