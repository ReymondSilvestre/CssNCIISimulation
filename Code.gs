/* Google Apps Script: paste this into Extensions > Apps Script of your Google Sheet. */
const TRAINER_PIN = '1234';   // first PIN. After the trainer changes it in Trainer settings, the new PIN is kept in Script properties.
const getPin = () => PropertiesService.getScriptProperties().getProperty('TRAINER_PIN') || TRAINER_PIN;

/* FORGOT THE PIN? Select resetPin in the Apps Script editor and press Run. The PIN goes back to TRAINER_PIN above. */
function resetPin() { PropertiesService.getScriptProperties().deleteProperty('TRAINER_PIN'); }
const KEYS = ['id','ts','name','age','date','trainer','pre','preMax','u1','u1max','u2','u2max','u3','u3max','u4','u4max','total','max','pct','remark','mistakes','mins'];

/* One tab per category. key = score column in the row, max = its max column.
   To add another unit later, add one line here (the app must send its u5/u5max values). */
const CATS = [
  { tab: 'Pre-test', title: 'PRE-TEST RESULTS (not counted in final score)', key: 'pre', max: 'preMax', graded: false },
  { tab: 'Unit 1',   title: 'UNIT 1 RESULTS: INSTALL AND CONFIGURE COMPUTER SYSTEMS', key: 'u1', max: 'u1max', graded: true },
  { tab: 'Unit 2',   title: 'UNIT 2 RESULTS: SET UP COMPUTER NETWORKS', key: 'u2', max: 'u2max', graded: true },
  { tab: 'Unit 3',   title: 'UNIT 3 RESULTS: SET UP COMPUTER SERVERS', key: 'u3', max: 'u3max', graded: true },
  { tab: 'Unit 4',   title: 'UNIT 4 RESULTS: MAINTAIN AND REPAIR COMPUTER SYSTEMS AND NETWORKS', key: 'u4', max: 'u4max', graded: true }
];

function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function tab(n) { const ss = SpreadsheetApp.getActive(); return ss.getSheetByName(n) || ss.insertSheet(n); }

function passMark() {
  try { const v = tab('Config').getRange('A1').getValue(); const c = v ? JSON.parse(v) : null; return (c && c.pass) || 75; }
  catch (e) { return 75; }
}

/* Create a category tab: row 1 = big title, row 2 = column headers, data from row 3. */
function catSheet(c) {
  const sh = tab(c.tab);
  if (sh.getLastRow() >= 2) return sh;
  const head = ['Student ID', 'Date saved', 'Student name', 'Age', 'Date taken', c.tab + ' score', c.tab + ' total items/points', c.tab + ' percent'];
  if (c.graded) head.push(c.tab + ' result');
  sh.clear();
  sh.getRange(1, 1, 1, head.length).merge().setValue(c.title)
    .setFontWeight('bold').setFontSize(13).setBackground('#1a73e8').setFontColor('#ffffff').setHorizontalAlignment('left');
  sh.getRange(2, 1, 1, head.length).setValues([head]).setFontWeight('bold').setBackground('#d2e3fc');
  sh.getRange(3, 1, sh.getMaxRows() - 2, 2).setNumberFormat('@');
  sh.setFrozenRows(2);
  sh.setTabColor(c.graded ? '#1a73e8' : '#f9ab00');
  return sh;
}

/* Write (or update, same id) one student's row in every category tab. */
function writeCategories(r) {
  const pass = passMark();
  CATS.forEach(c => {
    const score = r[c.key], mx = r[c.max];
    if (score === undefined || score === '' || mx === undefined || mx === '') return;
    const s = Number(score), m = Number(mx), pct = m ? Math.round(s / m * 100) : '';
    const row = [String(r.id), r.ts === undefined ? '' : String(r.ts), r.name || '', r.age || '', r.date || '', s, m, pct];
    if (c.graded) row.push(pct >= pass ? 'Competent' : 'Not yet competent');
    const sh = catSheet(c), last = sh.getLastRow();
    let f = null;
    if (last >= 3) f = sh.getRange(3, 1, last - 2, 1).createTextFinder(String(r.id)).matchEntireCell(true).findNext();
    if (f) sh.getRange(f.getRow(), 1, 1, row.length).setValues([row]);
    else sh.getRange(last + 1, 1, 1, row.length).setValues([row]);
  });
}

/* Run this ONCE from the Apps Script editor to fill the new tabs from the existing Results tab. */
function rebuildCategoryTabs() {
  const sh = tab('Results'), n = sh.getLastRow() - 1;
  if (n < 1) return;
  sh.getRange(2, 1, n, KEYS.length).getValues().forEach(v => writeCategories(Object.fromEntries(KEYS.map((k, i) => [k, v[i]]))));
}

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents), a = d.action;
    if (a === 'config') {                       // students: read settings
      const v = tab('Config').getRange('A1').getValue();
      return out({ ok: true, config: v ? JSON.parse(v) : null });
    }
    if (a === 'result') {                       // students: save one result (same id = update)
      const sh = tab('Results');
      if (!sh.getLastRow()) { sh.appendRow(KEYS); sh.getRange(1, 1, sh.getMaxRows(), KEYS.length).setNumberFormat('@'); }
      const row = KEYS.map(k => d.row[k] === undefined ? '' : String(d.row[k]));
      const f = sh.getRange(2, 1, Math.max(1, sh.getLastRow() - 1), 1).createTextFinder(String(d.row.id)).matchEntireCell(true).findNext();
      if (f) sh.getRange(f.getRow(), 1, 1, KEYS.length).setValues([row]); else sh.appendRow(row);
      writeCategories(d.row);                   // also copy into Pre-test / Unit tabs
      return out({ ok: true });
    }
    if (String(d.pin) !== getPin()) return out({ ok: false, error: 'Wrong PIN' });
    if (a === 'check') return out({ ok: true });
    if (a === 'changePin') {
      const n = String(d.newPin || '');
      if (n.length < 4 || n.length > 20) return out({ ok: false, error: 'The PIN must be 4 to 20 characters' });
      PropertiesService.getScriptProperties().setProperty('TRAINER_PIN', n);
      return out({ ok: true });
    }
    if (a === 'saveConfig') { tab('Config').getRange('A1').setValue(JSON.stringify(d.config)); return out({ ok: true }); }
    if (a === 'results') {
      const sh = tab('Results'), n = sh.getLastRow() - 1;
      const v = n > 0 ? sh.getRange(2, 1, n, KEYS.length).getValues() : [];
      return out({ ok: true, rows: v.map(r => Object.fromEntries(KEYS.map((k, i) => [k, r[i]]))) });
    }
    return out({ ok: false, error: 'Unknown action' });
  } catch (err) { return out({ ok: false, error: String(err) }); }
}
