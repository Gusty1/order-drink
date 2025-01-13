/**
 * 連接 RethinkDB 的 Express 伺服器
 */
const express = require('express')
const http = require('http')
const r = require('rethinkdb')
const cors = require('cors')
const socketIo = require('socket.io')
const os = require('os')

const app = express()
const PORT = 5000
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: '*' // 設定允許的跨域來源
  }
})
const dbConfig = { host: 'localhost', port: 28015 }

let connection = null
const dbName = 'order_drink'
const tableName = 'orders'

// 中間件：允許跨域請求與解析 JSON 格式的請求體
app.use(cors())
app.use(express.json())

/**
 * 初始化 RethinkDB 資料庫和資料表
 */
async function initializeDatabase() {
  try {
    connection = await r.connect(dbConfig)
    console.log('RethinkDB 連接成功!')

    const dbs = await r.dbList().run(connection)
    if (!dbs.includes(dbName)) {
      await r.dbCreate(dbName).run(connection)
      console.log(`Database "${dbName}" 建立成功`)
    }

    const tables = await r.db(dbName).tableList().run(connection)
    if (!tables.includes(tableName)) {
      await r.db(dbName).tableCreate(tableName).run(connection)
      console.log(`Table "${tableName}" 建立成功`)
    }
  } catch (error) {
    console.error('初始化資料庫時出錯:', error)
    process.exit(1) // 無法連接資料庫時退出
  }
}

/**
 * 監聽資料表變化並透過 WebSocket 傳送更新
 */
async function watchTableChanges() {
  try {
    const cursor = await r.db(dbName).table(tableName).changes().run(connection)
    console.log(`正在監聽資料表 "${tableName}" 的變化...`)

    cursor.each((err, change) => {
      if (err) {
        console.error('監聽資料表變化時出錯:', err)
      } else {
        console.log('資料表變化:', change)
        io.emit('tableChange', change)
      }
    })
  } catch (error) {
    console.error('設定資料表監聽器時出錯:', error)
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
    console.error('查詢今天資料時出錯:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * 插入資料
 */
app.post('/setOrder', async (req, res) => {
  try {
    const data = req.body
    const { id } = data

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
      delete data.id
      result = await r
        .db(dbName)
        .table(tableName)
        .insert({
          ...data,
          date: r.now()
        })
        .run(connection)

      res.status(201).json({ message: '插入成功', result })
    }
  } catch (error) {
    console.error('插入或更新資料時出錯:', error)
    res.status(500).json({ error: error.message })
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
    console.error('刪除資料時出錯:', error)
    res.status(500).json({ error: error.message })
  }
})

//取得一筆資料
app.get('/getOrder/:id', async (req, res) => {
  try {
    const { id } = req.params // 从 URL 中获取 id 参数

    // 确保 id 是有效的
    if (!id) {
      return res.status(400).json({ message: 'ID 无效' })
    }

    // 根据 id 获取数据
    const result = await r
      .db(dbName)
      .table(tableName)
      .get(id) // 根据 id 查找该数据
      .run(connection)

    if (result) {
      res.status(200).json(result) // 返回找到的数据
    } else {
      res.status(404).json({ message: '数据未找到' }) // 如果没有找到数据，返回 404
    }
  } catch (error) {
    console.error('获取数据时出错:', error)
    res.status(500).json({ error: error.message }) // 处理其他错误
  }
})

/**
 * 獲取當前主機的 IPv4 地址
 */
app.get('/userIP', (req, res) => {
  const networkInterfaces = os.networkInterfaces()

  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName]

    for (const iface of interfaces) {
      // 找到第一個符合條件的 IPv4 地址
      if (iface.family === 'IPv4' && !iface.internal) {
        return res.json({ name: interfaceName, address: iface.address })
      }
    }
  }

  res.status(404).json({ error: '找不到有效的 IPv4 地址' })
})

/**
 * 啟動伺服器
 */
server.listen(PORT, async () => {
  await initializeDatabase()
  watchTableChanges()
  console.log(`Server is running on http://localhost:${PORT}`)
})

/**
 * 在伺服器關閉時釋放資料庫連接
 */
process.on('SIGINT', async () => {
  console.log('伺服器正在關閉...')
  if (connection) {
    await connection.close()
    console.log('RethinkDB 連接已關閉')
  }
  process.exit(0)
})
