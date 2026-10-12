const { t, getLang, setLang } = require('../../utils/i18n');

Page({
  data: {
    currentLang: 'en',
    groupSize: 10,
    groupSizes: [5, 10, 20]
  },

  onLoad() {
    this.initPage();
  },

  onShow() {
    this.initPage();
  },

  initPage() {
    const lang = getLang();
    const groupSize = wx.getStorageSync('groupSize') || 10;
    this.setData({
      currentLang: lang,
      groupSize: groupSize
    });
  },

  switchLanguage(e) {
    const lang = e.currentTarget.dataset.lang;
    setLang(lang);
    this.setData({ currentLang: lang });
  },

  onGroupSizeChange(e) {
    const size = parseInt(e.currentTarget.dataset.size);
    this.setData({ groupSize: size });
    wx.setStorageSync('groupSize', size);
  },

  backToHome() {
    wx.navigateBack();
  }
});
