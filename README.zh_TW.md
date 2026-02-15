# Typing Particles — 打字粒子特效

一個 Chrome Extension，在使用者於任何網頁的文字輸入框打字時，即時顯示粒子特效動畫。提供 12 種視覺風格供切換，支援多國語系（English / 繁中 / 簡中 / 日 / 韓 / 西班牙文），所有設定透過 Popup 面板操作，即時生效。

---

## 目錄

1. [功能總覽](#功能總覽)
2. [安裝與測試方式](#安裝與測試方式)
3. [檔案結構](#檔案結構)
4. [特效展示](#特效展示)
5. [特效介面規範與擴充方式](#特效介面規範與擴充方式)
6. [多國語系 (i18n)](#多國語系-i18n)
7. [效能設計](#效能設計)
8. [已知限制](#已知限制)

---

## 功能總覽

| 功能 | 說明 |
|---|---|
| 十二種粒子特效 | Burst / Echo / Vortex / Sparkle / Firefly / Confetti / Bubble / Frost / Flame / Ripple / Electric / Diffuse |
| 即時切換 | 透過 Popup 面板選擇，無需重新載入頁面 |
| 強度控制 | 滑桿 0.1 – 1.0 控制粒子數量倍率 |
| 全域開關 | 一鍵啟用或停用所有特效 |
| 多國語系 | 支援 English / 繁中 / 簡中 / 日 / 韓 / 西班牙文，自動偵測瀏覽器語系 |
| 跨裝置同步 | 設定儲存於 `chrome.storage.sync` |
| 支援所有輸入框 | `<input>` / `<textarea>` / `contenteditable` |
| 隱私保護 | 自動跳過 `<input type="password">` |
| IME 支援 | 組字期間抑制，確認輸入時觸發 |
| iframe 支援 | `all_frames: true`，子框架中的輸入框同樣生效 |
| 背景自適應配色 | 自動偵測輸入框背景亮度，切換深色/淺色配色方案，確保任何背景下特效都清晰可見 |
| 零干擾 | Canvas 層 `pointer-events: none`，不影響任何頁面互動 |

---

## 安裝與測試方式

### 方式一：開發者模式載入（推薦測試方式）

1. 開啟 Chrome，在網址列輸入 `chrome://extensions/`
2. 開啟右上角的「**開發人員模式**」（Developer mode）
3. 點擊左上角「**載入未封裝項目**」（Load unpacked）
4. 選擇 `typing-particles/` **根目錄**（包含 `manifest.json` 的那層）
5. 擴充功能列表中出現「Typing Particles — 打字粒子特效」即代表載入成功
6. 開啟任意網頁（如 Google 搜尋、GitHub、Gmail），在輸入框打字即可看到粒子特效
7. 點擊瀏覽器右上角的擴充功能圖示，開啟 Popup 面板切換特效與強度

### 方式二：使用原型頁面（僅供快速視覺驗證）

1. 在瀏覽器中開啟 `typing-particles/prototype/index.html`
2. 頁面內建了 text input、textarea、contenteditable、password 四種輸入框
3. 頂部控制面板可切換特效、調整強度、查看活躍粒子數
4. 此原型在本機直接執行，不依賴 Chrome Extension API

### 測試檢核清單

- [ ] 在 `<input type="text">` 打字，粒子出現在游標附近
- [ ] 在 `<textarea>` 多行文字打字，粒子跟隨游標換行
- [ ] 在 `contenteditable` 區域打字，粒子正常顯示
- [ ] 在 `<input type="password">` 打字，**不出現**粒子（隱私保護）
- [ ] 透過 Popup 切換十二種特效，效果即時變更
- [ ] 調整強度滑桿，粒子數量隨之增減
- [ ] 關閉特效開關，粒子立即停止並消失
- [ ] 快速連續打字時無卡頓（Performance 面板確認無掉幀）
- [ ] 在含有 iframe 的頁面中（如 CodePen），iframe 內的輸入框也有特效
- [ ] 使用注音/拼音等 IME 輸入法：組字過程無粒子，按下 Enter 確認後觸發
- [ ] 在淺色背景的輸入框（如 Google 搜尋）中，特效使用深色配色方案，清晰可見
- [ ] 在深色背景的輸入框中，特效使用亮色配色方案

---

## 檔案結構

```
typing-particles/
├── manifest.json                # Manifest V3 設定
├── _locales/                    # 多國語系翻譯檔
│   ├── en/messages.json         # English（預設）
│   ├── zh_TW/messages.json      # 繁體中文
│   ├── zh_CN/messages.json      # 简体中文
│   ├── ja/messages.json         # 日本語
│   ├── ko/messages.json         # 한국어
│   └── es/messages.json         # Español
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── popup/
│   ├── popup.html               # 設定面板 UI（data-i18n 屬性標記翻譯點）
│   ├── popup.css                # 設定面板樣式（暗色主題，4×3 grid）
│   └── popup.js                 # 設定讀寫邏輯 + i18n 初始化
├── content/
│   ├── content.js               # 入口：事件監聽、輸入偵測、context 組裝
│   ├── caret-detector.js        # 游標像素位置偵測（mirror div + Selection API）
│   ├── canvas-manager.js        # Canvas 覆蓋層生命週期（Shadow DOM 包裹）
│   ├── particle-engine.js       # 粒子物件池 + requestAnimationFrame 動畫迴圈
│   ├── settings-bridge.js       # chrome.storage.onChanged 監聽橋接
│   └── effects/
│       ├── burst.js             # 💥 粒子爆發
│       ├── echo.js              # 🔤 文字迴響
│       ├── vortex.js            # 💫 漩渦吸入
│       ├── sparkle.js           # ⭐ 星光閃爍
│       ├── firefly.js           # ✨ 螢光漫舞
│       ├── confetti.js          # 🎊 紙花飄落
│       ├── bubble.js            # 🫧 泡泡飄浮
│       ├── frost.js             # ❄️ 冰霜結晶
│       ├── flame.js             # 🔥 火焰燃燒
│       ├── ripple.js            # 🌊 水波漣漪
│       ├── electric.js          # ⚡ 電流脈衝
│       └── diffuse.js           # 🌀 擴散漸層
├── shared/
│   └── constants.js             # 預設值、特效註冊表
└── prototype/                   # 獨立原型（不隨 Extension 發布）
    ├── index.html
    ├── prototype.js
    └── prototype.css
```

---

## 特效展示

| | |
|:---:|:---:|
| **💥 粒子爆發 (Burst)** | **🔤 文字迴響 (Echo)** |
| ![Burst](docs/gifs/burst.gif) | ![Echo](docs/gifs/echo.gif) |
| **💫 漩渦吸入 (Vortex)** | **⭐ 星光閃爍 (Sparkle)** |
| ![Vortex](docs/gifs/vortex.gif) | ![Sparkle](docs/gifs/sparkle.gif) |
| **✨ 螢光漫舞 (Firefly)** | **🎊 紙花飄落 (Confetti)** |
| ![Firefly](docs/gifs/firefly.gif) | ![Confetti](docs/gifs/confetti.gif) |
| **🫧 泡泡飄浮 (Bubble)** | **❄️ 冰霜結晶 (Frost)** |
| ![Bubble](docs/gifs/bubble.gif) | ![Frost](docs/gifs/frost.gif) |
| **🔥 火焰燃燒 (Flame)** | **🌊 水波漣漪 (Ripple)** |
| ![Flame](docs/gifs/flame.gif) | ![Ripple](docs/gifs/ripple.gif) |
| **⚡ 電流脈衝 (Electric)** | **🌀 擴散漸層 (Diffuse)** |
| ![Electric](docs/gifs/electric.gif) | ![Diffuse](docs/gifs/diffuse.gif) |

> 架構設計與十二種特效的演算法細節請參閱 [docs/implementation.zh_TW.md](docs/implementation.zh_TW.md)

---

## 特效介面規範與擴充方式

每個特效是一個獨立的 JavaScript 物件，必須實作以下介面：

```javascript
const MyEffect = {
  name: 'my-effect',           // 唯一識別碼（對應 EFFECT_REGISTRY）
  label: '我的特效',            // 顯示名稱（用於 Popup UI）
  icon: '🎨',                  // Popup 卡片圖示

  /**
   * 在游標位置 (x, y) 產生粒子
   * @param {number} x         - viewport X 座標
   * @param {number} y         - viewport Y 座標
   * @param {number} intensity - 強度倍率 0.1-1.0
   * @param {Function} acquire - 從物件池取得空閒粒子，回傳粒子物件或 null
   * @param {Object|null} context - { char, fontFamily, fontSize, fontWeight }
   */
  spawn(x, y, intensity, acquire, context) { ... },

  /**
   * 每幀更新一個粒子的狀態
   * @param {Object} p - 粒子物件
   */
  update(p) { ... },

  /**
   * 每幀繪製一個粒子
   * @param {CanvasRenderingContext2D} ctx
   * @param {Object} p - 粒子物件
   */
  render(ctx, p) { ... }
};
```

### 新增特效的步驟

1. 在 `content/effects/` 新增 JS 檔（如 `my-effect.js`），實作上述介面
2. 在 `shared/constants.js` 的 `EFFECT_REGISTRY` 陣列中加入名稱
3. 在 `manifest.json` 的 `content_scripts.js` 陣列中加入檔案路徑
4. 在 `content/content.js` 的 `EFFECTS` 物件中加入映射
5. 在 `popup/popup.html` 的 `effect-list` 中加入按鈕（含 `data-i18n` 屬性）
6. 在所有 `_locales/*/messages.json` 中加入翻譯 key
7. 在 `prototype/index.html` 中加入按鈕與 `<script>` 標籤
8. 在 `prototype/prototype.js` 的 `EFFECTS` 物件中加入映射

---

## 多國語系 (i18n)

使用 Chrome Extension 內建的 `chrome.i18n` API，自動根據瀏覽器語系顯示對應語言。

### 支援語言

| 語系代碼 | 語言 | 範例（螢光漫舞） |
|---|---|---|
| `en` | English（預設） | Firefly |
| `zh_TW` | 繁體中文 | 螢光漫舞 |
| `zh_CN` | 简体中文 | 萤光漫舞 |
| `ja` | 日本語 | 蛍の光 |
| `ko` | 한국어 | 반딧불이 |
| `es` | Español | Luciérnaga |

### 運作機制

- `manifest.json` 中的 `name` 和 `description` 使用 `__MSG_key__` 佔位符，Chrome 會自動替換為對應語系的翻譯
- `popup.html` 中的 UI 文字元素標記 `data-i18n="key"` 屬性，預設顯示英文
- `popup.js` 啟動時呼叫 `chrome.i18n.getMessage()` 逐一替換所有 `data-i18n` 元素的文字內容
- 翻譯檔位於 `_locales/{語系代碼}/messages.json`

### 新增語言的步驟

1. 在 `_locales/` 下建立語系資料夾（如 `_locales/fr/`）
2. 建立 `messages.json`，包含所有 key 的翻譯
3. 不需要修改任何 JS 或 HTML 程式碼

---

## 效能設計

| 設計 | 效能影響 |
|---|---|
| 物件池（300 粒子預分配） | 零記憶體分配、零 GC 壓力 |
| requestAnimationFrame 自動啟停 | 不打字時 CPU 使用率 0% |
| Canvas `display:none` | 不打字時零合成成本 |
| 事件節流 16ms | 每幀最多處理一次輸入 |
| 離屏 canvas 重複使用 | Diffuse 特效避免重複建立 |
| `willReadFrequently` 提示 | getImageData 使用 CPU 路徑，更快 |
| 大字體像素步長 ×2 | 邊緣偵測掃描量減少 75% |
| Closed Shadow DOM | 頁面 CSS 無法觸發重排 |
| 背景偵測 DOM 走訪 | 每次輸入一次 `getComputedStyle`，成本可忽略 |

典型快速打字場景（10 次/秒）：每幀渲染 ~100 個粒子，耗時約 0.5-1ms，遠在 16.6ms 幀預算內。

---

## 已知限制

| 限制 | 原因 |
|---|---|
| Google Docs / Sheets / Slides | 使用自定義 Canvas 渲染，不觸發標準 `input` 事件 |
| Closed Shadow DOM 內的輸入框 | 瀏覽器安全策略禁止外部存取 closed shadow root |
| Diffuse / Echo 特效在刪除鍵時不觸發 | `e.data` 為 `null`，無字元可渲染 |
| 某些高度自訂的富文字編輯器（如 Monaco Editor） | 可能使用非標準輸入機制 |
