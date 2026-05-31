import { Layout, Menu, Typography } from 'antd'
import {
  BarChartOutlined,
  DashboardOutlined,
  ImportOutlined,
  LineChartOutlined,
  StockOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'

const { Header, Sider, Content } = Layout

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '概览' },
  { key: '/stocks', icon: <StockOutlined />, label: '日K行情' },
  { key: '/bar5min/market', icon: <LineChartOutlined />, label: '5分钟行情' },
  { key: '/bar5min', icon: <ImportOutlined />, label: '5分钟导入' },
  { key: '/backtest', icon: <ThunderboltOutlined />, label: '策略回测' },
  { key: '/tasks', icon: <BarChartOutlined />, label: '回测记录' },
  { key: '/strategies', icon: <LineChartOutlined />, label: '策略管理' },
]

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const selectedKey =
    [...menuItems]
      .sort((a, b) => b.key.length - a.key.length)
      .find((item) =>
        item.key === '/'
          ? location.pathname === '/'
          : location.pathname === item.key || location.pathname.startsWith(`${item.key}/`),
      )?.key ?? '/'

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth={64} theme="dark" width={220}>
        <div className="logo">
          <StockOutlined style={{ fontSize: 22 }} />
          <span>Stock Backtest</span>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header className="app-header">
          <Typography.Title level={4} style={{ margin: 0, color: '#fff' }}>
            股票策略回测系统
          </Typography.Title>
        </Header>
        <Content className="app-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
