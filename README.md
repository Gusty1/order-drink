# 訂飲料

## 緣起

說真的，我從來沒想過我會在上班有負責訂飲料的一天，總之就是某天我訂飲料，然後就被臭了ˊ_ˋ。  
原本想說找機會跟老大說，看看給不給用，但某天我裝個開發工具就被臭了，說什麼資安問題，我覺得我裝的工具已經是相對安全了，又不是從甚麼神奇的地放下載，這樣都不行，真的是在哭。  
那我這個自己寫的，也不能放到USB放到公司電腦，也是要從github下載，我想8成又會被臭，想想還是算了，SB公司一輩子用紙筆吧。  
  
由於上班的環境是在工廠，就是一個甚麼都要申請的環境，不然用google excel就可以了，我也不用再寫一個簡陋版的訂飲料了  

## 技術

一切都是在本地運行，使用`rethinkDB`是因為它可以監聽資料庫變化，然後用`socket.io`，傳送消息到前端顯示

- 前端: react、ant design
- 消息: zustand、socket.io
- 資料存儲: rethinkDB

## TODO(做不到但又想做的事)

- [x] 自動爬取最新菜單，目前都需要手動更換(部分店家可以做到完成)
- [x] 打包成docker(介於可行和不可行之間)
- [ ] 可以跟訂飲料的網站連結，一鍵下訂。
  - 靠杯一下某個訂飲料的網站換個分店而已，訂購資料全都要重打什麼大便，氣氣氣~

## 使用說明

本專案只適合類似公司、工廠那樣，大家都在同一個網路環境下才可以用

1. 先安裝[rethinkDB](https://rethinkdb.com/ 'rethinkDB')，預設安裝即可，也可以用docker裝
2. 下載本專案，然後執行

 ```terminal
 npm i 
 ```

3. 進入`src/constants/defaultSetting.js`，這裡面有些基本設定
   - darkMode: 暗黑模式，現在好像沒啥用了，我應該是保設定保存在瀏覽器
   - disabledMenu: 下拉菜單是否可以用
   - rootIPAddress: 管理者ipv4，可以修改所有訂單資料，其他人只能改自己的

4. 先開啟rethinkDB，再開啟terminal進入本專案輸入指令，這會開啟客戶端和server端程式

 ```terminal
 npm start
 ```

## Docker說明

對docker沒有很熟，可能會有問題...

### 環境變數說明

| 變數名稱                        | 說明                               |
| --------------------------- | -------------------------------- |
| `ROOT_IP_ADDRESS`           | 啟動主機的 IPv4 位址                    |
| `RETHINKDB_HOST`            | RethinkDB 服務主機名稱，通常是 `rethinkdb` |
| `REACT_APP_TITLE`           | 訂飲料頁面標題，例如：XX請喝飲料                |
| `REACT_APP_STORE_NAME`      | 預設飲料店名稱，會顯示在菜單中                  |
| `REACT_APP_ROOT_IP_ADDRESS` | 與 `ROOT_IP_ADDRESS` 相同，用於前端配置    |

1. 在專案根目錄建立 `.env` 檔，內容範例如：

  ```env
  ROOT_IP_ADDRESS=192.168.164.142
  RETHINKDB_HOST=rethinkdb
  REACT_APP_TITLE=XX請喝飲料，謝謝XX
  REACT_APP_STORE_NAME=迷客夏
  REACT_APP_ROOT_IP_ADDRESS=192.168.164.142
  ```

2. 確認目錄下有 `docker-compose.yml`，內容示範：

```yaml
version: "3"
services:
  app:
    image: gray9527/order-drink:latest
    environment:
      - ROOT_IP_ADDRESS=${ROOT_IP_ADDRESS}
      - RETHINKDB_HOST=${RETHINKDB_HOST}
      - REACT_APP_TITLE=${REACT_APP_TITLE}
      - REACT_APP_STORE_NAME=${REACT_APP_STORE_NAME}
      - REACT_APP_ROOT_IP_ADDRESS=${REACT_APP_ROOT_IP_ADDRESS}
    ports:
      - "5000:5000"
    depends_on:
      - rethinkdb

  rethinkdb:
    image: rethinkdb:latest
    ports:
      - "8080:8080"
      - "28015:28015"
```

3. 執行指令啟動服務：

```bash
docker compose up -d
```

4. 用瀏覽器開啟 [http://localhost:5000](http://localhost:5000)

### 停止服務

```bash
docker compose down
```

## 菜單

### 支援的店家

以桃園市`龍潭區`的飲料店為主，目前的店家有:  

- 19茶屋
- 50嵐
- coco
- comebuy
- teatop
- 一沐日
- 五桐號
- 可不可
- 吾奶王
- 大苑子
- 德正
- 清心
- 烏弄
- 珍煮丹
- 萬波
- 迷客夏
- 阿義
- 鮮茶道
- 麻古
- 龜記

### 菜單爬蟲

部分店家可以做到，有些飲料店官網沒有菜單，只能從其他部分取得，不確定那些地方會不會更新，所以就沒有用爬蟲了，特別紀錄那些不能用爬蟲的特殊店家

**`標題就是連結`**

### [50嵐](http://50lan.com/web/%E5%8C%97%E5%8D%8050%E5%B5%90%E5%82%B3%E7%9C%9F%E8%A8%82%E8%B3%BC%E5%96%AE(%E7%A9%BA%E7%99%BD).doc '50嵐')

從官網來看就是古老的飲料店，網頁還有adobe，菜單還是用doc，有夠怪的

### [COCO](https://supertaste.tvbs.com.tw/food/347016 'COCO')

沒有官網，菜單好像只會放在FB，這個連結是某個部落格的

### [德正](https://roo.cash/blog/oolongproject-drink-recommendation-article/ '德正')

官網做得很漂亮，但沒有菜單阿，這樣再漂亮有G8用，這個連結是某個部落格的

### [清心](https://supertaste.tvbs.com.tw/pack/352352 '清新')

有官網，但沒有菜單，這個連結是某個部落格的

### [烏弄](https://drive.google.com/drive/folders/1fCxZ4KPaHj8XBvro3KjSHM4fR4vgjfWE '烏弄')

有官網，但沒想到菜單是放在google雲端硬碟，這樣更新的話連結不也是會變

### [鮮茶道](https://icard.ai/shop/reward/channel%2F5e0ac3b11b207d182d6bd3d3?type=channel_concept%2F5f6ab11b3d97d93195e6707c '鮮茶道')

有官網，但菜單只寫名稱，不寫價錢，這個連結是某個部落格的

### [龜記](https://roo.cash/blog/guiji-drink-recommendation-article/ '龜記')

有官網，網站做得不錯，但卻沒有菜單可以下載，這個連結是某個部落格的

### [一沐日](https://roo.cash/blog/aniceholiday-recommendation-article/ '一沐日')

不知什麼出現的飲料店，有官網，但菜單不是圖片

### [吾奶王](https://www.facebook.com/wo.milk.king '吾奶王')

不知什麼出現的飲料店，沒有官網，只有FB圖片

### PDF下載圖片

部分店家的菜單是用PDF的，windows要處理pdf還要先裝[poppler](https://github.com/oschwartz10612/poppler-windows 'poppler')，不然不能下載PDF處理後的圖片  
~~菜單用PDF都是SB~~

`菜單用PDF的店家:`

- 可不可: 他們網站有擋什麼verify驗證，還我要多做一些事
- 迷客夏: 跟`可不可`比好一點，~~但還是SB~~
