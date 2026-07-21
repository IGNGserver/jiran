# English

## What's changed

<!-- app-update-notes:en:start -->
### Added
- **Kimi membership limits:** Connect a Kimi web session cookie to display 5-hour, weekly, and monthly quota windows. An API key fallback restores 5-hour and weekly when web access is unavailable. (#221)
- **Antigravity grouped quotas:** Antigravity limits now show five-hour and weekly quota windows per model family, read dynamically from the running app, CLI, or IDE. Weekly-only plans and the legacy RPC fallback are preserved. (#217)

### Improved
- **Antigravity Home summary:** The compact Home display shows the five-hour window by default; the weekly window takes over automatically when it becomes the tighter constraint, and the reset time is shown alongside the period label. (#219)
- **OpenCode profile and plan labels:** Account identity (profile name) is now shown separately from Go/Zen plan labels in both Home and Limits, and provider names appear automatically when tool icons are hidden. (#216)
- **WSL SQLite guidance:** The WSL status panel now surfaces a hint for OpenCode and Hermes — whose usage lives in SQLite — guiding users to run the headless agent inside WSL when usage stays empty. (#222)
- **Theme color consistency:** A custom accent color no longer affects semantic status colors such as success or warning indicators, making theme presets and custom colors behave more predictably. (#214)

### Fixed
- **Expired reset windows:** When a provider's reset window expires mid-session, the app now automatically re-fetches that provider's limits instead of holding a stale countdown. (#212)
<!-- app-update-notes:en:end -->

## Download

- **macOS Apple Silicon** — [Token-Monitor-0.33.0-arm64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.33.0/Token-Monitor-0.33.0-arm64.dmg)
- **macOS Intel** — [Token-Monitor-0.33.0-x64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.33.0/Token-Monitor-0.33.0-x64.dmg)
- **Windows Installer** — [Token-Monitor-Setup-0.33.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.33.0/Token-Monitor-Setup-0.33.0.exe) (recommended)
- **Windows Portable** — [Token-Monitor-0.33.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.33.0/Token-Monitor-0.33.0.exe) (no install required)
- **Linux x64** — [Token-Monitor-0.33.0.AppImage](https://github.com/Javis603/token-monitor/releases/download/v0.33.0/Token-Monitor-0.33.0.AppImage)

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
- **Kimi 会员额度：** 连接 Kimi 网页登录 Cookie，即可显示 5 小时、每周与每月配额窗口。在 Web 无法访问时，可改用 API Key 作为备援，以恢复 5 小时与每周额度。（#221）
- **Antigravity 分组配额：** Antigravity 额度现在会按模型系列分别显示五小时与每周配额窗口，直接从运行中的应用、CLI 或 IDE 读取。仅有每周配额的套餐及旧版 RPC 回退均保持兼容。（#217）

### 改进
- **Antigravity 首页摘要：** 紧凑首页默认显示五小时窗口；当每周配额更为紧张时自动切换，重置时间也会显示在时段标签旁。（#219）
- **OpenCode 账号与套餐标签分离：** 首页与额度视图现在将账号身份（配置名称）与 Go/Zen 套餐标签分开显示，隐藏工具图标时也会自动补充提供商名称。（#216）
- **WSL SQLite 引导：** WSL 状态面板新增针对 OpenCode 与 Hermes 的提示——由于这两者的用量存储在 SQLite 中，当用量持续为空时，会引导用户在 WSL 内运行 headless agent。（#222）
- **主题色系分层：** 自定义强调色不再影响成功、警告等语义状态色，主题预设与自定义颜色的表现更加一致可预期。（#214）

### 修复
- **到期重置窗口：** 额度重置窗口到期后，会自动重新获取该提供商的额度，不再停留在过期的倒计时上。（#212）
<!-- app-update-notes:zh:end -->

## 下载

- **macOS Apple Silicon** — [Token-Monitor-0.33.0-arm64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.33.0/Token-Monitor-0.33.0-arm64.dmg)
- **macOS Intel** — [Token-Monitor-0.33.0-x64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.33.0/Token-Monitor-0.33.0-x64.dmg)
- **Windows 安装版** — [Token-Monitor-Setup-0.33.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.33.0/Token-Monitor-Setup-0.33.0.exe)（推荐）
- **Windows 便携版** — [Token-Monitor-0.33.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.33.0/Token-Monitor-0.33.0.exe)（免安装）
- **Linux x64** — [Token-Monitor-0.33.0.AppImage](https://github.com/Javis603/token-monitor/releases/download/v0.33.0/Token-Monitor-0.33.0.AppImage)

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
