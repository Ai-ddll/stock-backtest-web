import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
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
import { useLocation, useNavigate } from 'react-router-dom'
import { runGridTier5MinBacktestBatch } from '../api/gridTier5MinBacktest'
import { fetchStocks } from '../api/stocks'
import ParamSweepField from '../components/ParamSweepField'
import type { BacktestTask, GridTier5MinBatchBacktestRequest } from '../types'
import { symbolToBarCode } from '../utils/barCode'
import { taskToGridTier5MinFormValues } from '../utils/gridTier5MinForm'
import { buildSweepConfig, countCombinations, MAX_COMBINATIONS } from '../utils/paramSweep'

const { RangePicker } = DatePicker

const defaultFormValues = {
  dateRange: [dayjs().subtract(3, 'month'), dayjs()],
  initialCapital: 300000,
  commissionRate: 0.0001,
  initialPosition: 2000,
  basePosition: 2000,
  minPosition: 2000,
  dropThresholdPct: 1.0,
  riseThresholdPct: 1.0,
  dropTierQty: 1000,
  riseTierQty: 1000,
  maxTier: 20,
  buyOverrideCostGapPct: 20,
  sellLotMode: 'MIN_PROFITABLE' as const,
  initialCapitalSweep: false,
  initialCapitalMin: 300000,
  initialCapitalMax: 300000,
  initialCapitalStep: 10000,
  initialPositionSweep: false,
  initialPositionMin: 2000,
  initialPositionMax: 2000,
  initialPositionStep: 100,
  dropThresholdPctSweep: false,
  dropThresholdPctMin: 1.0,
  dropThresholdPctMax: 5.0,
  dropThresholdPctStep: 0.1,
  riseThresholdPctSweep: false,
  riseThresholdPctMin: 1.0,
  riseThresholdPctMax: 5.0,
  riseThresholdPctStep: 0.1,
  dropTierQtySweep: false,
  dropTierQtyMin: 1000,
  dropTierQtyMax: 1000,
  dropTierQtyStep: 100,
  riseTierQtySweep: false,
  riseTierQtyMin: 1000,
  riseTierQtyMax: 1000,
  riseTierQtyStep: 100,
}

type FormValues = typeof defaultFormValues & { symbol: string }

function buildBatchRequest(values: FormValues): GridTier5MinBatchBacktestRequest {
  return {
    barCode: symbolToBarCode(values.symbol),
    symbol: values.symbol,
    startDate: values.dateRange[0].format('YYYY-MM-DD'),
    endDate: values.dateRange[1].format('YYYY-MM-DD'),
    commissionRate: values.commissionRate,
    basePosition: values.basePosition ?? 2000,
    minPosition: values.minPosition ?? 2000,
    maxTier: values.maxTier ?? 20,
    buyOverrideCostGapPct: values.buyOverrideCostGapPct ?? 20,
    sellLotMode: values.sellLotMode ?? 'MIN_PROFITABLE',
    initialCapital: buildSweepConfig(
      values.initialCapital,
      values.initialCapitalSweep,
      values.initialCapitalMin,
      values.initialCapitalMax,
      values.initialCapitalStep,
      300000,
    ),
    initialPosition: buildSweepConfig(
      values.initialPosition,
      values.initialPositionSweep,
      values.initialPositionMin,
      values.initialPositionMax,
      values.initialPositionStep,
      2000,
    ),
    dropThresholdPct: buildSweepConfig(
      values.dropThresholdPct,
      values.dropThresholdPctSweep,
      values.dropThresholdPctMin,
      values.dropThresholdPctMax,
      values.dropThresholdPctStep,
      1.0,
    ),
    riseThresholdPct: buildSweepConfig(
      values.riseThresholdPct,
      values.riseThresholdPctSweep,
      values.riseThresholdPctMin,
      values.riseThresholdPctMax,
      values.riseThresholdPctStep,
      1.0,
    ),
    dropTierQty: buildSweepConfig(
      values.dropTierQty,
      values.dropTierQtySweep,
      values.dropTierQtyMin,
      values.dropTierQtyMax,
      values.dropTierQtyStep,
      1000,
    ),
    riseTierQty: buildSweepConfig(
      values.riseTierQty,
      values.riseTierQtySweep,
      values.riseTierQtyMin,
      values.riseTierQtyMax,
      values.riseTierQtyStep,
      1000,
    ),
  }
}

export default function GridTier5MinBacktestPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [form] = Form.useForm<FormValues>()
  const [running, setRunning] = useState(false)
  const fromTask = (location.state as { fromTask?: BacktestTask } | null)?.fromTask
  const watched = Form.useWatch([], form)

  const { data: stocks = [] } = useQuery({ queryKey: ['stocks'], queryFn: fetchStocks })

  useEffect(() => {
    if (!fromTask) return
    const filled = taskToGridTier5MinFormValues(fromTask)
    form.setFieldsValue({
      ...defaultFormValues,
      ...filled,
      initialCapitalMin: (filled.initialCapital as number | undefined) ?? defaultFormValues.initialCapital,
      initialCapitalMax: (filled.initialCapital as number | undefined) ?? defaultFormValues.initialCapital,
      initialPositionMin: (filled.initialPosition as number | undefined) ?? defaultFormValues.initialPosition,
      initialPositionMax: (filled.initialPosition as number | undefined) ?? defaultFormValues.initialPosition,
      dropThresholdPctMin: (filled.dropThresholdPct as number | undefined) ?? defaultFormValues.dropThresholdPct,
      dropThresholdPctMax: (filled.dropThresholdPct as number | undefined) ?? defaultFormValues.dropThresholdPct,
      riseThresholdPctMin: (filled.riseThresholdPct as number | undefined) ?? defaultFormValues.riseThresholdPct,
      riseThresholdPctMax: (filled.riseThresholdPct as number | undefined) ?? defaultFormValues.riseThresholdPct,
      dropTierQtyMin: (filled.dropTierQty as number | undefined) ?? defaultFormValues.dropTierQty,
      dropTierQtyMax: (filled.dropTierQty as number | undefined) ?? defaultFormValues.dropTierQty,
      riseTierQtyMin: (filled.riseTierQty as number | undefined) ?? defaultFormValues.riseTierQty,
      riseTierQtyMax: (filled.riseTierQty as number | undefined) ?? defaultFormValues.riseTierQty,
    })
  }, [fromTask, form])

  const combinationCount = useMemo(() => {
    if (!watched) return 1
    try {
      const request = buildBatchRequest({ ...defaultFormValues, ...watched } as FormValues)
      return countCombinations([
        request.initialCapital,
        request.initialPosition,
        request.dropThresholdPct,
        request.riseThresholdPct,
        request.dropTierQty,
        request.riseTierQty,
      ])
    } catch {
      return 0
    }
  }, [watched])

  const mutation = useMutation({
    mutationFn: runGridTier5MinBacktestBatch,
    onSuccess: (tasks) => {
      const successCount = tasks.filter((t) => t.status === 'SUCCESS').length
      const batchNo = tasks[0]?.batchNo
      message.success(
        batchNo
          ? `批量回测完成：批次号 ${batchNo}，成功 ${successCount} / ${tasks.length} 单`
          : `批量回测完成：成功 ${successCount} / ${tasks.length} 单`,
      )
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      navigate('/tasks')
    },
    onError: (err: Error) => message.error(err.message),
  })

  const onFinish = async (values: FormValues) => {
    const request = buildBatchRequest(values)
    const total = countCombinations([
      request.initialCapital,
      request.initialPosition,
      request.dropThresholdPct,
      request.riseThresholdPct,
      request.dropTierQty,
      request.riseTierQty,
    ])
    if (total > MAX_COMBINATIONS) {
      message.error(`参数组合过多（${total} 组），请缩小测算区间，最多支持 ${MAX_COMBINATIONS} 组`)
      return
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
            <Spin spinning={running} tip={`回测执行中，共 ${combinationCount} 组参数...`}>
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={defaultFormValues}
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
                <ParamSweepField
                  name="initialCapital"
                  label="初始资金"
                  min={1000}
                  step={10000}
                  addonAfter="元"
                />
                <Form.Item name="commissionRate" label="佣金费率">
                  <InputNumber style={{ width: '100%' }} min={0} max={0.01} step={0.0001} />
                </Form.Item>

                <Divider plain>档位策略参数</Divider>
                <ParamSweepField
                  name="initialPosition"
                  label="初始持仓（开盘建仓）"
                  min={0}
                  step={100}
                  addonAfter="股"
                />
                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item name="basePosition" label="底仓（不可卖）">
                      <InputNumber style={{ width: '100%' }} min={0} step={100} addonAfter="股" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item name="minPosition" label="最低持仓">
                      <InputNumber style={{ width: '100%' }} min={0} step={100} addonAfter="股" />
                    </Form.Item>
                  </Col>
                </Row>
                <ParamSweepField
                  name="dropThresholdPct"
                  label="下跌触发档位"
                  min={0.01}
                  step={0.1}
                  sweepStepMin={0.01}
                  sweepStepIncrement={0.01}
                  precision={2}
                  addonAfter="%"
                />
                <ParamSweepField
                  name="riseThresholdPct"
                  label="上涨触发档位"
                  min={0.01}
                  step={0.1}
                  sweepStepMin={0.01}
                  sweepStepIncrement={0.01}
                  precision={2}
                  addonAfter="%"
                />
                <ParamSweepField
                  name="dropTierQty"
                  label="跌档数量/档"
                  min={100}
                  step={100}
                  addonAfter="股"
                />
                <ParamSweepField
                  name="riseTierQty"
                  label="涨档数量/档"
                  min={100}
                  step={100}
                  addonAfter="股"
                />
                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item name="maxTier" label="最大档数">
                      <InputNumber style={{ width: '100%' }} min={1} max={100} step={1} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="buyOverrideCostGapPct"
                      label="买入放宽阈值 (%)"
                      tooltip="T 仓被拦截时的例外门槛：买入后成本 ≤ 现价×(1−阈值/100)。正值越大越严（20=成本须低于现价20%），负值越宽（-10=成本可比现价高10%）"
                    >
                      <InputNumber style={{ width: '100%' }} min={-100} max={100} step={1} addonAfter="%" />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item
                  name="sellLotMode"
                  label="卖出选批模式"
                  tooltip="浮盈优先：跳过浮亏最低价，同 K 线可多批卖出且先卖后买；最低价优先：旧规则，每 K 线最多 1 笔且先买后卖"
                >
                  <Select
                    options={[
                      { value: 'MIN_PROFITABLE', label: '浮盈优先（推荐）' },
                      { value: 'MIN_PRICE', label: '最低价优先（旧规则）' },
                    ]}
                  />
                </Form.Item>

                <Alert
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                  message={`将生成 ${combinationCount} 组参数组合，每组独立测算并生成任务号`}
                />

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<ThunderboltOutlined />}
                    loading={running}
                    block
                    size="large"
                  >
                    开始回测{combinationCount > 1 ? `（${combinationCount} 组）` : ''}
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
              <strong>区间测算：</strong>初始资金、初始持仓、下跌/上涨触发档位、跌/涨档数量支持设置测算区间。例如下跌触发档位 1%、区间 1–5%、步长 1%，将分别按 1%、2%、3%、4%、5% 各生成一单；多个参数区间将自动组合测算。
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>建仓规则：</strong>开盘时若持仓为 0，以开盘价买入初始持仓；清仓后下一交易日开盘价自动建仓。
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>买入规则：</strong>建仓后以开盘价为基准，跌 1% 买 1000 股、跌 2% 再买 2000 股、跌 3% 再买 3000 股，以此类推（第 N 档买 N × 跌档数量），每档仅触发一次；每次卖出后，买入基准更新为最后一次卖出成交价，档位重新计算；若 T 仓仍有买入成本低于最近卖出价的持仓，通常不触发买入，仅当本次买入后摊薄持仓成本满足「买入放宽阈值」（默认 20%，可设负值放宽，如 -10%）时才允许买入。
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>卖出规则（浮盈优先）：</strong>在可卖 T 仓中，选取相对现价仍有浮盈且涨幅达标的批次，以其中最低买入价为基准涨档卖出；跳过成本最低但浮亏的批次；同 K 线内可先卖多批（换批时重置档位），再执行跌档买入；涨 N% 卖 N × 涨档数量，每档每批仅一次；批次卖完后切换至次低可卖浮盈批次；预估收益为负不卖；仅卖 T 仓；遵守 T+1。
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>卖出规则（最低价优先）：</strong>以可卖 T 仓全局最低买入价为基准涨档卖出，每 K 线最多 1 笔，先买后卖；其余涨档与 T+1 规则同上。
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>底仓规则：</strong>开盘建仓的底仓（默认与初始持仓相同）锁仓不卖，不参与 T 网格卖出。
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>永久持仓：</strong>当摊薄持仓成本 ≤ 0 时，当前全部持股转为永久持仓（不再参与 T 交易）；保持当前买入基准价，待现价相对该基准跌达跌档阈值后，再按初始持仓数量（默认 2000 股）重建新底仓，其中仅底仓参数（不可卖）数量锁仓，其余买入量作 T 仓可参与网格卖出；T 仓成本核算重置，后续 T 交易以新底仓为基准。
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>永久极端行情减仓：</strong>每次转永久时记录触发价（当根 K 线收盘价）与当次新锁永久股数；此后若现价相对该触发价上涨 20%/30%/40%/50%，分别累计卖出该批次 25%/50%/75%/100% 永久股（每档仅触发一次、补差额，50% 涨幅档清仓）；卖出数量为 100 股整数倍（四舍五入，不足 100 按 100）；优先于 T 仓涨档卖出执行；永久股卖出不改变当前摊薄持仓成本。
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>永久极端回补买入：</strong>永久极端各档卖出后，若现价大于买入基准价×(1−跌档阈值)且现价不高于该档卖出价×(1−20%)，则买回当档卖出股数并恢复永久持仓；20%/30%/40%/50% 各档独立回补、每档仅一次；回补后买入基准价更新为成交价。
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>基准价：</strong>买入基准为建仓价或最近卖出价；卖出基准为当前选中批次买入价（浮盈模式下为可卖浮盈批次中最低价），该批次卖完后切换下一候选批次。
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
