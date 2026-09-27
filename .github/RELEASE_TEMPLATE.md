# Token Monitor {{tag}}

## 本次更新

<!-- app-update-notes:zh:start -->
### 移动端与 PWA 体验
- **Fluent 2 底部原生导航栏：** 手机窄屏下自动隐藏侧边抽屉，转为拇指热区友好的固定底部导航栏（总览、使用情况、设备、更多），激活状态对齐 Fluent 2 顶部强调线规范。
- **作用域控制栏（Scope Command Bar）横向滑动：** 手机窄屏下将时间周期 Tab 改造成支持平滑触摸滚动的胶囊链，隐藏原生滚动条并提供极佳的手指滑动体验。
- **触控与 Bottom Sheet 适配：** 设置抽屉、账户编辑面板和自定义时间范围弹窗在手机端自适应为原生底部抽屉（Bottom Sheet），具备 Fluent 2 圆角、阴影与平滑升降动画。
- **平板端分栏布局（Master-Detail）：** 在中等尺寸屏幕（平板与折叠屏）自适应为双列列表/详情分栏与双列卡片，充分利用横向视野。
- **动效微交互：** 为底部导航项、可交互卡片添加触觉按压反馈缩放微动效，Toast 提示和 PWA 安装浮条自适应避让底栏与全面屏安全区。
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
