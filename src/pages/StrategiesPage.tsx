import { Card, Descriptions, Table, Tag, Typography } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { fetchStrategies } from '../api/strategies'
import { parseParamsJson } from '../utils/format'

export default function StrategiesPage() {
  const { data: strategies = [], isLoading } = useQuery({
    queryKey: ['strategies'],
    queryFn: fetchStrategies,
  })

  return (
    <div>
      <Typography.Title level={3}>策略管理</Typography.Title>
      <Card>
        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={strategies}
          pagination={false}
          expandable={{
            expandedRowRender: (record) => (
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="策略类型">{record.strategyType}</Descriptions.Item>
                <Descriptions.Item label="描述">{record.description ?? '-'}</Descriptions.Item>
                <Descriptions.Item label="参数">
                  <pre style={{ margin: 0 }}>
                    {JSON.stringify(parseParamsJson(record.paramsJson), null, 2)}
                  </pre>
                </Descriptions.Item>
              </Descriptions>
            ),
          }}
          columns={[
            { title: '编码', dataIndex: 'code', width: 120 },
            { title: '名称', dataIndex: 'name' },
            { title: '类型', dataIndex: 'strategyType', width: 120 },
            {
              title: '状态',
              dataIndex: 'enabled',
              width: 80,
              render: (v: boolean) => (
                <Tag color={v ? 'success' : 'default'}>{v ? '启用' : '禁用'}</Tag>
              ),
            },
            { title: '版本', dataIndex: 'version', width: 70 },
          ]}
        />
      </Card>
    </div>
  )
}
