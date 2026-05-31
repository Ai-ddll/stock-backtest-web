import { useCallback, useRef, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Col,
  message,
  Progress,
  Row,
  Statistic,
  Table,
  Typography,
  Upload,
} from 'antd'
import { FolderOpenOutlined, InboxOutlined, StopOutlined } from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { importBar5MinCsv } from '../api/bar5min'
import type { Bar5MinFolderImportResult, Bar5MinImportResult } from '../types'
import { importBar5MinFolderConcurrent, type FolderImportProgress } from '../utils/bar5minImport'

const { Dragger } = Upload

function ImportResultCard({
  title,
  result,
}: {
  title: string
  result: Bar5MinImportResult | Bar5MinFolderImportResult
}) {
  const isFolder = 'successFiles' in result

  return (
    <Card title={title}>
      <Row gutter={16}>
        {isFolder ? (
          <>
            <Col span={8}>
              <Statistic title="文件总数" value={result.totalFiles} />
            </Col>
            <Col span={8}>
              <Statistic title="成功" value={result.successFiles} valueStyle={{ color: '#3f8600' }} />
            </Col>
            <Col span={8}>
              <Statistic title="失败" value={result.failedFiles} valueStyle={{ color: '#cf1322' }} />
            </Col>
            <Col span={8}>
              <Statistic title="忽略（非CSV）" value={result.ignoredFiles} />
            </Col>
          </>
        ) : (
          <Col span={12}>
            <Statistic title="文件名" value={result.fileName} valueStyle={{ fontSize: 14 }} />
          </Col>
        )}
        <Col span={8}>
          <Statistic title="解析行数" value={result.totalRows} />
        </Col>
        <Col span={8}>
          <Statistic title="新增" value={result.inserted} valueStyle={{ color: '#3f8600' }} />
        </Col>
        <Col span={8}>
          <Statistic title="跳过（重复）" value={result.skipped} />
        </Col>
        <Col span={8}>
          <Statistic title="新增股票" value={result.symbolsCreated} />
        </Col>
      </Row>
      {'fileResults' in result && result.fileResults.length > 0 && (
        <Table
          style={{ marginTop: 16 }}
          rowKey="fileName"
          size="small"
          pagination={{ pageSize: 8 }}
          dataSource={result.fileResults}
          columns={[
            { title: '文件', dataIndex: 'fileName', ellipsis: true },
            { title: '新增', dataIndex: 'inserted', width: 80 },
            { title: '跳过', dataIndex: 'skipped', width: 80 },
            { title: '行数', dataIndex: 'totalRows', width: 80 },
          ]}
        />
      )}
      {result.errors.length > 0 && (
        <Alert
          style={{ marginTop: 16 }}
          type="warning"
          message="部分导入失败或存在解析错误"
          description={
            <ul style={{ margin: 0, paddingLeft: 20, maxHeight: 160, overflow: 'auto' }}>
              {result.errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          }
        />
      )}
    </Card>
  )
}

export default function Bar5MinPage() {
  const queryClient = useQueryClient()
  const folderInputRef = useRef<HTMLInputElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const [singleResult, setSingleResult] = useState<Bar5MinImportResult | null>(null)
  const [folderResult, setFolderResult] = useState<Bar5MinFolderImportResult | null>(null)
  const [folderImporting, setFolderImporting] = useState(false)
  const [folderProgress, setFolderProgress] = useState<FolderImportProgress | null>(null)

  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['bar5min'] })
    queryClient.invalidateQueries({ queryKey: ['bar5min-chart'] })
    queryClient.invalidateQueries({ queryKey: ['stocks'] })
  }, [queryClient])

  const importMutation = useMutation({
    mutationFn: importBar5MinCsv,
    onSuccess: (result) => {
      setSingleResult(result)
      setFolderResult(null)
      message.success(
        `导入完成：新增 ${result.inserted} 条，跳过 ${result.skipped} 条，新增股票 ${result.symbolsCreated} 只`,
      )
      invalidateQueries()
    },
    onError: (err: Error) => message.error(err.message),
  })

  const handleFolderSelect = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) {
        return
      }
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setFolderImporting(true)
      setFolderProgress(null)
      setFolderResult(null)
      setSingleResult(null)

      try {
        const result = await importBar5MinFolderConcurrent(
          Array.from(fileList),
          setFolderProgress,
          controller.signal,
        )
        setFolderResult(result)
        message.success(
          `文件夹导入完成：${result.successFiles}/${result.totalFiles} 个文件成功，新增 ${result.inserted} 条`,
        )
        invalidateQueries()
      } catch (err) {
        if (!controller.signal.aborted) {
          message.error(err instanceof Error ? err.message : '文件夹导入失败')
        }
      } finally {
        setFolderImporting(false)
        setFolderProgress(null)
        if (folderInputRef.current) {
          folderInputRef.current.value = ''
        }
      }
    },
    [invalidateQueries],
  )

  const handleCancelFolderImport = () => {
    abortRef.current?.abort()
    setFolderImporting(false)
    setFolderProgress(null)
    message.info('已取消文件夹导入')
  }

  const singleUploadProps: UploadProps = {
    accept: '.csv',
    multiple: false,
    showUploadList: false,
    disabled: importMutation.isPending || folderImporting,
    beforeUpload: (file) => {
      importMutation.mutate(file)
      return false
    },
  }

  const busy = importMutation.isPending || folderImporting
  const progressPercent = folderProgress
    ? Math.round((folderProgress.current / folderProgress.total) * 100)
    : 0

  return (
    <div>
      <Typography.Title level={3}>5分钟数据导入</Typography.Title>

      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="单文件导入" style={{ marginBottom: 16 }}>
            <Dragger {...singleUploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽 CSV 文件到此区域</p>
              <p className="ant-upload-hint">示例：sh600036_2026.csv</p>
            </Dragger>
            {importMutation.isPending && (
              <Alert style={{ marginTop: 16 }} message="正在导入，请稍候..." type="info" showIcon />
            )}
          </Card>

          <Card title="文件夹批量导入">
            <input
              ref={folderInputRef}
              type="file"
              // @ts-expect-error webkitdirectory is supported by browsers
              webkitdirectory=""
              directory=""
              multiple
              accept=".csv"
              style={{ display: 'none' }}
              disabled={busy}
              onChange={(e) => void handleFolderSelect(e.target.files)}
            />
            <div
              role="button"
              tabIndex={busy ? -1 : 0}
              onClick={() => !busy && folderInputRef.current?.click()}
              onKeyDown={(e) => {
                if (!busy && (e.key === 'Enter' || e.key === ' ')) {
                  folderInputRef.current?.click()
                }
              }}
              style={{ cursor: busy ? 'not-allowed' : 'pointer' }}
            >
              <Dragger disabled={busy} openFileDialogOnClick={false} showUploadList={false}>
                <p className="ant-upload-drag-icon">
                  <FolderOpenOutlined />
                </p>
                <p className="ant-upload-text">点击选择文件夹</p>
                <p className="ant-upload-hint">支持 5000+ 文件，自动分批顺序导入（每批最多 8 个文件）</p>
                <p className="ant-upload-hint">非 CSV 文件会自动忽略</p>
              </Dragger>
            </div>

            {folderImporting && folderProgress && (
              <div style={{ marginTop: 16 }}>
                <Progress percent={progressPercent} status="active" />
                <Typography.Text type="secondary">
                  正在导入 {folderProgress.current}/{folderProgress.total}
                  {folderProgress.fileName ? `：${folderProgress.fileName}` : ''}
                </Typography.Text>
                <div style={{ marginTop: 8 }}>
                  <Button
                    size="small"
                    icon={<StopOutlined />}
                    onClick={handleCancelFolderImport}
                  >
                    取消导入
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          {singleResult && <ImportResultCard title="单文件导入结果" result={singleResult} />}
          {folderResult && <ImportResultCard title="文件夹导入结果" result={folderResult} />}
        </Col>
      </Row>
    </div>
  )
}
