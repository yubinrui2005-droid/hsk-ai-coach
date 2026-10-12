/**
 * 词汇工具 - 主词库以 vocabulary.js 为准，每次启动同步到本地存储
 * Vocab Utilities - Master word list from vocabulary.js, synced to local storage on startup
 */

const builtinSeed = require('../data/vocabulary');
const STORAGE_KEY = 'masterWords';
const VERSION_KEY = 'vocabVersion';
let _synced = false;

function _syncFromCode() {
  if (_synced) return;
  _synced = true;

  const codeVersion = builtinSeed.length;
  let storedVersion = 0;
  try {
    storedVersion = wx.getStorageSync(VERSION_KEY) || 0;
  } catch (e) {}

  if (storedVersion === codeVersion) return;

  const seed = builtinSeed.map((w, i) => {
    const id = 'custom_' + i;
    return { ...w, _id: id, id: id, level: w.level || 0 };
  });

  wx.setStorageSync(STORAGE_KEY, seed);
  wx.setStorageSync(VERSION_KEY, codeVersion);
}

function _readAll() {
  _syncFromCode();
  try {
    const raw = wx.getStorageSync(STORAGE_KEY);
    if (Array.isArray(raw)) return raw;
  } catch (e) {}
  return [];
}

function _writeAll(arr) {
  wx.setStorageSync(STORAGE_KEY, arr);
}

function getAllVocabulary() {
  return _readAll();
}

function getWordsByLevel(level) {
  if (level == null || level < 0) return getAllVocabulary();
  return getAllVocabulary().filter(w => w.level === level);
}

/* ───── 学习记录 / Learning Records ───── */
function _learnedKey(level) {
  return 'learnedWords_' + level;
}

function markLearned(level, wordId) {
  const key = _learnedKey(level);
  let learned = [];
  try { learned = wx.getStorageSync(key) || []; } catch (e) {}
  if (learned.indexOf(wordId) === -1) {
    learned.push(wordId);
    wx.setStorageSync(key, learned);
  }
}

function getUnlearnedWords(level) {
  const all = getWordsByLevel(level);
  const key = _learnedKey(level);
  let learned = [];
  try { learned = wx.getStorageSync(key) || []; } catch (e) {}
  return all.filter(w => learned.indexOf(w._id) === -1);
}

function clearLearned(level) {
  const key = _learnedKey(level);
  try { wx.removeStorageSync(key); } catch (e) {}
}

/* ───── 错词记录 / Mistake Records ───── */
function _mistakeKey(level) {
  return 'mistakeWords_' + level;
}

function markMistake(level, wordId) {
  const key = _mistakeKey(level);
  let mistakes = [];
  try { mistakes = wx.getStorageSync(key) || []; } catch (e) {}
  if (mistakes.indexOf(wordId) === -1) {
    mistakes.push(wordId);
    wx.setStorageSync(key, mistakes);
  }
}

function removeMistake(level, wordId) {
  const key = _mistakeKey(level);
  let mistakes = [];
  try { mistakes = wx.getStorageSync(key) || []; } catch (e) {}
  const idx = mistakes.indexOf(wordId);
  if (idx !== -1) {
    mistakes.splice(idx, 1);
    wx.setStorageSync(key, mistakes);
  }
}

function getMistakeWords(level) {
  const all = getWordsByLevel(level);
  const key = _mistakeKey(level);
  let mistakes = [];
  try { mistakes = wx.getStorageSync(key) || []; } catch (e) {}
  return all.filter(w => mistakes.indexOf(w._id) !== -1);
}

function clearMistakes(level) {
  const key = _mistakeKey(level);
  try { wx.removeStorageSync(key); } catch (e) {}
}

function addWord(word) {
  const all = _readAll();
  const id = 'custom_' + Date.now();
  const newWord = {
    ...word,
    _id: id,
    id: id,
    level: word.level || 0
  };
  all.push(newWord);
  _writeAll(all);
  return newWord;
}

function updateWord(id, data) {
  const all = _readAll();
  const idx = all.findIndex(w => w._id === id);
  if (idx === -1) return false;
  all[idx] = { ...all[idx], ...data, _id: id, id: id };
  _writeAll(all);
  return true;
}

function deleteWord(id) {
  const all = _readAll();
  const idx = all.findIndex(w => w._id === id);
  if (idx === -1) return false;
  all.splice(idx, 1);
  _writeAll(all);
  return true;
}

function getCustomWords() {
  return getAllVocabulary().filter(w => w._id && w._id.startsWith('custom_'));
}

function saveCustomWord(word) {
  return addWord(word);
}

function deleteCustomWord(index) {
  const custom = getCustomWords();
  if (index >= 0 && index < custom.length) {
    return deleteWord(custom[index]._id);
  }
  return false;
}

module.exports = {
  getAllVocabulary,
  getWordsByLevel,
  markLearned,
  getUnlearnedWords,
  clearLearned,
  markMistake,
  removeMistake,
  getMistakeWords,
  clearMistakes,
  addWord,
  updateWord,
  deleteWord,
  getCustomWords,
  saveCustomWord,
  deleteCustomWord
};
