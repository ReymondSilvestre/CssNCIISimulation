/* Trainer settings, results, Google Sheets sync. Runs after app.js. */
const AC = window.APP_CONFIG || {};
const DEF_QS = QS.map(q => [q[0], q[1].slice(), q[2]]);
CFG.questions = CFG.questions || DEF_QS;
const RES = [], net = { on: false };
let pend = [], tPin = '', tab = 'd', W = null, D = null;
const K = ['id','ts','name','age','date','trainer','pre','preMax','u1','u1max','u2','u2max','u3','u3max','u4','u4max','total','max','pct','remark','mistakes','mins'];
const copy = o => JSON.parse(JSON.stringify(o));
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
const hdr = () => `<div class="who"><b>${esc(CFG.trainer)}</b><span>${esc(CFG.role)}${CFG.center ? '<br>' + esc(CFG.center) : ''}</span></div>`;
function applyCfg() {
  QS = CFG.questions;
  document.title = CFG.title + ' – ' + CFG.course;
  document.querySelector('#side h1').textContent = CFG.title;
  document.querySelector('#side .sub').textContent = CFG.course;
  $('trn').innerHTML = `<b>${esc(CFG.trainer)}</b><br>${esc(CFG.role)}`;
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
    D = { title: CFG.title, course: CFG.course, trainer: CFG.trainer, role: CFG.role, center: CFG.center, pass: CFG.pass };
    tab = 'd'; panel();
  };
  $('tok').onclick = go; $('tp').onkeydown = e => { if (e.key === 'Enter') go(); }; $('tp').focus();
}
function panel() {
  const T = [['d', 'Details'], ['q', 'Questions (' + W.length + ')'], ['r', 'Results']];
  let b = '';
  if (tab === 'd') b = `<div class="grid">${[['title','Lab title'],['course','Course'],['trainer','Trainer name'],['role','Trainer title'],['center','Training center (optional)']].map(([k, l]) => `<label>${l}<input data-k="${k}" value="${esc(D[k])}"></label>`).join('')}<label>Passing mark (%)<input data-k="pass" type="number" min="1" max="100" value="${D.pass}"></label></div>`;
  else if (tab === 'q') b = W.map((q, i) => `<div class="qcard"><label>Question ${i + 1}<input data-q="${i}" value="${esc(q[0])}"></label>${q[1].map((o, j) => `<div class="qopt"><input type="radio" name="r${i}" data-r="${i}.${j}" ${q[2] === j ? 'checked' : ''} aria-label="Correct answer"><input data-o="${i}.${j}" value="${esc(o)}" placeholder="Choice ${j + 1}"></div>`).join('')}<button class="opt" data-del="${i}">Delete question</button></div>`).join('') + '<div class="btns"><button class="opt" data-add="1">Add question</button><button class="opt" data-rst="1">Restore default questions</button></div><p class="meta">Select the round button beside the correct choice.</p>';
  else b = resHtml();
  tr.innerHTML = `<div class="tcard">${hdr()}<h2>Trainer settings</h2><div class="tabs">${T.map(t => `<button data-t="${t[0]}" class="${tab === t[0] ? 'on' : ''}">${t[1]}</button>`).join('')}</div>${b}<p class="err" id="te"></p><div class="btns">${tab === 'r' ? '<button data-ref="1">Refresh from sheet</button><button data-csv="1">Download CSV</button>' : '<button data-save="1">Save changes</button>'}<button class="opt" data-x="1">Close</button></div></div>`;
}
tr.addEventListener('input', e => {
  const t = e.target, d = t.dataset;
  if (d.k) D[d.k] = t.type === 'number' ? +t.value : t.value;
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
  if (d.save) return save();
  if (d.ref) { await loadRes(); return panel(); }
  if (d.csv) return csv();
});
async function save() {
  const e = $('te'), bad = W.findIndex(q => !q[0].trim() || q[1].some(o => !o.trim()));
  if (!W.length) return e.textContent = 'Add at least one question.';
  if (bad >= 0) return e.textContent = 'Question ' + (bad + 1) + ' needs text and four choices.';
  if (!(D.pass >= 1 && D.pass <= 100) || !D.trainer.trim() || !D.title.trim()) return e.textContent = 'Check the lab title, trainer name and passing mark.';
  Object.assign(CFG, D, { questions: copy(W) }); applyCfg();
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
