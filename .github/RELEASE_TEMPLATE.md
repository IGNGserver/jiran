# Token Monitor {{tag}}

## 本次更新

<!-- app-update-notes:zh:start -->
### 修复：数据自动刷新不再打断当前操作（网页端 / 桌面端 / 安卓端）
- **展开的列表、下拉框与输入不再被刷新还原：** 之前每次数据推送（约每几秒一次）都会整体重建界面，正在展开的列表、已打开的下拉框、输入到一半的表单会被关闭或覆盖成旧值。现在数据刷新遇到你正在操作的控件时会先暂存，等你操作结束后再应用；内容没有变化的刷新完全不改动界面，焦点、滚动位置与展开状态因此都不会被清掉。展开过的详情菜单也按内容定位，刷新后仍停在原来那一行，而不是挪到列表第一行。
- **桌面端设置表单纳入保护：** 在管理页填写 Hub 地址、设备 ID 等设置时若恰好收到后台推送，输入内容不再回退成旧值。
- **安卓端同步优化：** 额度账号的展开状态按账号身份保存，刷新导致顺序变化时不会被静默收起；定价列表改为按模型虚拟化，刷新重排不会移动正在编辑的行；总览页「同步中」提示改为固定占位，出现与消失都不再推动下方内容。
### 修复：Command Code 只填 API Key（Cookie 留空）也能正常添加
- **根因是本地校验误杀凭据：** 之前对 API Key 做了一道 `cmd_` 前缀白名单，把每一个真实 Key 都判为非法并清空；随后回落到同样为空的 Cookie 通道，账号以 `notConfigured` 收场，且从未向 Command Code 发出任何请求——表现上像是「凭据不对」，实际是「凭据被本地丢掉了」。
- **改为交由服务端判定：** 不再猜 Key 格式，只拒绝两类真正有问题的输入（把 Cookie 当 Bearer 用的跨通道粘贴，以及明确属于其它服务商的凭据）；其余一律原样提交。Key 无效时会如实返回「未授权」，而不是含糊的「未配置」。
- **文案同步：** 占位符提示改为真实的 `user_...` 形态（来自 `cmd login` / `~/.commandcode/auth.json`，或 Studio 的 API keys 页面）。
### 桌面端：修复 Windows 材质与全平台透明模式，打磨 Fluent 2 视觉层次
- **修复云母与亚克力切换生效与透明通道：** 修复了 Windows 11 下材质切换未触发窗口重构的缺陷，消除了原先覆盖在 DWM 纹理之上的实色背景；窗口底色与原生标题栏 Overlay 控制按钮均保持透明通透，材质自然呈现。
- **Windows 端支持选择纯透明模式：** 补齐 Windows 端显式配置「透明」选项的持久化与生效支持，允许在 Windows 上关闭 DWM 材质并开启通透磨砂底色。
- **修复卡片容器双重嵌套与边界穿帮：** 修正了首页「常用工具」与「常用模型」在半透明材质下内层面板重复染上背景色与阴影导致的边界错位问题，保持规整平整的 Fluent 2 微分隔层次。
- **算法精细化打磨：** 优化了深色/浅色模式下的透明度配比（78%~88% 溶合阶梯），结合 Fluent 2 规范提升了文字与趋势图对比度，浮层抽屉与弹窗保持高遮蔽度防干扰。
### Codex / Antigravity 账号改为「浏览器登录」单一方式
- **只保留浏览器授权：** Codex 与 Antigravity 账号的新增与编辑都只走浏览器授权向导，不再提供粘贴令牌 / JSON / 本地 RPC 端点的旧入口，避免同一账号出现多种互相冲突的凭据形态。
- **编辑页可见凭据状态：** 回到编辑页会明确显示「已填写凭据」或「未填写凭据」，并展示可安全公开的身份信息（如账号 ID / 邮箱）；可一键「清除凭据」，账号本身保留。
- **重新授权不会再建重复账号：** 清除后重新完成浏览器授权会原地替换该账号的凭据，而不是新增一个重复账号；桌面端与安卓端行为一致。
### 修复：网页端设备迁移永远提示"需要管理员凭据"
- **单 Owner 密钥完全正确也会被拒：** 迁移 POST 是全 UI 唯一一条没有携带会话密钥的请求（其余请求都显式带上，唯独它漏了），到中枢侧就是匿名调用被 401 拒绝，界面把它翻译成了"迁移需要 Hub 的管理员凭据"。现已随请求携带当前会话密钥，并有回归测试钉住。
- **迁移表单的选择不再被实时刷新重置：** 表单会随每次数据推送重渲染，此前选好的源/目标设备会跳回默认值；现在选择保留在应用状态里，设备消失时自动回退到默认。
### 修复：桌面端恢复 Windows Mica/Acrylic 与跨平台透明表面
- **原生材质回来了：** Windows 的 Mica / Acrylic 背景与标题栏叠加恢复为透明透出材质，macOS/Windows 的透明表面按实际生效的窗口表面渲染，不再被实色背景盖住。
- **表面切换即时生效：** 修改系统毛玻璃 / Windows 背景设置后窗口会按新表面重建，诊断信息同步上报实际生效的表面类型。
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
