// 素材池扩充后的临时自检脚本（跑完即删；此文件会被拼在 scenes.js 之后执行）
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
