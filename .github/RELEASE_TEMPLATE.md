# Token Monitor {{tag}}

## 本次更新

<!-- app-update-notes:zh:start -->
### Hub 网页端：设备迁移终于有了入口
- **迁移页此前只存在于"手动输入网址"这条路径上：** 接口（`POST /api/devices/:id/transfer`，需要 admin 权限）、独立页面、`/transfer` 路由、五种语言的 `nav.transfer` 标签都早已存在，但没有任何导航分组列出它，而设置页里的迁移面板只在桌面 App 上渲染。所以在网页面板里看不到设备迁移，五个标签也成了没人引用的死字符串。
- **现在它进入"管理"导航组，并且只对 admin 显示**，与接口本身的权限要求一致——非 admin 不会看到一个点进去只能得到禁用按钮的入口。
- **手机端同样可达：** 底部导航的「更多」打开的就是同一套导航抽屉，因此抽屉里的管理组同样有它。
- **独立迁移页不再借用桌面设置专用容器：** 原来的 `settings-layout` / `desktop-settings-group` 等类只由桌面渲染层定义（网页端根本没有），窄屏以上会把单面板塞进设置网格的其中一列、留下空列。
- 新增源码守卫：导航里的每个 id 必须在所有语言都有标签（这次死键能被发现的检查），迁移必须列在管理组，且必须保持 admin 门槛。
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
