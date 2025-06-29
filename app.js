
App({
  onLaunch() {
    console.log('应用启动');
    // 检查并更新版本
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) {
      console.log('是否有新版本：', res.hasUpdate);
    });
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: function (res) {
          if (res.confirm) {
            updateManager.applyUpdate();
          }
        }
      });
    });
  },
  onHide() {
    // 应用进入后台时，清理敏感数据
    const dataSecurity = require('./utils/data_security.js');
    dataSecurity.clearSensitiveData();
  },
  globalData: {
    userInfo: null,
    userInput: null,
    fullResult: null,
    hasUnlockedDetail: false,
    // 上线前务必替换为生产环境的Key
    deepSeekApiKey: 'YOUR_DEEPSEEK_API_KEY', 
    // 广告ID，上线前替换为自己的广告单元ID
    adUnitId: 'adunit-7e94a5d3d48b5d80',
    // 提示：上线前，请在微信小程序后台 -> 开发 -> 开发管理 -> 开发设置 -> 服务器域名
    // 将 https://api.deepseek.com 添加到 request合法域名中
  }
})
