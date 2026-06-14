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

export type SellLotMode = 'MIN_PRICE' | 'MIN_PROFITABLE'

export interface GridTier5MinParams {
  initialPosition: number
  basePosition: number
  minPosition: number
  dropThresholdPct: number
  riseThresholdPct: number
  dropTierQty: number
  riseTierQty: number
  maxTier: number
  buyOverrideCostGapPct: number
  sellLotMode?: SellLotMode
}

export interface ParamSweepConfig {
  value: number
  sweep?: boolean
  min?: number
  max?: number
  step?: number
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

export interface GridTier5MinBatchBacktestRequest {
  barCode: string
  symbol?: string
  startDate: string
  endDate: string
  commissionRate?: number
  basePosition: number
  minPosition: number
  maxTier: number
  buyOverrideCostGapPct: number
  initialCapital: ParamSweepConfig
  initialPosition: ParamSweepConfig
  dropThresholdPct: ParamSweepConfig
  riseThresholdPct: ParamSweepConfig
  dropTierQty: ParamSweepConfig
  riseTierQty: ParamSweepConfig
  sellLotMode?: SellLotMode
}

export interface GridTier5MinMetrics {
  buyCount?: number
  sellCount?: number
  buyHoldReturn?: number
  buyHoldDividendReturn?: number
  dividendReturn?: number
  excessReturn?: number
  strategyType?: string
}

export interface BacktestTask {
  id: number
  taskNo: string
  batchNo?: string
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

export interface BacktestTaskListItem extends BacktestTask {
  stockName?: string
  totalReturn?: number
  finalEquity?: number
}

export interface TaskListQuery {
  page?: number
  pageSize?: number
  taskNo?: string
  batchNo?: string
  symbol?: string
  stockName?: string
  params?: string
  profit?: '' | 'profit' | 'loss' | 'none'
  sortField?: string
  sortOrder?: 'ascend' | 'descend'
}

export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
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
  side: 'BUY' | 'SELL' | 'DIVIDEND'
  price: number
  buyBenchmarkPrice?: number
  sellBenchmarkPrice?: number
  changePct?: number
  quantity: number
  commission: number
  slippage: number
  pnl?: number
  cashAfter?: number
  positionAfter?: number
  permanentPosition?: number
  positionCost?: number
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

export interface StockDividend {
  id: string
  code: string
  dividendYear: string
  planAnnounceDate?: string
  implementStatus: string
  transferPerShare: number
  bonusShareRatio?: number
  capitalIncreaseRatio?: number
  dividendAfterTax: number
  dividendBeforeTax: number
  recordDate?: string
  exDividendDate?: string
  paymentDate?: string
  bonusListingDate?: string
  implementAnnounceDate?: string
  remark?: string
  createdAt?: string
  updatedAt?: string
}

export interface StockDividendImportResult {
  fileName: string
  totalRows: number
  inserted: number
  skipped: number
  symbolsCreated: number
  errors: string[]
}

export interface StockDividendFolderImportResult {
  totalFiles: number
  successFiles: number
  failedFiles: number
  ignoredFiles: number
  totalRows: number
  inserted: number
  skipped: number
  symbolsCreated: number
  fileResults: StockDividendImportResult[]
  errors: string[]
}

export interface StockFinancialIndicatorMetrics {
  basicEps?: number
  dilutedEps?: number
  revenuePerShare?: number
  operatingRevenuePerShare?: number
  capitalReservePerShare?: number
  surplusReservePerShare?: number
  undistributedProfitPerShare?: number
  nonRecurringGainLoss?: number
  deductNonNetProfit?: number
  grossProfit?: number
  currentRatio?: number
  quickRatio?: number
  conservativeQuickRatio?: number
  inventoryTurnoverDays?: number
  receivableTurnoverDays?: number
  inventoryTurnoverRate?: number
  receivableTurnoverRate?: number
  currentAssetTurnoverRate?: number
  fixedAssetTurnoverRate?: number
  totalAssetTurnoverRate?: number
  operatingNetIncome?: number
  valueChangeNetIncome?: number
  interestExpense?: number
  depreciationAmortization?: number
  ebit?: number
  ebitda?: number
  fcff?: number
  fcfe?: number
  interestFreeCurrentLiabilities?: number
  interestFreeNonCurrentLiabilities?: number
  interestBearingDebt?: number
  netDebt?: number
  tangibleAssets?: number
  workingCapital?: number
  operatingWorkingCapital?: number
  totalInvestedCapital?: number
  retainedEarnings?: number
  dilutedEpsEnd?: number
  netAssetPerShare?: number
  operatingCashflowPerShare?: number
  retainedEarningsPerShare?: number
  netCashflowPerShare?: number
  ebitPerShare?: number
  fcffPerShare?: number
  fcfePerShare?: number
  netProfitMargin?: number
  grossProfitMargin?: number
  costOfSalesRatio?: number
  periodExpenseRatio?: number
  netProfitToRevenue?: number
  salesExpenseToRevenue?: number
  adminExpenseToRevenue?: number
  financeExpenseToRevenue?: number
  assetImpairmentToRevenue?: number
  totalCostToRevenue?: number
  operatingProfitToRevenue?: number
  ebitToRevenue?: number
  roe?: number
  weightedRoe?: number
  deductRoe?: number
  roa?: number
  roaNetProfit?: number
  roic?: number
  annualizedRoe?: number
  annualizedRoa?: number
  averageRoe?: number
  debtToAssetRatio?: number
  equityMultiplier?: number
  currentAssetToTotalAsset?: number
  nonCurrentAssetToTotalAsset?: number
  interestBearingDebtToCapital?: number
  equityRatio?: number
  operatingCycle?: number
  fixedAssetsTotal?: number
  totalProfitToRevenue?: number
  qtrNetProfitMargin?: number
  qtrGrossProfitMargin?: number
  qtrRoe?: number
  qtrDeductRoe?: number
  qtrRoaNetProfit?: number
  qtrOperatingCashflowToRevenue?: number
  basicEpsYoy?: number
  dilutedEpsYoy?: number
  cashflowPerShareYoy?: number
  operatingProfitYoy?: number
  netProfitYoy?: number
  roeYoy?: number
  netAssetPerShareGrowth?: number
  totalAssetGrowth?: number
  netAssetGrowth?: number
  totalRevenueYoy?: number
  operatingRevenueYoy?: number
  netAssetYoyGrowth?: number
  rdExpense?: number
}

export interface StockFinancialIndicator extends StockFinancialIndicatorMetrics {
  id: string
  code: string
  announceDate: string
  reportPeriod: string
  createdAt?: string
  updatedAt?: string
}

export interface StockFinancialIndicatorImportResult {
  fileName: string
  totalRows: number
  inserted: number
  skipped: number
  symbolsCreated: number
  errors: string[]
}

export interface StockFinancialIndicatorFolderImportResult {
  totalFiles: number
  successFiles: number
  failedFiles: number
  ignoredFiles: number
  totalRows: number
  inserted: number
  skipped: number
  symbolsCreated: number
  fileResults: StockFinancialIndicatorImportResult[]
  errors: string[]
}
