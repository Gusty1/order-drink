# AGENTS.md — order-drink

> AI 代理協作指南。說明此專案的結構、慣例與 AI 代理在修改程式碼時需遵守的規則。

---

## 專案概述

辦公室訂飲料系統。React 前端 + Express 後端，前後端同源部署於 Docker，透過 Socket.IO 實現即時訂單同步。

**技術棧：** React 19 · Vite 8 · Express 5 · RethinkDB · Socket.IO 4 · Ant Design 6 · Zustand 5

**部署：** Docker multi-stage build，前後端同源，port 5918

---

## 目錄結構

```
order-drink/
├── server.js                  # 後端：Express + RethinkDB + Socket.IO（單一檔案，~295 行）
├── src/
│   ├── App.jsx                # 根元件：ConfigProvider + Ant Design 主題 + message API
│   ├── index.jsx              # Entry point
│   ├── components/
│   │   ├── MyLayout/          # 頁面佈局容器，負責 setUser() 初始化 + BackTop
│   │   ├── MyHeader/          # Header + 暗色模式切換按鈕
│   │   ├── MyContent/         # 主內容容器 + 管理員驗證 Modal
│   │   │   ├── FoodMenu/      # 菜單圖片（從遠端 JSON 動態取店家清單）
│   │   │   ├── OrderForm/     # 訂單表單（新增 / 編輯）
│   │   │   └── OrderTable/    # 訂單列表 + Socket.IO 連線管理
│   │   └── MyFooter/          # 頁腳
│   ├── stores/
│   │   ├── orderStore/        # 單筆訂單 state（目前選中 / 編輯中的訂單）
│   │   └── settingStore/      # UI 設定（darkMode），persist 至 localStorage
│   ├── services/
│   │   ├── axios/             # axiosClient 設定
│   │   ├── rethinkDB/         # HTTP API client（命名具誤導性，實為前端 API 呼叫層）
│   │   └── user/              # localStorage user 管理（nanoid 生成 ID）
│   ├── constants/             # defaultSetting / defaultThemeSet
│   └── utils/
│       └── env.js             # 讀取 window._env_（runtime 注入的環境變數）
├── public/                    # 靜態資源（favicon、manifest）
├── build/                     # Vite 打包輸出（gitignore 中但 Docker 使用）
├── Dockerfile                 # multi-stage build
├── docker-compose.yaml        # RethinkDB + app 服務
└── .env                       # 本地開發用環境變數（不提交）
```

---

## 資料流

```
瀏覽器
  └─ React UI
       ├─ axios (HTTP)  →  Express API  →  RethinkDB
       └─ Socket.IO     ←  Express (changeStream emit)
```

菜單資料來源：`https://gusty1.github.io/Database/order-drink/storeMenus.json`（外部 GitHub Pages，不在本 repo 管理）

---

## 環境變數

透過 `window._env_` 於 runtime 注入（`src/utils/env.js`），Docker 由 `environment` 欄位傳入，本地開發由 `.env` 讀取。

| 變數 | 說明 | 預設值 |
|------|------|--------|
| `REACT_APP_TITLE` | 頁面標題 | `測試用的標題` |
| `REACT_APP_STORE_NAME` | 預設店家（對應 storeMenus.json value） | `迷客夏` |
| `REACT_APP_DISABLED_MENU` | 是否鎖定菜單選擇 | `false` |
| `REACT_APP_ADMIN_PASSWORD` | 管理員密碼（前端可見，刻意設計） | `''` |
| `SERVER_PORT` | 後端 port | `5918` |
| `RETHINKDB_HOST` | RethinkDB host | `localhost` |
| `RETHINKDB_PORT` | RethinkDB port | `28015` |

---

## API 端點

| Method | Path | 說明 |
|--------|------|------|
| `GET` | `/getTodayOrders` | 取得今日所有訂單（UTC 日期過濾） |
| `POST` | `/setOrder` | 新增（無 id）或更新（有 id）訂單 |
| `DELETE` | `/deleteOrder/:id` | 刪除指定訂單 |
| `GET` | `/getOrder/:id` | 取得單筆訂單 |

所有資料庫錯誤於後端 console.error，僅回傳通用訊息給前端，不洩漏 DB 內部資訊。

---

## 程式碼慣例

### 一般原則

- **不可變更新**：Zustand store 一律用 `set({...})` 回傳新物件，不直接 mutate state
- **命名規範**：元件 PascalCase，函式 camelCase，常數 UPPER_SNAKE_CASE
- **PropTypes**：所有接受 props 的元件均需定義 `ComponentName.propTypes`
- **錯誤處理**：async 函式一律包 try/catch，UI 顯示友善訊息，console.error 記錄詳情
- **魔術數字**：用具名常數取代（範例：`RELOAD_DELAY_MS = 800`）

### React 慣例

- **模組頂層初始化**：`getEnv()`、Layout 元件解構（如 `const { Content } = Layout`）放在元件函式外，只執行一次
- **useMemo**：`columns`（OrderTable）、`imageHeight`（FoodMenu）等重複計算需用 `useMemo`
- **useRef 解決 stale closure**：Socket.IO callback 內讀取最新 state 用 `useRef`（見 OrderTable `orderRef`）
- **useEffect cleanup**：Socket.IO 連線必須在 cleanup 中 `socket.off()` + `socket.disconnect()`

### 後端慣例

- 所有 API handler 使用 `validateOrder()` 驗證輸入，回傳 400 含具體錯誤訊息
- RethinkDB 操作失敗回傳 500 含通用訊息（不洩漏 DB 細節）
- changeStream 錯誤（cursor error / catch）5 秒後自動重試 `watchTableChanges()`

---

## 設計決策（已確認，請勿修改）

| 項目 | 決策 |
|------|------|
| CORS `origin: '*'` | 純內網部署，允許所有來源，風險可接受 |
| 管理員密碼前端可見 | 刻意設計：管理員密碼由當天負責訂飲料的人持有，純內網使用 |
| RethinkDB port 暴露 | 純內網環境，風險可接受 |
| `services/rethinkDB/` 命名 | 歷史命名，實為 HTTP API client，技術債，未來可重命名為 `services/api/` |
| `setUser()` 放在 MyLayout | 歷史決策，技術債，未來可移至 App.jsx 頂層 |

---

## 修改指南

### 新增 API 端點

1. 在 `server.js` 新增 route，驗證輸入後操作 RethinkDB
2. 在 `src/services/rethinkDB/rethinkDB.js` 新增對應的 axios 呼叫
3. 若需要在 barrel file 匯出，更新 `src/services/index.js`

### 新增元件

1. 在 `src/components/` 下建立 `元件名/元件名.jsx`（PascalCase）
2. 若有對應 CSS，建立 `元件名/元件名.css`
3. 在 `src/components/index.js` barrel file 加入匯出（若需全域使用）
4. 必須定義 PropTypes

### 修改菜單資料

菜單資料由外部 JSON 維護：`https://gusty1.github.io/Database/order-drink/storeMenus.json`

格式：
```json
[
  { "value": "迷客夏", "label": "迷客夏", "url": "https://..." },
  ...
]
```

本 repo 不包含菜單資料，請至 Database repo 修改。

### 修改主題 / 樣式

- Ant Design 主題 token：`src/constants/defaultThemeSet.js`
- 暗色模式判斷：`settingStore().setting.darkMode`（已透過 Zustand persist 儲存）
- 選中行 CSS class：`selected-row`（亮色）/ `selected-row-dark`（暗色），定義於 `OrderTable.css`

---

## 已知技術債（低優先，維持現狀）

- `services/rethinkDB/` 命名誤導，未來可重命名為 `services/api/`
- `MyLayout` 負責 `setUser()` 初始化，職責略混雜
- `MyContent` 包含管理員驗證 Modal 邏輯，可抽出 `AdminAuthModal` 元件
- `OrderTable` 職責過重（Socket.IO 連線 + 資料取得 + 列表渲染），可抽出 `useOrderSocket` hook
- 目前無任何測試，建議優先為 `validateOrder`、`getUser/setUser`、`orderStore` 補充單元測試

---

## 禁止操作

- 不可將 `REACT_APP_ADMIN_PASSWORD` 或其他 secret 提交至 git
- 不可在 `validateOrder()` 以外的地方直接 insert 未驗證資料
- 不可在生產環境 commit `console.log` 偵錯輸出（`console.error` 保留）
- 不可更改 CORS 為更嚴格設定，除非明確討論過（內網部署有特殊需求）
- 不可在未確認前刪除或重命名 `src/services/rethinkDB/`（多處 import 依賴此路徑）
