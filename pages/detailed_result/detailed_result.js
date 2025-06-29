
const dataSecurity = require('../../utils/data_security.js');

Page({
  data: {
    result: null,
    userInfo: null,
    isGeneratingShare: false
  },
  onLoad() {
    const hasUnlockedDetail = getApp().globalData.hasUnlockedDetail;
    if (!hasUnlockedDetail) {
      wx.showModal({
        title: '未解锁',
        content: '请先观看广告解锁详细内容',
        showCancel: false,
        success: () => wx.navigateBack()
      });
      return;
    }
    const fullResult = getApp().globalData.fullResult;
    if (fullResult) {
      this.setData({ result: fullResult });
    } else {
      wx.showToast({ title: '数据加载失败', icon: 'none' });
      wx.navigateBack();
    }
  },
  onUnload() {
    // 页面卸载时，彻底清理本次会话的所有敏感信息
    console.log("详细结果页卸载，清理会话数据。");
    dataSecurity.clearSensitiveData();
  },
  goBack() {
    wx.navigateBack();
  },
  generateShareImage() {
    if (this.data.isGeneratingShare) return;
    this.setData({ isGeneratingShare: true });
    wx.showLoading({ title: '准备生成海报...', mask: true });
    wx.getUserProfile({
      desc: '用于生成个性化命理分享海报',
      success: (res) => {
        this.setData({ userInfo: res.userInfo });
        this.selectComponent('#shareCanvas').show();
        wx.hideLoading();
        this.setData({ isGeneratingShare: false });
      },
      fail: () => {
        this.setData({ userInfo: { nickName: '神秘访客', avatarUrl: '' } });
        this.selectComponent('#shareCanvas').show();
        wx.hideLoading();
        this.setData({ isGeneratingShare: false });
      }
    });
  },
  handleShareToFriend() {
    this.onShareAppMessage();
  },
  onShareTimeline() {
    return {
      title: '我的命理解析，解锁你的运势密码！',
      query: 'from=timeline',
      imageUrl: '/images/share_cover.png'
    }
  },
  onShareAppMessage() {
    const fortuneKeyword = this.data.result.keyword || '吉';
    return {
      title: `【${fortuneKeyword}】我的命理解析，速来围观！`,
      path: '/pages/index/index?from=share',
      imageUrl: '/images/share_cover.png'
    };
  }
});
