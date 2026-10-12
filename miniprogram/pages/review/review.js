const { t } = require('../../utils/i18n');
const { getAllVocabulary, getWordsByLevel, clearLearned } = require('../../utils/vocab-utils');

Page({
  data: {
    words: [],
    totalCount: 0,
    expandedId: -1,

    levels: [],
    selectedLevel: -1,
    showLevelPicker: false
  },

  onLoad() {
    const showAllLabel = t('levelAll');
    const hsk13Label = t('hskLevelLabel');
    this.setData({
      levels: [
        { value: -1, label: showAllLabel },
        { value: 0, label: hsk13Label }
      ],
      selectedLevel: -1
    });
    this.loadWords();
  },

  onShow() {
    this.loadWords();
  },

  loadWords() {
    const level = this.data.selectedLevel;
    const words = level === -1 ? getAllVocabulary() : getWordsByLevel(level);
    this.setData({
      words: words,
      totalCount: words.length
    });
  },

  onLevelChange(e) {
    const level = parseInt(e.currentTarget.dataset.level);
    this.setData({
      selectedLevel: level,
      showLevelPicker: false
    });
    this.loadWords();
  },

  toggleLevelPicker() {
    this.setData({ showLevelPicker: !this.data.showLevelPicker });
  },

  onClearLearned() {
    const level = this.data.selectedLevel;
    const confirmText = level === -1
      ? t('clearAllConfirm')
      : t('clearLevelConfirm');
    wx.showModal({
      title: t('clearLearnedTitle'),
      content: confirmText,
      success: (res) => {
        if (res.confirm) {
          if (level === -1) {
            clearLearned(0);
          } else {
            clearLearned(level);
          }
          wx.showToast({ title: t('clearDone'), icon: 'success', duration: 1500 });
          this.loadWords();
        }
      }
    });
  },

  toggleCard(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      expandedId: this.data.expandedId === id ? -1 : id
    });
  },

  backToHome() {
    wx.navigateBack();
  }
});
