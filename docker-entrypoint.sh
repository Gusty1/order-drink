#!/bin/sh

# 生成前端 env.js
cat <<EOF > /app/build/env.js
window._env_ = {
  REACT_APP_TITLE: "${REACT_APP_TITLE}",
  REACT_APP_STORE_NAME: "${REACT_APP_STORE_NAME}",
  REACT_APP_DISABLED_MENU: "${REACT_APP_DISABLED_MENU}",
  REACT_APP_ADMIN_PASSWORD: "${REACT_APP_ADMIN_PASSWORD}"
};
EOF

# 執行 server.js
exec "$@"
