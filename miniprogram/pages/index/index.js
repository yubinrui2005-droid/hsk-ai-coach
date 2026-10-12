const { t } = require('../../utils/i18n');
const { getAllVocabulary, getUnlearnedWords, getMistakeWords } = require('../../utils/vocab-utils');

Page({
  data: {
    groupSize: 10,
    groupSizes: [5, 10, 20],
    totalWords: 0,
    unlearnedWords: 0,
    mistakeCount: 0,
    showGroupPicker: false,

    hskLevels: [{ value: 0, label: 'HSK 1-3' }],
    selectedLevel: 0,
    showLevelPicker: false,

    langText: {}
  },

  onLoad() {
    this.initPage();
  },

  onShow() {
    this.initPage();
  },

  initPage() {
    const groupSize = wx.getStorageSync('groupSize') || 10;
    const level = this.data.selectedLevel;
    const allWords = getAllVocabulary();
    const unlearned = getUnlearnedWords(level);

    const levelLabel = t('hskLevel');
    const levelValue = t('hskLevelLabel');
    const mistakes = getMistakeWords(level);

    this.setData({
      groupSize: groupSize,
      totalWords: allWords.length,
      unlearnedWords: unlearned.length,
      mistakeCount: mistakes.length,
      hskLevels: [{ value: 0, label: levelValue }],
      langText: {
        groupLabel: t('wordsPerGroup'),
        levelLabel: levelLabel,
        levelValue: levelValue,
        studyText: t('study'),
        studyDesc: t('studyDesc'),
        reviewText: t('review'),
        reviewDesc: t('reviewDesc'),
        mistakeReviewText: t('mistakeReview'),
        mistakeReviewDesc: mistakes.length > 0
          ? t('mistakeReviewCount', { count: mistakes.length })
          : t('mistakeReviewEmpty'),
        addWordText: t('addWord'),
        manageText: t('manage'),
        settingsText: t('settings'),
        wordsAvail: t('wordsAvailable', { count: unlearned.length })
      }
    });
  },

  onGroupSizeChange(e) {
    const size = parseInt(e.currentTarget.dataset.size);
    this.setData({ groupSize: size, showGroupPicker: false });
    wx.setStorageSync('groupSize', size);
  },

  toggleGroupPicker() {
    this.setData({ showGroupPicker: !this.data.showGroupPicker, showLevelPicker: false });
  },

  onLevelChange(e) {
    const level = parseInt(e.currentTarget.dataset.level);
    this.setData({ selectedLevel: level, showLevelPicker: false });
    wx.setStorageSync('hskLevel', level);
    this.updateWordCount();
  },

  toggleLevelPicker() {
    this.setData({ showLevelPicker: !this.data.showLevelPicker, showGroupPicker: false });
  },

  updateWordCount() {
    const level = this.data.selectedLevel;
    const unlearned = getUnlearnedWords(level);
    const mistakes = getMistakeWords(level);
    this.setData({
      unlearnedWords: unlearned.length,
      mistakeCount: mistakes.length,
      'langText.wordsAvail': t('wordsAvailable', { count: unlearned.length }),
      'langText.mistakeReviewDesc': mistakes.length > 0
        ? t('mistakeReviewCount', { count: mistakes.length })
        : t('mistakeReviewEmpty')
    });
  },

  openMistakeReview() {
    const { selectedLevel } = this.data;
    wx.navigateTo({
      url: `/pages/study/study?mode=mistake&level=${selectedLevel}`
    });
  },

  startStudy() {
    const { groupSize, selectedLevel } = this.data;
    const unlearned = getUnlearnedWords(selectedLevel);
    if (unlearned.length === 0) {
      wx.showToast({
        title: t('allLearned'),
        icon: 'none',
        duration: 2500
      });
      return;
    }
    if (unlearned.length < groupSize && unlearned.length < groupSize) {
      wx.showToast({
        title: t('needMoreWords', { count: groupSize, current: unlearned.length }),
        icon: 'none',
        duration: 2500
      });
      return;
    }
    wx.navigateTo({
      url: `/pages/study/study?groupSize=${groupSize}&level=${selectedLevel}`
    });
  },

  startReview() {
    wx.navigateTo({
      url: '/pages/review/review'
    });
  },

  openAddWord() {
    wx.navigateTo({
      url: '/pages/add-word/add-word'
    });
  },

  openManage() {
    wx.navigateTo({
      url: '/pages/manage/manage'
    });
  },

  openSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  },

  stopPropagation() {},

  onShareAppMessage() {
    const allWords = getAllVocabulary();
    return {
      title: t('shareTitle', { count: allWords.length }),
      path: '/pages/index/index'
    };
  },

  onShareTimeline() {
    const allWords = getAllVocabulary();
    return {
      title: t('shareTimelineTitle', { count: allWords.length }),
      query: ''
    };
  }
});
