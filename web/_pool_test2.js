/**
 * 场景对话素材池（v0.4）
 *
 * 不再写死剧本。一局对话由四层随机要素组合而成：
 *   场景 SCENE_POOL  +  角色性格 PERSONAS  +  本局挑战 CURSES  +  意外事件 TWISTS
 * 具体开场白和每一轮任务交给 AI 现场编写（见 director.js），
 * AI 不可用或返回不合法时，回落到本地模板拼装。
 */

/* ---------------- 场景池 ---------------- */

const SCENE_POOL = [
  { id: 'milktea',    cat: '日常', emoji: '🧋', name: '奶茶店点单',   role: '奶茶店店员',   brief: '点一杯饮品，说清口味、杯型、堂食还是带走' },
  { id: 'market',     cat: '日常', emoji: '🍓', name: '菜市场砍价',   role: '摊主',         brief: '嫌贵、还价、说要买多少、成交' },
  { id: 'noodle',     cat: '日常', emoji: '🍜', name: '餐厅上错菜',   role: '服务员',       brief: '指出问题、说明你点的是什么、要求换或退' },
  { id: 'express',    cat: '日常', emoji: '📦', name: '快递取件',     role: '驿站工作人员', brief: '报取件码、说明包裹问题、改地址或代取' },
  { id: 'taxi',       cat: '日常', emoji: '🚕', name: '打车赶飞机',   role: '出租车司机',   brief: '说目的地、催时间、商量走哪条路' },
  { id: 'barber',     cat: '日常', emoji: '💇', name: '理发店剪头',   role: '理发师',       brief: '描述想要的发型、说剪多短、别剪太短' },
  { id: 'gym',        cat: '办事', emoji: '🏋️', name: '健身房办卡',   role: '会籍顾问',     brief: '问价格、砍价、拒绝推销、说自己在考虑' },
  { id: 'bank',       cat: '办事', emoji: '🏦', name: '银行开户',     role: '柜员',         brief: '说明要办什么、回答身份问题、问材料' },
  { id: 'clinic',     cat: '办事', emoji: '🏥', name: '医院看病',     role: '内科医生',     brief: '说哪里不舒服、多久了、有没有过敏、问吃药' },
  { id: 'phone',      cat: '办事', emoji: '📱', name: '营业厅办套餐', role: '营业厅店员',   brief: '说需求、比较套餐、拒绝加钱项目' },
  { id: 'rent',       cat: '办事', emoji: '🏠', name: '租房看房',     role: '中介',         brief: '问租金、问押几付几、问能不能养宠物' },
  { id: 'resell',     cat: '办事', emoji: '🛒', name: '二手面交',     role: '卖家',         brief: '砍价、约地点时间、检查东西、成交或放弃' },
  { id: 'interview',  cat: '社交', emoji: '💼', name: '公司面试',     role: '面试官',       brief: '自我介绍、说优点、问一个问题、表达期待' },
  { id: 'late',       cat: '社交', emoji: '🎉', name: '聚会迟到',     role: '等你的朋友',   brief: '道歉、说明原因、提出补偿、约下次' },
  { id: 'blinddate',  cat: '社交', emoji: '💌', name: '相亲现场',     role: '相亲对象',     brief: '寒暄、聊爱好、礼貌拒绝或约下次' },
  { id: 'neighbor',   cat: '社交', emoji: '🏘️', name: '邻居太吵',     role: '楼上邻居',     brief: '委婉提意见、说清楚时间、商量办法' },
  { id: 'teacher',    cat: '社交', emoji: '📚', name: '找老师请假',   role: '班主任',       brief: '说明原因、说请几天、问能不能补作业' },
  { id: 'gaming',     cat: '社交', emoji: '🎮', name: '游戏开黑',     role: '队友',         brief: '报位置、催支援、甩锅或认错、商量战术' },
  { id: 'loudvideo',  cat: '社交', emoji: '🎧', name: '高铁邻座外放', role: '邻座乘客',     brief: '委婉提醒戴耳机、对方不服气、坚持但要有礼貌、商量解决' },
  // ---- 日常 · 生活摩擦 ----
  { id: 'hotpot',     cat: '日常', emoji: '🍲', name: '火锅店等位',   role: '前台叫号员',   brief: '问还要等多久、说明几个人、离开一下再回来、解释刚才没听见叫号' },
  { id: 'delivery',   cat: '日常', emoji: '🛵', name: '外卖洒了',     role: '外卖骑手',     brief: '说明餐洒了、商量退款还是重送、体谅对方赶时间、把事说清楚' },
  { id: 'ridechat',   cat: '日常', emoji: '🚗', name: '网约车闲聊',   role: '热情司机',     brief: '应付连环提问、说清目的地、礼貌地把话题收回来、聊到目的地' },
  // ---- 办事 · 手续升级 ----
  { id: 'train',      cat: '办事', emoji: '🎫', name: '春运抢票',     role: '客服专员',     brief: '说明要买哪天的票、问有没有票、候补怎么排、改签规则' },
  { id: 'driving',    cat: '办事', emoji: '🚘', name: '科目三考试',   role: '考官',         brief: '上车前报告、听懂指令、解释熄火原因、问成绩' },
  { id: 'airport',    cat: '办事', emoji: '✈️', name: '行李超重',     role: '值机柜员',     brief: '承认超重、商量怎么办、当场开箱拿东西、托运还是手提' },
  // ---- 奇遇 · 中国特色名场面 ----
  { id: 'scriptkill', cat: '奇遇', emoji: '🎭', name: '剧本杀拼场',   role: 'DM 主持人',    brief: '问能不能拼车、选角色、听规则、被大家怀疑是凶手' },
  { id: 'escape',     cat: '奇遇', emoji: '🗝️', name: '密室逃脱卡关', role: '密室 NPC',     brief: '卡关了求助、描述手里的线索、听懂提示、喊队友配合' },
  { id: 'square',     cat: '奇遇', emoji: '💃', name: '广场舞入伙',   role: '领舞大妈',     brief: '想加入、跟不上节奏、商量站在哪、被推去领舞' },
  { id: 'mahjong',    cat: '奇遇', emoji: '🀄', name: '麻将三缺一',   role: '邻居大爷',     brief: '被拉来凑桌、承认不太会、边学边玩、点炮了得认' },
  { id: 'corner',     cat: '奇遇', emoji: '❤️', name: '公园相亲角',   role: '替孩子来的大妈', brief: '应付连环盘问、介绍自己、礼貌脱身、不留联系方式' },
  { id: 'tourist',    cat: '奇遇', emoji: '🏔️', name: '景区拒绝拉客', role: '拉客的司机',   brief: '问路、拒绝包车、坚持自己的行程、把价格砍下来' },
  { id: 'hanfu',      cat: '奇遇', emoji: '🏮', name: '汉服店租赁',   role: '店员',         brief: '挑款式、问押金和时长、谈拍照、还衣服时说清污渍' },
];

const SCENE_CATS = ['全部', '日常', '办事', '社交', '奇遇'];

/* ---------------- 角色性格 ---------------- */

const PERSONAS = [
  { id: 'rash',    name: '急性子',   emoji: '⚡', desc: '语速快、爱催促，你说慢了他会打断你' },
  { id: 'warm',    name: '热心大妈', emoji: '🧣', desc: '话特别多，爱唠家常，经常跑题' },
  { id: 'cold',    name: '高冷',     emoji: '🧊', desc: '惜字如金，不主动说话，你得自己开口' },
  { id: 'chatty',  name: '话痨',     emoji: '🗣️', desc: '一个问题能讲三分钟，还会反问你' },
  { id: 'strict',  name: '严谨派',   emoji: '📋', desc: '抠细节、讲规矩，反复跟你确认' },
  { id: 'forget',  name: '健忘',     emoji: '🤔', desc: '刚说的就忘了，你得再说一遍' },
  { id: 'nosy',    name: '八卦',     emoji: '👀', desc: '爱打听私事，聊着聊着就问你工资多少' },
  { id: 'chill',   name: '佛系',     emoji: '🍃', desc: '什么都行、慢悠悠，但你想快也快不起来' },
  { id: 'sales',   name: '推销狂',   emoji: '💸', desc: '疯狂安利，一直劝你加钱、升级、办卡' },
  { id: 'tsundere',name: '傲娇',     emoji: '😤', desc: '嘴上嫌弃你，其实还是帮你办了' },
  { id: 'drama',   name: '戏精',     emoji: '🎭', desc: '一惊一乍的浮夸表演型，什么小事都能演出大戏' },
  { id: 'grandpa', name: '老大爷',   emoji: '🧓', desc: '慢条斯理，爱讲道理，动不动就「想当年」' },
];

/* ---------------- 本局挑战（随机约束，增加变数） ---------------- */

const CURSES = [
  { id: 'polite',  emoji: '🙏', text: '本局你非常有礼貌：每句话都要带「请」或「麻烦您」' },
  { id: 'nosimple',emoji: '🚫', text: '本局不许只回「好 / 行 / 可以」，每句都要说完整' },
  { id: 'askone',  emoji: '❓', text: '本局你必须主动问清楚至少一个细节（价格 / 时间 / 地点）' },
  { id: 'poor',    emoji: '💰', text: '本局你身上只有 20 块：先问价，超了就得砍价或放弃' },
  { id: 'hurry',   emoji: '⏰', text: '本局你非常着急：每句话都要表达出「来不及了」' },
  { id: 'longs',   emoji: '📏', text: '本局每句话至少 10 个字，不许只蹦一两个词' },
  { id: 'request', emoji: '🙋', text: '本局你必须用「能不能…」或「可不可以…」提一次请求' },
  { id: 'explain', emoji: '💡', text: '本局每句都要多给一个理由，不能只说结论' },
  { id: 'none',    emoji: '🎯', text: '本局没有额外挑战，专心把话说清楚就行' },
];

/* ---------------- 意外事件（在某一轮突然插入） ---------------- */

const TWISTS = [
  { id: 'power',   emoji: '🔋', text: '你的手机突然没电了，扫不了码，得想办法说清楚' },
  { id: 'queue',   emoji: '😤', text: '你后面排队的人开始催：「能不能快点啊！」' },
  { id: 'call',    emoji: '📞', text: '对方突然接了个电话，挂掉后全忘了你刚才说什么' },
  { id: 'broken',  emoji: '⚙️', text: '机器 / 系统突然坏了，对方说现在办不了' },
  { id: 'priceup', emoji: '📈', text: '价格突然变了，比你以为的贵，你得重新谈' },
  { id: 'third',   emoji: '👤', text: '半路杀出第三个人插话（领导 / 孩子 / 朋友），局面变了' },
  { id: 'mishear', emoji: '👂', text: '对方听错了一个关键信息，你得纠正它' },
  { id: 'forgetid',emoji: '🪪', text: '你一摸口袋，发现证件 / 钱包忘带了' },
  { id: 'curve',   emoji: '🌀', text: '对方忽然问了个你完全没准备的问题' },
  { id: 'noise',   emoji: '📢', text: '广播响了，周围特别吵，对方一直让你再说一遍' },
  { id: 'offtopic',emoji: '🎈', text: '对方开始跟你闲聊，你得把话题拉回正事' },
  { id: 'closing', emoji: '🚪', text: '快下班 / 快关门了，对方催你抓紧' },
  { id: 'wrongnum',emoji: '🔢', text: '对方把你说的数字记错了（价格 / 时间 / 数量）' },
  { id: 'change',  emoji: '🔄', text: '对方临时改了主意，之前说好的不算数了' },
  { id: 'mistaken',emoji: '💥', text: '对方认错人了，把你当成老熟人热情寒暄' },
  { id: 'filming', emoji: '📷', text: '对方突然举起手机对着你拍，说要发到网上' },
  { id: 'dialect', emoji: '🗣️', text: '对面来了个说话带重口音的人，你得请他说慢一点' },
];

/* ---------------- 本地回落模板 ---------------- */

/** 场景的通用轮次骨架：本地回落时按场景 brief 拼装 */
const FALLBACK_STEPS = [
  { goal: '开口说明你来干什么 / 你要什么', tip: '先说目的：「我想…」「我要…」' },
  { goal: '补充一个关键细节，让对方能办下去', tip: '加上具体信息：数量、时间、大小、价格' },
  { goal: '回应对方刚才的问题或要求', tip: '没听清可以说：「不好意思，您能再说一遍吗？」' },
  { goal: '收尾：确认结果并道谢', tip: '「好的，谢谢您」「那就这样，麻烦了」' },
];

/* ---------------- 随机工具 ---------------- */

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickMany(arr, n) {
  const pool = arr.slice();
  const out = [];
  while (pool.length && out.length < n) {
    out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return out;
}

/** 素材池总组合数（场景 × 性格 × 挑战 × 意外 × 意外插入位置 2 种） */
function comboCount() {
  return SCENE_POOL.length * PERSONAS.length * CURSES.length * TWISTS.length * 2;
}

/** 抽一局的随机要素组合。
 * @param {string} cat 场景分类，'全部' 时从全池抽
 */
function rollSetup(cat = '全部') {
  const pool = cat === '全部' ? SCENE_POOL : SCENE_POOL.filter((s) => s.cat === cat);
  const scene = pickRandom(pool.length ? pool : SCENE_POOL);
  const persona = pickRandom(PERSONAS);
  const curse = pickRandom(CURSES);
  const twist = pickRandom(TWISTS);
  // 意外事件插在第 2 或第 3 轮（0 起即 1 或 2）
  const twistAt = 1 + Math.floor(Math.random() * 2);
  return { scene, persona, curse, twist, twistAt };
}

/** 本地回落：不依赖 AI，直接拼出一局可玩的剧本 */
function localDirect(setup, level) {
  return {
    opening: `${setup.scene.brief.split('，')[0]}——${setup.persona.desc.slice(0, 12)}。`,
    steps: FALLBACK_STEPS.map((s) => ({
      goal: `${setup.scene.name}场景：${s.goal}`,
      tip: s.tip,
    })),
    twistAt: setup.twistAt,
    twistLine: setup.twist.text,
    source: 'local',
  };
}

;// 素材池扩充后的临时自检脚本（跑完即删；此文件会被拼在 scenes.js 之后执行）
const byCat = {};
SCENE_POOL.forEach(s => byCat[s.cat] = (byCat[s.cat] || 0) + 1);
console.log('场景总数:', SCENE_POOL.length, JSON.stringify(byCat));
console.log('性格', PERSONAS.length, '挑战', CURSES.length, '意外', TWISTS.length);
console.log('组合数:', comboCount().toLocaleString());

const ids = SCENE_POOL.map(s => s.id);
if (new Set(ids).size !== ids.length) throw new Error('场景 id 重复!');

for (const cat of SCENE_CATS) {
  const hits = new Set();
  for (let i = 0; i < 20000; i++) {
    const s = rollSetup(cat);
    hits.add(s.scene.id);
    if (cat !== '全部' && s.scene.cat !== cat) throw new Error('类别过滤失效: ' + cat);
  }
  const expect = cat === '全部' ? SCENE_POOL.length : byCat[cat];
  console.log('  [' + cat + '] 抽样覆盖 ' + hits.size + '/' + expect);
}

for (const cat of SCENE_CATS) {
  const s = rollSetup(cat);
  console.log(' ', cat, '->', s.scene.name, '|', s.persona.name, '|', s.twist.text.slice(0, 14));
}

const setup = rollSetup('全部');
const script = localDirect(setup, '3-4');
console.log('本地回落校验:', validateScript(script).length === 0 ? '通过' : '失败');
console.log('回落开场白:', script.opening);
