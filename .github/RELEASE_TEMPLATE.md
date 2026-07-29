# English

## What's changed

<!-- app-update-notes:en:start -->
### Added
- **Smart collection:** Choose **Smart (10 minutes)** under **Settings → Collection** to collect after detected Agent activity while keeping an hourly reconciliation; **Live watch** remains the default. (#160)
- **Claude credits:** Claude now shows **Usage credits** spend from OAuth and Web sources, plus an optional **Prepaid balance** with per-grant expiry details for Claude Web accounts under **Settings → AI Tool Limits → Claude**. (#269)
- **DeepSeek spend history:** The balance tooltip now breaks tracked spend into **Today**, **Week**, **Month**, and **All time**, with Week covering the latest seven local calendar days. (#278)

### Improved
- **AI Tool Limits settings:** Provider credentials, sign-in controls, account lists, enablement, status, and capability tags now live together in expandable provider rows under **Settings → AI Tool Limits**; the separate **Accounts** section has been removed without changing saved account behavior. (#281)
- **Provider reordering:** Drag anywhere on a provider row to reorder **AI Tool Limits**; rows follow the pointer and only settle after drop, with expanded rows collapsing during the drag. (#279)

### Fixed
- **Claude Web limits:** Subscription plan labels now resolve from the matching organization, and the headless agent can refresh through Claude's browser-gated endpoint instead of reporting a valid session as expired. (#271, #272)
- **Settings refresh:** Changing a provider credential or account setting now clears the old provider status before checking the new source. (#268)
<!-- app-update-notes:en:end -->

## Download

- **macOS Apple Silicon** — [Token-Monitor-0.37.0-arm64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.37.0/Token-Monitor-0.37.0-arm64.dmg)
- **macOS Intel** — [Token-Monitor-0.37.0-x64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.37.0/Token-Monitor-0.37.0-x64.dmg)
- **Windows Installer** — [Token-Monitor-Setup-0.37.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.37.0/Token-Monitor-Setup-0.37.0.exe) (recommended)
- **Windows Portable** — [Token-Monitor-0.37.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.37.0/Token-Monitor-0.37.0.exe) (no install required)
- **Linux x64** — [Token-Monitor-0.37.0.AppImage](https://github.com/Javis603/token-monitor/releases/download/v0.37.0/Token-Monitor-0.37.0.AppImage)

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
- **智能采集：** 可在 **设置 → 采集** 中选择 **智能采集（10 分钟）**，仅在检测到 Agent 活动后采集，并每小时校准一次；**实时追踪** 仍是默认选项。（#160）
- **Claude credits：** Claude 现在会显示 OAuth 与 Web 来源的 **Usage credits** 消费；Claude Web 账号还可在 **设置 → AI 工具额度 → Claude** 中显示 **预付余额** 与各笔余额的到期信息。（#269）
- **DeepSeek 消费记录：** 余额提示现在会显示 **Today**、**Week**、**Month** 和 **All time** 的已追踪消费，其中 Week 按最近 7 个本地自然日计算。（#278）

### 改进
- **AI 工具额度设置：** 供应商凭据、登录控件、账号列表、启用状态、检测状态与能力标签现在集中在 **设置 → AI 工具额度** 的可展开供应商行中；原来的 **账号** 分区已移除，已有账号行为不受影响。（#281）
- **供应商排序：** 现在可拖动供应商整行来调整 **AI 工具额度** 的顺序；拖动时当前行会跟随指针，展开内容会暂时收起，放下后才更新顺序。（#279）

### 修复
- **Claude Web 额度：** 现在会从对应的组织解析正确订阅方案；headless agent 也能通过 Claude 需要浏览器标识的端点刷新，不再把有效会话误报为 Cookie 过期。（#271、#272）
- **设置刷新：** 更改供应商凭据或账号设置后，会先清除旧状态再检测新来源，不再短暂显示过期结果。（#268）
<!-- app-update-notes:zh:end -->

## 下载

- **macOS Apple Silicon** — [Token-Monitor-0.37.0-arm64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.37.0/Token-Monitor-0.37.0-arm64.dmg)
- **macOS Intel** — [Token-Monitor-0.37.0-x64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.37.0/Token-Monitor-0.37.0-x64.dmg)
- **Windows 安装版** — [Token-Monitor-Setup-0.37.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.37.0/Token-Monitor-Setup-0.37.0.exe)（推荐）
- **Windows 便携版** — [Token-Monitor-0.37.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.37.0/Token-Monitor-0.37.0.exe)（免安装）
- **Linux x64** — [Token-Monitor-0.37.0.AppImage](https://github.com/Javis603/token-monitor/releases/download/v0.37.0/Token-Monitor-0.37.0.AppImage)

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
