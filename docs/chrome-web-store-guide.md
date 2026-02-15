# Chrome Web Store 上架指南 — TypeSpark Extension

本文件包含將 TypeSpark 擴充功能上架至 Chrome Web Store 所需的所有資訊，包括圖片資產需求、商店說明文字、隱私聲明，以及逐步上架流程。

---

## 1. 圖片資產需求

| 資產 | 尺寸 | 格式 | 必要 | 說明 |
|---|---|---|---|---|
| Extension Icon | 128×128 px | PNG | 是 | 已有 `icons/icon128.png` |
| 截圖 (Screenshots) | 1280×800 或 640×400 px | PNG/JPG | 是（1–5 張） | 需自行截圖 |
| 小型宣傳圖 (Small Promo) | 440×280 px | PNG/JPG | 是 | 需自行製作 |
| 大型宣傳圖 (Marquee) | 1400×560 px | PNG/JPG | 否 | 推薦製作 |

### 1.1 截圖建議內容

1. **截圖 1** — 在 Google 搜尋框打字展示 Burst 特效
2. **截圖 2** — Popup 設定面板（12 種特效一覽）
3. **截圖 3** — 展示 2–3 種不同特效的拼接圖
4. **截圖 4** — 在深色背景網頁（如 GitHub）中展示特效
5. **截圖 5** — 在 textarea 中展示多行打字特效

### 1.2 宣傳圖建議

- 使用 icon + 擴充功能名稱 + 3–4 種特效 GIF 截圖拼貼
- 現有 `docs/gifs/` 中的 12 張 GIF 可作為素材來源

---

## 2. 商店說明文字

### 2.1 English Description（預設語系）

```
TypeSpark — Add stunning particle effects to your typing experience!

Every keystroke triggers beautiful particle animations right at your cursor. Choose from 12 unique visual effects:

💥 Burst · 🔤 Text Echo · 💫 Vortex · ⭐ Sparkle · ✨ Firefly · 🎊 Confetti
🫧 Bubble · ❄️ Frost · 🔥 Flame · 🌊 Ripple · ⚡ Electric · 🌀 Diffuse

Features:
• 12 unique particle effects with distinct visual styles
• Adjustable intensity (0.1 – 1.0)
• One-click enable/disable toggle
• Works on all websites — input fields, textareas, and contenteditable elements
• Smart background detection — effects auto-adapt to light/dark input fields
• Privacy-first — never activates on password fields
• IME-friendly — supports CJK input methods (Zhuyin, Pinyin, etc.)
• Multi-language UI — English, 繁體中文, 简体中文, 日本語, 한국어, Español
• Zero interference — canvas overlay uses pointer-events:none
• Lightweight — object pool design, 0% CPU when idle
• Settings sync across devices via Chrome Storage

Just install, open any webpage, and start typing!
```

### 2.2 繁體中文 Description（zh_TW 語系提交或備註用）

```
TypeSpark — 為你的打字體驗加上絢麗的粒子動畫！

每次按鍵都會在游標旁觸發精美的粒子動畫。提供 12 種獨特視覺特效：

💥 粒子爆發 · 🔤 文字迴響 · 💫 漩渦吸入 · ⭐ 星光閃爍 · ✨ 螢光漫舞 · 🎊 紙花飄落
🫧 泡泡飄浮 · ❄️ 冰霜結晶 · 🔥 火焰燃燒 · 🌊 水波漣漪 · ⚡ 電流脈衝 · 🌀 擴散漸層

功能特色：
• 12 種獨特粒子特效，風格各異
• 可調整粒子強度（0.1 – 1.0）
• 一鍵開關
• 支援所有網站 — input、textarea、contenteditable
• 智慧背景偵測 — 自動適應淺色/深色輸入框
• 隱私保護 — 密碼欄位自動跳過
• IME 友善 — 支援注音、拼音等輸入法
• 多國語系介面 — English、繁體中文、简体中文、日本語、한국어、Español
• 零干擾 — Canvas 覆蓋層不影響頁面互動
• 輕量高效 — 物件池設計，閒置時 CPU 使用率 0%
• 設定跨裝置同步

安裝後開啟任意網頁，開始打字即可體驗！
```

---

## 3. 分類與標籤

- **Category**: Fun（娛樂）
- **Language**: English（預設），並標示支援 6 種語系：
  - English, 繁體中文 (zh_TW), 简体中文 (zh_CN), 日本語 (ja), 한국어 (ko), Español (es)

---

## 4. 隱私聲明

| 欄位 | 內容 |
|---|---|
| **Single Purpose** | Displays particle animations at the text cursor when the user types in input fields. |
| **Permissions — `storage`** | 用於儲存使用者的特效偏好設定（效果類型、強度、開關狀態），並透過 Chrome Storage Sync 跨裝置同步。 |
| **Data Collection** | 不蒐集任何使用者資料（No user data collected）。 |
| **Host Permissions — `<all_urls>`** | 需要在所有頁面注入 content script 才能偵測輸入事件並顯示粒子特效。 |
| **Remote Code** | 不使用任何遠端程式碼（No remote code used）。 |

> **填寫 Privacy Practices 時勾選：**
> - "I do not sell, transfer or use data for purposes unrelated to my item's single purpose"
> - "I do not sell, transfer or use data for determining creditworthiness or for lending purposes"

---

## 5. 逐步上架流程

### Step 1：註冊開發者帳號

1. 前往 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. 使用 Google 帳號登入
3. 支付一次性開發者註冊費 **$5 USD**
4. 同意開發者服務條款

### Step 2：建立新項目

1. 在 Developer Dashboard 點選 **「+ New Item」**
2. 上傳打包好的 ZIP 檔：`typing-particles-v1.0.0.zip`
3. 上傳成功後會進入項目編輯頁面

### Step 3：填寫商店資訊 (Store Listing)

1. **Language**: 選擇 English（預設語系）
2. **Name**: `TypeSpark`（會從 manifest.json 自動帶入）
3. **Description**: 貼上本文件 [2.1 English Description](#21-english-description預設語系) 的內容
4. **Category**: 選擇 **Fun**
5. **Language**: 標示支援的語系（上傳 ZIP 後系統會自動偵測 `_locales/` 中的語系）

### Step 4：上傳圖片資產

1. **Icon**: 系統會從 ZIP 中的 `icons/icon128.png` 自動擷取
2. **Screenshots**: 上傳 1–5 張截圖（1280×800 或 640×400 px）
3. **Small Promo Tile**: 上傳 440×280 px 宣傳圖
4. **Marquee Promo Tile**（選填）: 上傳 1400×560 px 大型宣傳圖

### Step 5：填寫隱私權 (Privacy Practices)

1. **Single Purpose Description**: 填入本文件 [第 4 節](#4-隱私聲明) 的 Single Purpose 內容
2. **Permission Justifications**:
   - `storage`: 填入 "Stores user preferences for effect type, intensity, and enabled state. Syncs settings across devices via Chrome Storage Sync."
   - `<all_urls>` (host permission): 填入 "Injects a content script to detect typing events in input fields on all web pages and display particle animations at the cursor position."
3. **Data Usage**:
   - 勾選 "I do not sell, transfer or use data for purposes unrelated to my item's single purpose"
   - 勾選 "I do not sell, transfer or use data for determining creditworthiness or for lending purposes"
4. **Data Collection Disclosure**: 選擇 **No** — 不蒐集任何使用者資料

### Step 6：設定發佈範圍 (Distribution)

1. **Visibility**: 選擇 **Public**（公開）
2. **Distribution**: 選擇 **All regions**（所有地區）

### Step 7：提交審核

1. 檢查所有欄位填寫完成（頁面上方會顯示完成度）
2. 點選 **「Submit for Review」**
3. 審核通常需要 **1–3 個工作天**（首次提交可能稍久）
4. 審核結果會以 email 通知

### Step 8：審核通過後

- 擴充功能會自動發佈到 Chrome Web Store
- 可在 Developer Dashboard 查看安裝數、評分等統計資料
- 後續更新只需上傳新 ZIP 並增加 `manifest.json` 中的 `version` 號

---

## 6. 上傳用 ZIP 檔案

- **檔案名稱**: `typing-particles-v1.0.0.zip`
- **位置**: 專案上層目錄（`typing-particles/` 的 parent）
- **包含內容**:
  - `manifest.json`
  - `_locales/` (en, zh_TW, zh_CN, ja, ko, es)
  - `icons/` (icon16, icon32, icon48, icon128)
  - `popup/` (popup.html, popup.css, popup.js)
  - `content/` (content.js, canvas-manager.js, caret-detector.js, particle-engine.js, settings-bridge.js, effects/*.js)
  - `shared/` (constants.js)
- **排除內容**: node_modules, package.json, package-lock.json, scripts, prototype, docs, README, .git, .gitignore

---

## 7. 常見問題

### Q: 審核被拒怎麼辦？
常見拒絕原因與對策：
- **Permission too broad**: 在 justification 中詳細說明為何需要 `<all_urls>`
- **Missing privacy policy**: 若被要求提供，可建立一個簡單的 GitHub Pages 隱私政策頁面
- **Screenshots不符**: 確認截圖尺寸為 1280×800 或 640×400 px

### Q: 如何發佈更新？
1. 修改 `manifest.json` 中的 `version`（例如 `1.0.0` → `1.0.1`）
2. 重新打包 ZIP
3. 在 Developer Dashboard 點選 **「Package」** → **「Upload new package」**
4. 上傳新 ZIP 並提交審核

### Q: 如何新增語系的商店說明？
在 Developer Dashboard 的 Store Listing 頁面，點選 **「Add language」** 可逐一新增各語系的 Name 與 Description。
