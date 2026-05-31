import { useMemo, useState } from 'react'
import { Card, Col, DatePicker, Empty, Row, Select, Spin, Table, Typography } from 'antd'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { fetchBars, fetchStocks } from '../api/stocks'
import KLineChart from '../components/KLineChart'
import { formatDate } from '../utils/format'

const { RangePicker } = DatePicker

export default function StocksPage() {
  const [symbol, setSymbol] = useState<string>()
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(1, 'year'),
    dayjs(),
  ])

  const { data: stocks = [], isLoading: stocksLoading } = useQuery({
    queryKey: ['stocks'],
    queryFn: fetchStocks,
  })

  const startDate = dateRange[0].format('YYYY-MM-DD')
  const endDate = dateRange[1].format('YYYY-MM-DD')

  const { data: bars = [], isLoading: barsLoading } = useQuery({
    queryKey: ['bars', symbol, startDate, endDate],
    queryFn: () => fetchBars(symbol!, startDate, endDate),
    enabled: !!symbol,
  })

  const selectedStock = useMemo(
    () => stocks.find((s) => s.symbol === symbol),
    [stocks, symbol],
  )

  return (
    <div>
      <Typography.Title level={3}>股票行情</Typography.Title>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <span style={{ marginRight: 8 }}>股票</span>
            <Select
              style={{ width: 260 }}
              placeholder="选择股票"
              loading={stocksLoading}
              value={symbol}
              onChange={setSymbol}
              options={stocks.map((s) => ({
                value: s.symbol,
                label: `${s.symbol} ${s.name}`,
              }))}
              showSearch
              optionFilterProp="label"
            />
          </Col>
          <Col>
            <span style={{ marginRight: 8 }}>日期范围</span>
            <RangePicker
              value={dateRange}
              onChange={(v) => v && setDateRange(v as [dayjs.Dayjs, dayjs.Dayjs])}
            />
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card title={selectedStock ? `${selectedStock.name} (${selectedStock.symbol}) K线` : 'K线图'}>
            {!symbol ? (
              <Empty description="请选择股票" />
            ) : barsLoading ? (
              <Spin style={{ display: 'block', margin: '80px auto' }} />
            ) : bars.length === 0 ? (
              <Empty description="该区间暂无 K 线数据" />
            ) : (
              <KLineChart bars={bars} />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="股票列表">
            <Table
              rowKey="symbol"
              size="small"
              loading={stocksLoading}
              dataSource={stocks}
              pagination={{ pageSize: 8 }}
              onRow={(record) => ({
                onClick: () => setSymbol(record.symbol),
                style: { cursor: 'pointer' },
              })}
              rowClassName={(record) => (record.symbol === symbol ? 'ant-table-row-selected' : '')}
              columns={[
                { title: '代码', dataIndex: 'symbol', width: 80 },
                { title: '名称', dataIndex: 'name', ellipsis: true },
                { title: '行业', dataIndex: 'industry', ellipsis: true },
                { title: '上市', dataIndex: 'listDate', render: formatDate, width: 100 },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
