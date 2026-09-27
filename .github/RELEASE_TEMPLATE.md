# Token Monitor {{tag}}

## 本次更新

<!-- app-update-notes:zh:start -->
### 安卓客户端：刷新数据时不再闪动，滚动位置不再错位
- **列表入场不再重播：** 每个列表项此前各自「从零高度展开」入场，导致滚回来的行、以及因刷新而出现的行（同步提示、额度告急条）在出现的那一帧收起再展开，并把下方内容顶得位移——这是刷新时闪动与滚动错位的主要来源。现在改为整屏一次性、只改变透明度的呈现，每个列表项都带稳定键，同时「正在同步」提示移入页头，刷新不再往列表顶部插入新行。
- **图表数值变化只做插值、不再从头重播：** 环形图、堆叠柱与分段条的入场重播条件此前包含 token 数值本身，任何数字变化都会让它们归零重扫；趋势图的图表模型此前每帧重建。现在重播只由「这一组数据是否换了」决定，数值变化原地过渡。
- **加载指示共用一条时钟：** 每个进度圆环与骨架屏此前各自起停，一屏十几个指示的相位互不相同，看起来像在闪烁；现在全应用共用一条动画时钟，最后一个指示离开画面即停止。
- **设备页整队虚拟化：** 几百台设备不再一次性全部组合，滚动只渲染可视行。

### 安卓客户端：修复几个功能缺陷
- **Hub 侧 OAuth 登录此前无法完成：** 粘贴授权回调后没有任何调用把它交给 Hub，账号会以空凭据创建。现在「完成登录」真正可用；重新开始登录会作废上一个会话与已粘贴内容。
- **一次点击不再触发两次震动：** 原实现同时走系统触感与振动器两条通道。
- **品牌图标底色改为跟随实际生效的主题：** 此前询问系统深浅色，用户把应用锁成深色、系统仍是浅色时，角标会按浅色的透明度绘制。
- **日期窗口改用本机时区：** 贡献热力图的「今天」标记与「近一年」活跃天统计此前按 UTC 计算，东半球用户在上午会差一天。
- **限额卡片展开状态不再错位：** 额度刷新导致账号顺序变化时，展开的行会跟错账号；自定义范围的小时滚轮也不再在滚动途中把经过的每个小时写回。
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
