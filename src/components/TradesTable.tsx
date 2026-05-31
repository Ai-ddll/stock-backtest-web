import { Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { BacktestTrade } from '../types'
import { formatDate, formatMoney } from '../utils/format'

interface TradesTableProps {
  trades: BacktestTrade[]
  loading?: boolean
}

export default function TradesTable({ trades, loading }: TradesTableProps) {
  const columns: ColumnsType<BacktestTrade> = [
    { title: '日期', dataIndex: 'tradeDate', render: formatDate, width: 110 },
    {
      title: '方向',
      dataIndex: 'side',
      width: 80,
      render: (side: string) => (
        <Tag color={side === 'BUY' ? 'red' : 'green'}>{side === 'BUY' ? '买入' : '卖出'}</Tag>
      ),
    },
    { title: '价格', dataIndex: 'price', render: (v) => formatMoney(v, 3) },
    { title: '数量', dataIndex: 'quantity' },
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
    { title: '权益', dataIndex: 'equityAfter', render: (v) => formatMoney(v, 2) },
    { title: '信号', dataIndex: 'signalReason', ellipsis: true },
  ]

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={trades}
      loading={loading}
      pagination={{ pageSize: 10, showSizeChanger: true }}
      scroll={{ x: 900 }}
      size="small"
    />
  )
}
