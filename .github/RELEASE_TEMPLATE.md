# Token Monitor {{tag}}

## 本次更新

<!-- app-update-notes:zh:start -->
### 管理导航合并为单一「管理」页面
- **三个入口收进一页：** 原先管理组下的「账号」「管理（订阅 / 定价）」「设置」三个页面合并为一个「管理」页面，左侧栏在 账号 / 消费 / 偏好 分区间切换，网页端管理员额外显示「高级」分区。
- **旧链接不失效：** `accounts` / `management` 不再是独立视图，持久化路由、书签或旧 URL 会自动重定向到对应分区；当前分区同步到 URL（`?section=`），书签和分享都能直达目标分区。
- **桌面菜单同步精简：** 原生应用菜单移除两个失效入口；视图 id `settings` 作为旧路由与原生菜单的兼容面保留，只有标签改成了「管理」。
### 统一本地采集测量与 Qoder WSL 支持
- **统一测量语义：** 本地适配器现在通过统一的 `clientMeasurements` 传递 Token / 成本精度与 Provider 原生计量；旧的 `clientEstimated` / `clientCredits` 字段继续兼容。
- **Qoder / Qoder CN 跨端一致：** Web、Android、Hub 范围查询和本地采集共享同一套 provenance 与 Credits 规则，估算 Token 仍明确显示 `~`，Credits 不再伪装成 USD 成本。
- **补齐 WSL：** Windows 上运行中的 WSL Linux home 现在也会使用 Qoder 本地适配器采集 Global / CN 数据，并保留原有去重、失败保护和范围查询行为。
### 恢复单用户 Owner 鉴权并统一跨端管理权限
- **恢复单一 Owner 模型：** Hub 现在只接受 `TOKEN_MONITOR_SECRET` 作为唯一操作者凭证，读取、数据上报、设备管理、订阅、定价和额度账号管理均由同一凭证完成。
- **移除误导性的多用户权限层级：** 不再把 `admin`、`viewer`、`device`、`legacy` 当作 Token Monitor 用户；设备 ID 只表示数据来源，Provider Accounts 仍表示第三方 AI 服务商额度账号。
- **统一 Web、Desktop 与 Android：** 各端改用认证状态和宿主能力控制界面，不再因为旧的 admin scope 隐藏管理功能；鉴权 API 合同升级为 v3，并停止暴露认证拓扑。
- **兼容与安全：** 旧 split credential 配置不再作为正式登录模式，URL query secret 被拒绝；认证失败限流、TLS 要求、设备数据校验和 Hub 账号凭据保护继续保留。
<!-- app-update-notes:zh:end -->

## 快捷下载

<!-- release-downloads -->

<details>
<summary><strong>首次启动与其他说明</strong></summary>

### 首次启动

**macOS：** 应用已使用 Developer ID 签名并通过 Apple 公证。打开 `.dmg`，然后把 Token Monitor 拖到 Applications。

**Windows：** 安装版和便携版均已签名（[查看验证方法]({{repositoryUrl}}/blob/main/docs/code-signing.md#verify-a-download)）。

**Linux AppImage：** 先给执行权限，然后运行：

```bash
chmod +x Token-Monitor-*.AppImage
./Token-Monitor-*.AppImage
```

**Linux Debian 包：** 双击交给 App Center 安装，或执行 `sudo apt install ./Token-Monitor-{{version}}.deb`。按 [docs/RELEASING.md]({{repositoryUrl}}/blob/main/docs/RELEASING.md) 配好本项目的 APT 源之后，App Center 会把新版本直接显示为可升级。

**Android：** APK 是 Hub 的只读客户端，本身不采集数据，所以需要先有一个 Docker Compose Hub。签名使用长期保存的密钥，安装新版可直接覆盖旧版。

### 其他说明

快捷下载没有列出的平台不提供预构建版本，请参考 [README]({{repositoryUrl}}#readme) 从源码运行。macOS 的 `.zip` 只是同一个 app 的重新打包，除非明确需要，否则可以忽略。

### tokscale 依赖

Tokscale 已随应用内置，版本随本应用一起构建与更新，无需单独安装。Tokscale 是 MIT 开源项目：
https://github.com/junhoyeo/tokscale

</details>

<!-- release-hub-image -->
