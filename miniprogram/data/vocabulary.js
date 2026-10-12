/**
 * ============================================
 *  HSK 词汇数据文件 - Vocabulary Data File
 * ============================================
 * 
 * 在这里添加你的HSK词汇。每个词汇包含以下字段：
 * Add your HSK vocabulary here. Each word contains:
 * 
 *   id          - 唯一编号 / Unique ID
 *   word        - 中文词汇 / Chinese word
 *   pinyin      - 拼音 / Pinyin
 *   pos         - 词性 / Part of speech
 *   sentence    - 例句 / Example sentence
 *   answer      - 正确答案（英文）/ Correct answer (English)
 *   distractors - 3个干扰项（英文）/ 3 wrong options (English)
 * 
 * 注意 / Note:
 * - distractors 必须是3个英文选项，系统会自动与 answer 混合成4个选项
 * - distractors must contain exactly 3 English options
 * - 可以直接复制下面的例子继续添加 / Copy the example below to add more
 * 
 * 当前等级：HSK 1-3 / Current level: HSK 1-3
 * ============================================
 */

const vocabulary = [
  { id: 1,  level: 0, word: "我",   pinyin: "wǒ",      sentence: "我想买一些铅笔。",       pos: "pron.", answer: "I, me",        distractors: ["you,yours", "he,his", "my,mine"] },
  { id: 2,  level: 0, word: "你",   pinyin: "nǐ",      sentence: "你自己挑吧。",              pos: "pron.", answer: "you",    distractors: ["Hello", "Goodbye", "You're welcome"] },
  { id: 3,  level: 0, word: "是",   pinyin: "shì",     sentence: "这是他的书",              pos: "v.", answer: "be(is/am/are);yes",      distractors: ["travel","look(see/watch)","view"] },
  { id: 4,  level: 0, word: "不", pinyin: "bú",    sentence: "我不爱吃苹果。",         pos: "", answer: "not,no",        distractors: ["never, none", "without, lack", "hardly, barely"] },
  { id: 5,  level: 0, word: "去",   pinyin: "qù",     sentence: "我们什么时候去爬山?",             pos: "v.", answer: "go",        distractors: ["walk; stroll","depart; leave","travel; journey"] },
  { id: 6,  level: 0, word: "有",     pinyin: "yǒu",         sentence: "他是大学老师，他有很多学生。",             pos: "v.", answer: "have;there be",        distractors: ["own; possess","exist; occur","hold; contain"] },
  { id: 7,  level: 0, word: "好",     pinyin: "hǎo",          sentence: "大家可以好好放松一下了。",             pos: "adj. & adv.", answer: "good;well",          distractors: ["fine; nicely","great; perfectly","nice; properly"] },
  { id: 8,  level: 0, word: "很",   pinyin: "hěn",     sentence: "那儿离我家很近，很方便。",           pos: "adv.", answer: "very",       distractors: ["quite","rather","extremely"] },
  { id: 9,  level: 0, word: "什么",   pinyin: "shén me",      sentence: "她每天在家做什么?",           pos: "pron.", answer: "what",      distractors: ["who","where","which"] },
  { id: 10, level: 0, word: "看",   pinyin: "kàn",     sentence: "我和女儿都爱看话剧。",           pos: "v.", answer: "watch,see(a doctor)",       distractors: ["read, glance at","stare, gaze","view, observe"] },
  { id: 11, level: 0, word: "他", pinyin: "tā", sentence: "他是医生。", pos: "pron.", answer: "he,him", distractors: ["she,her","it,its","they,them"] },
  { id: 12, level: 0, word: "一", pinyin: "yī", sentence: "你想买哪一个? ", pos: "num.", answer: "one", distractors: ["a", "two", "own"] },
  { id: 13, level: 0, word: "那", pinyin: "nà", sentence: "那是谁的书?", pos: "pron.", answer: "that", distractors: ["this","these","those"] },
  { id: 14, level: 0, word: "就", pinyin: " jiù  ", sentence: "没事儿，我很快就办完。", pos: "adv.", answer: "right away;just", distractors: ["at once; merely","straight away; simply","right now; exactly"] },
  { id: 15, level: 0, word: "来", pinyin: "lái", sentence: "妈妈什么时候来北京呢? ", pos: "v.", answer: "come", distractors: ["arrive","approach","attend"] },
  { id: 16, level: 0, word: "点", pinyin: "diǎn", sentence: "现在是上午八点四十。", pos: " m.w.&num.", answer: "o'clock;a little ", distractors: ["hour mark; a bit","time point; slightly","clock reading; somewhat"] },
  { id: 17, level: 0, word: "要", pinyin: "yào", sentence: "我每天都要洗碗。", pos: "m.w.&num.", answer: "must,want", distractors: ["need, desire","ought, wish","have to, feel like"] },
  { id: 18, level: 0, word: "人", pinyin: "rén", sentence: "你家有几口人?", pos: "n.", answer: "person,people ", distractors: ["individual, crowd","folk, folks","creature, citizen"] },
  { id: 19, level: 0, word: "多", pinyin: "duō", sentence: "这里很多年没下雪了。", pos: "adj.&adv.", answer: "many;much more", distractors: ["numerous; far more","plenty; extra","a lot of; additional"] },
  { id: 20, level: 0, word: "下", pinyin: "xià", sentence: "小狗在桌子下面。   ", pos: "n.&adj.", answer: "under;next ", distractors: ["below; following","beneath; subsequent","underneath; coming"] },
  { id: 21, level: 0, word: "我们", pinyin: "wǒ men", sentence: "我们坐火车去。", pos: "pron.", answer: "we,us", distractors: ["they, them","you, yourselves","all of us, ourselves"] },
  { id: 22, level: 0, word: "会", pinyin: "huì", sentence: "你会说英语吗?", pos: "v.", answer: "can,be possible", distractors: ["be able to, might","know how to, will","could, likely"] },
  { id: 23, level: 0, word: "到", pinyin: "dào", sentence: "那个电脑不到四千元。", pos: "v.", answer: "be up to;arrive", distractors: ["reach; get to","arrive at; come to","as much as; get there"] },
  { id: 24, level: 0, word: "还", pinyin: "hái ", sentence: "他还在教室里看书。", pos: "adv.", answer: "even more,still", distractors: ["yet, additionally","still, furthermore","as well, even"] },
  { id: 25, level: 0, word: "买", pinyin: "mǎi", sentence: "您想买什么牌子的手机？", pos: "v.", answer: "buy,purchase ", distractors: ["obtain, acquire","shop for, secure","get, invest in"] },
  { id: 26, level: 0, word: "女", pinyin: "nǔ", sentence: "我们班女生比男生多。", pos: "n.", answer: "female,woman", distractors: ["lady, maiden","miss, feminine","young woman, distaff"] },
  { id: 27, level: 0, word: "吃", pinyin: "chī", sentence: "医生说爸爸不能吃甜的。", pos: "v.", answer: "eat", distractors: ["dine, consume","ingest, partake","feed, devour"] },
  { id: 28, level: 0, word: "家", pinyin: "jiā ", sentence: "家里还有苹果吗?", pos: "n.&m.w", answer: "home", distractors: ["household; establishment","residence; outlet","family; venue"] },
  { id: 29, level: 0, word: "想", pinyin: "xiǎng", sentence: "他想看什么节目?", pos: "v.", answer: "wish,want", distractors: ["desire, crave","long for, intend","fancy, aspire"] },
  { id: 30, level: 0, word: "她", pinyin: "tā", sentence: "她在商场买东西", pos: "pron.", answer: "she,her", distractors: ["herself, feminine subject","female pronoun, feminine object","the woman, that lady"] },
  { id: 31, level: 0, word: "现在", pinyin: "xiàn zài", sentence: "你现在去机场? ", pos: "n.", answer: "now,at present", distractors: ["soon", "then", "today"] },
  { id: 32, level: 0, word: "都", pinyin: "dōu", sentence: "同事们都很喜欢她。", pos: "adv.", answer: "already,all", distractors: ["yet", "quite", "always"] },
  { id: 33, level: 0, word: "小", pinyin: "xiǎo", sentence: "这件衣服太小了。", pos: "adj.", answer: "small,tiny", distractors: ["long", "heavy", "fast"] },
  { id: 34, level: 0, word: "男", pinyin: "nán", sentence: "你们班有多少个男同学?", pos: "n.", answer: "male,man", distractors: ["kid", "friend", "parent"] },
  { id: 35, level: 0, word: "做", pinyin: "zuò", sentence: "他做过哪些工作?", pos: "v.", answer: "do", distractors: ["go", "take", "play"] },
  { id: 36, level: 0, word: "怎么", pinyin: "zěn me", sentence: "你怎么不高兴了?", pos: "pron.", answer: "how,what", distractors: ["who", "where", "when"] },
  { id: 37, level: 0, word: "年", pinyin: "nián", sentence: "我们认识三年了。", pos: "n.", answer: "year", distractors: ["month", "hour", "week"] },
  { id: 38, level: 0, word: "和", pinyin: "hé", sentence: "冰箱里有面包和牛奶。", pos: "conj.", answer: "and,with", distractors: ["but", "either", "so"] },
  { id: 39, level: 0, word: "您", pinyin: "nín", sentence: "先生，您想喝点儿什么?", pos: "pron.", answer: "you(polite form)", distractors: ["she", "he", "they(all people)"] },
  { id: 40, level: 0, word: "太", pinyin: "tài", sentence: "这件衣服太大了。", pos: "adv.", answer: "too,very", distractors: ["quite", "much", "so(very)"] },
  { id: 41, level: 0, word: "可以", pinyin: "kě yǐ", sentence: "这本书可以借给我看看吗?", pos: "v.", answer: "can,be able to", distractors: ["want", "need", "may"] },
  { id: 42, level: 0, word: "说", pinyin: "shuō", sentence: "对不起，你说什么?", pos: "v.", answer: "say,talk", distractors: ["listen, hear", "read, study", "watch, see"] },
  { id: 43, level: 0, word: "怎么样", pinyin: "zěn me yàng", sentence: "你的汉语怎么样?", pos: "pron.", answer: "how about", distractors: ["what about", "why not", "how much"] },
  { id: 44, level: 0, word: "今天", pinyin: "jin tiān", sentence: "你今天去北京?", pos: "n.", answer: "today", distractors: ["tomorrow", "yesterday", "tonight"] },
  { id: 45, level: 0, word: "几", pinyin: "jǐ", sentence: "请你读一下这几个汉字。", pos: "num.", answer: "how many,several", distractors: ["how much", "what time", "which one"] },
  { id: 46, level: 0, word: "喜欢", pinyin: "xǐ huan", sentence: "中国人喜欢喝茶。", pos: "v.", answer: "like,be fond of", distractors: ["love,be keen on", "enjoy,be interested in", "prefer,be in favor of"] },
  { id: 47, level: 0, word: "听", pinyin: "tīng", sentence: "你们听懂了吗?", pos: "v.", answer: "listen,hear", distractors: ["say, talk", "look, see", "read, study"] },
  { id: 48, level: 0, word: "给", pinyin: "gěi", sentence: "你给我打电话了?", pos: "prep.& v.", answer: "to,for;give ", distractors: ["on, in; take", "at, with; get", "from, by; bring"] },
  { id: 49, level: 0, word: "别", pinyin: "bié", sentence: "你别睡了， 快迟到了。", pos: "adv.", answer: "(do)not,", distractors: ["might(not)", "also", "what"] },
  { id: 50, level: 0, word: "也", pinyin: "yě", sentence: "我也想住得近点儿。", pos: "adv.", answer: "also", distractors: ["two", "get", "may"] },
];

module.exports = vocabulary;
