# -----------------------------
# 第一階段：建構前端
# -----------------------------
FROM node:18 AS builder

WORKDIR /app

# 先複製 package.json，以便利用 npm install 的 cache
COPY package*.json ./

RUN npm install

# 再複製源碼（避免每次都 invalid cache）
COPY . .

# 設定 build-time 環境變數
ARG REACT_APP_TITLE
ARG REACT_APP_STORE_NAME
ARG REACT_APP_ROOT_IP_ADDRESS

ENV REACT_APP_TITLE=$REACT_APP_TITLE
ENV REACT_APP_STORE_NAME=$REACT_APP_STORE_NAME
ENV REACT_APP_ROOT_IP_ADDRESS=$REACT_APP_ROOT_IP_ADDRESS

RUN npm run build

# -----------------------------
# 第二階段：生產環境
# -----------------------------
FROM node:18-slim

WORKDIR /app

COPY --from=builder /app/build ./build
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/package*.json ./

RUN npm install --production

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENV NODE_ENV=production
EXPOSE 5000

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "server.js"]
