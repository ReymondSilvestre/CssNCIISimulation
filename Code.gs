/* Google Apps Script: paste this into Extensions > Apps Script of your Google Sheet. */
const TRAINER_PIN = '1234';   // change this to your own PIN
const KEYS = ['id','ts','name','age','date','trainer','pre','preMax','u1','u1max','u2','u2max','u3','u3max','u4','u4max','total','max','pct','remark','mistakes','mins'];

function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function tab(n) { const ss = SpreadsheetApp.getActive(); return ss.getSheetByName(n) || ss.insertSheet(n); }

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
      return out({ ok: true });
    }
    if (d.pin !== TRAINER_PIN) return out({ ok: false, error: 'Wrong PIN' });
    if (a === 'check') return out({ ok: true });
    if (a === 'saveConfig') { tab('Config').getRange('A1').setValue(JSON.stringify(d.config)); return out({ ok: true }); }
    if (a === 'results') {
      const sh = tab('Results'), n = sh.getLastRow() - 1;
      const v = n > 0 ? sh.getRange(2, 1, n, KEYS.length).getValues() : [];
      return out({ ok: true, rows: v.map(r => Object.fromEntries(KEYS.map((k, i) => [k, r[i]]))) });
    }
    return out({ ok: false, error: 'Unknown action' });
  } catch (err) { return out({ ok: false, error: String(err) }); }
}
