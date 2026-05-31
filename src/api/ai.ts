import { postData } from './client'
import type { StrategyAnalyzeRequest } from '../types'

export function analyzeStrategy(request: StrategyAnalyzeRequest) {
  return postData<{ analysis: string }, StrategyAnalyzeRequest>('/api/ai/analyze', request)
}
