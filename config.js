/* Edit this file only. */
window.APP_CONFIG = {
  /* Paste your Google Apps Script Web app URL here (ends with /exec).
     Leave it empty to run offline: data stays in memory and is lost on reload. */
  SHEET_URL: '',
  /* Trainer PIN used when the Google Sheet cannot be reached (offline).
     The PIN that protects the Google Sheet itself is TRAINER_PIN in Code.gs. */
  DEFAULT_PIN: '1234'
};

/* Default details. The trainer can change these in Trainer settings. */
const CFG = {
  title: 'Computer Unit Lab',
  course: 'Computer Systems Servicing NC II',
  trainer: 'REYMOND P. SILVESTRE',
  role: 'CSS NC II TRAINER/ASSESSOR',
  center: '',
  pass: 75,
  questions: null
};
const PASS = () => CFG.pass / 100;
