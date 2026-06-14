import { getData, uploadFile, uploadFiles } from './client'
import type {
  StockDividend,
  StockDividendFolderImportResult,
  StockDividendImportResult,
} from '../types'

export function fetchStockDividend(params: { code?: string; limit?: number }) {
  return getData<StockDividend[]>('/api/stock-dividend', params)
}

export function importStockDividendCsv(file: File) {
  return uploadFile<StockDividendImportResult>('/api/stock-dividend/import', file)
}

export function importStockDividendFolder(files: File[]) {
  return uploadFiles<StockDividendFolderImportResult>('/api/stock-dividend/import/folder', files)
}
