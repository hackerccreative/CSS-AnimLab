const state = {
  shape: 'square',
  color: '#7c6af7',
  width: 80,
  height: 80,
  duration: 1.2,
  delay: 0,
  easing: 'ease-in-out',
  infinite: true,
  playing: true,
  animName: 'myAnimation',
  keyframes: []
};

const PRESETS = {
  fade: { name:'fadeIn', keyframes:[
    { stop:'0%', opacity:'0', transform:'none' },
    { stop:'100%', opacity:'1', transform:'none' }
  ]},
  slide: { name:'slideUp', keyframes:[
    { stop:'0%', opacity:'0', transform:'translateY(40px)' },
    { stop:'100%', opacity:'1', transform:'translateY(0px)' }
  ]},
  bounce: { name:'bounce', keyframes:[
    { stop:'0%', opacity:'1', transform:'translateY(0px)' },
    { stop:'40%', opacity:'1', transform:'translateY(-32px)' },
    { stop:'60%', opacity:'1', transform:'translateY(-16px)' },
    { stop:'80%', opacity:'1', transform:'translateY(-6px)' },
    { stop:'100%', opacity:'1', transform:'translateY(0px)' }
  ]},
  spin: { name:'spin', keyframes:[
    { stop:'0%', opacity:'1', transform:'rotate(0deg)' },
    { stop:'100%', opacity:'1', transform:'rotate(360deg)' }
  ]},
  scale: { name:'scaleUp', keyframes:[
    { stop:'0%', opacity:'0', transform:'scale(0.3)' },
    { stop:'60%', opacity:'1', transform:'scale(1.1)' },
    { stop:'100%', opacity:'1', transform:'scale(1)' }
  ]},
  wobble: { name:'wobble', keyframes:[
    { stop:'0%', opacity:'1', transform:'rotate(0deg)' },
    { stop:'20%', opacity:'1', transform:'rotate(-8deg)' },
    { stop:'40%', opacity:'1', transform:'rotate(8deg)' },
    { stop:'60%', opacity:'1', transform:'rotate(-4deg)' },
    { stop:'80%', opacity:'1', transform:'rotate(4deg)' },
    { stop:'100%', opacity:'1', transform:'rotate(0deg)' }
  ]},
  flip: { name:'flipX', keyframes:[
    { stop:'0%', opacity:'1', transform:'rotateY(0deg)' },
    { stop:'50%', opacity:'0.4', transform:'rotateY(90deg)' },
    { stop:'100%', opacity:'1', transform:'rotateY(180deg)' }
  ]},
  neon: { name:'neonPulse', keyframes:[
    { stop:'0%', opacity:'1', transform:'scale(1)' },
    { stop:'50%', opacity:'0.7', transform:'scale(1.05)' },
    { stop:'100%', opacity:'1', transform:'scale(1)' }
  ]}
};

const SHAPES = {
  square: () => `<div id="anim-target" style="width:${state.width}px;height:${state.height}px;background:${state.color};border-radius:6px"></div>`,
  circle: () => `<div id="anim-target" style="width:${state.width}px;height:${state.height}px;background:${state.color};border-radius:50%"></div>`,
  pill:   () => `<div id="anim-target" style="width:${state.width*1.5}px;height:${state.height*0.6}px;background:${state.color};border-radius:100px"></div>`,
  text:   () => `<div id="anim-target" style="font-family:'Syne',sans-serif;font-size:${state.width*0.5}px;font-weight:800;color:${state.color};white-space:nowrap">Hello</div>`,
  diamond:() => `<div id="anim-target" style="width:${state.width}px;height:${state.height}px;background:${state.color};transform:rotate(45deg)"></div>`,
  ring:   () => `<div id="anim-target" style="width:${state.width}px;height:${state.height}px;border-radius:50%;border:${Math.max(4,state.width/8)}px solid ${state.color}"></div>`,
  bar:    () => `<div id="anim-target" style="width:${state.width*1.8}px;height:${state.height*0.4}px;background:${state.color};border-radius:3px"></div>`,
  star:   () => `<div id="anim-target" style="font-size:${state.width}px;line-height:1;color:${state.color}">★</div>`
};

function renderShape() {
  document.getElementById('stage-el').innerHTML = SHAPES[state.shape]();
  applyAnimation();
}

function applyAnimation() {
  const existing = document.getElementById('__anim_style');
  if (existing) existing.remove();

  const kfCSS = buildKeyframesCSS();
  const iterCount = state.infinite ? 'infinite' : '1';
  const playState = state.playing ? 'running' : 'paused';

  const styleTag = document.createElement('style');
  styleTag.id = '__anim_style';
  styleTag.textContent = `
    ${kfCSS}
    #anim-target {
      animation: ${state.animName} ${state.duration}s ${state.easing} ${state.delay}s ${iterCount} both;
      animation-play-state: ${playState};
    }
  `;
  document.head.appendChild(styleTag);
  updateCode();
}

function buildKeyframesCSS() {
  const stops = state.keyframes.map(kf => {
    let props = '';
    if (kf.opacity !== undefined && kf.opacity !== '') props += `\n    opacity: ${kf.opacity};`;
    if (kf.transform && kf.transform !== 'none' && kf.transform !== '') props += `\n    transform: ${kf.transform};`;
    return `  ${kf.stop} {${props}\n  }`;
  }).join('\n');
  return `@keyframes ${state.animName} {\n${stops}\n}`;
}

function updateCode() {
  const kfCSS = buildKeyframesCSS();
  const iterCount = state.infinite ? 'infinite' : '1';
  const fill = kfCSS
    .replace(/@keyframes (\w+)/g, `<span class="kw">@keyframes</span> <span class="val">$1</span>`)
    .replace(/(\d+%)/g, `<span class="pct">$1</span>`)
    .replace(/(opacity|transform):/g, `<span class="prop">$1</span>:`)
    .replace(/([{};])/g, `<span class="brace">$1</span>`);

  const elCSS = `.element {\n  animation: ${state.animName} ${state.duration}s ${state.easing} ${state.delay}s ${iterCount} both;\n}`
    .replace(/(\.element)/g, `<span class="kw">$1</span>`)
    .replace(/(animation):/g, `<span class="prop">$1</span>:`)
    .replace(/([{};])/g, `<span class="brace">$1</span>`);

  document.getElementById('code-output').innerHTML = fill + '\n\n' + elCSS;
}

function renderKeyframeEditor() {
  const list = document.getElementById('kf-list');
  list.innerHTML = '';
  state.keyframes.forEach((kf, i) => {
    const row = document.createElement('div');
    row.className = 'kf-row';
    row.innerHTML = `
      <div class="kf-header">
        <span class="kf-stop">${kf.stop}</span>
        ${i > 0 && i < state.keyframes.length-1 ? `<button class="kf-delete" onclick="removeKeyframe(${i})" title="Remove">✕</button>` : ''}
      </div>
      <div class="kf-props">
        <div class="kf-prop">
          <label>opacity</label>
          <input type="text" value="${kf.opacity}" oninput="updateKF(${i},'opacity',this.value)">
        </div>
        <div class="kf-prop">
          <label>transform</label>
          <input type="text" value="${kf.transform}" oninput="updateKF(${i},'transform',this.value)" placeholder="none">
        </div>
      </div>`;
    list.appendChild(row);
  });
}

function updateKF(i, prop, val) {
  state.keyframes[i][prop] = val;
  applyAnimation();
}

function addKeyframe() {
  const existing = state.keyframes.map(k => parseInt(k.stop)).sort((a,b)=>a-b);
  const gaps = [];
  for (let i=0;i<existing.length-1;i++) {
    gaps.push({ mid: Math.round((existing[i]+existing[i+1])/2), size: existing[i+1]-existing[i] });
  }
  const biggest = gaps.sort((a,b)=>b.size-a.size)[0];
  const newStop = biggest ? `${biggest.mid}%` : '50%';
  const newKF = { stop: newStop, opacity: '1', transform: 'none' };
  const insertIdx = state.keyframes.findIndex(k => parseInt(k.stop) > biggest.mid);
  state.keyframes.splice(insertIdx === -1 ? state.keyframes.length-1 : insertIdx, 0, newKF);
  renderKeyframeEditor();
  applyAnimation();
}

function removeKeyframe(i) {
  state.keyframes.splice(i,1);
  renderKeyframeEditor();
  applyAnimation();
}

function setShape(btn) {
  document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  state.shape = btn.dataset.shape;
  renderShape();
}

function updateColor(val) {
  state.color = val;
  document.getElementById('color-hex').value = val;
  renderShape();
}

function updateColorHex(val) {
  if (/^#[0-9a-f]{6}$/i.test(val)) {
    state.color = val;
    document.getElementById('color-picker').value = val;
    renderShape();
  }
}

function updateSize() {
  state.width = parseInt(document.getElementById('el-width').value);
  state.height = parseInt(document.getElementById('el-height').value);
  document.getElementById('lbl-w').textContent = state.width+'px';
  document.getElementById('lbl-h').textContent = state.height+'px';
  renderShape();
}

function updateTiming() {
  state.duration = parseInt(document.getElementById('anim-dur').value) / 10;
  state.delay = parseInt(document.getElementById('anim-delay').value) / 10;
  state.easing = document.getElementById('anim-easing').value;
  document.getElementById('lbl-dur').textContent = state.duration.toFixed(1)+'s';
  document.getElementById('lbl-delay').textContent = state.delay.toFixed(1)+'s';
  applyAnimation();
}

function togglePlay() {
  state.playing = !state.playing;
  const btn = document.getElementById('play-btn');
  btn.textContent = state.playing ? '⏸ Pause' : '▶ Play';
  btn.classList.toggle('playing', !state.playing);
  applyAnimation();
}

function toggleInfinite() {
  state.infinite = !state.infinite;
  const btn = document.getElementById('iter-btn');
  btn.classList.toggle('active', state.infinite);
  applyAnimation();
}

function resetAnim() {
  const target = document.getElementById('anim-target');
  if (!target) return;
  target.style.animationName = 'none';
  void target.offsetHeight;
  target.style.animationName = '';
  state.playing = true;
  document.getElementById('play-btn').textContent = '⏸ Pause';
  document.getElementById('play-btn').classList.remove('playing');
  applyAnimation();
}

function loadPreset(name, btn) {
  document.querySelectorAll('.preset-chip').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const p = PRESETS[name];
  state.animName = p.name;
  state.keyframes = p.keyframes.map(k => ({...k}));
  renderKeyframeEditor();
  state.playing = true;
  document.getElementById('play-btn').textContent = '⏸ Pause';
  document.getElementById('play-btn').classList.remove('playing');
  applyAnimation();
}

function copyCode() {
  const pre = document.getElementById('code-output');
  const raw = pre.textContent;
  navigator.clipboard.writeText(raw).then(() => {
    const btn = document.getElementById('copy-btn');
    btn.textContent = '✓ Copied';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = raw; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
  });
}

function downloadHTML() {
  const kfCSS = buildKeyframesCSS();
  const iterCount = state.infinite ? 'infinite' : '1';
  const elStyle = SHAPES[state.shape]().replace('id="anim-target"', 'class="element"');
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>CSS Animation Export</title>
<style>
body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0a0a0f; }
${kfCSS}
.element {
  animation: ${state.animName} ${state.duration}s ${state.easing} ${state.delay}s ${iterCount} both;
}
</style>
</head>
<body>
  ${elStyle}
</body>
</html>`;
  const blob = new Blob([html], {type:'text/html'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${state.animName}.html`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// Init
loadPreset('fade', document.querySelector('.preset-chip.active'));
renderShape();
