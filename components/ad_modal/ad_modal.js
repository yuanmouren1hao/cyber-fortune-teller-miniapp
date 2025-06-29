
Component({
  properties: {
    adUnitId: {
      type: String,
      value: 'adunit-7e94a5d3d48b5d80' // 这是一个示例广告ID，实际应用中需要替换为自己的广告ID
    }
  },
  data: {
    showAd: false,
    adError: false,
    errorMsg: '',
    videoAdInstance: null,
    loadingAd: false
  },
  lifetimes: {
    attached() {
      // 组件实例进入页面节点树时执行，提前初始化广告实例
      this.initVideoAd();
    },
    detached() {
      // 组件实例被从页面节点树移除时执行，销毁广告实例
      if (this.data.videoAdInstance) {
        this.data.videoAdInstance.destroy();
      }
    }
  },
  methods: {
    initVideoAd() {
      // 检查是否支持广告API
      if (!wx.createRewardedVideoAd) {
        console.error('当前微信版本不支持激励视频广告');
        this.setData({
          adError: true,
          errorMsg: '当前微信版本不支持激励视频广告'
        });
        return;
      }

      // 创建激励视频广告实例
      const videoAd = wx.createRewardedVideoAd({
        adUnitId: this.properties.adUnitId
      });

      // 监听加载事件
      videoAd.onLoad(() => {
        console.log('激励视频广告加载成功');
        this.setData({ 
          adError: false,
          errorMsg: '',
          loadingAd: false
        });
      });

      // 监听错误事件
      videoAd.onError(err => {
        console.error('激励视频广告加载失败', err);
        this.setData({
          adError: true,
          errorMsg: '广告加载失败，请稍后再试',
          loadingAd: false
        });
        // 触发加载失败事件，让页面可以做降级处理
        this.triggerEvent('adfailed', err);
      });

      // 监听关闭事件
      videoAd.onClose(res => {
        // 用户点击了【关闭广告】按钮
        if (res && res.isEnded) {
          // 正常播放结束，可以下发奖励
          console.log('激励视频广告完整观看');
          this.hide();
          this.triggerEvent('adfinished', { completed: true });
        } else {
          // 播放中途退出，不下发奖励
          console.log('激励视频广告未完整观看');
          this.hide();
          this.triggerEvent('adfinished', { completed: false });
        }
      });

      this.setData({ videoAdInstance: videoAd });
    },
    show() {
      if (this.data.loadingAd) return;
      
      this.setData({ 
        showAd: true,
        loadingAd: true,
        adError: false,
        errorMsg: ''
      });

      if (!this.data.videoAdInstance) {
        this.initVideoAd();
      }

      if (this.data.videoAdInstance) {
        // 显示广告
        this.data.videoAdInstance.show()
          .catch(err => {
            this.data.videoAdInstance.load()
              .then(() => this.data.videoAdInstance.show())
              .catch(err => {
                console.error('激励视频广告显示失败', err);
                this.setData({
                  adError: true,
                  errorMsg: '广告显示失败，请稍后再试',
                  loadingAd: false
                });
                this.triggerEvent('adfailed', err);
              });
          });
      }
    },
    hide() {
      this.setData({ 
        showAd: false,
        loadingAd: false
      });
    },
    // 当广告加载失败时，提供一个模拟广告的备选方案
    useBackupAd() {
      this.setData({
        adError: false,
        showBackupAd: true,
        backupCountdown: 15
      });
      this.startBackupCountdown();
    },
    startBackupCountdown() {
      this.backupTimer = setInterval(() => {
        if (this.data.backupCountdown > 1) {
          this.setData({ backupCountdown: this.data.backupCountdown - 1 });
        } else {
          clearInterval(this.backupTimer);
          this.hide();
          this.triggerEvent('adfinished', { completed: true });
        }
      }, 1000);
    }
  }
});
