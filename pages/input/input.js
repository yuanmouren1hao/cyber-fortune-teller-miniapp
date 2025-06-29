
const dataSecurity = require('../../utils/data_security.js');

Page({
  data: {
    inputType: 'bazi',
    pageTitle: '输入生辰八字',
    date: '2000-01-01',
    time: '12:00',
    question: ''
  },
  onLoad(options) {
    // 显示隐私提示
    dataSecurity.showPrivacyReminder();
    const type = options.type || 'bazi';
    this.setData({
      inputType: type,
      pageTitle: type === 'bazi' ? '输入生辰八字' : '输入问题描述'
    });
    wx.setNavigationBarTitle({
      title: this.data.pageTitle
    });
  },
  bindDateChange(e) {
    this.setData({ date: e.detail.value });
  },
  bindTimeChange(e) {
    this.setData({ time: e.detail.value });
  },
  bindQuestionInput(e) {
    this.setData({ question: e.detail.value });
  },
  startAnalysis() {
    let userInput = '';
    if (this.data.inputType === 'bazi') {
      if (!this.data.date || !this.data.time) {
        wx.showToast({ title: '请选择完整的日期和时间', icon: 'none' });
        return;
      }
      userInput = `生辰八字：${this.data.date} ${this.data.time}`;
    } else {
      if (!this.data.question.trim()) {
        wx.showToast({ title: '请输入您的问题', icon: 'none' });
        return;
      }
      userInput = `问题：${this.data.question}`;
    }

    // 将用户输入暂存到全局，传递给结果页
    getApp().globalData.userInput = userInput;
    
    wx.navigateTo({
      url: '/pages/basic_result/basic_result'
    });
  }
});
