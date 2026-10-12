/**
 * AI 输出测试案例集
 *
 * 四类覆盖：
 *   grammar  语法纠正   —— 句子确实有问题，看 AI 能不能指出并改对
 *   correct  正确句     —— 句子本来就对，看 AI 会不会误判（误判是这类产品最致命的缺陷）
 *   level    等级适配   —— 同一句在不同等级下，解释难度应该有区别
 *   edge     异常输入   —— 非中文、空、超短、混杂，看 AI 会不会胡编
 *
 * 说明：
 *   expect 只是「人工参考预期」，不参与自动判定。
 *   自动判定只检查结构合法性；语义是否判对，必须人工核对，不允许自动编造准确率。
 */
const TEST_CASES = [
  // ---------- 语法纠正 ----------
  { id: 1,  cat: 'grammar', level: '1-2', input: '我昨天去学校学习中文了两个小时。',
    expect: '时量补语语序问题，应为「我昨天在学校学了两个小时中文」' },
  { id: 2,  cat: 'grammar', level: '1-2', input: '我吃饭了在餐厅。',
    expect: '地点状语位置错误，应为「我在餐厅吃饭了」' },
  { id: 3,  cat: 'grammar', level: '1-2', input: '天空是蓝色。',
    expect: '「是……的」或形容词谓语句，应为「天空是蓝色的」或「天空很蓝」' },
  { id: 4,  cat: 'grammar', level: '3-4', input: '我把书放在桌子。',
    expect: '「把」字句后缺方位词，应为「我把书放在桌子上」' },
  { id: 5,  cat: 'grammar', level: '1-2', input: '我喜欢吃苹果，也他喜欢。',
    expect: '副词「也」位置错误，应为「他也喜欢」' },
  { id: 6,  cat: 'grammar', level: '3-4', input: '我去学校了昨天。',
    expect: '时间状语应在动词前，应为「我昨天去学校了」' },
  { id: 7,  cat: 'grammar', level: '3-4', input: '我昨天看了一个电影很有意思。',
    expect: '两个谓语结构杂糅，应为「我昨天看了一个很有意思的电影」' },
  { id: 8,  cat: 'grammar', level: '3-4', input: '他比我一点高。',
    expect: '比较句语序，应为「他比我高一点」' },

  // ---------- 正确句（防止误判） ----------
  { id: 9,  cat: 'correct', level: '1-2', input: '你好，我叫李明，我是美国人。',
    expect: '应判定为正确，不强行挑错' },
  { id: 10, cat: 'correct', level: '1-2', input: '你吃饭了吗？',
    expect: '应判定为正确' },
  { id: 11, cat: 'correct', level: '1-2', input: '我想买两个苹果。',
    expect: '应判定为正确' },
  { id: 12, cat: 'correct', level: '3-4', input: '我学汉语学了三个月了。',
    expect: '应判定为正确' },
  { id: 13, cat: 'correct', level: '3-4', input: '这本书是我朋友的。',
    expect: '应判定为正确' },
  { id: 14, cat: 'correct', level: '5-6', input: '虽然他很忙，但他还是来参加了我的生日聚会。',
    expect: '应判定为正确' },

  // ---------- 等级适配 ----------
  { id: 15, cat: 'level', level: '1-2', input: '我把作业做完了。',
    expect: 'HSK1-2 下解释应使用最基础的词，不应出现「处置式」等术语' },
  { id: 16, cat: 'level', level: '5-6', input: '我把作业做完了。',
    expect: '与第 15 条对照：高等级下可以说得更精确，但仍然要通俗易懂' },
  { id: 17, cat: 'level', level: '1-2', input: '他跑得很快。',
    expect: '低等级下应简单说明「得」的用法，不展开结构助词体系' },

  // ---------- 异常输入 ----------
  { id: 18, cat: 'edge', level: '1-2', input: '12345',
    expect: '纯数字，应识别出无法进行语法分析，而不是虚构语法问题' },
  { id: 19, cat: 'edge', level: '1-2', input: 'hello my name is Tom',
    expect: '非中文输入，应提示需要中文句子' },
  { id: 20, cat: 'edge', level: '3-4', input: '？？？',
    expect: '无意义符号，应识别为无效输入' },
];

const CAT_LABEL = {
  grammar: '语法纠正',
  correct: '正确句',
  level:   '等级适配',
  edge:    '异常输入',
};
