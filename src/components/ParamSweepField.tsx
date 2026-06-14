import { Col, Form, InputNumber, Row, Switch } from 'antd'

interface ParamSweepFieldProps {
  name: string
  label: string
  min?: number
  max?: number
  /** 主值 / 最小 / 最大的输入步进 */
  step?: number
  /** 区间步长输入框的最小值，默认同 step */
  sweepStepMin?: number
  /** 区间步长输入框的加减步进，默认同 step */
  sweepStepIncrement?: number
  addonAfter?: string
  precision?: number
}

export default function ParamSweepField({
  name,
  label,
  min = 0,
  max,
  step = 1,
  sweepStepMin,
  sweepStepIncrement,
  addonAfter,
  precision,
}: ParamSweepFieldProps) {
  const stepFieldMin = sweepStepMin ?? step
  const stepFieldIncrement = sweepStepIncrement ?? step

  return (
    <div style={{ marginBottom: 16 }}>
      <Form.Item name={name} label={label} style={{ marginBottom: 8 }}>
        <InputNumber
          style={{ width: '100%' }}
          min={min}
          max={max}
          step={step}
          precision={precision}
          addonAfter={addonAfter}
        />
      </Form.Item>
      <Row gutter={8} align="middle">
        <Col flex="none">
          <Form.Item name={`${name}Sweep`} valuePropName="checked" noStyle>
            <Switch size="small" />
          </Form.Item>
        </Col>
        <Col flex="auto" style={{ color: '#666', fontSize: 12 }}>
          区间测算
        </Col>
      </Row>
      <Form.Item noStyle shouldUpdate={(prev, cur) => prev[`${name}Sweep`] !== cur[`${name}Sweep`]}>
        {({ getFieldValue }) =>
          getFieldValue(`${name}Sweep`) ? (
            <Row gutter={8} style={{ marginTop: 8 }}>
              <Col span={8}>
                <Form.Item name={`${name}Min`} label="最小" style={{ marginBottom: 0 }}>
                  <InputNumber
                    style={{ width: '100%' }}
                    min={min}
                    max={max}
                    step={step}
                    precision={precision}
                    addonAfter={addonAfter}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name={`${name}Max`} label="最大" style={{ marginBottom: 0 }}>
                  <InputNumber
                    style={{ width: '100%' }}
                    min={min}
                    max={max}
                    step={step}
                    precision={precision}
                    addonAfter={addonAfter}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name={`${name}Step`} label="步长" style={{ marginBottom: 0 }}>
                  <InputNumber
                    style={{ width: '100%' }}
                    min={stepFieldMin}
                    step={stepFieldIncrement}
                    precision={precision}
                    addonAfter={addonAfter}
                  />
                </Form.Item>
              </Col>
            </Row>
          ) : null
        }
      </Form.Item>
    </div>
  )
}
