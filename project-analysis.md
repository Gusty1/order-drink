# 專案分析報告
> 生成日期：2026-03-27 | 最後更新：2026-04-17（移除本地圖片資產，改為遠端 JSON；移除 scrapy 工具與 workflow）

## 總體評估

整體架構清晰，前後端分離明確，採用 Zustand 管理狀態、Socket.IO 實現即時同步，技術選型現代且合理。主應用程式、爬蟲工具與 GitHub Actions workflow 的所有可修復問題均已處理完畢。目前清單中無任何待修復問題，僅剩設計決策紀錄。

---

## 設計決策紀錄

以下為已評估後決定維持現狀的設計決策，不列為待修復問題。

| 項目 | 說明 | 決策理由 |
|------|------|----------|
| `server.js` CORS `origin: '*'` | 允許任意來源存取 API，未限縮至特定 origin | 本專案僅供工廠/公司內網部署，無對外開放需求。若未來有外網暴露，應改回條件式 origin 驗證（僅允許同源與 localhost:5917） |
| `.gitignore` 中 `.env` 被注釋 | `REACT_APP_ADMIN_PASSWORD` 理論上可被提交 | 管理員密碼功能是讓當天負責點飲料的人持有，前端本就可見，屬於刻意設計。純內網使用，風險可接受 |
| RethinkDB port 9000/28015 暴露 | 管理介面與 DB 連線 port 暴露至 host | 純內網環境，port 8080 已對應至 9000 避免明顯暴露，風險可接受 |
| `tools/scrapy/storeAndUrl.json` 鮮茶道使用 http | `http://www.presotea.com.tw/menu.php` 為明文 HTTP | 已隨 scrapy 工具一同移除，不再適用 |
| `tools/scrapy/scrapy_store_menu.py` path traversal 防禦 | `get_output_path()` 未驗證商家名稱是否含路徑字元 | 已隨 scrapy 工具一同移除，不再適用 |

---

## 問題清單

### CRITICAL

無 CRITICAL 等級問題。

### HIGH

無 HIGH 等級問題。

### MEDIUM

無 MEDIUM 等級問題。

### LOW

無 LOW 等級問題。

---

## 架構分析

### 主應用程式模組結構

```
order-drink/
├── server.js                # 後端：Express + RethinkDB + Socket.IO（單一檔案，約 295 行，合理）
├── src/
│   ├── App.jsx              # 根元件：ConfigProvider + 主題（職責清晰）
│   ├── index.jsx            # Entry point
│   ├── components/
│   │   ├── MyLayout/        # 頁面佈局容器 + user 初始化 + BackTop（職責略混雜）
│   │   ├── MyHeader/        # Header + 暗色模式切換（職責清晰）
│   │   ├── MyContent/       # 主內容容器 + 管理員驗證邏輯（職責略重）
│   │   │   ├── FoodMenu/    # 菜單圖片顯示（從遠端 JSON 動態取店家清單）
│   │   │   ├── OrderForm/   # 訂單表單
│   │   │   └── OrderTable/  # 訂單列表 + Socket.IO 連線（職責過重）
│   │   └── MyFooter/        # 頁腳（簡單）
│   ├── stores/
│   │   ├── orderStore/      # 單筆訂單 state（正在編輯的那筆）
│   │   └── settingStore/    # UI 設定（darkMode 等）
│   ├── services/
│   │   ├── axios/           # axiosClient 設定
│   │   ├── rethinkDB/       # API 呼叫層（命名具誤導性，實為 HTTP client）
│   │   └── user/            # localStorage user 管理
│   ├── constants/           # 靜態設定（storeNames 已移除，改為遠端 fetch）
│   └── utils/               # env 工具函式
└── （tools/scrapy 與 .github/workflows/getDrinkMenu.yml 已移除）
    # 菜單資料改由 Database repo 的 GitHub Pages 提供
    # https://gusty1.github.io/Database/order-drink/storeMenus.json
```

**評估：**

整體結構清晰，層次分明。菜單圖片資產已從本地移除，改由外部 GitHub Pages JSON 動態提供，未來新增或修改店家菜單只需更新 Database repo，無需重新打包本專案。

`services/rethinkDB/rethinkDB.js` 命名具有誤導性：此層實際上是前端的 HTTP API client，與 RethinkDB 無直接關係，更好的命名應為 `services/api/orderApi.js`。

`MyLayout` 同時負責佈局渲染與使用者初始化（`setUser()`），職責略微混雜，`setUser()` 更適合放在 `App.jsx` 的頂層 effect 中。

`MyContent` 同時負責佈局容器與管理員驗證邏輯，可考慮抽出 `AdminAuthModal` 元件。

`OrderTable` 同時管理 Socket.IO 連線、資料取得、列表渲染，職責過重。

### 爬蟲工具

已移除。菜單資料來源改為 Database repo 的 GitHub Pages JSON（`https://gusty1.github.io/Database/order-drink/storeMenus.json`），由 Database repo 自行維護更新流程。

### 元件設計

**優點：**
- PropTypes 定義完整，所有接受 props 的元件均有驗證
- messageApi 透過 props 向下傳遞，避免在多個地方初始化 message
- CSS 命名不衝突，結構清晰
- 合理使用 Ant Design 元件，未過度自訂

### 狀態管理

**優點：**
- Zustand 使用正確，persist middleware 處理 darkMode 持久化邏輯合理
- orderStore 的職責明確：只管理「當前選中或編輯中的訂單」
- settingStore 的 darkModeChange 使用 setter pattern，遵循不可變更新原則
- fetchOrder 有完整 try/catch，失敗時 `set({ order: null })` 並記錄錯誤

---

## 依賴分析

### 主應用套件版本

| 套件 | 現有版本 | 備註 |
|------|---------|------|
| `antd` | ^6.3.3 | 可升級至 6.3.4（patch） |
| `vite` | ^8.0.1 | 可升級至 8.0.3（patch） |
| `eslint` | ^9.39.4 | 10.x 為 major 跳升，升級前需驗證設定相容性 |
| `prop-types` | ^15.8.1 | 已明確加入 dependencies |

### 爬蟲工具依賴

已隨 scrapy 工具一同移除，不再適用。

---

## 未來建議

### 優先級 1：程式碼品質

**1. TypeScript 遷移**

現有 PropTypes 驗證在執行期才能捕捉型別錯誤，改用 TypeScript 可在編譯期發現問題。

**2. 抽出 AdminAuthModal 元件**

將 `MyContent.jsx` 中的管理員驗證 Modal 邏輯抽出為獨立元件，減少 MyContent 的職責。

**3. Socket.IO 連線管理抽出 custom hook**

```javascript
// src/components/MyContent/OrderTable/useOrderSocket.js
export function useOrderSocket(onTableChange) {
  useEffect(() => {
    const socket = io()
    socket.on('tableChange', onTableChange)
    return () => {
      socket.off('tableChange', onTableChange)
      socket.disconnect()
    }
  }, [onTableChange])
}
```

**4. 服務層重新命名**

```
src/services/rethinkDB/  →  src/services/api/
rethinkDB.js             →  orderApi.js
```
命名更貼近實際用途（HTTP API client，非直接 DB 操作）。

### 優先級 2：長期架構

**1. 訂單列表資料提升至 Store**

若未來有多個元件需要讀取訂單列表，考慮將 `data` state 從 OrderTable 移至 store。

**2. 加入測試覆蓋**

目前無任何測試檔案。建議優先針對以下加入 unit test：
- `validateOrder` 函式（server.js 純函式，最容易測試）
- `getUser` / `setUser`（需要 mock localStorage）
- `orderStore` 狀態邏輯
- `scrapy_store_menu.py` 的 `get_image_url()` 各店家 strategy（可用 mock HTML）

**3. MyLayout 職責分離**

`setUser()` 呼叫從 MyLayout 移至 `App.jsx` 頂層 effect，使佈局元件職責單純。

---

## 審查總結

| 嚴重程度 | 數量 | 狀態 |
|---------|------|------|
| CRITICAL | 0   | 通過 |
| HIGH     | 0   | 通過 |
| MEDIUM   | 0   | 通過 |
| LOW      | 0   | 通過 |

**所有問題均已修復或已記錄為設計決策。專案目前處於乾淨狀態，無任何待處理問題。**

> 最後更新：2026-03-27
