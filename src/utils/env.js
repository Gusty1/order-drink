// 從 Docker 或 public/env.js 注入的環境變數
// 注意：布林值 env 需要以字串 'true' 表示
export const getEnv = () => {
  return {
    REACT_APP_TITLE: window._env_?.REACT_APP_TITLE ?? "測試用的標題",
    REACT_APP_STORE_NAME: window._env_?.REACT_APP_STORE_NAME ?? "迷客夏",
    REACT_APP_ROOT_IP_ADDRESS: window._env_?.REACT_APP_ROOT_IP_ADDRESS ?? "10.232.107.142",
    REACT_APP_REAL_ROOT_IP_ADDRESS: window._env_?.REACT_APP_REAL_ROOT_IP_ADDRESS ?? "10.232.107.142",
    REACT_APP_DISABLED_MENU: window._env_?.REACT_APP_DISABLED_MENU === 'true'
  }
};
