export interface ParamSweepConfig {
  value: number
  sweep?: boolean
  min?: number
  max?: number
  step?: number
}

export const MAX_COMBINATIONS = 50000

export function expandSweepValues(config: ParamSweepConfig): number[] {
  if (!config.sweep) {
    return [config.value]
  }
  const min = config.min ?? config.value
  const max = config.max ?? config.value
  const step = config.step ?? 1
  if (step <= 0) return [config.value]
  if (min > max) return []

  const values: number[] = []
  for (let cur = min; cur <= max + 1e-9; cur += step) {
    values.push(Number(cur.toFixed(6)))
    if (values.length > MAX_COMBINATIONS) break
  }
  return values
}

export function countCombinations(sweeps: ParamSweepConfig[]): number {
  return sweeps.reduce((total, config) => total * Math.max(expandSweepValues(config).length, 1), 1)
}

export function buildSweepConfig(
  value: number | undefined,
  sweep: boolean | undefined,
  min: number | undefined,
  max: number | undefined,
  step: number | undefined,
  fallback: number,
): ParamSweepConfig {
  const resolved = value ?? fallback
  return {
    value: resolved,
    sweep: !!sweep,
    min: sweep ? (min ?? resolved) : undefined,
    max: sweep ? (max ?? resolved) : undefined,
    step: sweep ? (step ?? fallback) : undefined,
  }
}
