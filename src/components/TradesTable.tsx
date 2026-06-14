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
      render: (side: string) => {
        if (side === 'BUY') {
          return <Tag color="red">买入</Tag>
        }
        if (side === 'DIVIDEND') {
          return <Tag color="blue">分红</Tag>
        }
        return <Tag color="green">卖出</Tag>
      },
    },
    { title: '成交价格', dataIndex: 'price', render: (v) => formatMoney(v, 3) },
    ...(isGrid
      ? [
          {
            title: '买入基准',
            dataIndex: 'buyBenchmarkPrice',
            render: (v?: number) => (v != null ? formatMoney(v, 3) : '-'),
          },
          {
            title: '卖出基准',
            dataIndex: 'sellBenchmarkPrice',
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
          { title: '永久持仓', dataIndex: 'permanentPosition', render: (v?: number) => v ?? 0 },
          {
            title: '持仓成本',
            dataIndex: 'positionCost',
            render: (v?: number) => (v != null ? formatMoney(v, 3) : '-'),
          },
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
      className="trades-table"
      rowKey="id"
      columns={columns}
      dataSource={trades}
      loading={loading}
      sticky={{ offsetHeader: 64 }}
      pagination={{
        pageSize,
        total: trades.length,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条`,
        pageSizeOptions: ['20', '50', '100', '200', '500', '1000'],
        onShowSizeChange: (_current, size) => setPageSize(size),
      }}
      scroll={{ x: isGrid ? 1400 : 900 }}
      size="small"
    />
  )
}
