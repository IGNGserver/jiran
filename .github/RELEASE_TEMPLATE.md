# English

## What's changed

<!-- app-update-notes:en:start -->
### Added
- **Third-party API Accounts:** Track balances from a compatible relay or balance API under **Settings → Accounts**. Pick the **New API-compatible** account preset (compatible One API forks included), the **New API** API-key preset for one key's configured quota and lifetime usage, or **Custom** to map numeric JSON fields from a single GET balance endpoint with Bearer or x-api-key authentication. Several named accounts are supported, and credentials stay on this device and are sent only to the Base URL you configure. (#261)
- **Claude Web login:** Add a Claude Web session under **Settings → Accounts → Claude Account** by pasting the `sessionKey` cookie from your browser; it then becomes the local Claude source. Claude Code OAuth and CLI are still detected automatically when Web login is not configured, and the cookie stays on this device. (#259)
- **Balance accounts in the menu bar:** DeepSeek, MiMo, OpenRouter, and Third-party API accounts can now drive the menu bar and the Floating Bubble, and their remaining balance reads as money on **Home**, in **AI Tool Limits**, and in the menu bar instead of being derived differently on each surface. (#266)
- **Live display preview:** The built-in menu bar and Floating Bubble displays now preview live under **Settings → Window**, not only **Custom…** layouts, with a **Custom…** button to start editing from what you see.

### Improved
- **Multiple accounts in AI Tool Limits:** Accounts inside one provider are separated instead of running together as a single stream, account emails are masked on **Home** the way they already were in **AI Tool Limits**, OpenRouter and Third-party accounts show their profile name on Home, and accounts whose addresses would read alike stay distinguishable. Redundant balance and quota suffixes were dropped from the rows.
- **Provider order on new installs:** **AI Tool Limits** and **Settings → Accounts** start in the same order as the supported-tools list; an order you already customized is left untouched. (#262)
- **Settings layout:** Display modes and quota indicators use compact inline controls, the nested Trends and Status lists match the spacing, row height, and label styling of the other settings lists, and switch rows respond to their own control rather than the whole row.

### Fixed
- **Claude accounts:** Different Claude accounts no longer collapse into one, and the account email and name are filled in instead of staying empty. (#259)
- **Empty balances:** An account with no funds left no longer shows a full meter or sorts as healthy on **Home**. (#266)
- **OpenRouter and Third-party API accounts:** Turning off a provider or a single account now settles immediately instead of staying on **Checking…**. (#262)
- **Hidden view count:** A view whose feature is switched off — Trends without history, Projects when project collection is off — counted as visible under **Settings → Main**, so the summary was wrong and the guard that keeps one view reachable released too early, letting every remaining view be hidden and leaving the main screen empty.
<!-- app-update-notes:en:end -->

## Download

- **macOS Apple Silicon** — [Token-Monitor-0.36.0-arm64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.36.0/Token-Monitor-0.36.0-arm64.dmg)
- **macOS Intel** — [Token-Monitor-0.36.0-x64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.36.0/Token-Monitor-0.36.0-x64.dmg)
- **Windows Installer** — [Token-Monitor-Setup-0.36.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.36.0/Token-Monitor-Setup-0.36.0.exe) (recommended)
- **Windows Portable** — [Token-Monitor-0.36.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.36.0/Token-Monitor-0.36.0.exe) (no install required)
- **Linux x64** — [Token-Monitor-0.36.0.AppImage](https://github.com/Javis603/token-monitor/releases/download/v0.36.0/Token-Monitor-0.36.0.AppImage)

<details>
<summary><strong>First launch and other notes</strong></summary>

### First launch

**macOS:** the app is Developer ID-signed and notarized by Apple. Open the `.dmg`, then drag Token Monitor to Applications.

**Windows:** both executables are signed ([how to verify](https://github.com/Javis603/token-monitor/blob/main/docs/code-signing.md#verify-a-download)).

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
- **Third-party APIs 账号：** 在 **设置 → 账号** 中连接兼容的中转站或余额 API。可选择 **New API 兼容** 账号预设方案（也支持兼容的 One API 分支）、**New API** 密钥预设方案（显示单把 API 密钥的设置额度与累计用量），或 **自定义** 方案——调用一个 GET 余额端点并映射数值 JSON 字段，支持 Bearer Token 或 x-api-key 认证。支持添加多个命名账号；凭证只保存在本机，并只会发送到你配置的 Base URL。（#261）
- **Claude Web 登录：** 在 **设置 → 账号 → Claude 账号** 中粘贴浏览器里的 `sessionKey` cookie 即可添加 Claude Web 会话，本机 Claude 会改用此来源；未设置 Web 登录时仍会自动检测 Claude Code OAuth 与 CLI，Cookie 只会保存在本机。（#259）
- **余额账号可用于菜单栏：** DeepSeek、MiMo、OpenRouter 与 Third-party APIs 账号现在可以驱动菜单栏与悬浮小窗；剩余余额在 **主页**、**AI 工具额度** 与菜单栏统一显示为金额，不再各处各自推算。（#266）
- **显示实时预览：** 在 **设置 → 窗口** 中，内置的菜单栏与悬浮小窗显示方案现在也会实时预览，不再只有 **自定义…** 布局才有；预览旁的 **自定义…** 按钮可以直接以当前效果开始编辑。

### 改进
- **AI 工具额度的多账号呈现：** 同一提供方下的各个账号现在彼此分隔，不再连成一片；**主页** 的账号邮箱会像 **AI 工具额度** 中一样打码；OpenRouter 与 Third-party APIs 账号会在主页显示账号名称；邮箱看起来相近的账号也能区分开。余额与额度行中多余的后缀已移除。
- **新安装的提供方顺序：** **AI 工具额度** 与 **设置 → 账号** 的初始顺序与支持的工具列表一致；你已经自定义过的顺序不受影响。（#262）
- **设置布局：** 显示方案与额度指示器改用紧凑的内联控件，嵌套的趋势与状态列表在间距、行高与标签样式上与其他设置列表保持一致，开关行的点击范围也限定在控件本身。

### 修复
- **Claude 账号：** 不同的 Claude 账号不再被合并成一个，账号邮箱与名称也不再为空。（#259）
- **余额耗尽：** 余额已用尽的账号不再显示为满格额度条，也不会在 **主页** 排到健康状态。（#266）
- **OpenRouter 与 Third-party APIs 账号：** 关闭整个提供方或单个账号后会立即生效，不再停留在 **检查中…**。（#262）
- **隐藏视图计数：** 功能被关闭的视图（未开启历史时的趋势、未开启项目收集时的项目）在 **设置 → 主画面** 中仍被算作可见，导致摘要数字错误，并让「至少保留一个视图」的保护提前失效，可能把剩下的视图全部隐藏、主画面变成空白。
<!-- app-update-notes:zh:end -->

## 下载

- **macOS Apple Silicon** — [Token-Monitor-0.36.0-arm64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.36.0/Token-Monitor-0.36.0-arm64.dmg)
- **macOS Intel** — [Token-Monitor-0.36.0-x64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.36.0/Token-Monitor-0.36.0-x64.dmg)
- **Windows 安装版** — [Token-Monitor-Setup-0.36.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.36.0/Token-Monitor-Setup-0.36.0.exe)（推荐）
- **Windows 便携版** — [Token-Monitor-0.36.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.36.0/Token-Monitor-0.36.0.exe)（免安装）
- **Linux x64** — [Token-Monitor-0.36.0.AppImage](https://github.com/Javis603/token-monitor/releases/download/v0.36.0/Token-Monitor-0.36.0.AppImage)

<details>
<summary><strong>首次启动与其他说明</strong></summary>

### 首次启动

**macOS：** 应用已使用 Developer ID 签名并通过 Apple 公证。打开 `.dmg`，然后把 Token Monitor 拖到 Applications。

**Windows：** 两个可执行文件均已签名（[查看验证方法](https://github.com/Javis603/token-monitor/blob/main/docs/code-signing.md#verify-a-download)）。

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
