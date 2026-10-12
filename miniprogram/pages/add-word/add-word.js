const { t } = require('../../utils/i18n');
const { getCustomWords, saveCustomWord, deleteCustomWord } = require('../../utils/vocab-utils');

Page({
  data: {
    word: '',
    pinyin: '',
    sentence: '',
    pos: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctIndex: 0,

    hskLevels: [{ value: 0, labelKey: 'hskLevelLabel' }],
    selectedLevel: 0,
    showLevelPicker: false,

    langText: {},
    customWords: []
  },

  onLoad() {
    this.refreshUI();
  },

  onShow() {
    this.refreshUI();
  },

  refreshUI() {
    const words = getCustomWords();
    this.setData({
      customWords: words,
      hskLevels: this.data.hskLevels.map(lv => ({ ...lv, label: t(lv.labelKey) })),
      langText: {
        levelLabel: t('hskLevel'),
        levelValue: t('hskLevelLabel'),
        pageTitle: t('addWordTitle'),
        wordPlaceholder: t('addWordWord'),
        pinyinPlaceholder: t('addWordPinyin'),
        sentencePlaceholder: t('addWordSentence'),
        posPlaceholder: t('addWordPos'),
        optionPlaceholder: t('addWordOption'),
        submitText: t('addWordSubmit'),
        deleteText: t('addWordDelete'),
        myWords: t('addWordMyWords'),
        noWords: t('addWordNoWords'),
        success: t('addWordSuccess'),
        fillAll: t('addWordFillAll'),
        confirmDelete: t('addWordConfirmDelete'),
        backToHome: t('backToHome')
      }
    });
  },

  toggleLevelPicker() {
    this.setData({ showLevelPicker: !this.data.showLevelPicker });
  },

  onLevelChange(e) {
    const level = parseInt(e.currentTarget.dataset.level);
    this.setData({ selectedLevel: level, showLevelPicker: false });
  },

  selectCorrect(e) {
    this.setData({ correctIndex: parseInt(e.currentTarget.dataset.index) });
  },

  onWordInput(e) {
    this.setData({ word: e.detail.value });
  },

  onPinyinInput(e) {
    this.setData({ pinyin: e.detail.value });
  },

  onSentenceInput(e) {
    this.setData({ sentence: e.detail.value });
  },

  onPosInput(e) {
    this.setData({ pos: e.detail.value });
  },

  onOption1Input(e) {
    this.setData({ option1: e.detail.value });
  },

  onOption2Input(e) {
    this.setData({ option2: e.detail.value });
  },

  onOption3Input(e) {
    this.setData({ option3: e.detail.value });
  },

  onOption4Input(e) {
    this.setData({ option4: e.detail.value });
  },

  submitWord() {
    const { word, pinyin, sentence, option1, option2, option3, option4, correctIndex } = this.data;
    const options = [option1, option2, option3, option4];

    const trimmed = options.map(o => o.trim());
    if (!word.trim() || !pinyin.trim() || trimmed.some(o => !o)) {
      wx.showToast({ title: t('addWordFillAll'), icon: 'none', duration: 2000 });
      return;
    }

    const answer = trimmed[correctIndex];
    const distractors = trimmed.filter((_, i) => i !== correctIndex);

    const newWord = {
      word: word.trim(),
      pinyin: pinyin.trim(),
      sentence: sentence.trim(),
      pos: this.data.pos.trim(),
      answer: answer,
      distractors: distractors,
      level: 0
    };

    saveCustomWord(newWord);

    wx.showToast({ title: t('addWordSuccess'), icon: 'success', duration: 1500 });

    this.setData({
      word: '',
      pinyin: '',
      sentence: '',
      pos: '',
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correctIndex: 0
    });

    this.refreshUI();
  },

  deleteWord(e) {
    const index = e.currentTarget.dataset.index;
    wx.showModal({
      title: t('addWordConfirmDelete'),
      success: (res) => {
        if (res.confirm) {
          deleteCustomWord(index);
          this.refreshUI();
        }
      }
    });
  },

  backToHome() {
    wx.navigateBack();
  },

  stopPropagation() {}
});
