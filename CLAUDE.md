# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个 VS Code 扩展插件，用于监控 GLM Coding Plan（智谱 AI 编程助手）的使用配额情况。插件通过环境变量获取认证信息，然后调用 GLM 监控 API 获取配额信息，在 VS Code 状态栏实时显示使用量。

## 构建和开发命令

```bash
# 编译 TypeScript
npm run compile

# 监视模式编译（开发时使用）
npm run watch

# 代码检查
npm run lint

# 打包插件
npm run package

# 运行测试
npm run test
```

## 核心架构

### 服务层架构

```
extension.ts (入口)
    ├── ConfigService - 配置管理
    ├── GlmQuotaService - 配额轮询和 API 请求
    └── StatusBarService - 状态栏显示
        └── LocalizationService - 国际化服务
```

### 关键设计模式

1. **单例模式**：`LocalizationService` 使用单例模式管理多语言。

2. **观察者模式**：`GlmQuotaService` 通过回调函数（`onQuotaUpdate`, `onError`, `onStatus`）通知状态变化。

3. **服务定位器模式**：`ConfigService` 从 VS Code 配置中读取设置，支持实时监听配置变更。

### API 请求机制

- **平台检测**：根据 `ANTHROPIC_BASE_URL` 自动检测平台类型
  - ZAI 平台：`api.z.ai`
  - ZHIPU 平台：`open.bigmodel.cn` 或 `dev.bigmodel.cn`
- **API 端点**：`/api/monitor/usage/quota/limit`
- **认证方式**：通过 `Authorization` 请求头传递 `ANTHROPIC_AUTH_TOKEN`
- **重试机制**：最多重试 3 次，间隔 5 秒
- **超时设置**：10 秒

### 配额类型

1. **TOKENS_LIMIT**：每 5 小时可使用额度
   - `limitValue`: 总可用量
   - `usedValue`: 已使用量
   - `remainingValue`: 剩余量
   - `remainingPercentage`: 剩余百分比
   - `resetTime`: 重置时间戳

2. **TIME_LIMIT**：MCP 每月可使用额度
   - 每月 1 号 00:00 重置

### 环境变量

插件依赖以下环境变量：

- `ANTHROPIC_AUTH_TOKEN`：认证 Token
- `ANTHROPIC_BASE_URL`：API 基础 URL
  - ZAI: `https://api.z.ai`
  - ZHIPU: `https://open.bigmodel.cn` 或 `https://dev.bigmodel.cn`

### 配置管理

配置通过 VS Code 的 `workspace.getConfiguration()` 读取，支持实时监听配置变更（防抖 300ms）。

### 国际化 (i18n)

- 支持 `auto`、`en`、`zh-cn` 三种语言设置
- `auto` 模式根据 VS Code 界面语言自动选择
- 翻译文件位于 `src/i18n/` 目录

## 重要常量

- **轮询间隔默认值**：600 秒（10 分钟）
- **最小轮询间隔**：60 秒
- **重试次数**：3 次
- **重试延迟**：5000 毫秒
- **启动延迟**：3000 毫秒（避免频繁请求）
- **请求超时**：10000 毫秒

## 状态栏显示样式

支持三种显示样式：

1. **percentage**：显示百分比（ `🟢 GLM: 85%`）
2. **progressBar**：显示方块进度条（ `🟢 GLM ███████░`）
3. **dots**：显示圆点进度条（ `🟢 GLM ●●●●○`）

### 状态指示符号

- **🟢 绿色**：剩余配额 ≥ 警告阈值（默认 50%）
- **🟡 黄色**：剩余配额 ≥ 临界阈值（默认 30%）且 < 警告阈值
- **🔴 红色**：剩余配额 < 临界阈值
- **⚫ 黑色**：配额已耗尽（0%）

## 文件命名约定

- `*Service.ts` - 服务类
- `types.ts` - 类型定义
- `package.nls.*.json` - 多语言配置文件
- `i18n/*.ts` - 国际化翻译文件

## 命令

- `glmQuotaWatcher.refreshQuota` - 手动刷新配额数据
