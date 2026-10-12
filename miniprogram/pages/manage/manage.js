const { t } = require('../../utils/i18n');
const { getAllVocabulary, updateWord, deleteWord, addWord } = require('../../utils/vocab-utils');

Page({
  data: {
    allWords: [],

    hskLevels: [{ value: 0, labelKey: 'hskLevelLabel' }],
    selectedLevel: 0,
    showLevelPicker: false,

    editingId: null,
    formWord: '',
    formPinyin: '',
    formSentence: '',
    formPos: '',
    formAnswer: '',
    formD2: '',
    formD3: '',
    formD4: '',
    isEditing: false,

    langText: {}
  },

  onLoad() {
    this.refresh();
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const all = getAllVocabulary();
    this.setData({
      allWords: all,
      hskLevels: this.data.hskLevels.map(lv => ({ ...lv, label: t(lv.labelKey) })),
      langText: {
        levelLabel: t('hskLevel'),
        levelValue: t('hskLevelLabel'),
        wordLabel: t('manageWord'),
        pinyinLabel: t('managePinyin'),
        sentenceLabel: t('manageSentence'),
        posLabel: t('managePos'),
        answerLabel: t('manageAnswer'),
        editBtn: t('manageEdit'),
        deleteBtn: t('manageDelete'),
        saveBtn: t('manageSave'),
        cancelBtn: t('manageCancel'),
        addBtn: t('manageAdd'),
        confirmDelete: t('manageConfirmDelete'),
        fillAll: t('manageFillAll'),
        totalWords: t('wordCount', { count: all.length })
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

  startEdit(e) {
    const id = e.currentTarget.dataset.id;
    const word = this.data.allWords.find(w => w._id === id);
    if (!word) return;
    this.setData({
      editingId: id,
      isEditing: true,
      formWord: word.word,
      formPinyin: word.pinyin,
      formSentence: word.sentence || '',
      formPos: word.pos || '',
      formAnswer: word.answer,
      formD2: word.distractors[0] || '',
      formD3: word.distractors[1] || '',
      formD4: word.distractors[2] || ''
    });
  },

  startAdd() {
    this.setData({
      editingId: null,
      isEditing: true,
      formWord: '',
      formPinyin: '',
      formSentence: '',
      formPos: '',
      formAnswer: '',
      formD2: '',
      formD3: '',
      formD4: ''
    });
  },

  cancelEdit() {
    this.setData({
      editingId: null,
      isEditing: false
    });
  },

  onFormWord(e) { this.setData({ formWord: e.detail.value }); },
  onFormPinyin(e) { this.setData({ formPinyin: e.detail.value }); },
  onFormSentence(e) { this.setData({ formSentence: e.detail.value }); },
onFormPos(e) { this.setData({ formPos: e.detail.value }); },
onFormAnswer(e) { this.setData({ formAnswer: e.detail.value }); },
  onFormD2(e) { this.setData({ formD2: e.detail.value }); },
  onFormD3(e) { this.setData({ formD3: e.detail.value }); },
  onFormD4(e) { this.setData({ formD4: e.detail.value }); },

  saveWord() {
    const { formWord, formPinyin, formAnswer, formD2, formD3, formD4, editingId } = this.data;
    if (!formWord.trim() || !formPinyin.trim() || !formAnswer.trim() || !formD2.trim() || !formD3.trim() || !formD4.trim()) {
      wx.showToast({ title: t('manageFillAll'), icon: 'none', duration: 2000 });
      return;
    }
    const wordData = {
      word: formWord.trim(),
      pinyin: formPinyin.trim(),
      sentence: this.data.formSentence.trim(),
      pos: this.data.formPos.trim(),
      answer: formAnswer.trim(),
      distractors: [formD2.trim(), formD3.trim(), formD4.trim()],
      level: 0
    };

    if (editingId) {
      updateWord(editingId, wordData);
    } else {
      addWord(wordData);
    }

    this.cancelEdit();
    this.setData({ allWords: getAllVocabulary() });
    this.refresh();
  },

  deleteWord(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: t('manageConfirmDelete'),
      success: (res) => {
        if (res.confirm) {
          deleteWord(id);
          this.setData({ allWords: getAllVocabulary() });
          this.refresh();
        }
      }
    });
  },

  exportWords() {
    const words = getAllVocabulary();
    const data = JSON.stringify(words, null, 2);
    wx.setClipboardData({
      data: data,
      success: () => {
        wx.showToast({ title: t('manageExportSuccess'), icon: 'success', duration: 2000 });
      },
      fail: () => {
        wx.showToast({ title: t('manageExportFail'), icon: 'none', duration: 2000 });
      }
    });
  },

  backToHome() {
    wx.navigateBack();
  },

  stopPropagation() {}
});
