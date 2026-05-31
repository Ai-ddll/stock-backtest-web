import { useState } from 'react'
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  InputNumber,
  message,
  Row,
  Select,
  Spin,
  Typography,
} from 'antd'
import { ThunderboltOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import { runBacktest } from '../api/backtest'
import { fetchStocks } from '../api/stocks'
import { fetchStrategies } from '../api/strategies'
import type { BacktestRunRequest } from '../types'

const { RangePicker } = DatePicker

export default function BacktestPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form] = Form.useForm()
  const [running, setRunning] = useState(false)

  const { data: stocks = [] } = useQuery({ queryKey: ['stocks'], queryFn: fetchStocks })
  const { data: strategies = [] } = useQuery({ queryKey: ['strategies'], queryFn: fetchStrategies })

  const mutation = useMutation({
    mutationFn: runBacktest,
    onSuccess: (task) => {
      message.success('回测完成')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      navigate(`/tasks/${task.id}`)
    },
    onError: (err: Error) => message.error(err.message),
  })

  const onFinish = async (values: {
    strategyCode: string
    symbol: string
    dateRange: [dayjs.Dayjs, dayjs.Dayjs]
    initialCapital?: number
    commissionRate?: number
    slippageRate?: number
  }) => {
    const request: BacktestRunRequest = {
      strategyCode: values.strategyCode,
      symbol: values.symbol,
      startDate: values.dateRange[0].format('YYYY-MM-DD'),
      endDate: values.dateRange[1].format('YYYY-MM-DD'),
      initialCapital: values.initialCapital,
      commissionRate: values.commissionRate,
      slippageRate: values.slippageRate,
    }
    setRunning(true)
    try {
      await mutation.mutateAsync(request)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div>
      <Typography.Title level={3}>策略回测</Typography.Title>
      <Row gutter={16}>
        <Col xs={24} lg={10}>
          <Card title="回测参数">
            <Spin spinning={running} tip="回测执行中，请稍候...">
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                  dateRange: [dayjs().subtract(1, 'year').startOf('year'), dayjs().endOf('year')],
                  initialCapital: 1000000,
                  commissionRate: 0.0003,
                  slippageRate: 0.0001,
                }}
              >
                <Form.Item
                  name="strategyCode"
                  label="策略"
                  rules={[{ required: true, message: '请选择策略' }]}
                >
                  <Select
                    placeholder="选择策略"
                    options={strategies.map((s) => ({
                      value: s.code,
                      label: `${s.name} (${s.code})`,
                    }))}
                  />
                </Form.Item>
                <Form.Item
                  name="symbol"
                  label="股票"
                  rules={[{ required: true, message: '请选择股票' }]}
                >
                  <Select
                    placeholder="选择股票"
                    showSearch
                    optionFilterProp="label"
                    options={stocks.map((s) => ({
                      value: s.symbol,
                      label: `${s.symbol} ${s.name}`,
                    }))}
                  />
                </Form.Item>
                <Form.Item
                  name="dateRange"
                  label="回测区间"
                  rules={[{ required: true, message: '请选择日期范围' }]}
                >
                  <RangePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="initialCapital" label="初始资金">
                  <InputNumber style={{ width: '100%' }} min={1000} step={10000} />
                </Form.Item>
                <Form.Item name="commissionRate" label="佣金费率">
                  <InputNumber style={{ width: '100%' }} min={0} max={0.01} step={0.0001} />
                </Form.Item>
                <Form.Item name="slippageRate" label="滑点费率">
                  <InputNumber style={{ width: '100%' }} min={0} max={0.01} step={0.0001} />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<ThunderboltOutlined />}
                    loading={running}
                    block
                    size="large"
                  >
                    开始回测
                  </Button>
                </Form.Item>
              </Form>
            </Spin>
          </Card>
        </Col>
        <Col xs={24} lg={14}>
          <Card title="使用说明">
            <Typography.Paragraph>
              1. 选择已启用的策略与股票代码，指定回测时间区间。
            </Typography.Paragraph>
            <Typography.Paragraph>
              2. 系统同步执行回测，根据历史日 K 线模拟买卖并计算收益指标。
            </Typography.Paragraph>
            <Typography.Paragraph>
              3. 回测完成后自动跳转至详情页，可查看净值曲线、成交明细及 AI 分析。
            </Typography.Paragraph>
            <Typography.Paragraph type="secondary">
              提示：请确保数据库中已有对应股票的 daily_bar 数据，否则回测可能无成交记录。
            </Typography.Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
