import { useState } from 'react'
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
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
import { runGridTier5MinBacktest } from '../api/gridTier5MinBacktest'
import { fetchStocks } from '../api/stocks'
import type { GridTier5MinBacktestRequest } from '../types'
import { symbolToBarCode } from '../utils/barCode'

const { RangePicker } = DatePicker

export default function GridTier5MinBacktestPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form] = Form.useForm()
  const [running, setRunning] = useState(false)

  const { data: stocks = [] } = useQuery({ queryKey: ['stocks'], queryFn: fetchStocks })

  const mutation = useMutation({
    mutationFn: runGridTier5MinBacktest,
    onSuccess: (task) => {
      message.success('5分钟分档回测完成')
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      navigate(`/tasks/${task.id}`)
    },
    onError: (err: Error) => message.error(err.message),
  })

  const onFinish = async (values: {
    symbol: string
    dateRange: [dayjs.Dayjs, dayjs.Dayjs]
    initialCapital?: number
    commissionRate?: number
    initialPosition?: number
    minPosition?: number
    dropThresholdPct?: number
    riseThresholdPct?: number
    dropTierQty?: number
    riseTierQty?: number
    maxTier?: number
  }) => {
    const request: GridTier5MinBacktestRequest = {
      barCode: symbolToBarCode(values.symbol),
      symbol: values.symbol,
      startDate: values.dateRange[0].format('YYYY-MM-DD'),
      endDate: values.dateRange[1].format('YYYY-MM-DD'),
      initialCapital: values.initialCapital,
      commissionRate: values.commissionRate,
      params: {
        initialPosition: values.initialPosition ?? 2000,
        minPosition: values.minPosition ?? 0,
        dropThresholdPct: values.dropThresholdPct ?? 0.5,
        riseThresholdPct: values.riseThresholdPct ?? 1.0,
        dropTierQty: values.dropTierQty ?? 1000,
        riseTierQty: values.riseTierQty ?? 2000,
        maxTier: values.maxTier ?? 20,
      },
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
      <Typography.Title level={3}>5分钟分档网格回测</Typography.Title>
      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="回测参数">
            <Spin spinning={running} tip="回测执行中，请稍候...">
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                  dateRange: [dayjs('2020-01-15'), dayjs('2026-05-15')],
                  initialCapital: 300000,
                  commissionRate: 0.0001,
                  initialPosition: 2000,
                  minPosition: 0,
                  dropThresholdPct: 0.5,
                  riseThresholdPct: 1.0,
                  dropTierQty: 1000,
                  riseTierQty: 2000,
                  maxTier: 20,
                }}
              >
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

                <Divider plain>资金与费率</Divider>
                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item name="initialCapital" label="初始资金">
                      <InputNumber style={{ width: '100%' }} min={1000} step={10000} addonAfter="元" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="commissionRate" label="佣金费率">
                      <InputNumber style={{ width: '100%' }} min={0} max={0.01} step={0.0001} />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider plain>档位策略参数</Divider>
                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item name="initialPosition" label="初始持仓（开盘建仓）">
                      <InputNumber style={{ width: '100%' }} min={0} step={100} addonAfter="股" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="minPosition" label="最低持仓">
                      <InputNumber style={{ width: '100%' }} min={0} step={100} addonAfter="股" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item name="dropThresholdPct" label="下跌触发档位 (%)">
                      <InputNumber style={{ width: '100%' }} min={0.01} step={0.1} addonAfter="%" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="riseThresholdPct" label="上涨触发档位 (%)">
                      <InputNumber style={{ width: '100%' }} min={0.01} step={0.1} addonAfter="%" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item name="dropTierQty" label="跌档数量/档">
                      <InputNumber style={{ width: '100%' }} min={100} step={100} addonAfter="股" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="riseTierQty" label="涨档数量/档">
                      <InputNumber style={{ width: '100%' }} min={100} step={100} addonAfter="股" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="maxTier" label="最大档数">
                  <InputNumber style={{ width: '100%' }} min={1} max={100} step={1} />
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
        <Col xs={24} lg={12}>
          <Card title="策略说明">
            <Typography.Paragraph>
              在 5 分钟 K 线级别上，价格下跌时分批买入（越跌越买），价格上涨时分批卖出（越涨越卖），通过高抛低吸降低成本。
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>建仓规则：</strong>开盘时若持仓为 0，以开盘价买入初始持仓；清仓后下一交易日开盘价自动建仓。
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>买入规则：</strong>当前价相对上次成交价下跌 ≥ 下跌档位时触发，第 N 档买入 N × 跌档数量，最大 maxTier 档。
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>卖出规则：</strong>当前价相对上次成交价上涨 ≥ 上涨档位时触发，第 N 档卖出 N × 涨档数量；遵守 T+1（当日买入不可卖）。
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>基准价：</strong>每次买入或卖出后，基准价更新为当前成交价。
            </Typography.Paragraph>
            <Typography.Paragraph type="secondary">
              请先在「5分钟导入」页导入对应股票的 CSV 数据。回测完成后可在详情页查看总体指标与交易明细。
            </Typography.Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
