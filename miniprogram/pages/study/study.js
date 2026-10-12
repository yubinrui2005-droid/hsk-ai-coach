const { t } = require('../../utils/i18n');
const { getUnlearnedWords, markLearned, markMistake, removeMistake, getMistakeWords, clearMistakes } = require('../../utils/vocab-utils');

Page({
  data: {
    currentWord: null,
    currentIndex: 0,
    totalQuestions: 0,
    progressText: '',
    resultSummary: '',
    options: [],
    selectedOption: -1,
    isCorrect: false,
    isWrong: false,
    answered: false,
    correctCount: 0,
    wrongCount: 0,
    isCompleted: false,
    showResult: false,
    progressPercent: 0,

    level: 0,
    mode: 'learn',
    isMistakeMode: false,
    langText: {}
  },

  onLoad(options) {
    this.initAudio();
    const groupSize = parseInt(options.groupSize) || 10;
    const level = parseInt(options.level) || 0;
    const mode = options.mode === 'mistake' ? 'mistake' : 'learn';
    this.setData({ level: level, mode: mode, isMistakeMode: mode === 'mistake' });
    this.prepareQuestions(groupSize, level);
  },

  initAudio() {
    try {
      this.rightAudio = wx.createInnerAudioContext();
      this.rightAudio.src = '/assets/audio/right.wav';
      this.rightAudio.obeyMuteSwitch = false;

      this.wrongAudio = wx.createInnerAudioContext();
      this.wrongAudio.src = '/assets/audio/wrong.wav';
      this.wrongAudio.obeyMuteSwitch = false;
    } catch (e) {
      console.warn('Audio init failed:', e);
    }
  },

  onUnload() {
    try {
      if (this.rightAudio) this.rightAudio.destroy();
      if (this.wrongAudio) this.wrongAudio.destroy();
    } catch (e) {}
  },

  prepareQuestions(groupSize, level) {
    const mode = this.data.mode;
    const vocabulary = mode === 'mistake' ? getMistakeWords(level) : getUnlearnedWords(level);
    if (vocabulary.length === 0) {
      const emptyMsg = mode === 'mistake' ? t('noMistakes') : t('allLearned');
      this.setData({
        isCompleted: true,
        totalQuestions: 0,
        correctCount: 0,
        wrongCount: 0,
        resultSummary: emptyMsg,
        langText: {
          completed: t('completed'),
          correctLabel: t('correct'),
          wrongLabel: t('wrong'),
          accuracy: t('accuracy'),
          studyAgain: mode === 'mistake' ? t('continueReview') : t('studyAgain'),
          clearMistakes: t('clearMistakes'),
          backToHome: t('backToHome')
        }
      });
      return;
    }

    const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(groupSize, vocabulary.length));

    const questions = selected.map(word => {
      const allOptions = [word.answer, ...word.distractors];
      const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);
      return {
        ...word,
        options: shuffledOptions
      };
    });

    this.questions = questions;
    this.setData({
      totalQuestions: questions.length,
      currentIndex: 0,
      langText: {
        studyProgress: t('studyProgress'),
        chooseMeaning: t('chooseMeaning'),
        completed: t('completed'),
        total: t('totalQuestions'),
        correctLabel: t('correct'),
        wrongLabel: t('wrong'),
        accuracy: t('accuracy'),
        studyAgain: mode === 'mistake' ? t('continueReview') : t('studyAgain'),
        clearMistakes: t('clearMistakes'),
        backToHome: t('backToHome')
      }
    });
    this.showQuestion(0);
  },

  showQuestion(index) {
    if (index >= this.questions.length) {
      this.finishQuiz();
      return;
    }

    const question = this.questions[index];
    const letters = ['A', 'B', 'C', 'D'];
    const progressStr = t('studyProgress', { current: index + 1, total: this.questions.length });
    this.setData({
      currentWord: question,
      currentIndex: index,
      progressText: progressStr,
      options: question.options.map((text, i) => ({
        text,
        index: i,
        letter: letters[i],
        state: ''
      })),
      selectedOption: -1,
      isCorrect: false,
      isWrong: false,
      answered: false,
      progressPercent: Math.round((index / this.questions.length) * 100)
    });
  },

  playSound(type) {
    try {
      const audio = type === 'right' ? this.rightAudio : this.wrongAudio;
      if (audio) {
        audio.stop();
        audio.seek(0);
        audio.play();
      }
    } catch (e) {}
  },

  selectAnswer(e) {
    if (this.data.answered) return;

    const selectedIndex = e.currentTarget.dataset.index;
    const optionText = this.data.options[selectedIndex].text;
    const correctAnswer = this.data.currentWord.answer;
    const isCorrect = optionText === correctAnswer;

    if (isCorrect) {
      this.playSound('right');

      const level = this.data.level;
      const wordId = this.data.currentWord._id;
      if (this.data.mode === 'mistake') {
        removeMistake(level, wordId);
      } else {
        markLearned(level, wordId);
      }

      const newOptions = this.data.options.map((opt, i) => {
        if (i === selectedIndex) return { ...opt, state: 'correct' };
        return opt;
      });

      this.setData({
        options: newOptions,
        isCorrect: true,
        isWrong: false,
        answered: true,
        correctCount: this.data.correctCount + 1
      });

      setTimeout(() => {
        this.showQuestion(this.data.currentIndex + 1);
      }, 800);
    } else {
      this.playSound('wrong');

      if (this.data.mode !== 'mistake') {
        markMistake(this.data.level, this.data.currentWord._id);
      }

      const newOptions = this.data.options.map((opt, i) => {
        if (i === selectedIndex) return { ...opt, state: 'wrong' };
        return opt;
      });

      this.setData({
        options: newOptions,
        isCorrect: false,
        isWrong: true,
        wrongCount: this.data.wrongCount + 1
      });

      setTimeout(() => {
        const resetOptions = this.data.options.map(opt => ({
          ...opt, state: ''
        }));
        this.setData({
          options: resetOptions,
          isWrong: false
        });
      }, 600);
    }
  },

  finishQuiz() {
    const totalAttempts = this.data.correctCount + this.data.wrongCount;
    const accuracy = totalAttempts > 0
      ? Math.round((this.data.correctCount / totalAttempts) * 100)
      : 0;

    const summary = t('studyProgress', {
      current: this.data.correctCount,
      total: this.data.totalQuestions
    });

    this.setData({
      isCompleted: true,
      progressPercent: 100,
      accuracy: accuracy,
      resultSummary: summary
    });
  },

  studyAgain() {
    const groupSize = wx.getStorageSync('groupSize') || 10;
    const level = this.data.level;
    this.setData({
      correctCount: 0,
      wrongCount: 0,
      isCompleted: false
    });
    this.prepareQuestions(groupSize, level);
  },

  clearAllMistakes() {
    const level = this.data.level;
    wx.showModal({
      title: t('clearMistakesTitle'),
      content: t('clearMistakesConfirm'),
      success: (res) => {
        if (res.confirm) {
          clearMistakes(level);
          wx.showToast({ title: t('clearMistakesDone'), icon: 'success', duration: 1500 });
          const groupSize = wx.getStorageSync('groupSize') || 10;
          this.setData({
            correctCount: 0,
            wrongCount: 0,
            isCompleted: false
          });
          this.prepareQuestions(groupSize, level);
        }
      }
    });
  },

  backToHome() {
    wx.navigateBack();
  }
});
