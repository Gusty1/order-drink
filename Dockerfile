# -----------------------------
# 第一階段：建構前端 (Builder)
# -----------------------------
FROM node:18 AS builder

WORKDIR /app

# 複製 package.json 以便利用 cache
COPY package*.json ./

# 安裝所有依賴（包含 devDependencies）
RUN npm install

# 分別複製前端源碼資料夾，避免 COPY . . 被 cache 誤判
COPY public ./public
COPY src ./src
COPY .env ./

# build-time ARG
ARG REACT_APP_TITLE
ARG REACT_APP_STORE_NAME
ARG REACT_APP_ROOT_IP_ADDRESS
ARG REACT_APP_REAL_ROOT_IP_ADDRESS
ARG REACT_APP_DISABLED_MENU

# 設定 ENV 給前端 build 使用
ENV REACT_APP_TITLE=$REACT_APP_TITLE
ENV REACT_APP_STORE_NAME=$REACT_APP_STORE_NAME
ENV REACT_APP_ROOT_IP_ADDRESS=$REACT_APP_ROOT_IP_ADDRESS
ENV REACT_APP_REAL_ROOT_IP_ADDRESS=$REACT_APP_REAL_ROOT_IP_ADDRESS
ENV REACT_APP_DISABLED_MENU=$REACT_APP_DISABLED_MENU
ENV NODE_ENV=production

# 前端 build
RUN npm run build

# -----------------------------
# 第二階段：生產環境 (Production)
# -----------------------------
FROM node:18-slim

WORKDIR /app

# 複製前端 build 與 server.js
COPY --from=builder /app/build ./build
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/package*.json ./

# 安裝 production 依賴
RUN npm install --production

# 複製 entrypoint 並確保 LF 格式
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# 設定 production 環境
ENV NODE_ENV=production

# 暴露端口
EXPOSE 5000

# 啟動 entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "server.js"]
