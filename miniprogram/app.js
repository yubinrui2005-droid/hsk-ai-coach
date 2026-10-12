App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('Please use Base Library 2.2.3 or above to use cloud capabilities');
    } else {
      wx.cloud.init({
        env: 'your-env-id',
        traceUser: true
      });
    }

    // 初始化默认设置 / Initialize default settings
    if (!wx.getStorageSync('language')) {
      wx.setStorageSync('language', 'en');
    }
    if (!wx.getStorageSync('groupSize')) {
      wx.setStorageSync('groupSize', 10);
    }
  },

  globalData: {
    language: 'en',
    groupSize: 10
  }
});