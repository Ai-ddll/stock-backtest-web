import { Card, Col, Row, Statistic } from 'antd'
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DollarOutlined,
  PercentageOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import type { BacktestResult, GridTier5MinMetrics } from '../types'
import { formatMoney, formatPercent, parseParamsJson } from '../utils/format'

interface MetricsCardsProps {
  result: BacktestResult | null
  initialCapital?: number
}

function parseGridMetrics(metricsJson?: string): GridTier5MinMetrics {
  const raw = parseParamsJson(metricsJson)
  if (raw.strategyType !== 'GRID_TIER_5MIN') return {}
  return {
    buyCount: raw.buyCount as number | undefined,
    sellCount: raw.sellCount as number | undefined,
    buyHoldReturn: raw.buyHoldReturn as number | undefined,
    excessReturn: raw.excessReturn as number | undefined,
    strategyType: raw.strategyType as string | undefined,
  }
}

export default function MetricsCards({ result, initialCapital }: MetricsCardsProps) {
  if (!result) {
    return (
      <Card>
        <span style={{ color: '#999' }}>暂无回测结果</span>
      </Card>
    )
  }

  const totalReturn = result.totalReturn ?? 0
  const isPositive = totalReturn >= 0
  const grid = parseGridMetrics(result.metricsJson)

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="总收益率"
            value={formatPercent(result.totalReturn)}
            prefix={isPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            valueStyle={{ color: isPositive ? '#3f8600' : '#cf1322' }}
          />
        </Card>
      </Col>
      {grid.buyHoldReturn != null && (
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="买入持有"
              value={formatPercent(grid.buyHoldReturn)}
              prefix={<PercentageOutlined />}
            />
          </Card>
        </Col>
      )}
      {grid.excessReturn != null && (
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="超额收益"
              value={formatPercent(grid.excessReturn)}
              prefix={grid.excessReturn >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              valueStyle={{ color: grid.excessReturn >= 0 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
      )}
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="最大回撤"
            value={formatPercent(result.maxDrawdown)}
            prefix={<ArrowDownOutlined />}
            valueStyle={{ color: '#cf1322' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="胜率"
            value={formatPercent(result.winRate)}
            prefix={<TrophyOutlined />}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="期末权益"
            value={formatMoney(result.finalEquity)}
            prefix={<DollarOutlined />}
            suffix={initialCapital ? `(初始 ${formatMoney(initialCapital)})` : undefined}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic title="总交易次数" value={result.tradeCount ?? 0} />
        </Card>
      </Col>
      {grid.buyCount != null && (
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="买入次数" value={grid.buyCount} />
          </Card>
        </Col>
      )}
      {grid.sellCount != null && (
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="卖出次数" value={grid.sellCount} />
          </Card>
        </Col>
      )}
      {!grid.strategyType && (
        <>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="年化收益"
                value={formatPercent(result.annualizedReturn)}
                prefix={<PercentageOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic title="夏普比率" value={result.sharpeRatio?.toFixed(2) ?? '-'} />
            </Card>
          </Col>
        </>
      )}
    </Row>
  )
}
