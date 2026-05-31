import ReactECharts from 'echarts-for-react'
import type { Bar5Min } from '../types'
import { formatDateTime } from '../utils/format'

interface Bar5MinKLineChartProps {
  bars: Bar5Min[]
  height?: number
}

export default function Bar5MinKLineChart({ bars, height = 480 }: Bar5MinKLineChartProps) {
  const times = bars.map((b) => formatDateTime(b.tradeTime))
  const ohlc = bars.map((b) => [b.openPrice, b.closePrice, b.lowPrice, b.highPrice])
  const volumes = bars.map((b) => b.volume)

  const option = {
    animation: false,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
    },
    axisPointer: { link: [{ xAxisIndex: 'all' }] },
    grid: [
      { left: 70, right: 20, top: 20, height: '58%' },
      { left: 70, right: 20, top: '72%', height: '18%' },
    ],
    xAxis: [
      {
        type: 'category',
        data: times,
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        axisLabel: { showMaxLabel: true, hideOverlap: true },
        min: 'dataMin',
        max: 'dataMax',
      },
      {
        type: 'category',
        gridIndex: 1,
        data: times,
        boundaryGap: false,
        axisLine: { onZero: false },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        min: 'dataMin',
        max: 'dataMax',
      },
    ],
    yAxis: [
      { scale: true, splitArea: { show: true } },
      {
        scale: true,
        gridIndex: 1,
        splitNumber: 2,
        axisLabel: { show: false },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { show: false },
      },
    ],
    dataZoom: [
      { type: 'inside', xAxisIndex: [0, 1], start: 60, end: 100 },
      { show: true, xAxisIndex: [0, 1], type: 'slider', bottom: 10, start: 60, end: 100 },
    ],
    series: [
      {
        name: '5分钟K线',
        type: 'candlestick',
        data: ohlc,
        itemStyle: {
          color: '#ef5350',
          color0: '#26a69a',
          borderColor: '#ef5350',
          borderColor0: '#26a69a',
        },
      },
      {
        name: '成交量',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: volumes,
        itemStyle: {
          color: (params: { dataIndex: number }) => {
            const bar = bars[params.dataIndex]
            return bar.closePrice >= bar.openPrice ? '#ef5350' : '#26a69a'
          },
        },
      },
    ],
  }

  return <ReactECharts option={option} style={{ height }} notMerge lazyUpdate />
}
