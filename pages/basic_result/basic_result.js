
const api = require('../../utils/api.js');
const dataSecurity = require('../../utils/data_security.js');

Page({
  data: {
    loading: true,
    result: null,
    error: null,
    unlocked: false
  },
  onLoad() {
    this.getAIResult();
  },
  onUnload() {
    // 页面卸载时清理敏感数据
    dataSecurity.clearSensitiveData();
  },
  getAIResult() {
    this.setData({ loading: true, error: null });
    const userInput = getApp().globalData.userInput;
    if (!userInput) {
      this.setData({ loading: false, error: '无法获取输入信息，请返回重试。' });
      return;
    }

    api.getFortune(userInput)
      .then(res => {
        const parsedResult = api.parseFortuneResult(res);
        if (!parsedResult) {
            throw new Error("AI结果解析失败");
        }
        parsedResult.wuxingData = [
          { name: '金', value: Math.floor(Math.random() * 80) + 20, color: '#FFD700' },
          { name: '木', value: Math.floor(Math.random() * 80) + 20, color: '#50C878' },
          { name: '水', value: Math.floor(Math.random() * 80) + 20, color: '#4682B4' },
          { name: '火', value: Math.floor(Math.random() * 80) + 20, color: '#FF6347' },
          { name: '土', value: Math.floor(Math.random() * 80) + 20, color: '#CD853F' }
        ];
    
        this.setData({
          loading: false,
          result: parsedResult
        });
        getApp().globalData.fullResult = parsedResult;
      })
      .catch(err => {
        this.setData({
          loading: false,
          error: 'AI服务暂时不可用，请稍后重试。'
        });
        console.error("获取AI结果失败", err);
      });
  },
  retry() {
    this.getAIResult();
  },
  watchAdToUnlock() {
    this.selectComponent('#adModal').show();
  },
  onAdFinished(e) {
    if (e.detail && e.detail.completed) {
      this.setData({ unlocked: true });
      getApp().globalData.hasUnlockedDetail = true;
      wx.navigateTo({
        url: '/pages/detailed_result/detailed_result',
      });
    } else {
      wx.showToast({
        title: '需要完整观看广告才能解锁',
        icon: 'none',
        duration: 2000
      });
    }
  },
  onAdFailed(err) {
    console.error('广告加载失败', err);
    wx.showModal({
      title: '提示',
      content: '广告加载失败，请检查网络后重试。',
      showCancel: false
    });
  }
});
