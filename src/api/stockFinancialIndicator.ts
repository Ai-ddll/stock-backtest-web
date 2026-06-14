import { getData, uploadFile, uploadFiles } from './client'
import type {
  StockFinancialIndicator,
  StockFinancialIndicatorFolderImportResult,
  StockFinancialIndicatorImportResult,
} from '../types'

export function fetchStockFinancialIndicator(params: { code?: string; limit?: number }) {
  return getData<StockFinancialIndicator[]>('/api/stock-financial-indicator', params)
}

export function importStockFinancialIndicatorCsv(file: File) {
  return uploadFile<StockFinancialIndicatorImportResult>('/api/stock-financial-indicator/import', file)
}

export function importStockFinancialIndicatorFolder(files: File[]) {
  return uploadFiles<StockFinancialIndicatorFolderImportResult>(
    '/api/stock-financial-indicator/import/folder',
    files,
  )
}
