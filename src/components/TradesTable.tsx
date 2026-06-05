import { useState } from 'react'
import { Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { BacktestTrade } from '../types'
import { formatDate, formatDateTime, formatMoney } from '../utils/format'

interface TradesTableProps {
  trades: BacktestTrade[]
  loading?: boolean
  extended?: boolean
}

export default function TradesTable({ trades, loading, extended }: TradesTableProps) {
  const [pageSize, setPageSize] = useState(20)
  const isGrid = extended ?? trades.some((t) => t.tradeTime != null)

  const columns: ColumnsType<BacktestTrade> = [
    {
      title: '时间',
      dataIndex: isGrid ? 'tradeTime' : 'tradeDate',
      render: (v: string) => (isGrid ? formatDateTime(v) : formatDate(v)),
      width: isGrid ? 150 : 110,
    },
    {
      title: '方向',
      dataIndex: 'side',
      width: 80,
      render: (side: string) => (
        <Tag color={side === 'BUY' ? 'red' : 'green'}>{side === 'BUY' ? '买入' : '卖出'}</Tag>
      ),
    },
    { title: '成交价格', dataIndex: 'price', render: (v) => formatMoney(v, 3) },
    ...(isGrid
      ? [
          {
            title: '基准价格',
            dataIndex: 'benchmarkPrice',
            render: (v?: number) => (v != null ? formatMoney(v, 3) : '-'),
          },
          {
            title: '涨跌%',
            dataIndex: 'changePct',
            render: (v?: number) => (v != null ? `${v.toFixed(6)}%` : '-'),
          },
        ]
      : []),
    { title: '股数', dataIndex: 'quantity' },
    ...(isGrid
      ? [
          { title: '持仓', dataIndex: 'positionAfter' },
          {
            title: '现金',
            dataIndex: 'cashAfter',
            render: (v?: number) => formatMoney(v, 2),
          },
        ]
      : []),
    { title: '手续费', dataIndex: 'commission', render: (v) => formatMoney(v, 4) },
    {
      title: '盈亏',
      dataIndex: 'pnl',
      render: (v?: number) =>
        v != null ? (
          <span style={{ color: v >= 0 ? '#3f8600' : '#cf1322' }}>{formatMoney(v, 2)}</span>
        ) : (
          '-'
        ),
    },
    { title: '总资产', dataIndex: 'equityAfter', render: (v) => formatMoney(v, 2) },
    { title: '类型', dataIndex: 'signalReason', ellipsis: true },
  ]

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={trades}
      loading={loading}
      pagination={{
        pageSize,
        showSizeChanger: true,
        pageSizeOptions: ['20', '50', '100', '200', '500', '1000'],
        onShowSizeChange: (_current, size) => setPageSize(size),
      }}
      scroll={{ x: isGrid ? 1200 : 900 }}
      size="small"
    />
  )
}
