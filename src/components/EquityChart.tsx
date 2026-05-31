import ReactECharts from 'echarts-for-react'
import type { BacktestTrade } from '../types'

interface EquityChartProps {
  trades: BacktestTrade[]
  initialCapital: number
  height?: number
}

export default function EquityChart({ trades, initialCapital, height = 320 }: EquityChartProps) {
  const sorted = [...trades].sort(
    (a, b) => new Date(a.tradeDate).getTime() - new Date(b.tradeDate).getTime(),
  )

  const dates = sorted.length > 0 ? sorted.map((t) => t.tradeDate) : ['起始']
  const equity =
    sorted.length > 0
      ? sorted.map((t) => t.equityAfter)
      : [initialCapital]

  const option = {
    tooltip: { trigger: 'axis' },
    grid: { left: 70, right: 30, top: 30, bottom: 50 },
    xAxis: { type: 'category', data: dates, boundaryGap: false },
    yAxis: {
      type: 'value',
      scale: true,
      axisLabel: {
        formatter: (v: number) => v.toLocaleString('zh-CN'),
      },
    },
    dataZoom: [{ type: 'inside' }, { type: 'slider', bottom: 10 }],
    series: [
      {
        name: '权益',
        type: 'line',
        smooth: true,
        showSymbol: false,
        areaStyle: { opacity: 0.15 },
        lineStyle: { width: 2 },
        data: equity,
        markLine: {
          silent: true,
          data: [{ yAxis: initialCapital, name: '初始资金' }],
          lineStyle: { type: 'dashed', color: '#999' },
        },
      },
    ],
  }

  return <ReactECharts option={option} style={{ height }} notMerge lazyUpdate />
}
