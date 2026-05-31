import { Card, Table, Tag, Typography } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchTasks } from '../api/backtest'
import { formatDate, formatMoney, statusColor, statusLabel } from '../utils/format'

export default function TasksPage() {
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', 50],
    queryFn: () => fetchTasks(50),
  })

  return (
    <div>
      <Typography.Title level={3}>回测记录</Typography.Title>
      <Card>
        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={tasks}
          pagination={{ pageSize: 15, showSizeChanger: true }}
          columns={[
            {
              title: '任务号',
              dataIndex: 'taskNo',
              render: (v, row) => <Link to={`/tasks/${row.id}`}>{v}</Link>,
            },
            { title: '股票', dataIndex: 'symbol', width: 90 },
            {
              title: '区间',
              render: (_, row) => `${formatDate(row.startDate)} ~ ${formatDate(row.endDate)}`,
            },
            {
              title: '初始资金',
              dataIndex: 'initialCapital',
              render: (v) => formatMoney(v, 0),
            },
            {
              title: '状态',
              dataIndex: 'status',
              width: 90,
              render: (s: string) => <Tag color={statusColor[s]}>{statusLabel[s] ?? s}</Tag>,
            },
            {
              title: '错误信息',
              dataIndex: 'errorMessage',
              ellipsis: true,
              render: (v) => v ?? '-',
            },
            { title: '完成时间', dataIndex: 'finishedAt', render: (v) => v?.slice(0, 19) ?? '-' },
          ]}
        />
      </Card>
    </div>
  )
}
