import { useMemo, useState } from 'react'
import { Button, Card, Col, Input, Row, Select, Table, Tag, Typography } from 'antd'
import type { ColumnsType, TableProps } from 'antd/es/table'
import { ClearOutlined, SearchOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { searchTasks } from '../api/backtest'
import type { BacktestTaskListItem } from '../types'
import {
  formatDate,
  formatDateTime,
  formatMoney,
  formatPercent,
  statusColor,
  statusLabel,
} from '../utils/format'
import {
  emptyTaskFilters,
  hasActiveFilters,
  type TaskFilters,
} from '../utils/taskFilters'
import { formatTaskStrategyParams } from '../utils/strategyParams'

const sortDirections = ['ascend', 'descend'] as ('ascend' | 'descend')[]

type SortField =
  | 'taskNo'
  | 'batchNo'
  | 'symbol'
  | 'stockName'
  | 'dateRange'
  | 'initialCapital'
  | 'profit'
  | 'params'
  | 'status'
  | 'errorMessage'
  | 'finishedAt'

const COLUMN_SORT_FIELDS: Record<string, SortField> = {
  taskNo: 'taskNo',
  batchNo: 'batchNo',
  symbol: 'symbol',
  stockName: 'stockName',
  initialCapital: 'initialCapital',
  status: 'status',
  errorMessage: 'errorMessage',
  finishedAt: 'finishedAt',
}

function renderProfit(row: BacktestTaskListItem) {
  if (row.status !== 'SUCCESS' || row.totalReturn == null || row.finalEquity == null) {
    return '-'
  }
  const profit = row.finalEquity - row.initialCapital
  const positive = profit >= 0
  return (
    <span style={{ color: positive ? '#3f8600' : '#cf1322' }}>
      {positive ? '+' : ''}
      {formatMoney(profit, 2)} ({formatPercent(row.totalReturn)})
    </span>
  )
}

function FilterField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <Col xs={24} sm={12} lg={8} xl={4}>
      <Typography.Text type="secondary" style={{ fontSize: 12 }}>
        {label}
      </Typography.Text>
      <Input
        allowClear
        size="small"
        style={{ marginTop: 4 }}
        placeholder={placeholder ?? '搜索'}
        prefix={<SearchOutlined style={{ color: '#bbb' }} />}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </Col>
  )
}

export default function TasksPage() {
  const [pageSize, setPageSize] = useState(500)
  const [current, setCurrent] = useState(1)
  const [draftFilters, setDraftFilters] = useState<TaskFilters>(emptyTaskFilters)
  const [appliedFilters, setAppliedFilters] = useState<TaskFilters>(emptyTaskFilters)
  const [searchTick, setSearchTick] = useState(0)
  const [sortField, setSortField] = useState<SortField>('finishedAt')
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend'>('descend')

  const queryParams = useMemo(
    () => ({
      page: current,
      pageSize,
      taskNo: appliedFilters.taskNo || undefined,
      batchNo: appliedFilters.batchNo || undefined,
      symbol: appliedFilters.symbol || undefined,
      stockName: appliedFilters.stockName || undefined,
      params: appliedFilters.params || undefined,
      profit: appliedFilters.profit || undefined,
      sortField,
      sortOrder,
    }),
    [current, pageSize, appliedFilters, sortField, sortOrder],
  )

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['tasks', searchTick, queryParams],
    queryFn: () => searchTasks(queryParams),
  })

  const tasks = data?.items ?? []
  const total = data?.total ?? 0

  const columns: ColumnsType<BacktestTaskListItem> = useMemo(
    () => [
      {
        title: '任务号',
        dataIndex: 'taskNo',
        key: 'taskNo',
        sorter: true,
        sortOrder: sortField === 'taskNo' ? sortOrder : null,
        sortDirections,
        render: (v, row) => <Link to={`/tasks/${row.id}`}>{v}</Link>,
      },
      {
        title: '批次号',
        dataIndex: 'batchNo',
        key: 'batchNo',
        width: 110,
        sorter: true,
        sortOrder: sortField === 'batchNo' ? sortOrder : null,
        sortDirections,
        render: (v) => v ?? '-',
      },
      {
        title: '股票',
        dataIndex: 'symbol',
        key: 'symbol',
        width: 100,
        sorter: true,
        sortOrder: sortField === 'symbol' ? sortOrder : null,
        sortDirections,
      },
      {
        title: '股票名称',
        dataIndex: 'stockName',
        key: 'stockName',
        width: 100,
        sorter: true,
        sortOrder: sortField === 'stockName' ? sortOrder : null,
        sortDirections,
        render: (v) => v ?? '-',
      },
      {
        title: '区间',
        key: 'dateRange',
        sorter: true,
        sortOrder: sortField === 'dateRange' ? sortOrder : null,
        sortDirections,
        render: (_, row) => `${formatDate(row.startDate)} ~ ${formatDate(row.endDate)}`,
      },
      {
        title: '初始资金',
        dataIndex: 'initialCapital',
        key: 'initialCapital',
        sorter: true,
        sortOrder: sortField === 'initialCapital' ? sortOrder : null,
        sortDirections,
        render: (v) => formatMoney(v, 0),
      },
      {
        title: '盈利情况',
        key: 'profit',
        width: 180,
        sorter: true,
        sortOrder: sortField === 'profit' ? sortOrder : null,
        sortDirections,
        render: (_, row) => renderProfit(row),
      },
      {
        title: '策略参数',
        key: 'params',
        width: 260,
        ellipsis: true,
        sorter: true,
        sortOrder: sortField === 'params' ? sortOrder : null,
        sortDirections,
        render: (_, row) => formatTaskStrategyParams(row),
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 90,
        sorter: true,
        sortOrder: sortField === 'status' ? sortOrder : null,
        sortDirections,
        render: (s: string) => <Tag color={statusColor[s]}>{statusLabel[s] ?? s}</Tag>,
      },
      {
        title: '错误信息',
        dataIndex: 'errorMessage',
        key: 'errorMessage',
        ellipsis: true,
        sorter: true,
        sortOrder: sortField === 'errorMessage' ? sortOrder : null,
        sortDirections,
        render: (v) => v ?? '-',
      },
      {
        title: '完成时间',
        dataIndex: 'finishedAt',
        key: 'finishedAt',
        width: 170,
        sorter: true,
        sortOrder: sortField === 'finishedAt' ? sortOrder : null,
        sortDirections,
        render: (v) => formatDateTime(v),
      },
    ],
    [sortField, sortOrder],
  )

  const handleTableChange: TableProps<BacktestTaskListItem>['onChange'] = (
    pagination,
    _filters,
    sorter,
  ) => {
    const nextPage = pagination.current ?? 1
    const nextPageSize = pagination.pageSize ?? 500
    const singleSorter = Array.isArray(sorter) ? sorter[0] : sorter

    let sortChanged = false
    if (singleSorter?.order) {
      const fieldKey = String(singleSorter.columnKey ?? singleSorter.field ?? '')
      const nextSortField =
        COLUMN_SORT_FIELDS[fieldKey] ??
        (fieldKey === 'dateRange' || fieldKey === 'profit' || fieldKey === 'params'
          ? (fieldKey as SortField)
          : sortField)
      sortChanged = nextSortField !== sortField || singleSorter.order !== sortOrder
      setSortField(nextSortField)
      setSortOrder(singleSorter.order)
    }

    setPageSize(nextPageSize)
    setCurrent(sortChanged ? 1 : nextPage)
  }

  const updateDraftFilter = <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    setAppliedFilters({ ...draftFilters })
    setCurrent(1)
    setSearchTick((tick) => tick + 1)
  }

  const resetFilters = () => {
    setDraftFilters(emptyTaskFilters)
    setAppliedFilters({ ...emptyTaskFilters })
    setCurrent(1)
    setSearchTick((tick) => tick + 1)
  }

  return (
    <div>
      <Typography.Title level={3}>回测记录</Typography.Title>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]}>
          <FilterField
            label="任务号"
            value={draftFilters.taskNo}
            onChange={(v) => updateDraftFilter('taskNo', v)}
            placeholder="FWG..."
          />
          <FilterField
            label="批次号"
            value={draftFilters.batchNo}
            onChange={(v) => updateDraftFilter('batchNo', v)}
            placeholder="20260606..."
          />
          <FilterField
            label="股票代码"
            value={draftFilters.symbol}
            onChange={(v) => updateDraftFilter('symbol', v)}
            placeholder="sh600900"
          />
          <FilterField
            label="股票名称"
            value={draftFilters.stockName}
            onChange={(v) => updateDraftFilter('stockName', v)}
          />
          <FilterField
            label="策略参数"
            value={draftFilters.params}
            onChange={(v) => updateDraftFilter('params', v)}
            placeholder="跌阈1%"
          />
          <Col xs={24} sm={12} lg={8} xl={4}>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              盈利情况
            </Typography.Text>
            <Select
              allowClear
              size="small"
              style={{ width: '100%', marginTop: 4 }}
              placeholder="全部"
              value={draftFilters.profit || undefined}
              onChange={(v) => updateDraftFilter('profit', v ?? '')}
              options={[
                { value: 'profit', label: '仅盈利' },
                { value: 'loss', label: '仅亏损' },
                { value: 'none', label: '无结果' },
              ]}
            />
          </Col>
        </Row>
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography.Text type="secondary">
            {hasActiveFilters(appliedFilters) ? `筛选结果共 ${total} 条` : `共 ${total} 条记录`}
          </Typography.Text>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              type="primary"
              size="small"
              icon={<SearchOutlined />}
              onClick={applyFilters}
            >
              查询
            </Button>
            <Button
              size="small"
              icon={<ClearOutlined />}
              disabled={!hasActiveFilters(appliedFilters) && !hasActiveFilters(draftFilters)}
              onClick={resetFilters}
            >
              重置筛选
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <Table
          rowKey="id"
          loading={isLoading || isFetching}
          dataSource={tasks}
          columns={columns}
          onChange={handleTableChange}
          pagination={{
            current,
            pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: ['500', '1000', '2000', '5000'],
            showTotal: (count) => `共 ${count} 条`,
          }}
        />
      </Card>
    </div>
  )
}
