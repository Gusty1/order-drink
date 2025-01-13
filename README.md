# 訂飲料

## 緣起

說真的，我從來沒想過我會在上班有負責訂飲料的一天，總之就是某天我訂飲料，發現公司還是用紙本，然後效率極低，最後我還要被噁心，哭阿。

由於上班的環境是在工廠，就是一個很封閉的環境，不然用google excel就可以了，我也不用再寫一個簡陋版的訂飲料了

## 技術

一切都是在本地運行，使用`rethinkDB`是因為它可以監聽資料庫變化，然後用`socket.io`，傳送消息到前端顯示

- 前端: react、ant design
- 消息: zustand、socket.io
- 資料存儲: rethinkDB
