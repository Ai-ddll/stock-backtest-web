import { getData, uploadFile, uploadFiles } from './client'
import type { Bar5Min, Bar5MinFolderImportResult, Bar5MinImportResult } from '../types'

export function fetchBar5MinChart(code: string, startTime?: string, endTime?: string) {
  return getData<Bar5Min[]>('/api/bar5min/chart', { code, startTime, endTime })
}

export function fetchBar5Min(params: {
  code?: string
  startTime?: string
  endTime?: string
  limit?: number
}) {
  return getData<Bar5Min[]>('/api/bar5min', params)
}

export function importBar5MinCsv(file: File) {
  return uploadFile<Bar5MinImportResult>('/api/bar5min/import', file)
}

export function importBar5MinFolder(files: File[]) {
  return uploadFiles<Bar5MinFolderImportResult>('/api/bar5min/import/folder', files)
}
