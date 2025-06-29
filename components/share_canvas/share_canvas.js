
Component({
  properties: {
    resultData: { type: Object, value: {} },
    userInfo: { type: Object, value: {} }
  },
  data: {
    showCanvas: false,
    templateImagePath: '',
    qrCodeImagePath: '',
    avatarImagePath: ''
  },
  lifetimes: {
    attached() {
      // 预加载图片资源
      this._preloadImages();
    }
  },
  methods: {
    _preloadImages() {
      const imageList = [
        { key: 'templateImagePath', src: '/images/share_template.png' },
        { key: 'qrCodeImagePath', src: '/images/qrcode.png' }
      ];
      imageList.forEach(item => {
        wx.getImageInfo({
          src: item.src,
          success: (res) => this.setData({ [item.key]: res.path }),
          fail: (err) => console.error(`预加载图片失败: ${item.src}`, err)
        });
      });
    },
    show() {
      this.setData({ showCanvas: true });
      wx.showLoading({ title: '精美海报生成中...' });
      if (this.data.userInfo && this.data.userInfo.avatarUrl) {
        wx.getImageInfo({
          src: this.data.userInfo.avatarUrl,
          success: (res) => {
            this.setData({ avatarImagePath: res.path });
            this._drawShareImage();
          },
          fail: () => {
            this.setData({ avatarImagePath: '' }); // 头像加载失败则不显示
            this._drawShareImage();
          }
        });
      } else {
        this._drawShareImage();
      }
    },
    hide() {
      this.setData({ showCanvas: false });
      // 隐藏时清理Canvas，释放内存
      const ctx = wx.createCanvasContext('shareCanvas', this);
      const canvasWidth = 375;
      const canvasHeight = 667;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.draw();
      console.log("分享画布已隐藏并清理。");
    },
    _drawShareImage() {
      const ctx = wx.createCanvasContext('shareCanvas', this);
      // ... (此处省略了具体的绘制逻辑，与前一阶段相同)
      const canvasWidth = 375;
      const canvasHeight = 667;
      if (this.data.templateImagePath) {
        ctx.drawImage(this.data.templateImagePath, 0, 0, canvasWidth, canvasHeight);
      } else {
        const grd = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
        grd.addColorStop(0, '#1E1E3F');
        grd.addColorStop(1, '#141428');
        ctx.setFillStyle(grd);
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }
      // ... 其他绘制逻辑
      ctx.draw(false, () => wx.hideLoading());
    },
    saveImage() {
      wx.canvasToTempFilePath({
        canvasId: 'shareCanvas',
        success: (res) => {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => wx.showToast({ title: '已保存到相册', icon: 'success' }),
            fail: (err) => {
              if (err.errMsg.includes('auth deny')) {
                wx.showModal({
                  title: '授权提示',
                  content: '需要您授权保存图片到相册才能使用该功能',
                  success: (modalRes) => {
                    if (modalRes.confirm) wx.openSetting();
                  }
                });
              } else {
                wx.showToast({ title: '保存失败', icon: 'none' });
              }
            }
          });
        },
        fail: () => wx.showToast({ title: '图片生成失败', icon: 'none' })
      }, this);
    },
    shareToFriend() {
      this.triggerEvent('shareToFriend');
    }
    // ... (省略了绘制辅助函数)
  }
});
