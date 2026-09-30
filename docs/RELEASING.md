# 发布说明

`.github/workflows/release.yml` 使用 `v<版本号>` tag 构建并创建 GitHub Release。项目版本格式为标准 SemVer：

```text
<major>.<minor>.<patch>[-rev.<正整数>]
```

`-rev.N` 是可选的本地维护修订号，用于在不改变 SemVer 主体的情况下发布增量修复。版本字符串必须通过 `npm run verify:release-version` 校验。

发布类型和版本字符串是两个独立概念：是否带 `-rev.N` 由本次发布的性质决定，GitHub Release 是否标记为 prerelease 由发布流程决定。普通的“发布 release”按 prerelease 处理；只有明确要求“发布正式版 release”时，才选择正式版。正式版还会更新 Docker 镜像的 `latest` 标签，版本化标签则始终发布。

## 首次配置 Android 签名

Android 正式包必须使用长期保存的签名密钥。不要把 keystore 文件或密码提交到仓库。

在安全环境生成 keystore 后，将 keystore 转成 base64，并在 GitHub 仓库的 **Settings → Secrets and variables → Actions** 中配置以下 Repository secrets：

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

签名密钥一旦用于公开发布，就必须永久保留。后续版本必须使用同一密钥，否则 Android 无法覆盖更新旧版本。

## 发布新版本

1. 新建 `.github/release-notes/<版本号>.md`（文件名是无 `v` 前缀的项目版本号，例如 `0.47.0-rev.36.md`），把本次更新写进文件里的 `<!-- app-update-notes:zh:start -->` 与 `<!-- app-update-notes:zh:end -->` 之间。一个版本一个文件：模板 `.github/RELEASE_TEMPLATE.md` 只留 `{{release_notes}}` 占位符，发布时渲染脚本按 tag 的版本读取对应文件，旧版本的说明不会再累积进新 Release。发布正文只有中文；快捷下载列表、版本号与 Hub 镜像段都由 `scripts/generate-release-notes.js` 注入，不要手写 `releases/download/` 链接。结构约定见 `.github/RELEASE_NOTES_FORMAT.md`。

2. 在根项目和锁文件中同步版本号，例如 `0.47.0`，然后运行：

   ```bash
   npm run verify:release-version
   ```

3. 提交并推送代码。
4. 创建并推送同名版本 tag，例如：

   ```bash
   git tag v0.47.0
   git push origin v0.47.0
   ```

   推送 tag 会自动创建 prerelease。
5. 如果要创建正式版，进入 GitHub Actions 手动运行 `Release`，填写同一个版本号，并将 `release_type` 选择为 `release`。只有这个明确操作会创建正式版 Release。
6. GitHub Actions 会构建 Windows 安装包、Linux AppImage、Debian `.deb` 包、Android release APK 和 Hub 镜像。Release 资产文件名中的 `<version>` 会保留完整版本号，例如：

   - `Jiran-Setup-0.47.0.exe`
   - `Jiran-0.47.0.AppImage`
   - `Jiran-0.47.0.deb`
   - `Jiran-Android-0.47.0.apk`

Android 的 `versionName` 与桌面版本一致；`versionCode` 由同一版本字符串推导（`major*10000 + minor*100 + patch`，再乘以 10000 加上 `rev.N`，无修订号时该位为 0），因此带或不带 `-rev.N` 的发布都能保持单调递增。

已安装的 Debian 版本通过应用内更新使用系统 `dpkg`/`apt` 完成升级，首次安装新版本时会按系统策略请求管理员权限；也可以手动执行 `sudo apt install ./Jiran-<version>.deb`。

## Debian App Center / APT 更新

直接打开 GitHub Release 中的 `.deb` 是一次“本地文件安装”，它不会自动把 GitHub Release 当成 APT 软件源。此时 App Center 能显示应用已安装，但没有可比较的仓库候选版本，所以不会显示升级按钮；这不是桌面包的 `Package` 名称问题。包保持稳定标识：项目改名后 `Package` 为 `jiran`（AppStream 组件 id 仍保留 `com.igng.tokenmonitor.desktop` 以维持元数据连续性），并使用标准语义化 Debian 版本。

### 改名（计然 / Jiran）迁移面

- **deb**：旧 `token-monitor` 包不会自动跟踪新包，`build-apt-repository.js` 会为每个版本额外构建一个同版本 transitional 桩包（`Depends: jiran`），已安装用户的下一次 `apt upgrade` 即被带到 `jiran`。
- **Pages 文件名**：`jiran.sources` / `jiran-archive-keyring(.asc|-fingerprint.txt)` 为主名，workflow 同时以 `token-monitor-*` 旧名发布同一份内容。**注意：GitHub Pages 的 URL 不随仓库改名重定向**，已装机的 `sources.list.d` 指向 `…/token-monitor-suite/apt` 会 404，需要用户执行一次 `curl … | sudo tee /etc/apt/sources.list.d/jiran.sources`；release notes（`0.47.0-rev.36`）已带迁移命令。
- **GHCR**：主镜像为 `jiran-hub`，`token-monitor-hub` 在过渡期内仍被推送完全相同的标签；用户改镜像名或保持旧名都可以，过渡窗口结束后才停推旧名。
- **线协议**：Hub 同时接受 `X-Jiran-Secret` 与历史 `X-Token-Monitor-Secret`；env 同时接受 `JIRAN_*` 与 `TOKEN_MONITOR_*`（后者优先）。
- **SignPath**：portal 侧的 artifact-configuration 必须与仓内 `.github/signpath/*.xml` 同步（文件名已从 `Token-Monitor-*` 改为 `Jiran-*`），否则 Windows 签名步骤会因找不到 PE 而失败。

要让 App Center 发现后续版本，发布端必须同时提供带签名的 APT 仓库，并在机器上一次性安装该仓库的公钥和 source 配置。仓库索引生成器是：

```bash
node scripts/build-apt-repository.js \
  --input-dir dist \
  --output-dir _site/apt \
  --suite stable \
  --signing-key <APT 发布密钥 ID> \
  --require-signature
```

其中 `dist/` 应只放当前要发布的 `.deb`。生成结果包含 `Packages`、压缩索引、`Release`、`InRelease` 和 `Release.gpg`；没有签名密钥时只能用于本地结构验证，不能作为用户源发布。公钥必须通过 HTTPS 或其他可信渠道安装到 `/usr/share/keyrings/jiran-archive-keyring.gpg`，source 配置中的 `Signed-By` 不能改成 `trusted=yes`。

GitHub Actions 的正式版 APT 部署需要两个 repository secrets：`TOKEN_MONITOR_APT_GPG_PRIVATE_KEY`（ASCII-armored 私钥）和 `TOKEN_MONITOR_APT_GPG_KEY_ID`（发布密钥 ID）。私钥只放在 Actions secret，不提交到仓库；Pages 会公开对应的 ASCII 公钥和指纹文件。

首次配置仓库后应执行：

```bash
curl -fsSL https://igngserver.github.io/jiran/apt/jiran-archive-keyring.asc \
  | gpg --dearmor \
  | sudo tee /usr/share/keyrings/jiran-archive-keyring.gpg >/dev/null
curl -fsSL https://igngserver.github.io/jiran/apt/jiran.sources \
  | sudo tee /etc/apt/sources.list.d/jiran.sources >/dev/null
sudo apt update
apt-cache policy jiran
```

安装前应把下载的公钥指纹与同目录的 `jiran-archive-keyring-fingerprint.txt` 及正式发布说明进行人工核对。`apt-cache policy` 应同时显示当前安装版本和 `https://igngserver.github.io/jiran/apt` 的候选版本；之后 App Center 才能把仓库里的新版本显示为可升级。现有从本地 `.deb` 安装的用户不需要卸载或改包名，配置 source 后执行一次 `sudo apt update` 即可迁移到仓库更新链路。

发布验证会检查 `.deb` 的 `Package`、原始 Debian `Version`、架构、桌面入口和 AppStream 元数据；AppStream 元数据用于让 App Center 正确识别应用，APT 源和签名则负责提供升级候选版本。

## Windows 签名

当前 Windows 安装包可以正常构建。未配置 `SIGNPATH_API_TOKEN` 时，Release workflow 会自动跳过 SignPath，发布**未签名**的 Windows 包（用户首次运行可能看到 SmartScreen 警告）。配置 SignPath 的 `SIGNPATH_API_TOKEN` secret 后，同一 workflow 会走 SignPath 双阶段签名（应用本体 + 安装包/便携版）。

## Hub Docker 镜像（GHCR）

推送 `v*` tag 后，Release workflow 会额外：

1. 多架构构建并推送 `ghcr.io/<owner>/jiran-hub`（`linux/amd64` + `linux/arm64`）。
2. 始终打标签：`<version>`、`v<version>`；只有正式版 Release 额外更新 `latest`。
3. 打包 `Jiran-Hub-Compose-<version>.zip`（最小 compose 部署包）并挂到 Release Assets。

镜像名固定为 **`jiran-hub`**。Compose 通过环境变量 `JIRAN_VERSION` 选择标签，默认 `latest`。

首次在组织/账号下推送 GHCR 包后，如需匿名拉取，请到 GitHub → Packages → `jiran-hub` → Package settings 将可见性设为 **Public**。

本地验证 compose 包（不推镜像）：

```bash
node scripts/package-hub-compose.js 0.47.0
```

本地从源码构建（不经过 GHCR）：

```bash
docker compose -f docker-compose.yml -f docker-compose.build.yml build hub
```
