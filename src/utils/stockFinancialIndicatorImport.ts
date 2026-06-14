import { importStockFinancialIndicatorFolder } from '../api/stockFinancialIndicator'
import type { StockFinancialIndicatorFolderImportResult } from '../types'

const MAX_FILE_RESULTS = 100
const MAX_ERRORS = 50
const MAX_BATCH_BYTES = 20 * 1024 * 1024
const DEFAULT_BATCH_SIZE = 16

export type FolderImportProgress = {
  current: number
  total: number
  fileName: string
}

function createEmptyFolderResult(totalFiles: number, ignoredFiles: number): StockFinancialIndicatorFolderImportResult {
  return {
    totalFiles,
    successFiles: 0,
    failedFiles: 0,
    ignoredFiles,
    totalRows: 0,
    inserted: 0,
    skipped: 0,
    symbolsCreated: 0,
    fileResults: [],
    errors: [],
  }
}

function mergeFolderResult(
  target: StockFinancialIndicatorFolderImportResult,
  source: StockFinancialIndicatorFolderImportResult,
) {
  target.successFiles += source.successFiles
  target.failedFiles += source.failedFiles
  target.totalRows += source.totalRows
  target.inserted += source.inserted
  target.skipped += source.skipped
  target.symbolsCreated += source.symbolsCreated
  for (const fileResult of source.fileResults) {
    if (target.fileResults.length < MAX_FILE_RESULTS) {
      target.fileResults.push(fileResult)
    }
  }
  for (const err of source.errors) {
    if (target.errors.length < MAX_ERRORS) {
      target.errors.push(err)
    }
  }
}

export function filterCsvFiles(files: FileList | File[]): File[] {
  return Array.from(files)
    .filter((f) => f.name.toLowerCase().endsWith('.csv'))
    .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'))
}

function partitionBatches(files: File[]): File[][] {
  const batches: File[][] = []
  let current: File[] = []
  let currentBytes = 0

  for (const file of files) {
    const wouldExceedSize = currentBytes + file.size > MAX_BATCH_BYTES
    const wouldExceedCount = current.length >= DEFAULT_BATCH_SIZE
    if (current.length > 0 && (wouldExceedSize || wouldExceedCount)) {
      batches.push(current)
      current = []
      currentBytes = 0
    }
    current.push(file)
    currentBytes += file.size
  }
  if (current.length > 0) {
    batches.push(current)
  }
  return batches
}

export async function importStockFinancialIndicatorFolderConcurrent(
  files: File[],
  onProgress?: (progress: FolderImportProgress) => void,
  signal?: AbortSignal,
): Promise<StockFinancialIndicatorFolderImportResult> {
  const csvFiles = filterCsvFiles(files)
  const result = createEmptyFolderResult(files.length, files.length - csvFiles.length)

  if (csvFiles.length === 0) {
    throw new Error('文件夹中未找到 .csv 文件')
  }

  const batches = partitionBatches(csvFiles)
  let completedFiles = 0

  try {
    for (const batch of batches) {
      if (signal?.aborted) {
        result.errors.push('导入已取消')
        break
      }

      onProgress?.({
        current: completedFiles,
        total: csvFiles.length,
        fileName: batch[0]?.name ?? '',
      })

      const batchResult = await importStockFinancialIndicatorFolder(batch)
      mergeFolderResult(result, batchResult)
      completedFiles += batch.length

      onProgress?.({
        current: completedFiles,
        total: csvFiles.length,
        fileName: batch[batch.length - 1]?.name ?? '',
      })

      await new Promise((resolve) => setTimeout(resolve, 0))
    }
  } catch (err) {
    if (signal?.aborted) {
      result.errors.push('导入已取消')
    }
    throw err
  }

  return result
}
