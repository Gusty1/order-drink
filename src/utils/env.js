// 從 Docker 或 public/env.js 注入的環境變數
export const getEnv = () => {
  return {
    REACT_APP_TITLE: window._env_?.REACT_APP_TITLE ?? "測試用的標題",
    REACT_APP_STORE_NAME: window._env_?.REACT_APP_STORE_NAME ?? "迷客夏",
    REACT_APP_DISABLED_MENU: window._env_?.REACT_APP_DISABLED_MENU === 'true',
    REACT_APP_ADMIN_PASSWORD: window._env_?.REACT_APP_ADMIN_PASSWORD ?? ""
  }
};
