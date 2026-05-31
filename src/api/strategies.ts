import { getData } from './client'
import type { StrategyDefinition } from '../types'

export function fetchStrategies() {
  return getData<StrategyDefinition[]>('/api/strategies')
}
