# English

## What's changed

<!-- app-update-notes:en:start -->
### Added
- **Menu bar layout composer:** The menu bar and the Floating Bubble can now use a layout you build yourself. Pick **Custom…** under **Settings → Window**, then add AI tool icons, quota bars, percentages, reset times, tokens, cost, account names, or custom text; drag to reorder against a live preview; and give each item its own AI tool, account, quota window, and typeface. Items set to Automatic follow a condition you choose — lowest remaining quota, highest tokens, or highest cost — over a selected period. The built-in presets stay available. (#251, #256)
- **OpenRouter Accounts:** Track one or more OpenRouter accounts under **Settings → Accounts** using an API key that stays on this device. Available balance, key limit, credits, and provider-reported spend appear in a compact meter with hover detail, and Free, Pay-as-you-go, and Management keys are distinguished. (#247)
- **Automatic update downloads:** Enable **Download updates automatically** under **Settings → General → App Updates** to fetch new versions in the background after startup, scheduled, and manual checks. Installing stays under your control through a dedicated **Restart** action, release notes remain available after the download, and on Windows the update now installs without flashing an installer window. (#239, #253)
- **Active days range:** The Home activity module can count active days over **All time** or the **Last 12 months**. (#210)
- **Back to Home:** Views opened from a Home module now show a return control; switching views from the footer stays direct navigation. (#238)

### Fixed
- **Codex Team and Personal accounts:** Two Codex workspaces that share one email — a Personal and a Team workspace, for example — no longer collapse into a single account. Each keeps its own identity across Settings, AI Tool Limits, the menu bar, and Hub aggregation. (#254, #257)
- **macOS menu bar popover:** Clicking the menu bar icon no longer occasionally switches to the Space the window was last shown on before appearing. (#250)
- **Settings across windows:** Changing a setting in the **Usage Dashboard** window — switching **Token Activity** between Tokens and Cost, for example — now updates the main window immediately. (#210)
- **DeepSeek spend history:** Month-to-date spend is preserved as older balance observations are pruned, and existing history migrates automatically. (#246)
<!-- app-update-notes:en:end -->

## Download

- **macOS Apple Silicon** — [Token-Monitor-0.35.0-arm64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.35.0/Token-Monitor-0.35.0-arm64.dmg)
- **macOS Intel** — [Token-Monitor-0.35.0-x64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.35.0/Token-Monitor-0.35.0-x64.dmg)
- **Windows Installer** — [Token-Monitor-Setup-0.35.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.35.0/Token-Monitor-Setup-0.35.0.exe) (recommended)
- **Windows Portable** — [Token-Monitor-0.35.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.35.0/Token-Monitor-0.35.0.exe) (no install required)
- **Linux x64** — [Token-Monitor-0.35.0.AppImage](https://github.com/Javis603/token-monitor/releases/download/v0.35.0/Token-Monitor-0.35.0.AppImage)

<details>
<summary><strong>First launch and other notes</strong></summary>

### First launch

**macOS:** the app is Developer ID-signed and notarized by Apple. Open the `.dmg`, then drag Token Monitor to Applications.

**Windows:** both executables are signed ([how to verify](https://github.com/Javis603/token-monitor/blob/main/docs/code-signing.md#verify-a-download)), but you may still see a brief SmartScreen prompt on the first few releases while the certificate builds reputation with Microsoft — More info → Run anyway.

**Linux:** mark the AppImage executable, then run it:

```bash
chmod +x "Token Monitor"*.AppImage
./"Token Monitor"*.AppImage
```

### Other notes

Other platforms are not pre-built — run from source per the [README](https://github.com/Javis603/token-monitor#readme). The macOS `.zip` is the same app repackaged; ignore it unless you specifically need it.

### tokscale dependency

Tokscale is bundled with this app. See **Settings → Tokscale** for the exact version
and the option to download a newer version directly from npm. Tokscale is MIT,
open-source: https://github.com/junhoyeo/tokscale

</details>

---

# 中文

## 更新内容

<!-- app-update-notes:zh:start -->
### 新增
- **菜单栏布局编辑器：** 菜单栏与悬浮小窗现在可以使用你自己搭建的布局。在 **设置 → 窗口** 中选择 **自定义…**，即可加入 AI 工具图标、额度条、百分比、重置时间、Tokens、费用、账号或自定义文字，拖动排序并实时预览，还能为每个项目单独指定 AI 工具、账号、额度窗口与字体。设为「自动」的项目会按你选择的条件跟随——剩余额度最少、Tokens 最多或费用最高——并可指定统计周期。内置预设仍然保留。（#251、#256）
- **OpenRouter 账号：** 在 **设置 → 账号** 中用只保存在本机的 API 密钥追踪一个或多个 OpenRouter 账号；可用余额、密钥上限、credits 与服务商上报的花费会以紧凑的额度条呈现，悬停可查看明细，并区分 Free、Pay-as-you-go 与 Management 密钥。（#247）
- **自动下载更新：** 在 **设置 → 常规 → 应用更新** 中打开 **自动下载更新**，启动后、定时与手动检查时都会在后台下载新版本；安装仍由你决定，通过专门的 **重新启动** 操作完成，下载完成后仍可查看发布说明，Windows 上安装时也不再闪出安装程序窗口。（#239、#253）
- **活跃天数范围：** 主页活动模块的活跃天数可在 **全部时间** 与 **近 12 个月** 之间切换。（#210）
- **返回主页：** 从主页模块打开的视图现在会显示返回控件；从底部切换视图仍是直接跳转。（#238）

### 修复
- **Codex 团队与个人账号：** 共用同一邮箱的两个 Codex 工作区（例如个人与团队）不再被合并成一个账号，在设置、AI 工具额度、菜单栏与 Hub 汇总中都保留各自的身份。（#254、#257）
- **macOS 菜单栏弹窗：** 点击菜单栏图标时，不再偶尔先切换到窗口上次显示所在的 Space 才出现。（#250）
- **多窗口设置同步：** 在 **使用仪表板** 窗口修改设置（例如把 **Token 活动** 从 Tokens 切换到成本）后，主窗口会立即同步更新。（#210）
- **DeepSeek 花费历史：** 清理较早的余额记录时不再丢失当月累计花费，已有历史会自动迁移。（#246）
<!-- app-update-notes:zh:end -->

## 下载

- **macOS Apple Silicon** — [Token-Monitor-0.35.0-arm64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.35.0/Token-Monitor-0.35.0-arm64.dmg)
- **macOS Intel** — [Token-Monitor-0.35.0-x64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.35.0/Token-Monitor-0.35.0-x64.dmg)
- **Windows 安装版** — [Token-Monitor-Setup-0.35.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.35.0/Token-Monitor-Setup-0.35.0.exe)（推荐）
- **Windows 便携版** — [Token-Monitor-0.35.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.35.0/Token-Monitor-0.35.0.exe)（免安装）
- **Linux x64** — [Token-Monitor-0.35.0.AppImage](https://github.com/Javis603/token-monitor/releases/download/v0.35.0/Token-Monitor-0.35.0.AppImage)

<details>
<summary><strong>首次启动与其他说明</strong></summary>

### 首次启动

**macOS：** 应用已使用 Developer ID 签名并通过 Apple 公证。打开 `.dmg`，然后把 Token Monitor 拖到 Applications。

**Windows：** 两个可执行文件均已签名（[查看验证方法](https://github.com/Javis603/token-monitor/blob/main/docs/code-signing.md#verify-a-download)），但在证书刚建立信誉的最初几个版本，仍可能短暂出现 SmartScreen 提示 → 更多信息 → 仍要运行。

**Linux：** 先给 AppImage 执行权限，然后运行：

```bash
chmod +x "Token Monitor"*.AppImage
./"Token Monitor"*.AppImage
```

### 其他说明

其他平台暂不提供预构建版本，请参考 [README](https://github.com/Javis603/token-monitor#readme) 从源码运行。macOS 的 `.zip` 只是同一个 app 的重新打包版本，除非你明确需要，否则可以忽略。

### tokscale 依赖

Tokscale 已随应用内置。你可以在 **设置 → Tokscale** 查看确切版本，
也可以直接从 npm 下载更新版本。Tokscale 是 MIT 开源项目：
https://github.com/junhoyeo/tokscale

</details>
