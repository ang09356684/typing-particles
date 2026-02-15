# Typing Particles — 打字粒子特效

一個 Chrome Extension，在使用者於任何網頁的文字輸入框打字時，即時顯示粒子特效動畫。提供 12 種視覺風格供切換，支援多國語系（English / 繁中 / 簡中 / 日 / 韓 / 西班牙文），所有設定透過 Popup 面板操作，即時生效。

---

## 目錄

1. [功能總覽](#功能總覽)
2. [安裝與測試方式](#安裝與測試方式)
3. [檔案結構](#檔案結構)
4. [架構設計](#架構設計)
   - [整體資料流](#整體資料流)
   - [渲染層：全螢幕 Canvas 覆蓋層](#渲染層全螢幕-canvas-覆蓋層)
   - [游標位置偵測](#游標位置偵測)
   - [粒子引擎：物件池模式](#粒子引擎物件池模式)
   - [事件監聽策略](#事件監聽策略)
   - [設定同步機制](#設定同步機制)
5. [十二種特效的實作方式與演算法](#十二種特效的實作方式與演算法)
   - [特效 1：💥 粒子爆發 (Burst)](#特效-1-粒子爆發-burst)
   - [特效 2：🔤 文字迴響 (Echo)](#特效-2-文字迴響-echo)
   - [特效 3：💫 漩渦吸入 (Vortex)](#特效-3-漩渦吸入-vortex)
   - [特效 4：⭐ 星光閃爍 (Sparkle)](#特效-4-星光閃爍-sparkle)
   - [特效 5：✨ 螢光漫舞 (Firefly)](#特效-5-螢光漫舞-firefly)
   - [特效 6：🎊 紙花飄落 (Confetti)](#特效-6-紙花飄落-confetti)
   - [特效 7：🫧 泡泡飄浮 (Bubble)](#特效-7-泡泡飄浮-bubble)
   - [特效 8：❄️ 冰霜結晶 (Frost)](#特效-8-冰霜結晶-frost)
   - [特效 9：🔥 火焰上升 (Flame)](#特效-9-火焰上升-flame)
   - [特效 10：🌊 水波漣漪 (Ripple)](#特效-10-水波漣漪-ripple)
   - [特效 11：⚡ 電流脈衝 (Electric)](#特效-11-電流脈衝-electric)
   - [特效 12：🌀 擴散漸層 (Diffuse)](#特效-12-擴散漸層-diffuse)
6. [特效介面規範與擴充方式](#特效介面規範與擴充方式)
7. [多國語系 (i18n)](#多國語系-i18n)
8. [效能設計](#效能設計)
9. [已知限制](#已知限制)

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
│       ├── flame.js             # 🔥 火焰上升
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

## 架構設計

### 整體資料流

```
使用者按鍵
    │
    ▼
document 'input' 事件（capture phase）
    │
    ├─ 節流：16ms 內最多一次
    ├─ IME 過濾：composing 期間跳過
    │
    ▼
CaretDetector.detect(target)
    │
    ├─ <input>/<textarea> → Mirror Div 技術
    ├─ contenteditable    → Selection/Range API
    ├─ password           → 回傳 null（跳過）
    │
    ▼
取得游標 viewport 座標 { x, y }
    │
    ▼
組裝 context { char, fontFamily, fontSize, fontWeight }
    │
    ▼
ParticleEngine.spawn(x, y, intensity, context)
    │
    ├─ 呼叫當前特效的 spawn() → 從物件池 acquire 粒子
    ├─ 啟動 requestAnimationFrame 迴圈（如未運行）
    │
    ▼
每幀迴圈：
    ├─ CanvasManager.clear()
    ├─ 遍歷所有活躍粒子：
    │   ├─ effect.update(p)  → 更新位置、速度、透明度
    │   ├─ p.life++
    │   ├─ 若 life >= maxLife → 回收至物件池
    │   └─ effect.render(ctx, p) → 繪製到 Canvas
    └─ 粒子歸零 → 停止迴圈 + 隱藏 Canvas
```

### 渲染層：全螢幕 Canvas 覆蓋層

**檔案**：`content/canvas-manager.js`

```
┌─────────────────────────────────────┐
│ document.documentElement            │
│  ┌──────────────────────────────┐   │
│  │ Shadow Host (div)            │   │
│  │ position: fixed              │   │
│  │ z-index: 2147483647          │   │
│  │ pointer-events: none         │   │
│  │  ┌── closed Shadow DOM ──┐  │   │
│  │  │                       │  │   │
│  │  │  <canvas>             │  │   │
│  │  │  100vw × 100vh        │  │   │
│  │  │  display: none/block  │  │   │
│  │  │                       │  │   │
│  │  └───────────────────────┘  │   │
│  └──────────────────────────────┘   │
│                                     │
│  [頁面原本的 DOM]                    │
└─────────────────────────────────────┘
```

核心設計要點：

- **Closed Shadow DOM**：Canvas 被包裹在 closed shadow root 中，完全隔離，不受頁面 CSS（如 `canvas { display: none !important }`）干擾
- **`pointer-events: none`**：所有滑鼠事件穿透到底層頁面，使用者無感覺
- **`z-index: 2147483647`**：32-bit integer 最大值，確保粒子永遠在最上層
- **`display: none`**：無粒子時完全隱藏，省去瀏覽器合成（compositing）成本
- **`devicePixelRatio` 支援**：Canvas 物理像素設為 `viewport × dpr`，CSS 尺寸維持 viewport 大小，搭配 `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` 確保 Retina 螢幕下粒子清晰不模糊
- **resize 響應**：監聽 `window.resize` 事件，即時調整 Canvas 尺寸

### 游標位置偵測

**檔案**：`content/caret-detector.js`

這是整個專案中**最複雜的部分**，因為瀏覽器沒有提供直接取得游標像素座標的 API。針對不同輸入元素類型，使用不同策略：

#### 策略一：Mirror Div 技術（用於 `<input>` 和 `<textarea>`）

`<input>` 和 `<textarea>` 的游標位置無法透過 Selection API 取得，因此使用「鏡像 div」方法：

```
原始 <input>:  "Hello World|"   （| = 游標位置）
                                  ↑ 我們要知道這裡的像素座標

做法：
1. 建立一個隱藏的 <div>（mirror div），放在 DOM 中但 visibility: hidden
2. 將原始元素的 23 個排版相關 CSS 屬性複製到 mirror div：
   - 字型：fontFamily, fontSize, fontWeight, fontStyle, letterSpacing, ...
   - 間距：padding（上下左右）, border（上下左右）
   - 排版：boxSizing, direction, textAlign, whiteSpace, wordWrap, tabSize
3. 將 mirror div 的寬高設為與原始元素相同
4. 將游標前的文字放入 TextNode，游標後第一個字元放入 <span>（標記元素）
5. 對 <span> 呼叫 getBoundingClientRect() 取得其位置
6. 將 mirror div 座標系轉換回原始元素的 viewport 座標
7. 扣除原始元素的 scrollTop / scrollLeft（處理內容捲動）
```

```
Mirror Div 結構：
┌────────────────────────────────┐
│ TextNode("Hello World")       │
│ <span>下一個字元</span>  ← getBoundingClientRect()
│ TextNode(剩餘文字)            │
└────────────────────────────────┘
```

#### 策略二：Selection/Range API（用於 `contenteditable`）

`contenteditable` 元素的游標可直接透過瀏覽器原生 API 取得：

```javascript
const sel = window.getSelection();
const range = sel.getRangeAt(0).cloneRange();
range.collapse(true);  // 折疊到游標位置
const rect = range.getBoundingClientRect();  // 直接取得像素座標
```

邊界情況處理：
- **空的 contenteditable**：`getBoundingClientRect()` 會回傳全零。此時插入一個零寬空格 `\u200B` 的暫存 `<span>`，取得座標後立即移除，並還原 Selection

#### 策略三：跳過密碼欄位

偵測到 `<input type="password">` 時直接回傳 `null`，不產生任何粒子，避免洩漏密碼長度或輸入節奏等資訊。

### 粒子引擎：物件池模式

**檔案**：`content/particle-engine.js`

#### 為什麼用物件池？

每次按鍵會產生 2-18 個粒子物件。若使用 `new` 建立 + 自然 GC 回收，快速打字時會觸發頻繁的 Minor GC，造成微卡頓。物件池在初始化時一次性分配所有物件，之後只做狀態重設，**整個生命週期零記憶體分配、零 GC 壓力**。

#### 物件池運作方式

```
初始化：預分配 300 個粒子物件
┌─────────────────────────────────────────────┐
│ [idle] [idle] [idle] ... [idle]  ← 300 個  │
└─────────────────────────────────────────────┘

按鍵產生粒子：acquire() 找到第一個 idle 物件，標記 active
┌─────────────────────────────────────────────┐
│ [ACTIVE] [ACTIVE] [idle] ... [idle]         │
└─────────────────────────────────────────────┘

粒子生命結束：release() 標記回 idle（不刪除不 new）
┌─────────────────────────────────────────────┐
│ [idle] [ACTIVE] [idle] ... [idle]           │
└─────────────────────────────────────────────┘
```

#### 動畫迴圈的自動啟停

```
spawn() 被呼叫
    │
    ├─ activeCount > 0 且 rafId === null
    │       → 啟動 requestAnimationFrame 迴圈
    │
    ▼
_tick() 每幀執行：
    ├─ clear Canvas
    ├─ 遍歷 pool → update + render 每個 active 粒子
    ├─ life >= maxLife → release
    │
    └─ activeCount === 0？
            ├─ 是 → cancelAnimationFrame + 隱藏 Canvas（省電）
            └─ 否 → requestAnimationFrame(_tick) 繼續
```

#### 粒子物件結構

每個粒子物件包含以下欄位，所有特效共用：

| 欄位 | 型別 | 說明 |
|---|---|---|
| `active` | boolean | 是否正在使用中 |
| `x`, `y` | number | viewport 座標 |
| `vx`, `vy` | number | 速度向量（px/frame） |
| `size` | number | 基礎尺寸（px） |
| `life` | number | 已存活幀數 |
| `maxLife` | number | 最大壽命（幀） |
| `color` | string | CSS 顏色值 |
| `alpha` | number | 透明度 0-1 |
| `rotation` | number | 旋轉角度（radians） |
| `rotationSpeed` | number | 每幀旋轉量 |
| `scale` | number | 縮放倍率 |
| `custom` | object | 特效專用資料（每次 acquire 時重設為 `{}`） |

### 事件監聽策略

**檔案**：`content/content.js`

```javascript
document.addEventListener('input', _onInput, true);  // capture phase
```

選擇 `input` 事件而非 `keydown` 的理由：

| 比較 | `keydown` | `input` |
|---|---|---|
| Shift/Ctrl 等修飾鍵 | 會觸發 | 不會觸發 |
| 貼上文字 | 不觸發 | 觸發 |
| 自動完成選取 | 不觸發 | 觸發 |
| 語音輸入 | 不觸發 | 觸發 |
| IME 組字確認 | 需額外處理 | 自然觸發 |
| `e.data` 取得輸入字元 | 無（需查 keyCode） | 有 |

使用 **capture phase**（第三參數 `true`）確保即使頁面 JavaScript 在 bubble phase 呼叫 `e.stopPropagation()`，我們依然能攔截到事件。

**節流**：每 16ms 最多處理一次，對應 60fps 的一幀。超出的事件直接丟棄，避免快速打字時堆積過多粒子。

**IME 處理**：

```
compositionstart → _composing = true（開始組字，抑制粒子）
    |
使用者在 IME 中選字...（input 事件被 _composing 擋下）
    |
compositionend → _composing = false → 立即觸發一次 _onInput()
```

**Context 組裝**：

對於「擴散漸層」和「文字迴響」等需要知道具體字元的特效，`content.js` 在每次 input 事件中組裝 context：

```javascript
context = {
  char: e.data.slice(-1),                    // 最後輸入的字元
  fontFamily: computedStyle.fontFamily,       // 輸入框的字型
  fontSize: parseFloat(computedStyle.fontSize), // 字體大小（px）
  fontWeight: computedStyle.fontWeight         // 字重
};
```

### 設定同步機制

```
Popup 面板                    Content Script
┌──────────┐                  ┌──────────────┐
│ 使用者    │  chrome.storage  │ SettingsBridge│
│ 切換特效  │ ──── .sync.set ──→ .onChanged   │
│ 調整強度  │                  │  listener     │
│ 開/關     │                  │       │       │
└──────────┘                  │       ▼       │
                              │  套用新設定    │
                              │  切換 effect   │
                              └──────────────┘
```

- **儲存**：`chrome.storage.sync`（跨裝置同步，最大 100KB）
- **即時生效**：Content Script 透過 `chrome.storage.onChanged` 監聽，收到變更立即套用，無需重載頁面
- **無「儲存」按鈕**：Popup 中每個操作直接寫入 storage

---

## 十二種特效的實作方式與演算法

### 特效 1：💥 粒子爆發 (Burst)

**檔案**：`content/effects/burst.js`

**視覺效果**：按鍵時從游標位置向四面八方射出彩色圓形粒子，帶重力和摩擦力，像迷你煙火。

**演算法**：

```
spawn（每次按鍵觸發）:
  粒子數量 = floor((6 + random()*10) × intensity)  // 強度 0.5 時約 6-8 個
  對每個粒子:
    角度 = random() × 2π                    // 360° 隨機方向
    速度 = 2 + random() × 5                 // 2-7 px/frame
    vx = cos(角度) × 速度
    vy = sin(角度) × 速度
    大小 = 3 + random() × 5 px
    壽命 = 25-50 幀（約 0.4-0.8 秒）
    顏色 = 隨機選取 [金 #FFD700, 橙 #FF8C00, 白 #FFFFFF, 淺藍 #87CEEB]

update（每幀）:
    x += vx
    y += vy
    vy += 0.1                                // 重力加速度（向下）
    vx *= 0.98                               // 水平摩擦力
    vy *= 0.98                               // 垂直摩擦力
    alpha = 1 - (life / maxLife)             // 線性淡出

render:
    ctx.arc(x, y, size) 填充圓形
```

**物理模型**：簡化的 2D 拋體運動。重力常數 0.1 使粒子呈拋物線軌跡，摩擦係數 0.98 讓粒子不會飛太遠。

### 特效 2：🔤 文字迴響 (Echo)

**檔案**：`content/effects/echo.js`

**視覺效果**：輸入一個字後，出現 2-3 層**相同字形的放大輪廓**，像漣漪一樣一層層向外擴張並淡出。

**演算法**：

```
spawn:
  用 measureText 取得字元寬度 → 計算字元中心 = 游標x - 字寬/2
  層數 layers = max(2, floor(3 × intensity))
  顏色 = 隨機選取 [青, 紫, 金, 粉, 白]

  對每一層 i = 0, 1, 2:
    p.x, p.y = 字元中心
    p.size = 原始 fontSize
    p.custom.char = 輸入的字元
    p.custom.fontFamily = 輸入框字型
    p.custom.fontWeight = 輸入框字重
    p.custom.startDelay = i × 5               // 第一層立即，每層間隔 5 幀
    p.maxLife = 35-45 幀

update:
    if life < startDelay → 不動（等待出場）

    active = life - startDelay
    duration = maxLife - startDelay
    progress = active / duration

    scale = 1.05 + progress × 1.5             // 1.05× → 2.55× 線性放大

    alpha:
      progress < 0.1 → 快速淡入（0 → 0.7）
      progress ≥ 0.1 → 0.7 × (1 - t²)        // 二次方淡出

render:
    scaledSize = fontSize × scale
    ctx.font = "fontWeight scaledSizepx fontFamily"

    第一層：fillText（低透明度 alpha×0.15）    // 柔和背景光暈
    第二層：strokeText（完整透明度 alpha）      // 清晰字元輪廓
    lineWidth = max(1, 2 - scale×0.4)          // 越大線越細，更優雅
```

**漣漪效果的關鍵**：`startDelay = i × 5` 讓三層字元依序出場。視覺上形成由內向外擴散的波紋。

---

### 特效 3：💫 漩渦吸入 (Vortex)

**檔案**：`content/effects/vortex.js`

**視覺效果**：粒子從游標周圍生成，以螺旋軌跡旋轉收縮至中心，逐漸縮小消失，像小型黑洞吸入效果。

**演算法**：

```
spawn:
  粒子數量 = floor((6 + random()*8) × intensity)
  對每個粒子:
    初始角度 = random() × 2π
    初始距離 = 20 + random() × 30 px（在游標周圍環形分佈）
    位置 = 游標 + (cos(角度)×距離, sin(角度)×距離)
    旋轉速度 = 0.15 + random() × 0.1 rad/frame
    壽命 = 25-40 幀
    顏色 = [紫 #C084FC, 淺紫 #A78BFA, 靛 #818CF8, 青 #67E8F9, 粉紫 #F0ABFC, 白]

update:
    angle += spinSpeed                         // 持續旋轉
    dist *= 0.955                              // 每幀軌道半徑縮小 4.5%
    x = centerX + cos(angle) × dist            // 螺旋軌跡
    y = centerY + sin(angle) × dist
    scale = 1 - progress × 0.7                // 接近中心時縮小
    alpha = 1 - progress²                      // 二次方淡出

render:
    外層：大半徑圓形，低透明度 → 光暈
    內層：小半徑白色圓形 → 明亮核心
```

---

### 特效 4：⭐ 星光閃爍 (Sparkle)

**檔案**：`content/effects/sparkle.js`

**視覺效果**：在游標周圍出現四角星形粒子，帶旋轉，大小來回振盪產生閃爍感，緩緩上飄。

**演算法**：

```
spawn:
  粒子數量 = floor((4 + random()*6) × intensity)
  對每個粒子:
    位置 = 游標 ± random()*40 px（隨機散佈在游標附近）
    vy = -0.3 - random()*0.5                  // 微微上飄
    大小 = 5-11 px
    壽命 = 30-55 幀
    旋轉速度 = random() × 0.15 rad/frame
    phaseOffset = random() × 2π               // 閃爍相位（避免同步閃爍）
    顏色 = [白 #FFFFFF, 淺黃 #FFFACD, 淺藍 #87CEEB]

update:
    x += vx, y += vy
    rotation += rotationSpeed
    progress = life / maxLife
    scale = 0.5 + 0.5 × |sin(life × 0.3 + phaseOffset)|   // ← 閃爍的核心
    alpha = 1 - progress

render:
    四角星形 — 4 個外頂點 + 4 個內頂點交替連線
    外頂點：距中心 size×scale，每隔 90°
    內頂點：距中心 size×scale×0.3，在外頂點之間 45° 處
```

**閃爍原理**：`scale` 使用正弦函數 `|sin(life × 0.3 + phaseOffset)|` 產生 0.5 到 1.0 之間的週期性縮放。`phaseOffset` 讓每個粒子的閃爍節奏不同，避免所有星星同時放大/縮小。

**四角星繪製**：8 個頂點的多邊形，外頂點在 0°/90°/180°/270°，內頂點在 45°/135°/225°/315°，外半徑是內半徑的 3.3 倍（`0.3` 比例），形成尖銳的星形。

---

### 特效 5：✨ 螢光漫舞 (Firefly)

**檔案**：`content/effects/firefly.js`

**視覺效果**：黃綠色小光點從游標緩慢漂出，帶有隨機蜿蜒軌跡和明滅閃爍效果，像夜晚的螢火蟲。

**演算法**：

```
spawn:
  粒子數量 = floor((4 + random()*6) × intensity)
  對每個粒子:
    位置 = 游標 ± random()*16 px（散佈）
    vy = 微微向上漂移（-0.3 bias）
    速度 = 0.3 + random() × 0.8（慢速）
    大小 = 2-4 px
    壽命 = 40-70 幀（長壽命，悠閒節奏）
    顏色 = [金黃 #FBBF24, 黃綠 #A3E635, 淺綠 #BEF264, 淺金 #FDE68A, 嫩綠 #D9F99D]
    flickerSpeed = 0.15 + random() × 0.15
    phase = random() × 2π（各自閃爍節奏不同）

update:
    // 蜿蜒漫遊
    vx += sin(life × 0.07 + wanderPhase) × 0.04
    vy += cos(life × 0.09 + wanderPhase) × 0.03
    vx *= 0.97, vy *= 0.97

    // 明滅閃爍（sine 波控制）
    flicker = 0.5 + 0.5 × sin(life × flickerSpeed + phase)

    // 漸入漸出包絡線
    envelope:
      progress < 0.15 → 淡入
      0.15 - 0.7     → 全亮
      > 0.7          → 淡出
    alpha = flicker × envelope

render:
    外層：radial gradient 光暈（半徑 3 倍，低透明度）
    內層：白色小圓點（半徑 0.6 倍，高透明度）
```

**閃爍的關鍵**：`flicker × envelope` 雙重控制。`flicker`（sine 波）產生持續的明暗交替，`envelope` 控制整體生命週期的漸入漸出，兩者相乘產生自然的螢火蟲發光效果。

---

### 特效 6：🎊 紙花飄落 (Confetti)

**檔案**：`content/effects/confetti.js`

**視覺效果**：彩色長方形紙片向上噴射後受重力飄落，帶 3D 翻轉旋轉效果。

**演算法**：

```
spawn:
  粒子數量 = floor((5 + random()*8) × intensity)
  對每個粒子:
    vx = (random()-0.5) × 5                    // 左右隨機散射
    vy = -3 - random() × 4                     // 強力向上噴射
    寬度 = 3 + random() × 4 px
    高度 = 寬度 × (1.5 + random())              // 長方形
    壽命 = 35-55 幀（飄得比較久）
    顏色 = 8 色高飽和度調色盤隨機選取
    rotation = random() × 2π
    rotationSpeed = (random()-0.5) × 0.3
    phase = random() × 2π（3D 翻轉相位）

update:
    x += vx, y += vy
    vy += 0.15                                 // 重力（比 burst 強）
    vx *= 0.98                                 // 空氣阻力
    vx += sin(life × 0.1 + phase) × 0.1       // 左右搖擺
    rotation += rotationSpeed
    alpha = 1 - progress²                      // 後期快速淡出

render:
    translate(x, y) → rotate(rotation)
    scaleX = cos(life × 0.15 + phase)          // 3D 翻轉
    drawWidth = width × |scaleX|               // scaleX→0 時紙片變成一條線
    fillRect(-w/2, -h/2, w, h)
```

**3D 翻轉效果**：`cos(life × 0.15 + phase)` 讓寬度在正負間擺盪。取絕對值後，紙片會週期性地從正面→側面→正面翻轉，模擬紙片在空中翻滾的 3D 效果。

---

### 特效 7：🫧 泡泡飄浮 (Bubble)

**檔案**：`content/effects/bubble.js`

**視覺效果**：半透明彩色泡泡從游標往上飄浮，帶有光澤高光和輕微左右搖擺，結尾膨脹破裂。

**演算法**：

```
spawn:
  粒子數量 = floor((4 + random()*6) × intensity)
  對每個粒子:
    位置 = 游標 ± 10px
    vy = -1.5 - random() × 2                   // 向上飄浮
    大小 = 4-11 px
    壽命 = 30-55 幀
    顏色 = [青 #67E8F9, 紫 #A78BFA, 金 #FDE68A, 粉 #FCA5A5, 綠 #86EFAC, 桃 #F9A8D4]
    swayAmp = 0.3 + random() × 0.4

update:
    vx += sin(life × 0.12 + phase) × swayAmp × 0.1  // 搖擺
    vx *= 0.96
    vy *= 0.995                                 // 極微阻力

    // 破裂效果：最後 15% 生命膨脹後消失
    progress > 0.85:
      scale = 1 + (progress - 0.85) × 3        // 膨脹
      alpha = (1 - progress) / 0.15             // 快速淡出
    else:
      alpha = 0.7                               // 半透明

render:
    // 玻璃質感 radial gradient
    gradient 偏移中心（左上角偏亮）:
      stop 0: rgba(255,255,255,0.5)             // 高光
      stop 0.4: rgba(color, 0.25)               // 泡泡主色
      stop 1: rgba(color, 0.05)                 // 邊緣透明
    圓形輪廓描邊（rim）
    橢圓形白色高光（specular highlight）
```

---

### 特效 8：❄️ 冰霜結晶 (Frost)

**檔案**：`content/effects/frost.js`

**視覺效果**：六角/四角冰晶從游標散射而出，帶分支結構、旋轉，逐漸縮小消失。

**演算法**：

```
spawn:
  粒子數量 = floor((5 + random()*6) × intensity)
  對每個粒子:
    角度 = random() × 2π
    速度 = 1 + random() × 2.5
    大小 = 4-9 px
    壽命 = 25-45 幀
    顏色 = [白 #FFFFFF, 冰藍 #E0F2FE, 淺藍 #BAE6FD, 天藍 #7DD3FC, 青 #67E8F9]
    rotationSpeed = (random()-0.5) × 0.08
    spokes = 6 或 4（隨機選擇六角或四角）

update:
    x += vx, y += vy
    vx *= 0.95, vy *= 0.95                     // 減速
    rotation += rotationSpeed
    scale *= 0.985                              // 逐漸縮小
    alpha = 1 - progress                        // 線性淡出

render:
    對每個 spoke（6 或 4 條）:
      從中心向外畫主幹線段（長度 = size × scale）
      在主幹 60% 處畫兩條分支（長度 = 35% 主幹，±0.5 rad 角度）
    lineCap = 'round', lineWidth = 1.2
```

**結晶形狀**：每條 spoke 由一條主幹 + 兩條分支組成，6 條 spoke 等角分佈形成雪花圖案。4-spoke 變體則形成十字結晶。分支在主幹 60% 位置，角度 ±0.5 rad（約 ±29°），近似真實雪花的分支角度。

---

### 特效 9：🔥 火焰上升 (Flame)

**檔案**：`content/effects/flame.js`

**視覺效果**：從游標位置產生火焰粒子，向上飄升並左右搖曳，顏色隨生命週期從亮黃漸變到暗紅，逐漸縮小消失。

**演算法**：

```
spawn:
  粒子數量 = floor((8 + random()*10) × intensity)
  對每個粒子:
    位置 = 游標 x ± 7px, y = 游標 y
    vy = -2.5 - random()*3.5                  // 強力向上
    vx = ± random()*1.5                       // 初始水平偏移
    大小 = 6-12 px
    壽命 = 30-55 幀

update:
    x += vx, y += vy
    vx += (random()-0.5) × 0.2               // 隨機水平搖曳
    vx *= 0.95                                // 搖曳阻尼
    size *= 0.97                              // 每幀縮小 3%
    progress = life / maxLife
    alpha = 1 - progress²                     // 二次方淡出（前期幾乎不淡）

    顏色依 progress 階段切換:
        0%  - 25%  → #FFFF80 亮黃
        25% - 50%  → #FFA500 橙色
        50% - 75%  → #FF4500 紅橙
        75% - 100% → #8B0000 暗紅

render:
    建立 RadialGradient(中心→邊緣):
      stop 0: 當前顏色（實心）
      stop 1: rgba(0,0,0,0)（透明）
    填充圓形 — 產生柔和的發光球效果
```

**搖曳演算法**：每幀對 `vx` 加一個 `[-0.1, +0.1]` 的隨機擾動，再乘以 0.95 的阻尼。這創造了類似布朗運動的自然搖擺，不會累積成單方向漂移。

**顏色演化**：模擬火焰從核心（最熱）到外圍（最冷）的光譜變化。離散的四階段切換在快速動畫中視覺上等同於漸變。

**徑向漸層**：每個粒子用 `createRadialGradient` 畫一個中心實色、邊緣透明的圓，產生「發光球」外觀，比實心圓更像真實火焰。

### 特效 10：🌊 水波漣漪 (Ripple)

**檔案**：`content/effects/ripple.js`

**視覺效果**：從游標擴散出同心圓波紋，像水面被觸碰一樣，由淺青漸變為藍色，線條逐漸變細。

**演算法**：

```
spawn:
  粒子數量 = floor((2 + random()*2) × intensity)  // 2-3 個波紋環
  對每個粒子 i:
    位置 = 游標（不偏移）
    大小 = 2 + i × 3（錯開初始半徑）
    壽命 = 25-40 幀
    expandSpeed = 1.2 + random() × 0.8 px/frame
    delay = i × 4 幀（逐層延遲出現）

update:
    if life < delay → alpha = 0（等待出場）
    else:
      size += expandSpeed                       // 持續擴大
      alpha = 1 - activeProgress²               // 二次方淡出
      顏色依進度：青 #67E8F9 → 藍 #38BDF8 → 深藍 #3B82F6

render:
    ctx.arc 描邊圓形（不填充）
    lineWidth = max(0.5, 2 - progress × 1.5)   // 越遠越細
```

---

### 特效 11：⚡ 電流脈衝 (Electric)

**檔案**：`content/effects/electric.js`

**視覺效果**：從游標射出 2-3 條隨機鋸齒閃電，明亮青白色，極短壽命，帶電弧抖動效果。

**演算法**：

```
spawn:
  粒子數量 = floor((2 + random()*2) × intensity)
  對每條閃電:
    生成折線路徑：從 (0,0) 出發，5-8 段
    每段長 8-15 px
    方向 = 前一段方向 ± random() × 60°
    起始角度完全隨機（360°）
    壽命 = 8-15 幀（極短）
    顏色 = [白 #FFFFFF, 淺青 #67E8F9, 冰青 #A5F3FC, 冰藍 #E0F2FE]

update:
    不移動（閃電是瞬間的）
    alpha 線性快速衰減
    每幀對路徑每個節點加 ±1px 隨機擾動（電弧抖動）

render:
    底層：lineWidth=4, alpha×0.3, 同色 → 光暈
    上層：lineWidth=1.5, alpha, 白色 → 明亮核心
    moveTo/lineTo 畫折線, lineCap='round', lineJoin='round'
    在折線節點隨機畫小圓點 → 火花
```

**鋸齒路徑生成**：每段方向在前一段基礎上 ±60° 隨機偏轉，產生自然的鋸齒形。段長 8-15px 的隨機性讓每條閃電都獨一無二。

**雙層渲染**：底層寬線低透明度模擬光暈擴散，上層細線高亮度形成閃電核心，兩層疊加產生真實的電弧視覺。

---

### 特效 12：🌀 擴散漸層 (Diffuse)

**檔案**：`content/effects/diffuse.js`

**視覺效果**：粒子沿著剛輸入的字元的**實際輪廓邊緣**向外擴散。例如輸入「A」，粒子會從 A 的三角輪廓向外飛散。

**這是十二種特效中演算法最複雜的**，涉及離屏渲染和邊緣偵測。

**演算法（三階段）**：

#### 階段一：離屏渲染取得字元像素

```
1. 建立一個隱藏的 <canvas>（offscreen），大小 = fontSize × 2.5
2. 設定與輸入框相同的 font（family, size, weight）
3. 在 canvas 正中央用 fillText 繪製該字元
4. 用 measureText 取得字元實際寬度（用於定位）
```

#### 階段二：邊緣偵測演算法

```
5. 呼叫 getImageData 取得整個 canvas 的像素陣列
6. 逐像素掃描（大字體時 step=2 加速）：
   對每個像素 (x, y):
     if alpha[x,y] < 50 → 跳過（不是字元的一部分）
     檢查四鄰域：
       top    = alpha[x, y-1]
       bottom = alpha[x, y+1]
       left   = alpha[x-1, y]
       right  = alpha[x+1, y]
     if 任一鄰居 alpha < 50 → 這是邊緣像素！記錄 (x - cx, y - cy)

結果：得到一組相對於字元中心的邊緣座標陣列
```

```
例：字元 "A" 的邊緣偵測結果（概念圖）

     ·  ·
    · ·· ·
   ·  ··  ·
  · ······ ·
 ·  ·    ·  ·
·  ·      ·  ·

· = 邊緣像素（內部填充像素和外部空白像素不計入）
```

#### 階段三：粒子產生與動畫

```
7. 從邊緣像素中均勻取樣 12-30 個點
8. 對每個取樣點:
     螢幕座標 = (游標x - 字寬/2 + edge.x, 游標y + edge.y)
     速度方向 = normalize(edge.x, edge.y) × (0.5 + random())
               ↑ 從字元中心指向邊緣點的方向 = 向外法線

update:
    x += vx, y += vy
    vx *= 0.97, vy *= 0.97                    // 減速
    scale:
      progress < 0.3 → 1 + progress×2         // 前 30%：微微脹大
      progress ≥ 0.3 → (1-progress) × 1.8     // 後 70%：縮小消失
    alpha = (1-progress)² × 0.9                // 二次方淡出

render:
    RadialGradient 發光球，顏色從實心到透明邊緣
    顏色 = 隨機 [紫 #A78BFA, 青 #67E8F9, 金 #FDE68A, 粉 #F9A8D4, 白 #FFFFFF]
```

**效能考量**：
- offscreen canvas 只建立一次，之後重複使用
- `getContext('2d', { willReadFrequently: true })` 提示瀏覽器使用 CPU 而非 GPU 後端，加速 `getImageData`
- 大字體（>30px）時掃描步長設為 2，將像素掃描量減少 75%

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

典型快速打字場景（10 次/秒）：每幀渲染 ~100 個粒子，耗時約 0.5-1ms，遠在 16.6ms 幀預算內。

---

## 已知限制

| 限制 | 原因 |
|---|---|
| Google Docs / Sheets / Slides | 使用自定義 Canvas 渲染，不觸發標準 `input` 事件 |
| Closed Shadow DOM 內的輸入框 | 瀏覽器安全策略禁止外部存取 closed shadow root |
| Diffuse / Echo 特效在刪除鍵時不觸發 | `e.data` 為 `null`，無字元可渲染 |
| 某些高度自訂的富文字編輯器（如 Monaco Editor） | 可能使用非標準輸入機制 |
