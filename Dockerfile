# -----------------------------
# 第一階段：建構前端
# -----------------------------
FROM node:18 AS builder

WORKDIR /app

ARG REACT_APP_TITLE
ARG REACT_APP_STORE_NAME
ARG REACT_APP_ROOT_IP_ADDRESS

ENV REACT_APP_TITLE=$REACT_APP_TITLE
ENV REACT_APP_STORE_NAME=$REACT_APP_STORE_NAME
ENV REACT_APP_ROOT_IP_ADDRESS=$REACT_APP_ROOT_IP_ADDRESS

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# -----------------------------
# 第二階段：生產環境
# -----------------------------
FROM node:18-slim

WORKDIR /app

# 複製 build + server.js
COPY --from=builder /app/build ./build
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/package*.json ./

RUN npm install --production

# 複製 docker-entrypoint.sh
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

ENV NODE_ENV=production
EXPOSE 5000

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "server.js"]
