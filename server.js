/**
 * 連接 RethinkDB 的 Express 伺服器
 */
require('dotenv').config()
const path = require('path')
const express = require('express')
const http = require('http')
const r = require('rethinkdb')
const cors = require('cors')
const socketIo = require('socket.io')

const app = express()
const PORT = process.env.SERVER_PORT || 5918
const server = http.createServer(app)

// 內部區網使用，允許所有來源（含 IP 存取）
const corsOptions = {
  origin: '*'
}

const io = socketIo(server, {
  cors: corsOptions
})

// 本地自動讀 .env，Docker 由 environment 注入
const dbConfig = {
  host: process.env.RETHINKDB_HOST || 'localhost',
  port: Number.parseInt(process.env.RETHINKDB_PORT, 10) || 28015
}

let connection = null
const dbName = 'order_drink'
const tableName = 'orders'

// 中間件：允許跨域請求與解析 JSON 格式的請求體
app.use(cors(corsOptions))
app.use(express.json())

/**
 * 初始化 RethinkDB 資料庫和資料表
 */
async function initializeDatabase() {
  try {
    // 連接 RethinkDB
    connection = await r.connect(dbConfig)
    console.log('✅ RethinkDB 連接成功')

    // 確認資料庫存在，不存在就建立
    const dbs = await r.dbList().run(connection)
    if (!dbs.includes(dbName)) {
      await r.dbCreate(dbName).run(connection)
      console.log(`✅ Database "${dbName}" 建立成功`)
    }

    // 確認資料表，不存在就建立
    const tables = await r.db(dbName).tableList().run(connection)

    if (tables.includes(tableName)) {
      console.log(`ℹ️ Table "${tableName}" 已存在，跳過建立`)
    } else {
      await r
        .db(dbName)
        .tableCreate(tableName, { replicas: 1, shards: 1 })
        .run(connection)
      console.log(`✅ Table "${tableName}" 建立成功 (replicas=1, shards=1)`)
    }
  } catch (error) {
    console.error('初始化資料庫時出錯:', error)
    process.exit(1) // 無法連接資料庫時退出
  }
}

/**
 * 監聽資料表變化並透過 WebSocket 傳送更新
 * 若 cursor 發生錯誤（如 DB 短暫斷線），5 秒後自動重試
 */
async function watchTableChanges() {
  try {
    const cursor = await r.db(dbName).table(tableName).changes().run(connection)
    console.log(`正在監聽資料表 "${tableName}" 的變化...`)

    cursor.each((err, change) => {
      if (err) {
        console.error('監聽資料表變化時出錯，5 秒後重試:', err)
        setTimeout(watchTableChanges, 5000)
      } else {
        console.log('資料表變化:', change)
        io.emit('tableChange', change)
      }
    })
  } catch (error) {
    console.error('設定資料表監聽器時出錯，5 秒後重試:', error)
    setTimeout(watchTableChanges, 5000)
  }
}

/**
 * 根據今天日期取得符合條件的資料
 */
app.get('/getTodayOrders', async (req, res) => {
  try {
    const today = new Date()
    // 確保在查詢資料時使用 UTC 日期，簡單來說就是不用UTC他不會自動加8，就找不到資料
    const utcYear = today.getUTCFullYear()
    const utcMonth = today.getUTCMonth() + 1 // JavaScript 中月數是從 0 開始
    const utcDay = today.getUTCDate()

    // 查詢資料
    const result = await r
      .db(dbName)
      .table(tableName)
      .filter((row) =>
        row('date')
          .year()
          .eq(utcYear)
          .and(row('date').month().eq(utcMonth))
          .and(row('date').day().eq(utcDay))
      )
      .orderBy(r.desc('date'))
      .run(connection)

    // 將結果轉換為陣列
    const data = await result.toArray()
    res.status(200).json({ message: '查詢成功', data })
  } catch (error) {
    // M5: 記錄詳細錯誤於伺服器，僅回傳通用訊息給客戶端，避免洩漏 DB 內部資訊
    console.error('[getTodayOrders] 查詢今天資料時出錯:', error)
    res.status(500).json({ error: '伺服器發生錯誤，請稍後再試' })
  }
})

/**
 * 驗證訂單欄位
 * @param {object} data - 請求 body
 * @returns {string|null} 錯誤訊息，無誤則回傳 null
 */
function validateOrder(data) {
  const { username, drink, sweet, ice, count, price } = data

  if (!username || typeof username !== 'string' || username.trim() === '') {
    return '稱呼不可為空'
  }
  if (!drink || typeof drink !== 'string' || drink.trim() === '') {
    return '飲品名稱不可為空'
  }
  const validSweet = [1, 2, 3, 4, 5]
  if (!validSweet.includes(Number(sweet))) {
    return '甜度值無效'
  }
  const validIce = [1, 2, 3, 4, 5, 6]
  if (!validIce.includes(Number(ice))) {
    return '冰塊值無效'
  }
  const parsedCount = Number(count)
  if (!Number.isInteger(parsedCount) || parsedCount < 1 || parsedCount > 99) {
    return '數量須為 1～99 的整數'
  }
  const parsedPrice = Number(price)
  if (!Number.isFinite(parsedPrice) || parsedPrice < 0 || parsedPrice > 9999) {
    return '價格須為 0～9999 的數字'
  }

  return null
}

/**
 * 插入資料
 */
app.post('/setOrder', async (req, res) => {
  try {
    const data = req.body
    const { id } = data

    const validationError = validateOrder(data)
    if (validationError) {
      return res.status(400).json({ error: validationError })
    }

    let result

    if (id) {
      result = await r
        .db(dbName)
        .table(tableName)
        .get(id)
        .update({
          ...data,
          date: r.now()
        })
        .run(connection)

      if (result.replaced === 1) {
        res.status(200).json({ message: '更新成功', result })
      } else {
        res.status(404).json({ message: '資料未找到，更新失敗' })
      }
    } else {
      // L6: 改用解構排除，避免直接 mutation 入參物件
      const { id: _id, ...insertData } = data
      result = await r
        .db(dbName)
        .table(tableName)
        .insert({
          ...insertData,
          date: r.now()
        })
        .run(connection)

      res.status(201).json({ message: '插入成功', result })
    }
  } catch (error) {
    console.error('[setOrder] 插入或更新資料時出錯:', error)
    res.status(500).json({ error: '伺服器發生錯誤，請稍後再試' })
  }
})

/**
 * 刪除資料
 */
app.delete('/deleteOrder/:id', async (req, res) => {
  try {
    const { id } = req.params // 從網址中取得 id 參數

    // 根據 id 刪除資料
    const result = await r
      .db(dbName)
      .table(tableName)
      .get(id) // 根據 id 查找該資料
      .delete() // 刪除該資料
      .run(connection)

    if (result.deleted === 1) {
      res.status(200).json({ message: '刪除成功' })
    } else {
      res.status(404).json({ message: '資料未找到' })
    }
  } catch (error) {
    console.error('[deleteOrder] 刪除資料時出錯:', error)
    res.status(500).json({ error: '伺服器發生錯誤，請稍後再試' })
  }
})

/**
 * 取得一筆資料
 */
app.get('/getOrder/:id', async (req, res) => {
  try {
    const { id } = req.params

    const result = await r.db(dbName).table(tableName).get(id).run(connection)

    if (result) {
      res.status(200).json(result)
    } else {
      res.status(404).json({ message: '查無資料' })
    }
  } catch (error) {
    console.error('[getOrder] 取得資料時出錯:', error)
    res.status(500).json({ error: '伺服器發生錯誤，請稍後再試' })
  }
})

// 打包docker會用到的東西
app.use(express.static(path.join(__dirname, 'build')))

// 最後面加這行處理所有未命中路由給前端
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

/**
 * 優雅關閉：關閉 DB 連線後退出
 */
async function gracefulShutdown(signal) {
  console.log(`收到 ${signal}，伺服器正在關閉...`)
  if (connection) {
    await connection.close()
    console.log('RethinkDB 連接已關閉')
  }
  process.exit(0)
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'))
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))

/**
 * 啟動伺服器：先完成 DB 初始化，再開始接受請求
 */
initializeDatabase().then(() => {
  server.listen(PORT, () => {
    watchTableChanges()
    console.log(`Server is running on http://localhost:${PORT}`)
  })
})
