# <img src="./icon.png" width="80" style="vertical-align: middle"> GLM Quota Watcher

#### Choose Your Language:  [English](./README.en.md) | 简体中文

> [!NOTE]
> 本插件为非官方工具，与智谱 AI (Zhipu AI) 没有任何关联。
> 本插件通过调用 GLM 监控 API 获取配额信息。
> 本插件基于[AntigravityQuotaWatcher](https://github.com/wusimpl/AntigravityQuotaWatcher)二次开发而成。

**一个在 VS Code 状态栏实时显示 GLM Coding Plan 使用配额的插件。**

## 功能特点

- **实时监控**：自动轮询 GLM 使用配额，定时更新数据
- **状态栏显示**：在 VS Code 底部状态栏显示当前配额使用情况
- **智能预警**：配额不足时自动变色提醒（绿色->黄色->红色）
- **双平台支持**：支持 ZAI (api.z.ai) 和 ZHIPU (open.bigmodel.cn) 平台
- **多种显示样式**：支持百分比、进度条、圆点三种显示方式
- **多语言支持**：支持中文和英文界面

## 系统要求

![Windows](https://img.shields.io/badge/Windows--amd64-支持-brightgreen?logo=microsoftwindows&logoColor=white)
![macOS](https://img.shields.io/badge/macOS-支持-brightgreen?logo=apple&logoColor=white)
![Linux](https://img.shields.io/badge/Linux-支持-brightgreen?logo=linux&logoColor=white)
![VS Code](https://img.shields.io/badge/VS%20Code-1.85%2B-blue?logo=visualstudiocode&logoColor=white)

## 安装配置

### 方法一：手动安装

1. 下载最新版本的 `.vsix` 文件
2. 在 VS Code 中按 `Ctrl+Shift+P` (Windows) 或 `Cmd+Shift+P` (Mac) 打开命令面板
3. 输入 `Extensions: Install from VSIX...`
4. 选择下载的 `.vsix` 文件
5. 重启 VS Code

### 方法二：开发模式安装

```bash
# 克隆项目
git clone https://github.com/user/glm-quota-watcher.git
cd glm-quota-watcher

# 安装依赖
npm install

# 编译
npm run compile

# 在 VS Code 中按 F5 启动调试模式
```

### 环境变量配置

插件需要设置以下环境变量才能正常工作：

1. 打开 VS Code 设置（`文件` > `首选项` > `设置`）
2. 搜索 `terminal.integrated.env.windows`（Windows）或 `terminal.integrated.env.osx`（macOS）/ `terminal.integrated.env.linux`（Linux）
3. 添加以下环境变量：

```json
{
  "terminal.integrated.env.windows": {
    "ANTHROPIC_AUTH_TOKEN": "你的认证Token",
    "ANTHROPIC_BASE_URL": "https://api.z.ai" 或 "https://open.bigmodel.cn"
  }
}
```

> [!IMPORTANT]
> 重启 VS Code 以使环境变量生效

## 配置选项

打开 VS Code 设置（`文件` > `首选项` > `设置`），搜索 `GLM Quota Watcher`：

### 启用监控
- **默认值**：`true`
- **说明**：是否启用配额监控

### 轮询间隔
- **默认值**：`600`（秒）
- **说明**：配额数据刷新频率，最小值为 60 秒

### 警告阈值
- **默认值**：`50`（百分比）
- **说明**：配额低于此百分比时状态栏显示黄色警告符号（🟡）

### 临界阈值
- **默认值**：`30`（百分比）
- **说明**：配额低于此百分比时状态栏显示红色错误符号（🔴）

### 状态栏显示样式
- **默认值**：`percentage`
- **选项**：
  - `percentage`：显示百分比（ `🟢 GLM: 85%`）
  - `progressBar`：显示进度条（ `🟢 GLM ███████░`）
  - `dots`：显示圆点（ `🟢 GLM ●●●●○`）

### 语言设置
- **默认值**：`auto`
- **选项**：
  - `auto`：自动跟随 VS Code 语言设置
  - `en`：英语
  - `zh-cn`：简体中文

## 状态栏说明

### 显示格式

**百分比模式（默认）**
```
🟢 GLM: 85%
```

**进度条模式**
```
🟢 GLM ███████░
```

**圆点模式**
```
🟢 GLM ●●●●○
```

### 状态指示符号

- **🟢 绿色**：剩余配额 ≥ 50%（充足）
- **🟡 黄色**：剩余配额 30%-50%（中等）
- **🔴 红色**：剩余配额 < 30%（不足）
- **⚫ 黑色**：配额已耗尽（0%）

### 配额详情

鼠标悬停在状态栏上会显示详细的配额信息，包括：
- **每5小时可使用额度**：TOKENS_LIMIT 配额
  - 已使用量
  - 总可用量
  - 使用占比
  - 重置时间
- **MCP每月可使用额度**：TIME_LIMIT 配额
  - 已使用数
  - 每月额度
  - 重置时间（每月1号 00:00）

点击状态栏可以立即刷新配额信息。

## 命令面板

按 `Ctrl+Shift+P`（Windows）或 `Cmd+Shift+P`（Mac）打开命令面板，输入：

- **GLM Quota Watcher: Refresh GLM Quota** - 手动刷新配额数据

## 注意事项

1. 首次启动会延迟 3 秒开始监控，避免频繁请求
2. 插件支持两个平台：
   - **ZAI 平台**：`https://api.z.ai`
   - **ZHIPU 平台**：`https://open.bigmodel.cn` 或 `https://dev.bigmodel.cn`
3. 如果状态栏显示错误，请检查环境变量配置是否正确

## 开发命令

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

## 项目使用约定

本项目基于 MIT 协议开源，使用此项目时请遵守开源协议。
除此外，希望你在使用代码时已经了解以下额外说明：

1. 打包、二次分发 **请保留代码出处**：[https://github.com/user/glm-quota-watcher](https://github.com/user/glm-quota-watcher)
2. 请不要用于商业用途，合法合规使用代码
3. 如果开源协议变更，将在此 Github 仓库更新，不另行通知。

## 许可证

MIT License
