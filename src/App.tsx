import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import Bar5MinMarketPage from './pages/Bar5MinMarketPage'
import Bar5MinPage from './pages/Bar5MinPage'
import StockDividendPage from './pages/StockDividendPage'
import StockFinancialIndicatorPage from './pages/StockFinancialIndicatorPage'
import GridTier5MinBacktestPage from './pages/GridTier5MinBacktestPage'
import BacktestPage from './pages/BacktestPage'
import DashboardPage from './pages/DashboardPage'
import StocksPage from './pages/StocksPage'
import StrategiesPage from './pages/StrategiesPage'
import TaskDetailPage from './pages/TaskDetailPage'
import TasksPage from './pages/TasksPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="stocks" element={<StocksPage />} />
          <Route path="bar5min" element={<Bar5MinPage />} />
          <Route path="stock-dividend" element={<StockDividendPage />} />
          <Route path="stock-financial-indicator" element={<StockFinancialIndicatorPage />} />
          <Route path="bar5min/market" element={<Bar5MinMarketPage />} />
          <Route path="backtest/grid-tier-5min" element={<GridTier5MinBacktestPage />} />
          <Route path="backtest" element={<BacktestPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="tasks/:taskId" element={<TaskDetailPage />} />
          <Route path="strategies" element={<StrategiesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
