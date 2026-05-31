import { Card, Col, Row, Statistic, Table, Tag, Typography } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchStocks } from '../api/stocks'
import { fetchStrategies } from '../api/strategies'
import { fetchTasks } from '../api/backtest'
import { formatDate, statusColor, statusLabel } from '../utils/format'

export default function DashboardPage() {
  const { data: stocks = [] } = useQuery({ queryKey: ['stocks'], queryFn: fetchStocks })
  const { data: strategies = [] } = useQuery({ queryKey: ['strategies'], queryFn: fetchStrategies })
  const { data: tasks = [], isLoading } = useQuery({ queryKey: ['tasks', 5], queryFn: () => fetchTasks(5) })

  const successCount = tasks.filter((t) => t.status === 'SUCCESS').length

  return (
    <div>
      <Typography.Title level={3}>系统概览</Typography.Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="股票数量" value={stocks.length} suffix="只" />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="可用策略" value={strategies.length} suffix="个" />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="近期成功回测" value={successCount} suffix={`/ ${tasks.length}`} />
          </Card>
        </Col>
      </Row>

      <Card
        title="最近回测任务"
        extra={<Link to="/tasks">查看全部</Link>}
      >
        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={tasks}
          pagination={false}
          columns={[
            {
              title: '任务号',
              dataIndex: 'taskNo',
              render: (v, row) => <Link to={`/tasks/${row.id}`}>{v}</Link>,
            },
            { title: '股票', dataIndex: 'symbol' },
            {
              title: '区间',
              render: (_, row) => `${formatDate(row.startDate)} ~ ${formatDate(row.endDate)}`,
            },
            {
              title: '状态',
              dataIndex: 'status',
              render: (s: string) => <Tag color={statusColor[s]}>{statusLabel[s] ?? s}</Tag>,
            },
            { title: '创建时间', dataIndex: 'createdAt', render: (v) => v?.slice(0, 19) ?? '-' },
          ]}
        />
      </Card>
    </div>
  )
}
