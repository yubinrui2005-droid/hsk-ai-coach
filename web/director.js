/**
 * AI 导演（v0.4）
 *
 * 一局对话的剧本不再写死，而是在开局时让模型现场编：
 * 给它「场景 + 角色性格 + 本局挑战 + 学习者水平」，它返回
 *   1) 一句开场白（角色 spoken）
 *   2) 4 轮任务（每轮 goal 给 AI 判断用、tip 给学习者点「卡住了」看）
 *   3) 某个轮次插入的意外事件，以及角色当场说出口的那句话
 *
 * 设计取向：让模型多做（生成剧情、临场反应），但产出必须是严格 JSON，
 * 且失败时回落到本地模板，保证任何情况下都能玩。
 */

/** 让 AI 编一局剧本 */
function buildDirectorPrompt(setup, level) {
  const { scene, persona, curse, twist, twistAt } = setup;
  return `你是中文口语陪练产品的「关卡设计师」。请为一位 HSK ${level} 水平的外国中文学习者设计一局场景对话。

【场景】${scene.name}（${scene.cat}类）
【场景任务走向】${scene.brief}
【对手角色】${scene.role}，性格是「${persona.name}」——${persona.desc}
【本局挑战（加在学习者身上的约束）】${curse.text}
【意外事件】会在第 ${twistAt + 1} 轮插入：${twist.text}

请设计 4 轮对话任务，输出且只输出一个 JSON 对象，不要任何前后缀或代码块标记：

{
  "opening": "角色说的第一句话，1 句，符合该性格的口吻，要能接住场景",
  "steps": [
    { "goal": "这一轮学习者需要做到什么，写给判断用的，20 字以内", "tip": "学习者在「卡住了」时看到的提示，一句示范中文，30 字以内" },
    ...共 4 项
  ],
  "twistLine": "意外事件发生时，角色当场说出口的那句话，1 句，要自然、要制造麻烦"
}

规则：
1. steps 必须正好 4 项，难度递进：开口 → 补细节 → 应对变化 → 收尾。
2. goal 是给判断者看的，用「学习者需要…」的口吻，不要写成学习者能直接抄的答案。
3. tip 是给学习者抄的句子，必须是符合 HSK ${level} 水平的自然中文，不要太长。
4. 任务要贴合场景和性格：比如对方是「健忘」，其中一轮就该是「你得把刚才说过的再说一遍」。
5. 本局挑战「${curse.text}」要能自然融进某一轮任务里，不要生硬。
6. 不要出现政治、宗教、暴力、色情内容；场景保持日常、安全。
7. 不要虚构具体品牌、真实机构名、真实人名。`;
}

/** 校验 AI 编的剧本是否可用 */
function validateScript(o) {
  const errs = [];
  if (!o || typeof o !== 'object') return ['剧本不是 JSON 对象'];
  if (typeof o.opening !== 'string' || !o.opening.trim()) errs.push('缺 opening');
  if (!Array.isArray(o.steps) || o.steps.length !== 4) errs.push(`steps 需为 4 项，实际 ${Array.isArray(o.steps) ? o.steps.length : '非数组'}`);
  else {
    o.steps.forEach((s, i) => {
      if (!s || typeof s !== 'object') { errs.push(`第 ${i + 1} 轮不是对象`); return; }
      if (typeof s.goal !== 'string' || !s.goal.trim()) errs.push(`第 ${i + 1} 轮缺 goal`);
      if (typeof s.tip !== 'string' || !s.tip.trim()) errs.push(`第 ${i + 1} 轮缺 tip`);
    });
  }
  if (typeof o.twistLine !== 'string' || !o.twistLine.trim()) errs.push('缺 twistLine');
  return errs;
}

/**
 * 编一局剧本。AI 失败或返回不合法时回滚到本地模板，保证可玩。
 * @returns {Promise<{script:object, source:'ai'|'local', note:string}>}
 */
async function directScene(setup, level, c) {
  const messages = [
    { role: 'system', content: '你是严谨的中文教学关卡设计师，只输出合法 JSON。' },
    { role: 'user', content: buildDirectorPrompt(setup, level) },
  ];

  try {
    const data = await callAIRaw(messages, c);
    const errs = validateScript(data.obj);
    if (errs.length) {
      return {
        script: localDirect(setup, level),
        source: 'local',
        note: `AI 返回的剧本不合法（${errs.join('；')}），已改用本地模板`,
      };
    }
    return { script: data.obj, source: 'ai', note: '' };
  } catch (e) {
    return {
      script: localDirect(setup, level),
      source: 'local',
      note: `AI 编剧本失败（${e.message.slice(0, 80)}），已改用本地模板`,
    };
  }
}
