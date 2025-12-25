# <img src="./icon.png" width="80" style="vertical-align: middle"> GLM Quota Watcher

#### Choose Your Language:  English | [简体中文](./README.md)

> [!NOTE]
> This plugin is an unofficial tool and has no affiliation with Zhipu AI.
> This plugin fetches quota information by calling the GLM monitoring API.
> This plugin is developed based on [AntigravityQuotaWatcher](https://github.com/wusimpl/AntigravityQuotaWatcher).

**A VS Code extension that displays GLM Coding Plan usage quota in real-time on the status bar.**

## Demo

<table>
  <tr>
    <td align="center">
      <strong>Status Bar Display</strong><br><br>
      <img src="https://raw.githubusercontent.com/CowanNath/GLMQuotaWatcher/main/images/demo1.png" alt="Status Bar Display" width="300">
    </td>
    <td align="center">
      <strong>Quota Details</strong><br><br>
      <img src="https://raw.githubusercontent.com/CowanNath/GLMQuotaWatcher/main/images/demo2.png" alt="Quota Details" width="400">
    </td>
    <td align="center">
      <strong>Config Page</strong><br><br>
      <img src="https://raw.githubusercontent.com/CowanNath/GLMQuotaWatcher/main/images/demo3.png" alt="Config Page" width="400">
    </td>
  </tr>
</table>

## Features

- **Real-time Monitoring**: Automatically polls GLM usage quota and updates periodically
- **Status Bar Display**: Shows current quota usage in the VS Code bottom status bar
- **Smart Alerts**: Automatically changes color when quota is low (green -> yellow -> red)
- **Dual Platform Support**: Supports ZAI (api.z.ai) and ZHIPU (open.bigmodel.cn) platforms
- **Multiple Display Styles**: Supports percentage, progress bar, and dots display modes
- **Multi-language Support**: Available in Chinese and English

## System Requirements

![Windows](https://img.shields.io/badge/Windows--amd64-supported-brightgreen?logo=microsoftwindows&logoColor=white)
![macOS](https://img.shields.io/badge/macOS-supported-brightgreen?logo=apple&logoColor=white)
![Linux](https://img.shields.io/badge/Linux-supported-brightgreen?logo=linux&logoColor=white)
![VS Code](https://img.shields.io/badge/VS%20Code-1.85%2B-blue?logo=visualstudiocode&logoColor=white)

## Installation

### Method 1: Manual Installation

1. Download the latest `.vsix` file
2. Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac) in VS Code to open the command palette
3. Type `Extensions: Install from VSIX...`
4. Select the downloaded `.vsix` file
5. Restart VS Code

### Method 2: Development Mode Installation

```bash
# Clone the project
git clone https://github.com/CowanNath/GLMQuotaWatcher.git
cd glm-quota-watcher

# Install dependencies
npm install

# Compile
npm run compile

# Press F5 in VS Code to launch debug mode
```

### Environment Variables Configuration

The extension requires the following environment variables to work properly:

1. Open VS Code Settings (`File` > `Preferences` > `Settings`)
2. Search for `terminal.integrated.env.windows` (Windows) or `terminal.integrated.env.osx` (macOS) / `terminal.integrated.env.linux` (Linux)
3. Add the following environment variables:

```json
{
  "terminal.integrated.env.windows": {
    "ANTHROPIC_AUTH_TOKEN": "Your authentication token",
    "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn" or "https://api.z.ai"
  }
}
```

> [!IMPORTANT]
> Restart VS Code for the environment variables to take effect

## Configuration Options

Open VS Code Settings (`File` > `Preferences` > `Settings`), search for `GLM Quota Watcher`:

### Enable Monitoring
- **Default**: `true`
- **Description**: Whether to enable quota monitoring

### Polling Interval
- **Default**: `600` (seconds)
- **Description**: Quota data refresh frequency, minimum value is 60 seconds

### Warning Threshold
- **Default**: `50` (percentage)
- **Description**: When quota falls below this percentage, the status bar displays a yellow warning symbol (🟡)

### Critical Threshold
- **Default**: `30` (percentage)
- **Description**: When quota falls below this percentage, the status bar displays a red error symbol (🔴)

### Status Bar Display Style
- **Default**: `percentage`
- **Options**:
  - `percentage`: Display percentage (`🟢 GLM: 85%`)
  - `progressBar`: Display progress bar (`🟢 GLM ███████░`)
  - `dots`: Display dots (`🟢 GLM ●●●●○`)

### Language Settings
- **Default**: `auto`
- **Options**:
  - `auto`: Automatically follow VS Code language settings
  - `en`: English
  - `zh-cn`: Simplified Chinese

## Status Bar Explanation

### Display Format

**Percentage Mode (Default)**
```
🟢 GLM: 85%
```

**Progress Bar Mode**
```
🟢 GLM ███████░
```

**Dots Mode**
```
🟢 GLM ●●●●○
```

### Status Indicator Symbols

- **🟢 Green**: Remaining quota ≥ 50% (sufficient)
- **🟡 Yellow**: Remaining quota 30%-50% (moderate)
- **🔴 Red**: Remaining quota < 30% (insufficient)
- **⚫ Black**: Quota exhausted (0%)

### Quota Details

Hover over the status bar to view detailed quota information, including:
- **Every 5 Hours Usage Quota**: TOKENS_LIMIT quota
  - Used amount
  - Total available amount
  - Usage percentage
  - Reset time
- **MCP Monthly Usage Quota**: TIME_LIMIT quota
  - Used count
  - Monthly quota
  - Reset time (1st day of each month at 00:00)

Click the status bar to immediately refresh quota information.

## Command Palette

Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac) to open the command palette, then type:

- **GLM Quota Watcher: Refresh GLM Quota** - Manually refresh quota data

## Notes

1. First startup will delay 3 seconds before starting monitoring to avoid frequent requests
2. The extension supports two platforms:
   - **ZAI Platform**: `https://api.z.ai`
   - **ZHIPU Platform**: `https://open.bigmodel.cn` or `https://dev.bigmodel.cn`
3. If the status bar shows an error, please check if the environment variables are configured correctly

## Development Commands

```bash
# Compile TypeScript
npm run compile

# Watch mode compilation (for development)
npm run watch

# Lint code
npm run lint

# Package extension
npm run package

# Run tests
npm run test
```

## Usage Agreement

This project is open-sourced under the MIT License. Please comply with the open-source license when using this project.
In addition, we hope you are aware of the following additional notes when using the code:

1. When packaging or redistributing, **please retain the source attribution**: [https://github.com/CowanNath/GLMQuotaWatcher](https://github.com/CowanNath/GLMQuotaWatcher)
2. Please do not use for commercial purposes. Use the code legally and compliantly.
3. If the open-source license changes, it will be updated in this GitHub repository without separate notice.

## License

MIT License
