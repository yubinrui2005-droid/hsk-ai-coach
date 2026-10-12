/**
 * 预设服务商
 *
 * 说明：全部走 OpenAI 兼容的 /chat/completions 接口。
 * 只需填「Base URL」，程序会自动补全成 <base>/chat/completions。
 *   例：https://api.deepseek.com          -> https://api.deepseek.com/v1/chat/completions
 *        https://api.siliconflow.cn/v1    -> https://api.siliconflow.cn/v1/chat/completions
 *
 * 各家地址以官方文档为准，如有变动直接在页面里改 Base URL 即可。
 * 走中转站 / 自建网关（One API、New API 等）选「自定义」填自己的地址。
 */
const PROVIDERS = [
  {
    id: 'deepseek',
    name: 'DeepSeek 官方',
    base: 'https://api.deepseek.com',
    model: 'deepseek-v4-flash',
    doc: 'platform.deepseek.com',
    note: '默认。原生支持 JSON 输出',
  },
  {
    id: 'siliconflow',
    name: '硅基流动 SiliconFlow',
    base: 'https://api.siliconflow.cn/v1',
    model: 'Qwen/Qwen2.5-7B-Instruct',
    doc: 'cloud.siliconflow.cn',
    note: '聚合多家开源模型，有免费额度',
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    base: 'https://openrouter.ai/api/v1',
    model: 'deepseek/deepseek-chat',
    doc: 'openrouter.ai',
    note: '国外聚合站，模型名需带厂商前缀',
  },
  {
    id: 'zhipu',
    name: '智谱 GLM',
    base: 'https://open.bigmodel.cn/api/paas/v4',
    model: 'glm-4-flash',
    doc: 'open.bigmodel.cn',
    note: 'glm-4-flash 免费',
  },
  {
    id: 'moonshot',
    name: '月之暗面 Kimi',
    base: 'https://api.moonshot.cn/v1',
    model: 'moonshot-v1-8k',
    doc: 'platform.moonshot.cn',
    note: '长文本见长',
  },
  {
    id: 'qwen',
    name: '阿里通义千问（百炼兼容模式）',
    base: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-plus',
    doc: 'bailian.console.aliyun.com',
    note: '必须用兼容模式地址',
  },
  {
    id: 'openai',
    name: 'OpenAI',
    base: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    doc: 'platform.openai.com',
    note: '原生支持 JSON 输出',
  },
  {
    id: 'ollama',
    name: '本地 Ollama',
    base: 'http://localhost:11434/v1',
    model: 'qwen2.5:7b',
    doc: 'ollama.com',
    note: '本机运行，零成本；需先 ollama serve',
  },
  {
    id: 'custom',
    name: '自定义 / 中转站',
    base: '',
    model: '',
    doc: '',
    note: '填你自己的网关地址，如 https://your-gate.com/v1',
  },
];

/** 把 Base URL 补全成完整的 chat/completions 地址 */
function buildEndpoint(base) {
  let b = String(base || '').trim().replace(/\/+$/, '');
  if (!b) return '';
  if (/\/chat\/completions$/.test(b) || /\/completions$/.test(b)) return b;
  if (/\/v\d+$/.test(b)) return b + '/chat/completions';
  return b + '/v1/chat/completions';
}
