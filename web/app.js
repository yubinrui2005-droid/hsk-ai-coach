/* HSK AI 中文陪练 · MVP v0.2
 * 纯前端，无构建步骤。支持任意 OpenAI 兼容接口（官方 / 中转站 / 本地模型）。
 * 注意：API Key 只存在用户浏览器 localStorage，代码仓库中不含任何密钥。
 */

const CFG_STORE = 'hsk_coach_provider_cfg';

const DEFAULT_CFG = {
  providerId: 'deepseek',
  base: PROVIDERS[0].base,
  model: PROVIDERS[0].model,
  key: '',
  strictJson: true,
};

/* ---------------- 配置存取 ---------------- */

function loadCfg() {
  try {
    const raw = localStorage.getItem(CFG_STORE);
    if (!raw) return { ...DEFAULT_CFG };
    return { ...DEFAULT_CFG, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_CFG };
  }
}

function saveCfg(c) {
  localStorage.setItem(CFG_STORE, JSON.stringify(c));
}

let cfg = loadCfg();

/* ---------------- 提示词 ---------------- */

const LEVEL_DESC = {
  '1-2': 'HSK 1-2（零基础到初级）：只认识约 300 个最常用词，只学过最简单的句型',
  '3-4': 'HSK 3-4（初中级）：约 1200 词，学过基本补语、把字句、比较句',
  '5-6': 'HSK 5-6（中高级）：约 5000 词以上，能读一般性文章，但书面表达仍会出错',
};

function buildSystemPrompt(level) {
  return `你是中文语法纠错助手，专门辅导 ${LEVEL_DESC[level]} 水平的外国学习者。

任务：分析学习者写的中文句子，只指出【一个最主要的问题】。

输出要求：
1. 必须且只能输出一个 JSON 对象，不要输出任何解释、前后缀或 markdown 代码块标记。
2. JSON 结构如下（所有字段必填）：
{
  "verdict": "correct" | "minor" | "wrong" | "invalid",
  "problem": "一句话指出最主要的问题。如果句子正确，写「句子自然通顺，没有明显问题」。如果输入不是中文句子或无法分析，写「无法分析」并说明原因。",
  "natural": "修改后的自然表达。若原句已自然，原样返回原句。若输入无效，返回空字符串。",
  "explanation": "解释原因，必须让 ${LEVEL_DESC[level]} 的学习者看懂，控制在 60 字以内，避免使用专业语法术语。",
  "tip": "一条可立即使用的语法小提示，20 字以内。",
  "keywords": ["涉及的语法点，1-2 个"]
}

判定规则：
- verdict 取值含义：correct=句子正确；minor=能懂但不够自然；wrong=有明显语法错误；invalid=输入不是中文句子或无法分析。
- 句子正确时不要强行挑错。宁可放过，不可误判。
- 只指出一个最主要的问题，不要罗列多个。
- 解释所用的汉字和词汇难度要匹配该学习者的水平。
- 不要虚构事实，不要编造例句出处，不确定的地方就说不确定。
- 如果输入是纯数字、纯英文、纯符号或无意义内容，verdict 必须返回 invalid。`;
}

function buildUserPrompt(sentence, level) {
  return `学习者水平：HSK ${level}
学习者写的句子：${sentence}`;
}

/* ---------------- 工具 ---------------- */

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** 从模型返回中剥离可能的 ```json 代码块后解析 */
function parseJSON(text) {
  let s = String(text).trim();
  const fence = s.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fence) s = fence[1].trim();
  return JSON.parse(s);
}

const VALID_VERDICT = ['correct', 'minor', 'wrong', 'invalid'];

/** 结构合法性校验：只检查格式，不评判语义 */
function validateShape(obj) {
  const errs = [];
  if (!obj || typeof obj !== 'object') return ['返回内容不是 JSON 对象'];
  for (const f of ['verdict', 'problem', 'natural', 'explanation', 'tip', 'keywords']) {
    if (!(f in obj)) errs.push(`缺字段 ${f}`);
  }
  if (!VALID_VERDICT.includes(obj.verdict)) errs.push(`verdict 取值非法：${obj.verdict}`);
  if (typeof obj.explanation === 'string' && obj.explanation.length > 120) {
    errs.push(`explanation 超长（${obj.explanation.length} 字，要求 60 字内）`);
  }
  if (!Array.isArray(obj.keywords)) errs.push('keywords 不是数组');
  return errs;
}

/** 判断错误是否属于「不支持 response_format」，用于自动降级 */
function isFormatUnsupported(msg) {
  return /response_format|json_object|json_schema|unsupported|not support|不支持/i.test(String(msg));
}

/**
 * 调用模型。strictJson 开启时先带 response_format 请求，
 * 若服务端不支持则自动去掉该参数重试一次。
 */
async function callAI(sentence, level, options = {}) {
  const c = options.cfg || cfg;
  const endpoint = buildEndpoint(c.base);

  if (!c.key) throw new Error('未设置 API Key');
  if (!endpoint) throw new Error('未设置 Base URL');
  if (!c.model) throw new Error('未设置模型名称');

  const messages = [
    { role: 'system', content: buildSystemPrompt(level) },
    { role: 'user', content: buildUserPrompt(sentence, level) },
  ];

  const send = async (strict) => {
    const payload = {
      model: c.model,
      messages,
      temperature: 0,
      stream: false,
    };
    if (strict) payload.response_format = { type: 'json_object' };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${c.key}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      let detail = '';
      try { detail = JSON.stringify(await res.json()); } catch { detail = await res.text(); }
      throw new Error(`HTTP ${res.status} — ${detail.slice(0, 300)}`);
    }
    return res.json();
  };

  let data;
  try {
    data = await send(c.strictJson);
  } catch (e) {
    // 仅在开启严格模式、且报错看起来是「不支持 response_format」时降级重试
    if (c.strictJson && isFormatUnsupported(e.message)) {
      data = await send(false);
    } else {
      throw e;
    }
  }

  const raw = data?.choices?.[0]?.message?.content ?? '';
  return { raw, obj: parseJSON(raw), usage: data?.usage || {}, endpoint };
}

/* ---------------- 设置区 ---------------- */

function refreshSettingsUI() {
  const c = cfg;

  // 当前 Base URL 若与某个预设一致，就显示为那个预设
  const matched = PROVIDERS.find((p) => p.id !== 'custom' && p.base === c.base);
  $('providerSel').value = matched ? matched.id : (c.base ? 'custom' : 'deepseek');

  $('baseUrl').value = c.base;
  $('modelName').value = c.model;
  $('apiKey').value = '';
  $('apiKey').placeholder = c.key ? '已保存，留空则不修改' : 'sk-...（只存在本机）';
  $('strictJson').checked = !!c.strictJson;

  const p = PROVIDERS.find((x) => x.id === $('providerSel').value);
  $('providerNote').textContent = p ? `${p.note}${p.doc ? ' · ' + p.doc : ''}` : '';

  const ok = !!(c.key && c.base && c.model);
  $('cfgStatus').textContent = ok ? '配置已就绪' : '配置不完整';
  $('cfgStatus').className = 'badge' + (ok ? ' is-ok' : '');
  $('endpointPreview').textContent = buildEndpoint(c.base) || '—';
}

function readFormCfg() {
  return {
    providerId: $('providerSel').value,
    base: $('baseUrl').value.trim(),
    model: $('modelName').value.trim(),
    key: $('apiKey').value.trim() || cfg.key,
    strictJson: $('strictJson').checked,
  };
}

async function testConnection() {
  const c = readFormCfg();
  const btn = $('testConnBtn');
  if (!c.key || !c.base || !c.model) {
    setConnResult('请先填全 Base URL、模型名称和 API Key', false);
    return;
  }
  btn.disabled = true;
  btn.textContent = '测试中…';
  setConnResult('正在发送最小请求…', null);

  const endpoint = buildEndpoint(c.base);
  const t0 = performance.now();
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${c.key}`,
      },
      body: JSON.stringify({
        model: c.model,
        messages: [{ role: 'user', content: 'hi' }],
        max_tokens: 1,
        stream: false,
      }),
    });
    const ms = Math.round(performance.now() - t0);
    if (!res.ok) {
      let d = '';
      try { d = JSON.stringify(await res.json()); } catch { d = await res.text(); }
      setConnResult(`✗ HTTP ${res.status}（${ms} ms）— ${d.slice(0, 260)}`, false);
    } else {
      const j = await res.json();
      const got = j?.choices?.[0]?.message?.content;
      setConnResult(
        `✓ 连通（${ms} ms）· 实际模型 ${j?.model || c.model} · 返回片段 ${JSON.stringify(got ?? '').slice(0, 60)}`,
        true
      );
    }
  } catch (e) {
    setConnResult(`✗ 请求失败 — ${e.message}`, false);
  } finally {
    btn.disabled = false;
    btn.textContent = '测试连接';
  }
}

function setConnResult(text, ok) {
  const el = $('connResult');
  el.hidden = false;
  el.textContent = text;
  el.className = 'conn-result ' + (ok === null ? '' : ok ? ' is-ok' : 'is-bad');
}

/* ---------------- 练习页 ---------------- */

let currentLevel = '1-2';

function showResult(data, sentence, elapsed) {
  const o = data.obj;
  const vmap = {
    correct: ['✓ 句子正确', 'v-correct'],
    minor:   ['！可以更好', 'v-minor'],
    wrong:   ['✗ 有问题', 'v-wrong'],
    invalid: ['— 无法分析', 'v-minor'],
  };
  const [label, cls] = vmap[o.verdict] || [o.verdict, 'v-minor'];

  const v = $('verdict');
  v.textContent = label;
  v.className = 'verdict ' + cls;

  const tk = data.usage.prompt_tokens != null
    ? `${data.usage.prompt_tokens}in / ${data.usage.completion_tokens}out tokens`
    : '';
  $('runMeta').textContent = `${elapsed} ms · ${tk} · ${cfg.model}`;

  $('rvOriginal').textContent = sentence;
  $('rvProblem').textContent = o.problem || '—';
  $('rvNatural').textContent = o.natural || '—';
  $('rvExplain').textContent = o.explanation || '—';
  $('rvTip').textContent = o.tip || '—';
  $('rvKeywords').textContent = Array.isArray(o.keywords) ? o.keywords.join('、') : '—';

  const errs = validateShape(o);
  $('rvRaw').textContent = data.raw + (errs.length ? `\n\n[结构校验未通过] ${errs.join('；')}` : '');

  $('resultCard').hidden = false;
  $('errorCard').hidden = true;
}

function showError(e) {
  $('errorText').textContent = e.message || String(e);
  $('errorCard').hidden = false;
  $('resultCard').hidden = true;
}

async function checkOne() {
  if (!cfg.key || !cfg.base || !cfg.model) {
    showError(new Error('请先在上方填全 Base URL、模型名称和 API Key，再点「保存配置」。'));
    return;
  }
  const sentence = $('sentence').value.trim();
  if (!sentence) {
    showError(new Error('请先输入一句中文。'));
    return;
  }

  const btn = $('checkBtn');
  btn.disabled = true;
  btn.textContent = '检查中…';

  const t0 = performance.now();
  try {
    const data = await callAI(sentence, currentLevel);
    showResult(data, sentence, Math.round(performance.now() - t0));
  } catch (e) {
    showError(e);
  } finally {
    btn.disabled = false;
    btn.textContent = '检查这句话';
  }
}

/* ---------------- 测试页 ---------------- */

const results = {};
let running = false;
let stopFlag = false;

/** 人工评价变化时写回 results，避免重绘丢失 */
$('testBody').addEventListener('change', (e) => {
  const sel = e.target.closest('select.human');
  if (!sel) return;
  const id = Number(sel.dataset.id);
  results[id] = results[id] || {};
  results[id].human = sel.value;
});

function renderTable() {
  $('testBody').innerHTML = TEST_CASES.map((c) => {
    const r = results[c.id];
    const struct = !r ? '<span class="pill p-idle">未运行</span>'
      : r.error ? '<span class="pill p-fail">请求失败</span>'
      : r.shapeErrs.length ? `<span class="pill p-fail">结构 ${r.shapeErrs.length} 处</span>`
      : '<span class="pill p-pass">结构通过</span>';

    const verdict = !r ? '—'
      : r.error ? esc(r.error.slice(0, 40))
      : esc(r.obj?.verdict ?? '—');

    const natural = !r ? '—'
      : r.error ? esc(r.error.slice(0, 80))
      : esc(r.obj?.natural || r.obj?.problem || '—');

    const ms = r ? (r.error ? '—' : r.ms + ' ms') : '—';

    return `<tr data-id="${c.id}">
      <td>${c.id}</td>
      <td>${CAT_LABEL[c.cat]}</td>
      <td>HSK ${c.level}</td>
      <td class="in">${esc(c.input)}</td>
      <td>${struct}</td>
      <td>${verdict}</td>
      <td>${natural}</td>
      <td>${ms}</td>
      <td>
        <select class="human" data-id="${c.id}">
          <option value="">待评价</option>
          <option value="pass"${r?.human === 'pass' ? ' selected' : ''}>判对了</option>
          <option value="partial"${r?.human === 'partial' ? ' selected' : ''}>部分正确</option>
          <option value="fail"${r?.human === 'fail' ? ' selected' : ''}>判错了</option>
        </select>
      </td>
    </tr>`;
  }).join('');
}

async function runAll() {
  if (!cfg.key || !cfg.base || !cfg.model) {
    alert('请先在「练习」页填全模型服务配置并保存。');
    return;
  }
  if (running) return;

  running = true;
  stopFlag = false;
  $('runAllBtn').disabled = true;
  $('stopBtn').disabled = false;

  for (let i = 0; i < TEST_CASES.length; i++) {
    if (stopFlag) break;
    const c = TEST_CASES[i];
    $('progress').textContent = `运行中 ${i + 1}/${TEST_CASES.length}`;

    const t0 = performance.now();
    try {
      const data = await callAI(c.input, c.level);
      results[c.id] = {
        obj: data.obj,
        raw: data.raw,
        usage: data.usage,
        ms: Math.round(performance.now() - t0),
        shapeErrs: validateShape(data.obj),
        error: null,
      };
    } catch (e) {
      results[c.id] = {
        obj: null, raw: '', usage: {},
        ms: Math.round(performance.now() - t0),
        shapeErrs: [],
        error: e.message || String(e),
      };
    }
    renderTable();
  }

  running = false;
  $('runAllBtn').disabled = false;
  $('stopBtn').disabled = true;
  $('exportBtn').disabled = false;
  $('progress').textContent = `完成 ${Object.keys(results).length}/${TEST_CASES.length}`;
  renderSummary();
}

function renderSummary() {
  const ids = Object.keys(results);
  const ok = ids.filter((i) => !results[i].error && !results[i].shapeErrs.length).length;
  const bad = ids.filter((i) => results[i].error).length;
  const shape = ids.length - ok - bad;
  const tot = ids.reduce((s, i) => s + results[i].ms, 0);
  const tokens = ids.reduce((s, i) => s + (results[i].usage?.total_tokens || 0), 0);

  $('summary').hidden = false;
  $('summary').innerHTML = `
    <b>自动校验结果</b>（仅结构层面，语义需人工核对）：<br>
    结构通过 <b>${ok}</b> 条 · 结构异常 <b>${shape}</b> 条 · 请求失败 <b>${bad}</b> 条<br>
    总耗时 ${(tot / 1000).toFixed(1)} s · 累计消耗 ${tokens} tokens · 模型 ${esc(cfg.model)}<br>
    <span class="hint small">下一步：逐条看「AI 输出」，在「人工评价」里勾选判对 / 判错，再导出 CSV 作为测试报告原始依据。</span>
  `;
}

function exportCSV() {
  const head = ['编号', '类别', '等级', '输入', '结构校验', 'AI判定', 'AI输出', '耗时ms', '人工评价', '原始返回'];
  const rows = TEST_CASES.map((c) => {
    const r = results[c.id];
    const human = { pass: '判对了', partial: '部分正确', fail: '判错了', '': '待评价' }[r?.human ?? ''];
    if (!r) return [c.id, CAT_LABEL[c.cat], c.level, c.input, '未运行', '', '', '', human, ''];
    const struct = r.error ? '请求失败' : (r.shapeErrs.length ? '结构异常:' + r.shapeErrs.join('|') : '通过');
    return [
      c.id, CAT_LABEL[c.cat], 'HSK ' + c.level, c.input, struct,
      r.obj?.verdict ?? '', r.obj?.natural || r.obj?.problem || '', r.ms, human,
      (r.raw || r.error || '').replace(/\n/g, ' '),
    ];
  });

  const q = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = '\uFEFF' + [head, ...rows].map((r) => r.map(q).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `hsk-ai-coach-test-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ---------------- 绑定 ---------------- */

document.querySelectorAll('.tab').forEach((t) => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((x) => x.classList.remove('is-active'));
    document.querySelectorAll('.panel').forEach((x) => x.classList.remove('is-active'));
    t.classList.add('is-active');
    $('panel-' + t.dataset.tab).classList.add('is-active');
  });
});

// 服务商下拉切换
$('providerSel').addEventListener('change', (e) => {
  const p = PROVIDERS.find((x) => x.id === e.target.value);
  if (!p) return;
  $('baseUrl').value = p.base;
  $('modelName').value = p.model;
  $('providerNote').textContent = `${p.note}${p.doc ? ' · ' + p.doc : ''}`;
  $('endpointPreview').textContent = buildEndpoint(p.base) || '—';
});

$('baseUrl').addEventListener('input', () => {
  $('endpointPreview').textContent = buildEndpoint($('baseUrl').value) || '—';
});

$('saveCfgBtn').addEventListener('click', () => {
  cfg = readFormCfg();
  saveCfg(cfg);
  refreshSettingsUI();
  setConnResult('✓ 配置已保存到本机浏览器', true);
});

$('clearCfgBtn').addEventListener('click', () => {
  if (!confirm('确定清除本机保存的 API Key 和服务配置？')) return;
  localStorage.removeItem(CFG_STORE);
  cfg = { ...DEFAULT_CFG, key: '' };
  refreshSettingsUI();
  setConnResult('已清除本机保存的配置', false);
});

$('testConnBtn').addEventListener('click', testConnection);

$('levelRow').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  document.querySelectorAll('.chip').forEach((x) => x.classList.remove('is-active'));
  chip.classList.add('is-active');
  currentLevel = chip.dataset.level;
});

$('checkBtn').addEventListener('click', checkOne);
$('clearBtn').addEventListener('click', () => {
  $('sentence').value = '';
  $('resultCard').hidden = true;
  $('errorCard').hidden = true;
});
$('sentence').addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') checkOne();
});

$('runAllBtn').addEventListener('click', runAll);
$('stopBtn').addEventListener('click', () => { stopFlag = true; });
$('exportBtn').addEventListener('click', exportCSV);

/* ---------------- 初始化 ---------------- */

(function init() {
  $('providerSel').innerHTML = PROVIDERS
    .map((p) => `<option value="${p.id}">${esc(p.name)}</option>`)
    .join('');
  refreshSettingsUI();
  renderTable();
})();
