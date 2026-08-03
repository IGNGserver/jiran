# English

## What's changed

<!-- app-update-notes:en:start -->
### Added
- **Subscriptions:** In Settings > Subscriptions, record what you actually pay for each AI account, including recurring plans and top-ups, then see price, renewal or validity, monthly usage value, and balance burn details from the AI Tool Limits page. When a hub is configured, subscription changes sync to other devices in real time. (#304, #305)
- **Localized App Updates:** App Updates now shows release notes in the selected interface language, with English, Simplified Chinese, Traditional Chinese, Korean, and Japanese support. (#311)

### Improved
- **Compact token units:** Choose International (K/M/B) or East Asian units and get consistent token formatting across Home, Usage Dashboard, token-rate readings, Floating Bubble, tray text, custom tray layouts, and Discord Rich Presence. (#303)
- **Token rate:** Short clicks still switch between output tok/s and total tok/min; holding the compact reading now shows a temporary animated boost and settles back to the current rate when released. (#306)
- **Currency display:** Compact cost values now keep fractional precision and use localized units around thresholds without rounding values like $999.50 up to the next unit. (#307, #309)

### Fixed
- **App Updates:** Packaged update checks no longer depend on GitHub REST API request quotas, and a failed check keeps the last known release visible with a specific error state. (#312)
<!-- app-update-notes:en:end -->

## Download

- **macOS Apple Silicon** — [Token-Monitor-0.40.0-arm64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.40.0/Token-Monitor-0.40.0-arm64.dmg)
- **macOS Intel** — [Token-Monitor-0.40.0-x64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.40.0/Token-Monitor-0.40.0-x64.dmg)
- **Windows Installer** — [Token-Monitor-Setup-0.40.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.40.0/Token-Monitor-Setup-0.40.0.exe) (recommended)
- **Windows Portable** — [Token-Monitor-0.40.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.40.0/Token-Monitor-0.40.0.exe) (no install required)
- **Linux x64** — [Token-Monitor-0.40.0.AppImage](https://github.com/Javis603/token-monitor/releases/download/v0.40.0/Token-Monitor-0.40.0.AppImage)

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
- **订阅信息：** 在「设置 > 订阅信息」中，可为每个 AI 账号记录实际支付的费用，包括订阅和充值；在「AI 工具额度」页面悬停账号的方案标签，可查看费用、下次续费／有效至、本月用量与回本信息，充值账号还会显示当前余额、消耗速率和预计用尽时间。配置 Hub 后，一台设备的订阅信息会实时同步到其他设备。（#304、#305）
- **多语言应用更新：** 「应用更新」现在会根据所选界面语言显示发布说明，支持英文、简体中文、繁体中文、韩文和日文。（#311）

### 改进
- **Token 简写单位：** 可在「国际（K/M/B）」和「中文（万/亿）」之间选择，并在主页、使用仪表板、tok/s／tok/min 读数、悬浮小窗、托盘文字、自定义托盘布局和 Discord Rich Presence 中统一使用。（#303）
- **Token rate：** 短按仍可在输出 tok/s 与总 tok/min 之间切换；按住紧凑读数会显示临时的动画加速，松开后回到当前速率。（#306）
- **成本显示：** 紧凑成本现在保留小数精度，并在单位阈值附近使用本地化单位，不会把 $999.50 过早进位到下一个单位。（#307、#309）

### 修复
- **应用更新：** 已打包版本不再依赖 GitHub REST API 请求额度；检查失败时会保留上次已知的版本，并显示具体的错误状态。（#312）
<!-- app-update-notes:zh:end -->

## 下载

- **macOS Apple Silicon** — [Token-Monitor-0.40.0-arm64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.40.0/Token-Monitor-0.40.0-arm64.dmg)
- **macOS Intel** — [Token-Monitor-0.40.0-x64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.40.0/Token-Monitor-0.40.0-x64.dmg)
- **Windows 安装版** — [Token-Monitor-Setup-0.40.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.40.0/Token-Monitor-Setup-0.40.0.exe)（推荐）
- **Windows 便携版** — [Token-Monitor-0.40.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.40.0/Token-Monitor-0.40.0.exe)（免安装）
- **Linux x64** — [Token-Monitor-0.40.0.AppImage](https://github.com/Javis603/token-monitor/releases/download/v0.40.0/Token-Monitor-0.40.0.AppImage)

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

---

**Full Changelog:** [v0.39.0...v0.40.0](https://github.com/Javis603/token-monitor/compare/v0.39.0...v0.40.0)

<details>
<summary>繁體中文 · 한국어 · 日本語</summary>

<details>
<summary><strong>繁體中文</strong></summary>

## 繁體中文

## 更新內容

<!-- app-update-notes:zh-TW:start -->
### 新增
- **訂閱資料：** 在「設定 > 訂閱資料」中，可為每個 AI 帳號記錄實際支付的費用，包括訂閱與儲值；在「AI 工具額度」頁面將游標移到帳號的方案標籤上，可查看費用、下次續費／有效至、本月用量與回本資訊，儲值帳號還會顯示目前餘額、消耗速率和預估用盡時間。設定 Hub 後，一台裝置的訂閱資料會即時同步到其他裝置。（#304、#305）
- **多語系應用程式更新：** 「應用程式更新」現在會依照所選介面語言顯示版本資訊，支援英文、簡體中文、繁體中文、韓文與日文。（#311）

### 改進
- **Token 簡寫單位：** 可在「國際（K/M/B）」與「中文（萬/億）」之間選擇，並在主頁、使用儀表板、tok/s／tok/min 讀數、懸浮小窗、托盤文字、自訂托盤布局和 Discord Rich Presence 中統一使用。（#303）
- **Token rate：** 短按仍可在輸出 tok/s 與總 tok/min 之間切換；按住精簡讀數會顯示暫時的動畫加速，放開後回到目前速率。（#306）
- **成本顯示：** 精簡成本現在保留小數精度，並在單位門檻附近使用本地化單位，不會把 $999.50 提前進位到下一個單位。（#307、#309）

### 修復
- **應用程式更新：** 已封裝版本不再依賴 GitHub REST API 請求額度；檢查失敗時會保留上次已知的版本，並顯示具體的錯誤狀態。（#312）
<!-- app-update-notes:zh-TW:end -->

## 下載

- **macOS Apple Silicon** — [Token-Monitor-0.40.0-arm64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.40.0/Token-Monitor-0.40.0-arm64.dmg)
- **macOS Intel** — [Token-Monitor-0.40.0-x64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.40.0/Token-Monitor-0.40.0-x64.dmg)
- **Windows 安裝版** — [Token-Monitor-Setup-0.40.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.40.0/Token-Monitor-Setup-0.40.0.exe)（推薦）
- **Windows 便攜版** — [Token-Monitor-0.40.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.40.0/Token-Monitor-0.40.0.exe)（免安裝）
- **Linux x64** — [Token-Monitor-0.40.0.AppImage](https://github.com/Javis603/token-monitor/releases/download/v0.40.0/Token-Monitor-0.40.0.AppImage)

</details>

<details>
<summary><strong>한국어</strong></summary>

## 한국어

## 업데이트 내용

<!-- app-update-notes:ko:start -->
### 추가
- **구독 정보:** 「설정 > 구독 정보」에서 각 AI 계정에 실제 지불한 금액을 구독과 충전으로 기록하고, 「AI 도구 한도」 페이지에서 요금, 다음 결제/유효 기간, 이번 달 사용량과 본전 대비 정보를 확인할 수 있습니다. 충전 계정에는 현재 잔액, 소진 속도와 소진 예상도 표시됩니다. Hub를 설정하면 한 기기의 구독 정보가 다른 기기에 실시간으로 동기화됩니다. (#304, #305)
- **다국어 앱 업데이트:** 「앱 업데이트」가 선택한 인터페이스 언어의 릴리즈 노트를 표시하며 영어, 중국어 간체/번체, 한국어, 일본어를 지원합니다. (#311)

### 개선
- **토큰 축약 단위:** 「국제식 (K/M/B)」와 「한국식 (만/억)」을 선택할 수 있으며 홈, 사용 대시보드, tok/s/tok/min 표시, 플로팅 버블, 트레이 텍스트, 사용자 지정 트레이와 Discord Rich Presence에 동일하게 적용됩니다. (#303)
- **토큰 속도 표시:** 짧게 클릭하면 출력 tok/s와 전체 tok/min을 계속 전환하고, 축약 수치를 누르고 있으면 임시 애니메이션 부스트가 표시된 뒤 손을 떼면 현재 속도로 돌아옵니다. (#306)
- **비용 표시:** 축약 비용이 소수점 정밀도를 유지하고 단위 경계에서 현지화된 단위를 사용해 $999.50 같은 값이 다음 단위로 일찍 반올림되지 않습니다. (#307, #309)

### 수정
- **앱 업데이트:** 패키지 버전의 업데이트 확인이 더 이상 GitHub REST API 요청 한도에 의존하지 않으며, 확인에 실패해도 마지막으로 확인한 버전을 유지하고 구체적인 오류 상태를 표시합니다. (#312)
<!-- app-update-notes:ko:end -->

## 다운로드

- **macOS Apple Silicon** — [Token-Monitor-0.40.0-arm64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.40.0/Token-Monitor-0.40.0-arm64.dmg)
- **macOS Intel** — [Token-Monitor-0.40.0-x64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.40.0/Token-Monitor-0.40.0-x64.dmg)
- **Windows 설치 버전** — [Token-Monitor-Setup-0.40.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.40.0/Token-Monitor-Setup-0.40.0.exe) (권장)
- **Windows 포터블 버전** — [Token-Monitor-0.40.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.40.0/Token-Monitor-0.40.0.exe) (설치 필요 없음)
- **Linux x64** — [Token-Monitor-0.40.0.AppImage](https://github.com/Javis603/token-monitor/releases/download/v0.40.0/Token-Monitor-0.40.0.AppImage)

</details>

<details>
<summary><strong>日本語</strong></summary>

## 日本語

## 更新内容

<!-- app-update-notes:ja:start -->
### 追加
- **サブスクリプション：** 「設定 > サブスクリプション」で各 AI アカウントに実際に支払った金額を、サブスクとチャージとして記録できます。「AIツール制限」ページで料金、次回請求／有効期限、今月の使用量と元が取れた倍率を確認でき、チャージでは現在の残高、消費ペース、枯渇予測も表示します。Hubを設定すると、1台で変更したサブスクリプションが他の端末へリアルタイムで同期されます。（#304、#305）
- **多言語アップデート：** 「アップデート」で選択したインターフェース言語のリリースノートを表示し、英語、簡体字中国語、繁体字中国語、韓国語、日本語に対応します。（#311）

### 改善
- **トークン短縮単位：** 「国際式（K/M/B）」と「日本式（万/億）」を選択でき、ホーム、使用状況ダッシュボード、tok/s／tok/min 表示、フローティングバブル、トレイテキスト、カスタムトレイ、Discord Rich Presence に統一して適用します。（#303）
- **トークン速度表示：** 短くクリックすると出力 tok/s と合計 tok/min を切り替えられ、短縮表示を長押しすると一時的なアニメーション付きブーストが表示され、離すと現在の速度に戻ります。（#306）
- **コスト表示：** 短縮コストが小数精度を保ち、単位の境界付近ではローカライズされた単位を使うため、$999.50 のような値が次の単位へ早く丸められません。（#307、#309）

### 修正
- **アップデート：** パッケージ版の更新確認が GitHub REST API のリクエスト上限に左右されなくなり、確認に失敗しても前回確認したバージョンを保持して具体的なエラー状態を表示します。（#312）
<!-- app-update-notes:ja:end -->

## ダウンロード

- **macOS Apple Silicon** — [Token-Monitor-0.40.0-arm64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.40.0/Token-Monitor-0.40.0-arm64.dmg)
- **macOS Intel** — [Token-Monitor-0.40.0-x64.dmg](https://github.com/Javis603/token-monitor/releases/download/v0.40.0/Token-Monitor-0.40.0-x64.dmg)
- **Windows インストーラー** — [Token-Monitor-Setup-0.40.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.40.0/Token-Monitor-Setup-0.40.0.exe)（推奨）
- **Windows ポータブル版** — [Token-Monitor-0.40.0.exe](https://github.com/Javis603/token-monitor/releases/download/v0.40.0/Token-Monitor-0.40.0.exe)（インストール不要）
- **Linux x64** — [Token-Monitor-0.40.0.AppImage](https://github.com/Javis603/token-monitor/releases/download/v0.40.0/Token-Monitor-0.40.0.AppImage)

</details>

</details>
