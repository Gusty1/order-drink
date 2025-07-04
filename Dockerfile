FROM node:18

WORKDIR /app

# 定義 build 時參數
ARG REACT_APP_TITLE
ARG REACT_APP_STORE_NAME
ARG REACT_APP_ROOT_IP_ADDRESS

# 把 ARG 轉成 ENV，給前端 build
ENV REACT_APP_TITLE=$REACT_APP_TITLE
ENV REACT_APP_STORE_NAME=$REACT_APP_STORE_NAME
ENV REACT_APP_ROOT_IP_ADDRESS=$REACT_APP_ROOT_IP_ADDRESS

# 安裝相依
COPY package*.json ./
RUN npm install

# 複製程式碼
COPY . .

# 前端打包
RUN npm run build

# 後端執行
ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "server.js"]
