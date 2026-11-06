/* Trainer settings, results, Google Sheets sync. Runs after app.js. */
const AC = window.APP_CONFIG || {};
const DEF_QS = QS.map(q => [q[0], q[1].slice(), q[2]]);
CFG.questions = CFG.questions || DEF_QS;
const RES = [], net = { on: false };
let pend = [], tPin = '', tab = 'd', W = null, D = null, UW = null, ut = 2;
const K = ['id','ts','name','age','date','trainer','pre','preMax','u1','u1max','u2','u2max','u3','u3max','u4','u4max','total','max','pct','remark','mistakes','mins'];
const copy = o => JSON.parse(JSON.stringify(o));
const UTYPES = ['choice', 'order', 'multi', 'topo', 'ip', 'perm'];
const DEF_UN = {}; [2, 3, 4].forEach(u => { DEF_UN[u] = copy(UN[u].a); DEF_UN[u].forEach(a => delete a.s); });
function applyUnits() {            /* trainer-edited activities replace the built-in ones */
  const U = CFG.units; if (!U) return;
  [2, 3, 4].forEach(u => {
    const a = U[u];
    if (Array.isArray(a) && a.length && a.every(x => x && x.id && x.t && UTYPES.includes(x.type))) UN[u].a = copy(a);
  });
}
const getP = p => p.split('.').reduce((o, k) => o[k], UW);
const setP = (p, v) => { const k = p.split('.'), l = k.pop(); k.reduce((o, x) => o[x], UW)[l] = v; };
const tr = $('tr');

/* ---------- Google Sheet connection ---------- */
async function api(body, ms = 8000) {
  if (!AC.SHEET_URL) throw new Error('No sheet linked');
  const c = new AbortController(), t = setTimeout(() => c.abort(), ms);
  try {
    const r = await fetch(AC.SHEET_URL, { method: 'POST', body: JSON.stringify(body), signal: c.signal });
    const j = await r.json();
    if (!j.ok) throw new Error(j.error || 'Error');
    return j;
  } finally { clearTimeout(t); }
}
function setNet() {
  $('net').textContent = net.on ? 'Online: results save to the Google Sheet.'
    : AC.SHEET_URL ? 'Offline: results stay in this session until you reload.'
    : 'Offline mode: data is lost when you reload.';
}
const hdr = () => `<div class="brand"><img src="logo.png" alt="SylverVibeCode logo"><div class="who"><b>${esc(CFG.trainer)}</b><span>${esc(CFG.role)}${CFG.center ? '<br>' + esc(CFG.center) : ''}</span></div></div>`;
function applyCfg() {
  QS = CFG.questions;
  document.title = CFG.title + ' – ' + CFG.course;
  document.querySelector('#side h1').textContent = CFG.title;
  document.querySelector('#side .sub').textContent = CFG.course;
  $('trn').innerHTML = `<b>${esc(CFG.trainer)}</b><br>${esc(CFG.role)}`;
  applyUnits();
}
async function loadCfg() {
  try { const j = await api({ action: 'config' }, 4000); if (j.config) Object.assign(CFG, j.config); net.on = true; }
  catch (e) { net.on = false; }
  setNet();
}
async function flush() {
  try { for (const r of pend.slice()) { await api({ action: 'result', row: r }); pend = pend.filter(x => x !== r); } net.on = true; }
  catch (e) { net.on = false; }
  setNet();
}
function saveResult(r) {
  r.ts = new Date().toISOString(); r.trainer = CFG.trainer;
  const i = RES.findIndex(x => x.id === r.id);
  i < 0 ? RES.push(r) : (RES[i] = r);
  pend = pend.filter(x => x.id !== r.id); pend.push(r);
  flush();
}
addEventListener('online', flush);
addEventListener('beforeunload', e => { if (pend.length) { e.preventDefault(); e.returnValue = ''; } });

/* ---------- trainer panel ---------- */
async function unlock(pin) {
  if (AC.SHEET_URL) {
    try { await api({ action: 'check', pin }); net.on = true; setNet(); return true; }
    catch (e) { if (e.message === 'Wrong PIN') return false; net.on = false; setNet(); }
  }
  return pin === (AC.DEFAULT_PIN || '1234');
}
const closeTr = () => { tr.style.display = 'none'; tr.innerHTML = ''; };
function openTrainer() {
  tr.style.display = 'flex';
  tr.innerHTML = `<div class="tcard narrow">${hdr()}<h2>Trainer settings</h2><label>Trainer PIN<input id="tp" type="password" inputmode="numeric" autocomplete="off"></label><div class="btns"><button id="tok">Open settings</button><button class="opt" data-x="1">Cancel</button></div><p class="err" id="te"></p></div>`;
  const go = async () => {
    $('te').textContent = 'Checking…';
    const pin = $('tp').value;
    if (!(await unlock(pin))) return $('te').textContent = 'Wrong PIN.';
    tPin = pin; W = copy(CFG.questions);
    UW = {}; [2, 3, 4].forEach(u => { UW[u] = copy(UN[u].a); UW[u].forEach(a => delete a.s); }); ut = 2;
    D = { title: CFG.title, course: CFG.course, trainer: CFG.trainer, role: CFG.role, center: CFG.center, pass: CFG.pass };
    tab = 'd'; panel();
  };
  $('tok').onclick = go; $('tp').onkeydown = e => { if (e.key === 'Enter') go(); }; $('tp').focus();
}
function panel() {
  const T = [['d', 'Details'], ['q', 'Pre-test (' + W.length + ')'], ['u', 'Units 2-4'], ['p', 'PIN'], ['r', 'Results']];
  const old = tr.querySelector('.tcard'), sc = old ? old.scrollTop : 0;
  let b = '';
  if (tab === 'd') b = `<div class="grid">${[['title','Lab title'],['course','Course'],['trainer','Trainer name'],['role','Trainer title'],['center','Training center (optional)']].map(([k, l]) => `<label>${l}<input data-k="${k}" value="${esc(D[k])}"></label>`).join('')}<label>Passing mark (%)<input data-k="pass" type="number" min="1" max="100" value="${D.pass}"></label></div>`;
  else if (tab === 'q') b = W.map((q, i) => `<div class="qcard"><label>Question ${i + 1}<input data-q="${i}" value="${esc(q[0])}"></label>${q[1].map((o, j) => `<div class="qopt"><input type="radio" name="r${i}" data-r="${i}.${j}" ${q[2] === j ? 'checked' : ''} aria-label="Correct answer"><input data-o="${i}.${j}" value="${esc(o)}" placeholder="Choice ${j + 1}"></div>`).join('')}<button class="opt" data-del="${i}">Delete question</button></div>`).join('') + '<div class="btns"><button class="opt" data-add="1">Add question</button><button class="opt" data-rst="1">Restore default questions</button></div><p class="meta">Select the round button beside the correct choice.</p>';
  else if (tab === 'u') b = unitsHtml();
  else if (tab === 'p') b = pinHtml();
  else b = resHtml();
  tr.innerHTML = `<div class="tcard">${hdr()}<h2>Trainer settings</h2><div class="tabs">${T.map(t => `<button data-t="${t[0]}" class="${tab === t[0] ? 'on' : ''}">${t[1]}</button>`).join('')}</div>${b}<p class="err" id="te"></p><div class="btns">${tab === 'r' ? '<button data-ref="1">Refresh from sheet</button><button data-csv="1">Download CSV</button>' : tab === 'p' ? '<button data-pin="1">Change PIN</button>' : '<button data-save="1">Save changes</button>'}<button class="opt" data-x="1">Close</button></div></div>`;
  const nc = tr.querySelector('.tcard'); if (nc) nc.scrollTop = sc;
}
const pinHtml = () => `<p class="meta">Change the trainer PIN. It is kept in your Google Sheet's script settings, so students cannot read it.</p><div class="grid"><label>Current PIN<input id="pc" type="password" autocomplete="off"></label><label>New PIN (4 to 20 characters)<input id="pn" type="password" autocomplete="new-password"></label><label>Confirm new PIN<input id="pn2" type="password" autocomplete="new-password"></label></div><p class="note">Forgot the PIN? In the Google Sheet open Extensions &gt; Apps Script, choose <b>resetPin</b> and press Run. The PIN goes back to the one written in Code.gs.</p>`;
async function changePin() {
  const e = $('te'), c = $('pc').value, n = $('pn').value, n2 = $('pn2').value;
  if (c !== tPin) return e.textContent = 'The current PIN is wrong.';
  if (n.length < 4 || n.length > 20) return e.textContent = 'The new PIN must be 4 to 20 characters.';
  if (n !== n2) return e.textContent = 'The new PINs do not match.';
  if (n === c) return e.textContent = 'The new PIN is the same as the current PIN.';
  e.textContent = 'Saving…';
  let msg;
  if (AC.SHEET_URL) {
    try { await api({ action: 'changePin', pin: tPin, newPin: n }); net.on = true; tPin = n; msg = 'PIN changed. Use the new PIN next time. (The offline PIN in config.js is not changed.)'; }
    catch (x) { net.on = false; setNet(); return e.textContent = 'PIN not changed: ' + x.message + '. Check the internet connection and try again.'; }
  } else { AC.DEFAULT_PIN = n; tPin = n; msg = 'PIN changed for this session only. Offline: it returns to the config.js PIN when the page reloads.'; }
  setNet(); panel(); $('te').textContent = msg;
}
const UTN = { choice: 'Multiple choice', order: 'Put in the correct order', multi: 'Select all that apply', topo: 'Network devices (interactive simulation)', ip: 'IP settings (interactive simulation)', perm: 'Folder permissions (interactive simulation)' };
function actHtml(a, i) {
  const P = ut + '.' + i, sim = ['topo', 'ip', 'perm'].includes(a.type);
  let b = `<div class="acard"><p class="atype">Activity ${i + 1} &middot; ${UTN[a.type]}</p><label>Activity title<input data-s="${P}.t" value="${esc(a.t)}"></label>`;
  if (a.type === 'choice') {
    b += `<p class="meta">Points: ${a.qs.length} (1 per question)</p>` + a.qs.map((q, j) => `<div class="qcard"><label>Question ${j + 1}<input data-s="${P}.qs.${j}.0" value="${esc(q[0])}"></label>${q[1].map((o, k) => `<div class="qopt"><input type="radio" name="r${P}.${j}" data-rad="${P}.qs.${j}.2" data-v="${k}" ${q[2] === k ? 'checked' : ''} aria-label="Correct answer"><input data-s="${P}.qs.${j}.1.${k}" value="${esc(o)}" placeholder="Choice ${k + 1}"></div>`).join('')}<label>Explanation shown after answering<input data-s="${P}.qs.${j}.3" value="${esc(q[3] || '')}"></label><button class="opt mini" data-dq="${P}.${j}">Delete question</button></div>`).join('') + `<div class="btns"><button class="opt" data-aq="${P}">Add question</button></div><p class="meta">Select the round button beside the correct choice.</p>`;
  } else if (a.type === 'order' || a.type === 'multi') {
    b += `<label>Points<input type="number" min="1" max="20" data-n="${P}.max" value="${a.max}"></label><label>Instruction for the student<input data-s="${P}.intro" value="${esc(a.intro || '')}"></label>`;
    if (a.id === 'cab') b += '<p class="note">The wire colors and order (T568B) are fixed by the 3D cable simulation. Title, instruction and points can be changed.</p>';
    else {
      b += a.type === 'order' ? '<p class="meta">Type the steps in the CORRECT order. Students see them shuffled. Use the arrows to move a step.</p>' : '<p class="meta">Tick the box beside every item that is correct.</p>';
      b += a.items.map((it, j) => a.type === 'order'
        ? `<div class="qopt"><span class="n">${j + 1}.</span><input data-s="${P}.items.${j}" value="${esc(it)}" placeholder="Step ${j + 1}"><button class="opt mini" data-mv="${P}.${j}.-1" aria-label="Move up">&uarr;</button><button class="opt mini" data-mv="${P}.${j}.1" aria-label="Move down">&darr;</button><button class="opt mini" data-di="${P}.${j}" aria-label="Delete item">&times;</button></div>`
        : `<div class="qopt"><input type="checkbox" data-ck="${P}.items.${j}.1" ${it[1] ? 'checked' : ''} aria-label="Correct item"><input data-s="${P}.items.${j}.0" value="${esc(it[0])}" placeholder="Item ${j + 1}"><button class="opt mini" data-di="${P}.${j}" aria-label="Delete item">&times;</button></div>`).join('') + `<div class="btns"><button class="opt" data-ai="${P}">Add ${a.type === 'order' ? 'step' : 'item'}</button></div>`;
    }
  } else b += `<p class="meta">Points: ${a.max} (fixed)</p><p class="note">This is an interactive simulation. You can rename it, but its content and scoring are built into the app.</p>`;
  return b + `<div class="btns"><button class="opt mini" data-dact="${i}">Delete this activity</button></div></div>`;
}
function unitsHtml() {
  const us = [2, 3, 4].map(u => `<button data-ut="${u}" class="${u === ut ? 'on' : ''}">Unit ${u}</button>`).join('');
  return `<p class="meta">Unit 1 is the hands-on work station (disassemble, assemble, BIOS), so it has no questions to edit. The pre-test is on the Pre-test tab.</p><div class="tabs">${us}</div><h3>${esc(UN[ut].t)}</h3>${UW[ut].map(actHtml).join('')}<div class="btns"><button class="opt" data-addact="choice">Add multiple-choice activity</button><button class="opt" data-addact="order">Add ordering activity</button><button class="opt" data-addact="multi">Add select-all activity</button></div><div class="btns"><button class="opt" data-ursts="1">Restore default Unit ${ut}</button></div>`;
}
const newAct = k => { const id = 'x' + Date.now().toString(36); return { choice: { id, t: 'New multiple-choice activity', max: 1, type: 'choice', qs: [['', ['', '', '', ''], 0, '']] }, order: { id, t: 'New ordering activity', max: 3, type: 'order', intro: 'Click the steps in the correct order.', items: ['', '', ''] }, multi: { id, t: 'New select-all activity', max: 3, type: 'multi', intro: 'Select every correct item, then press Check answers.', items: [['', 1], ['', 1], ['', 0]] } }[k]; };
tr.addEventListener('input', e => {
  const t = e.target, d = t.dataset;
  if (d.s) setP(d.s, t.value);
  else if (d.n) setP(d.n, +t.value);
  else if (d.rad) setP(d.rad, +d.v);
  else if (d.ck) setP(d.ck, t.checked ? 1 : 0);
  else if (d.k) D[d.k] = t.type === 'number' ? +t.value : t.value;
  else if (d.q) W[+d.q][0] = t.value;
  else if (d.o) { const [i, j] = d.o.split('.'); W[i][1][j] = t.value; }
  else if (d.r) { const [i, j] = d.r.split('.'); W[i][2] = +j; }
});
tr.addEventListener('click', async e => {
  const b = e.target.closest('button'); if (!b) return; const d = b.dataset;
  if (d.x) return closeTr();
  if (d.t) { tab = d.t; if (tab === 'r') await loadRes(); return panel(); }
  if (d.add) { W.push(['', ['', '', '', ''], 0]); panel(); const c = tr.querySelector('.tcard'); c.scrollTop = c.scrollHeight; return; }
  if (d.del) { W.splice(+d.del, 1); return panel(); }
  if (d.rst) { W = copy(DEF_QS); return panel(); }
  if (d.ut) { ut = +d.ut; return panel(); }
  if (d.addact) { UW[ut].push(newAct(d.addact)); panel(); const c = tr.querySelector('.tcard'); c.scrollTop = c.scrollHeight; return; }
  if (d.dact) { if (UW[ut].length < 2) return $('te').textContent = 'A unit needs at least one activity.'; UW[ut].splice(+d.dact, 1); return panel(); }
  if (d.ursts) { UW[ut] = copy(DEF_UN[ut]); return panel(); }
  if (d.aq) { getP(d.aq).qs.push(['', ['', '', '', ''], 0, '']); return panel(); }
  if (d.dq) { const k = d.dq.split('.'), a = UW[k[0]][k[1]]; if (a.qs.length < 2) return $('te').textContent = 'An activity needs at least one question.'; a.qs.splice(+k[2], 1); return panel(); }
  if (d.ai) { const a = getP(d.ai); a.items.push(a.type === 'multi' ? ['', 0] : ''); return panel(); }
  if (d.di) { const k = d.di.split('.'), a = UW[k[0]][k[1]]; if (a.items.length < 3) return $('te').textContent = 'Keep at least two items.'; a.items.splice(+k[2], 1); return panel(); }
  if (d.mv) { const k = d.mv.split('.'), a = UW[k[0]][k[1]], j = +k[2], n = j + +k[3]; if (n < 0 || n >= a.items.length) return; [a.items[j], a.items[n]] = [a.items[n], a.items[j]]; return panel(); }
  if (d.save) return save();
  if (d.pin) return changePin();
  if (d.ref) { await loadRes(); return panel(); }
  if (d.csv) return csv();
});
async function save() {
  const e = $('te'), bad = W.findIndex(q => !q[0].trim() || q[1].some(o => !o.trim()));
  if (!W.length) return e.textContent = 'Add at least one question.';
  if (bad >= 0) return e.textContent = 'Question ' + (bad + 1) + ' needs text and four choices.';
  if (!(D.pass >= 1 && D.pass <= 100) || !D.trainer.trim() || !D.title.trim()) return e.textContent = 'Check the lab title, trainer name and passing mark.';
  for (const u of [2, 3, 4]) for (const a of UW[u]) {
    const at = 'Unit ' + u + ', "' + (a.t || 'untitled') + '": ';
    if (!a.t.trim()) return e.textContent = 'Unit ' + u + ': every activity needs a title.';
    if (a.type === 'choice') {
      const qb = a.qs.findIndex(q => !q[0].trim() || q[1].some(o => !o.trim()));
      if (qb >= 0) return e.textContent = at + 'question ' + (qb + 1) + ' needs text and four choices.';
      a.qs.forEach(q => { if (!(q[3] || '').trim()) q[3] = 'Correct answer: ' + q[1][q[2]]; });
      a.max = a.qs.length;
    } else if (a.type === 'order' || a.type === 'multi') {
      if (!(a.max >= 1 && a.max <= 20)) return e.textContent = at + 'points must be from 1 to 20.';
      if (!(a.intro || '').trim()) return e.textContent = at + 'write an instruction for the student.';
      if (a.id !== 'cab') {
        const txt = a.type === 'order' ? a.items : a.items.map(i => i[0]);
        if (txt.some(x => !x.trim())) return e.textContent = at + 'fill in or delete the empty items.';
        if (a.type === 'multi' && !a.items.some(i => i[1])) return e.textContent = at + 'tick at least one correct item.';
      }
    }
  }
  const nextCfg = Object.assign({}, CFG, D, { questions: copy(W), units: copy(UW) });
  if (JSON.stringify(nextCfg).length > 45000) return e.textContent = 'Too much content for the Google Sheet (limit about 45,000 characters). Shorten or delete some items.';
  Object.assign(CFG, nextCfg); applyCfg();
  try { await api({ action: 'saveConfig', pin: tPin, config: CFG }); net.on = true; e.textContent = 'Saved to the Google Sheet. Students get it on their next page load.'; }
  catch (x) { net.on = false; e.textContent = AC.SHEET_URL ? 'Saved for this session only (' + x.message + ').' : 'Saved for this session. Offline: lost when you reload.'; }
  setNet();
}
async function loadRes() {
  try {
    const j = await api({ action: 'results', pin: tPin }), m = new Map(j.rows.map(r => [String(r.id), r]));
    RES.forEach(r => m.set(String(r.id), r)); RES.length = 0; m.forEach(r => RES.push(r)); net.on = true;
  } catch (e) { net.on = false; }
  setNet();
}
function resHtml() {
  if (!RES.length) return '<p>No results yet. A result appears here after a student presses Finish and see score.</p>';
  const rows = RES.slice().sort((a, b) => String(b.ts).localeCompare(String(a.ts)));
  const avg = Math.round(rows.reduce((t, r) => t + +r.pct, 0) / rows.length), ps = rows.filter(r => +r.pct >= CFG.pass).length;
  return `<p><b>${rows.length}</b> student(s). Passed: <b>${ps}</b>. Average: <b>${avg}%</b>.${net.on ? '' : ' Showing this session only.'}</p><div class="tw"><table><tr>${['Name','Age','Date','Pre-test','Unit 1','Unit 2','Unit 3','Unit 4','Total','%','Remark'].map(h => `<th>${h}</th>`).join('')}</tr>${rows.map(r => `<tr><td>${esc(r.name)}</td><td>${esc(r.age)}</td><td>${esc(r.date)}</td><td>${r.pre}/${r.preMax}</td>${[1,2,3,4].map(u => `<td>${r['u' + u]}/${r['u' + u + 'max']}</td>`).join('')}<td>${r.total}/${r.max}</td><td>${r.pct}%</td><td>${esc(r.remark)}</td></tr>`).join('')}</table></div>`;
}
function csv() {
  const q = v => { v = String(v ?? ''); if (/^[=+\-@]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; };
  const t = [K.join(','), ...RES.map(r => K.map(k => q(r[k])).join(','))].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['\ufeff' + t], { type: 'text/csv' })); a.download = 'CSS-NC2-results.csv'; a.click();
}

/* ---------- start ---------- */
ov.addEventListener('click', e => { if (e.target.id === 'tbtn') openTrainer(); });
$('trbtn').onclick = openTrainer;
show('<h2>Loading…</h2>');
loadCfg().then(() => { applyCfg(); regForm(); });
