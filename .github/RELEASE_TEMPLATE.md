# Token Monitor {{tag}}

## 本次更新

<!-- app-update-notes:zh:start -->
### 采集口径：Qoder 现在在每个标签里都算得到
- **Qoder 国际版与中国版补齐自定义范围：** 此前这两个版本只由固定周期标签（今日 / 本月 / 全部）读取本地适配器，昨日 / 本周 与任何自定义范围都是 0——同一款工具两套数字。现在范围查询走同一个适配器、同一份合并去重后的行集，按行时间戳精确切窗，无法定位时间的行不进入范围。
- **估算标记与 Credits 一并保留：** Qoder 的 token 数仍是估算（继续显示 `~` 前缀），credits 仍是提供方计量的准确值；范围标签不会把估算伪装成实测。单个版本读取失败只记日志，不影响其余来源的汇总。
- **接续上一版的口径工作：** 运行中的 WSL 发行版、以及被工具自行清理掉的会话归档，现在同样进入范围答案，并按实时扫描的会话键去重，不会重复计数。

### 移除没有任何入口的维护动作
- 设置界面重建之后就再没有按钮能触发的六个动作一并下架：打开数据目录（原生菜单里的入口保留，可直接用）、导出诊断包、检查 / 下载 / 重置 tokscale、清空保留的会话归档。对应的 IPC 通道、preload 桥接与渲染端状态一并清理，其中"启动时静默向 npm 查询新版 tokscale"的请求也一起移除——它唯一的结果接收方就是那块从不渲染的状态。
- 保留的部分：启动时仍会清理 tokscale 的半成品暂存目录；tokscale 版本随应用构建一起更新，无需单独安装或下载。
- 文档同步修正：发布模板里的"设置 → Tokscale"指向的界面已不存在，五个语言的 README 也不再把手动清理后的会话归档描述成"开启后生效"。
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
