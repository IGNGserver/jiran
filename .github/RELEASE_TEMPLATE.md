# Token Monitor {{tag}}

## 本次更新

<!-- app-update-notes:zh:start -->
### 采集：所有受支持工具一律采集，范围标签与周期标签同源
- **采集面锁定：** 追踪的工具集与采集节奏不再有任何可关闭的开关——watch、使用趋势历史、已删除会话归档、Projects、WSL 扫描全部常驻。历史版本里那些"前端已无控件、后端仍然生效"的收窄项会被自动清理，不会再在无人可察觉的地方压低数字。
- **WSL 不再漏采 Cursor / Antigravity：** 只装了这两个工具的发行版家目录此前匹配不到任何标记，整个目录被跳过、用量直接为 0；现在按 trae/warp 的同一规则补上了缓存根。
- **昨日 / 本周 / 自定义范围补齐同源数据：** 范围查询现在同样并入运行中发行版的用量，并还原被工具自行清理掉的会话（与实时扫描按同一会话键去重，不会重复计数）。之前这三个标签对 Windows + WSL 用户和有会话清理的工具系统性偏低，等于同一个日子给出两个答案。
- **仍未覆盖的一项（如实说明）：** Qoder 国际版与中国版的用量只在 今日 / 本月 / 全部 出现，自定义范围与 昨日 / 本周 暂时为 0 —— 它的本地适配器还没接到范围查询路径上，细节见 docs/API.md。

### 设置：前端没有控件的配置，后端一并删除
- **删除 11 个采集节奏配置键**（projectsEnabled、historyEnabled、historyIntervalMs、sessionUsageArchiveEnabled、wslScanEnabled、allTimeSince、collectionMode、collectionIntervalMs、watchEnabled、watchDebounceMs、syncUploadIntervalMs）连同对应的 `TOKEN_MONITOR_*` 环境变量与 headless agent 命令行开关。旧 `.env` / systemd / cron 配置不会报错：agent 会打印一条"已不受支持"的提示后继续运行。
- **下架四项已无入口的功能：** Discord Rich Presence、CSV/JSON 数据导出（连同 `docs/export.md`）、自定义模型定价、视图与模块排序/颜色遗留键。它们的设置键、IPC 通道、界面残留与文档一并移除。
- **自动更新改为仅手动：** 仍会自动检查并提示新版本，但下载与安装只在 设置 → 行为 里点击后发生。
- **保留且未变：** 显示 / 行为 / 连接三组设置，以及托盘的"暂停采集"。设备详情周期等已经没有任何界面读取的幽灵偏好已删除。

### 一致性与守护
- **Android 品牌显示补齐：** 27 个此前没有名称与配色的工具改为与桌面/Web 同源；10 个共用同一 logo 的工具通过别名表复用已内置的矢量图标。
- **新增反向守护：** 每个被追踪的工具都必须能被 watch、WSL 标记与扫描路径三条链路之一触达，否则测试直接失败——没有可取消勾选的工具之后，一个触达不到的工具就是静默少算，而不是显式的"未追踪"状态。设置文档也不再允许存在没有写入方的键。
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

Tokscale 已随应用内置。你可以在 **设置 → Tokscale** 查看确切版本，也可以直接从 npm 下载更新版本。Tokscale 是 MIT 开源项目：
https://github.com/junhoyeo/tokscale

</details>

<!-- release-hub-image -->
