import { useMemo, useState } from 'react'
import { Alert, Card, Col, DatePicker, Empty, Row, Select, Spin, Table, Typography } from 'antd'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { fetchBar5MinChart } from '../api/bar5min'
import { fetchStocks } from '../api/stocks'
import Bar5MinKLineChart from '../components/Bar5MinKLineChart'
import { formatDateTime, formatMoney } from '../utils/format'

const { RangePicker } = DatePicker

export default function Bar5MinMarketPage() {
  const [code, setCode] = useState<string>()
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(1, 'month').startOf('day'),
    dayjs().endOf('day'),
  ])

  const { data: stocks = [], isLoading: stocksLoading } = useQuery({
    queryKey: ['stocks'],
    queryFn: fetchStocks,
  })

  const startTime = dateRange[0].format('YYYY-MM-DDTHH:mm:ss')
  const endTime = dateRange[1].format('YYYY-MM-DDTHH:mm:ss')

  const { data: bars = [], isLoading: barsLoading } = useQuery({
    queryKey: ['bar5min-chart', code, startTime, endTime],
    queryFn: () => fetchBar5MinChart(code!, startTime, endTime),
    enabled: !!code,
  })

  const selectedStock = useMemo(
    () => stocks.find((s) => s.symbol === code),
    [stocks, code],
  )

  const title = selectedStock
    ? `${selectedStock.name} (${selectedStock.symbol}) 5分钟K线`
    : code
      ? `${code} 5分钟K线`
      : '5分钟K线图'

  return (
    <div>
      <Typography.Title level={3}>5分钟行情</Typography.Title>

      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <span style={{ marginRight: 8 }}>股票</span>
            <Select
              style={{ width: 280 }}
              placeholder="选择股票"
              loading={stocksLoading}
              value={code}
              onChange={setCode}
              options={stocks.map((s) => ({
                value: s.symbol,
                label: `${s.symbol} ${s.name}`,
              }))}
              showSearch
              optionFilterProp="label"
            />
          </Col>
          <Col>
            <span style={{ marginRight: 8 }}>时间范围</span>
            <RangePicker
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
              value={dateRange}
              onChange={(v) => v && setDateRange(v as [dayjs.Dayjs, dayjs.Dayjs])}
            />
          </Col>
        </Row>
      </Card>

      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card title={title}>
            {!code ? (
              <Empty description="请选择股票" />
            ) : barsLoading ? (
              <Spin style={{ display: 'block', margin: '80px auto' }} />
            ) : bars.length === 0 ? (
              <Empty description="该时间范围暂无 5 分钟数据，请先导入 CSV" />
            ) : (
              <>
                <Alert
                  type="info"
                  showIcon
                  style={{ marginBottom: 12 }}
                  message={`共 ${bars.length} 根 K 线，时间范围 ${formatDateTime(bars[0]?.tradeTime)} ~ ${formatDateTime(bars[bars.length - 1]?.tradeTime)}`}
                />
                <Bar5MinKLineChart bars={bars} />
              </>
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
                onClick: () => setCode(record.symbol),
                style: { cursor: 'pointer' },
              })}
              rowClassName={(record) => (record.symbol === code ? 'ant-table-row-selected' : '')}
              columns={[
                { title: '代码', dataIndex: 'symbol', width: 100 },
                { title: '名称', dataIndex: 'name', ellipsis: true },
                { title: '市场', dataIndex: 'market', width: 60 },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {code && bars.length > 0 && (
        <Card title="明细数据" style={{ marginTop: 16 }}>
          <Table
            rowKey="id"
            size="small"
            loading={barsLoading}
            dataSource={[...bars].reverse()}
            scroll={{ x: 1100 }}
            pagination={{ pageSize: 15, showSizeChanger: true }}
            columns={[
              { title: '时间', dataIndex: 'tradeTime', width: 160, render: formatDateTime },
              { title: '开盘', dataIndex: 'openPrice', render: (v) => formatMoney(v, 2) },
              { title: '收盘', dataIndex: 'closePrice', render: (v) => formatMoney(v, 2) },
              { title: '最高', dataIndex: 'highPrice', render: (v) => formatMoney(v, 2) },
              { title: '最低', dataIndex: 'lowPrice', render: (v) => formatMoney(v, 2) },
              { title: '成交量', dataIndex: 'volume' },
              { title: '成交额', dataIndex: 'amount', render: (v) => formatMoney(v, 0) },
              {
                title: '涨幅',
                dataIndex: 'changePct',
                render: (v?: number) => (v != null ? `${v}%` : '-'),
              },
              {
                title: '振幅',
                dataIndex: 'amplitude',
                render: (v?: number) => (v != null ? `${v}%` : '-'),
              },
            ]}
          />
        </Card>
      )}
    </div>
  )
}
