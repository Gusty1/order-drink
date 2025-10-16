#!/bin/sh

# 生成前端 env.js
cat <<EOF > /app/build/env.js
window._env_ = {
  REACT_APP_TITLE: "${REACT_APP_TITLE}",
  REACT_APP_STORE_NAME: "${REACT_APP_STORE_NAME}",
  REACT_APP_ROOT_IP_ADDRESS: "${REACT_APP_ROOT_IP_ADDRESS}"
};
EOF

# 執行 server.js
exec "$@"
