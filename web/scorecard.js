/**
 * 成绩卡绘制
 *
 * 用 canvas 画一张可下载的图。所有数字都来自本次真实操作，不做任何修饰。
 */
const CARD_W = 660;
const CARD_H = 1100;

const CARD_FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif";

function rateRun(retry, peek, twistHandled) {
  if (retry === 0 && peek === 0) return twistHandled ? '一遍过，意外也接住了' : '一遍过，表达很清楚';
  if (retry === 0) return '表达清楚，提示用得也克制';
  if (retry <= 2) return twistHandled ? '基本能沟通，临场反应不错' : '基本能沟通，个别地方再打磨';
  if (retry <= 5) return '敢说就是进步，多练几轮会更顺';
  return '先敢开口，准确度慢慢来';
}

function fmtDuration(ms) {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

/** 按最大宽度折行 */
function wrapText(ctx, text, maxW) {
  const out = [];
  let line = '';
  for (const ch of String(text)) {
    if (ctx.measureText(line + ch).width > maxW && line) {
      out.push(line);
      line = ch;
    } else {
      line += ch;
    }
  }
  if (line) out.push(line);
  return out;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/** 一行小标签 + 内容 */
function infoLine(ctx, x, y, w, emoji, label, text, tone) {
  const h = 22 + wrapText(ctx, text, w - 34).length * 24 + 18;
  ctx.fillStyle = tone === 'twist' ? '#fff4e5' : '#f5f7fa';
  roundRect(ctx, x, y, w, h, 12);
  ctx.fill();

  ctx.font = `400 13px ${CARD_FONT}`;
  ctx.fillStyle = tone === 'twist' ? '#b06a00' : '#5b6775';
  ctx.fillText(`${emoji} ${label}`, x + 16, y + 26);

  ctx.font = `400 15px ${CARD_FONT}`;
  ctx.fillStyle = '#1b2430';
  wrapText(ctx, text, w - 32).forEach((ln, i) => {
    ctx.fillText(ln, x + 16, y + 50 + i * 24);
  });
  return h;
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} d  { sceneName, sceneEmoji, role, persona, curse, twist, twistEmoji,
 *                      twistHandled, twistFired, done, total, retry, peek, ms, best, model }
 */
function drawScoreCard(ctx, d) {
  const PAD = 52;
  const W = CARD_W;
  const IN = W - PAD * 2;

  // 背景
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, CARD_H);
  ctx.fillStyle = '#f5f7fa';
  ctx.fillRect(0, 0, W, 8);

  let y = PAD + 22;

  // 页眉
  ctx.fillStyle = '#5b6775';
  ctx.font = `400 15px ${CARD_FONT}`;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText('HSK AI 中文陪练 · 场景对话', PAD, y);

  y += 46;
  // 场景名
  ctx.fillStyle = '#1b2430';
  ctx.font = `500 34px ${CARD_FONT}`;
  ctx.fillText(`${d.sceneEmoji || '🎬'} ${d.sceneName}`, PAD, y);

  y += 26;
  ctx.fillStyle = '#888780';
  ctx.font = `400 14px ${CARD_FONT}`;
  ctx.fillText(`对手：${d.role}（${d.persona || '—'}）`, PAD, y);

  y += 34;
  ctx.strokeStyle = '#e3e8ef';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD, y);
  ctx.lineTo(W - PAD, y);
  ctx.stroke();

  // 完成轮数
  y += 56;
  ctx.fillStyle = '#5b6775';
  ctx.font = `400 14px ${CARD_FONT}`;
  ctx.fillText('完成轮数', PAD, y);

  y += 52;
  ctx.fillStyle = '#0f6fd8';
  ctx.font = `500 56px ${CARD_FONT}`;
  ctx.fillText(`${d.done}`, PAD, y);
  const doneW = ctx.measureText(`${d.done}`).width;
  ctx.fillStyle = '#b4b2a9';
  ctx.font = `400 22px ${CARD_FONT}`;
  ctx.fillText(` / ${d.total}`, PAD + doneW + 6, y);

  // 进度点
  y += 34;
  const dotR = 7;
  const gap = 22;
  for (let i = 0; i < d.total; i++) {
    const cx = PAD + dotR + i * (dotR * 2 + gap);
    ctx.beginPath();
    ctx.arc(cx, y, dotR, 0, Math.PI * 2);
    ctx.fillStyle = i < d.done ? '#0f6fd8' : '#e3e8ef';
    ctx.fill();
  }

  // 三个指标
  y += 54;
  const boxW = (IN - 24) / 3;
  const stats = [
    { label: '没说清', value: `${d.retry}`, unit: '次' },
    { label: '看提示', value: `${d.peek}`, unit: '次' },
    { label: '用时', value: fmtDuration(d.ms), unit: '' },
  ];
  stats.forEach((s, i) => {
    const x = PAD + i * (boxW + 12);
    ctx.fillStyle = '#f5f7fa';
    roundRect(ctx, x, y, boxW, 92, 12);
    ctx.fill();

    ctx.fillStyle = '#5b6775';
    ctx.font = `400 13px ${CARD_FONT}`;
    ctx.fillText(s.label, x + 16, y + 28);

    ctx.fillStyle = '#1b2430';
    ctx.font = `500 28px ${CARD_FONT}`;
    const v = ctx.measureText(s.value).width;
    ctx.fillText(s.value, x + 16, y + 64);
    if (s.unit) {
      ctx.fillStyle = '#888780';
      ctx.font = `400 14px ${CARD_FONT}`;
      ctx.fillText(s.unit, x + 16 + v + 4, y + 64);
    }
  });

  // 本局随机要素
  y += 92 + 34;
  if (d.curse) {
    y += infoLine(ctx, PAD, y, IN, '🎯', '本局挑战', d.curse, 'curse') + 12;
  }

  if (d.twist && d.twistFired) {
    const label = d.twistHandled ? '意外事件 · 一次化解' : '意外事件 · 绕了几圈才过去';
    y += infoLine(ctx, PAD, y, IN, d.twistEmoji || '⚡', label, d.twist, 'twist') + 12;
  }

  // 评价
  y += 34;
  ctx.fillStyle = '#5b6775';
  ctx.font = `400 14px ${CARD_FONT}`;
  ctx.fillText('本次评价', PAD, y);

  y += 34;
  ctx.fillStyle = '#0f6fd8';
  ctx.font = `500 22px ${CARD_FONT}`;
  ctx.fillText(rateRun(d.retry, d.peek, d.twistHandled), PAD, y);

  // 本场最佳表达（过长则截断，避免顶到页脚）
  const best = String(d.best || '');
  const bestText = best.length > 70 ? best.slice(0, 70) + '…' : best;
  if (bestText) {
    y += 44;
    ctx.fillStyle = '#5b6775';
    ctx.font = `400 14px ${CARD_FONT}`;
    ctx.fillText('你说得最顺的一句', PAD, y);

    y += 20;
    const lines = wrapText(ctx, bestText, IN - 40);
    const boxH = 26 + lines.length * 30 + 20;
    ctx.fillStyle = '#e7f1fd';
    roundRect(ctx, PAD, y, IN, boxH, 12);
    ctx.fill();

    ctx.fillStyle = '#0c447c';
    ctx.font = `400 17px ${CARD_FONT}`;
    lines.forEach((ln, i) => {
      ctx.fillText(ln, PAD + 20, y + 32 + i * 30);
    });
    y += boxH;
  }

  // 页脚
  ctx.fillStyle = '#b4b2a9';
  ctx.font = `400 12px ${CARD_FONT}`;
  const date = new Date().toLocaleString('zh-CN', { hour12: false });
  ctx.fillText(`${date} · 模型 ${d.model || '—'}`, PAD, CARD_H - 46);
  ctx.fillText('数据来自本人实际操作，未做任何修饰', PAD, CARD_H - 26);
}
