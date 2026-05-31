# stock-backtest-web

[stock-backtest](https://github.com/) 后端配套的前端项目，提供股票行情展示、策略回测操作与结果可视化。

## 功能

- **概览**：股票/策略数量统计、最近回测任务
- **股票行情**：股票列表、日 K 线蜡烛图与成交量
- **策略回测**：选择策略与标的，配置参数并提交同步回测
- **回测记录**：历史任务列表与详情（指标卡片、净值曲线、成交明细）
- **策略管理**：查看已启用策略及参数
- **AI 分析**：基于回测任务调用后端 Spring AI 解读

## 技术栈

| 组件 | 说明 |
|------|------|
| React 19 + TypeScript | UI 框架 |
| Vite 8 | 构建与开发服务器 |
| Ant Design 6 | 组件库 |
| ECharts | K 线与净值图表 |
| TanStack Query | 数据请求与缓存 |
| Axios | HTTP 客户端 |

## 前置依赖

需先启动后端 API 服务（默认 `http://localhost:8080`）：

```bash
# 在 stock-backtest 项目中
cd ../stock-backtest
docker compose up -d
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

## 快速启动

```bash
cd stock-backtest-web
npm install
npm run dev
```

前端地址：http://localhost:5173

开发模式下 Vite 会将 `/api` 代理到 `http://localhost:8080`，无需额外跨域配置。

## 生产构建

```bash
npm run build
npm run preview
```

构建产物在 `dist/` 目录。部署时需将 API 请求指向后端，或配置 Nginx 反向代理。

## 项目结构

```
src/
├── api/           # 后端 API 封装
├── components/    # 通用组件（图表、布局等）
├── pages/         # 页面
├── types/         # TypeScript 类型
└── utils/         # 格式化工具
```

## 环境说明

- 回测为**同步**接口，大数据量时 UI 会显示 loading
- AI 分析需本地 Ollama 或配置 OpenAI
- K 线数据需预先写入后端 `daily_bar` 表

## 相关项目

| 项目 | 说明 |
|------|------|
| [stock-backtest](../stock-backtest) | Spring Boot 回测后端 API |
