import { useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Input,
  message,
  Spin,
  Tag,
  Typography,
} from 'antd'
import { RobotOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { analyzeStrategy } from '../api/ai'
import { fetchTaskDetail } from '../api/backtest'
import EquityChart from '../components/EquityChart'
import MetricsCards from '../components/MetricsCards'
import TradesTable from '../components/TradesTable'
import { formatDate, formatMoney, parseParamsJson, statusColor, statusLabel } from '../utils/format'

export default function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>()
  const id = Number(taskId)
  const [question, setQuestion] = useState('')
  const [analysis, setAnalysis] = useState<string>()

  const { data, isLoading, error } = useQuery({
    queryKey: ['taskDetail', id],
    queryFn: () => fetchTaskDetail(id),
    enabled: Number.isFinite(id) && id > 0,
  })

  const aiMutation = useMutation({
    mutationFn: analyzeStrategy,
    onSuccess: (res) => {
      setAnalysis(res.analysis)
      message.success('AI 分析完成')
    },
    onError: (err: Error) => message.error(err.message),
  })

  if (isLoading) {
    return <Spin size="large" style={{ display: 'block', margin: '120px auto' }} />
  }

  if (error || !data) {
    return <Alert type="error" message={(error as Error)?.message ?? '任务不存在'} showIcon />
  }

  const { task, result, trades } = data
  const taskParams = parseParamsJson(task.paramsJson)
  const isGridTask = !!task.barCode

  return (
    <div>
      <Typography.Title level={3}>回测详情 — {task.taskNo}</Typography.Title>

      <Card style={{ marginBottom: 16 }}>
        <Descriptions bordered column={{ xs: 1, sm: 2, lg: 3 }} size="small">
          <Descriptions.Item label="股票">{task.symbol}</Descriptions.Item>
          {task.barCode && (
            <Descriptions.Item label="5分钟代码">{task.barCode}</Descriptions.Item>
          )}
          <Descriptions.Item label="区间">
            {formatDate(task.startDate)} ~ {formatDate(task.endDate)}
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={statusColor[task.status]}>{statusLabel[task.status] ?? task.status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="初始资金">{formatMoney(task.initialCapital, 0)}</Descriptions.Item>
          <Descriptions.Item label="佣金费率">{task.commissionRate}</Descriptions.Item>
          <Descriptions.Item label="滑点费率">{task.slippageRate}</Descriptions.Item>
          {task.errorMessage && (
            <Descriptions.Item label="错误" span={3}>
              <Typography.Text type="danger">{task.errorMessage}</Typography.Text>
            </Descriptions.Item>
          )}
          {Object.keys(taskParams).length > 0 && (
            <Descriptions.Item label="策略参数" span={3}>
              <Typography.Text code>{JSON.stringify(taskParams)}</Typography.Text>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <div style={{ marginBottom: 16 }}>
        <MetricsCards result={result} initialCapital={task.initialCapital} />
      </div>

      <Card title="净值曲线" style={{ marginBottom: 16 }}>
        <EquityChart
          trades={trades}
          initialCapital={task.initialCapital}
        />
      </Card>

      <Card title="成交明细" style={{ marginBottom: 16 }}>
        <TradesTable trades={trades} extended={isGridTask} />
      </Card>

      <Card
        title={
          <>
            <RobotOutlined style={{ marginRight: 8 }} />
            AI 策略分析
          </>
        }
      >
        <Input.TextArea
          rows={2}
          placeholder="输入自定义问题（留空则使用默认评估）"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ marginBottom: 12 }}
        />
        <Button
          type="primary"
          icon={<RobotOutlined />}
          loading={aiMutation.isPending}
          onClick={() => aiMutation.mutate({ taskId: id, question: question || undefined })}
        >
          开始分析
        </Button>
        {analysis && (
          <div className="ai-analysis-result">
            <Typography.Paragraph style={{ whiteSpace: 'pre-wrap', marginTop: 16 }}>
              {analysis}
            </Typography.Paragraph>
          </div>
        )}
      </Card>
    </div>
  )
}
