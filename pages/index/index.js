
Page({
  data: {},
  navigateToInput(e) {
    const type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: `/pages/input/input?type=${type}`
    });
  }
});
