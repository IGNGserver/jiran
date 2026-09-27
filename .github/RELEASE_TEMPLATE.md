# Token Monitor {{tag}}

## 本次更新

<!-- app-update-notes:zh:start -->
### Hub 网页端：设备迁移收入「设置 → 高级」，并修好源设备下拉
- **迁移入口从侧边栏收回设置：** 上一版把设备迁移挂进了侧边栏「管理」组，这一版把它移入 **设置 →「高级」** 分组，仍然只对 admin 显示。网页面板的设置页会为管理员渲染这个分组，桌面 App 不再渲染迁移面板。
- **桌面端不再有迁移代码：** 迁移是中枢侧的管理员操作，桌面客户端既不再渲染面板，也不再代理 `POST /api/devices/:id/transfer`（`desktopRequestRouter` 已移除该路由），源码守卫会拦住回退。
- **修复源设备下拉框点开空白：** 选项此前直接挂在 `<fluent-dropdown>` 上、缺少 `fluent-listbox` 包裹，Fluent 因此拿不到 listbox，控件既打不开也不显示当前值。现在源、目标两个下拉都会列出已有设备。
- **目标设备从手输 ID 改为下拉选择：** 不再需要手动粘贴设备 ID；两个下拉默认给出一组有效且不相等的设备，源设备切换撞到目标时会自动把目标换到另一台。
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
