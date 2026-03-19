# -----------------------------
# 第一階段：建構前端 (Builder)
# -----------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# 複製 package.json 以便利用 cache
COPY package*.json ./

# 安裝所有依賴（包含 devDependencies）
RUN npm install

# 複製源碼
COPY . .

# 前端 build（環境變數由 runtime 的 env.js 注入，不需要 build-time ARG）
RUN npm run build

# -----------------------------
# 第二階段：生產環境 (Production)
# -----------------------------
FROM node:22-alpine

WORKDIR /app

# 複製前端 build 與 server.js
COPY --from=builder /app/build ./build
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/package*.json ./

# 安裝 production 依賴
RUN npm install --omit=dev

# 複製 entrypoint 並確保 LF 格式
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN sed -i 's/\r$//' /docker-entrypoint.sh && chmod +x /docker-entrypoint.sh

# 設定 production 環境
ENV NODE_ENV=production

# 暴露端口
EXPOSE 5918

# 啟動 entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "server.js"]
