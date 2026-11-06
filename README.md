# Computer Unit Lab – CSS NC II

Files: `index.html`, `styles.css`, `app.js`, `trainer.js`, `config.js`, `Code.gs`, `lib/three.min.js`.

## 1. Run offline
Open `index.html` in a browser. Everything works without internet except hand tracking.
With no Google Sheet linked, all data lives in memory and is lost on reload.

## 2. Set up the Google Sheet (database)
1. Create a Google Sheet. Open Extensions > Apps Script.
2. Paste the content of `Code.gs`. Change `TRAINER_PIN`. Save.
3. Deploy > New deployment > type Web app. Execute as: Me. Who has access: Anyone. Deploy and allow access.
4. Copy the Web app URL (ends with `/exec`) and paste it into `SHEET_URL` in `config.js`.
The sheet creates two tabs by itself: `Results` (one row per student) and `Config` (trainer settings and questions).
If you change `Code.gs` later, use Deploy > Manage deployments > Edit > New version.

## 3. Upload to GitHub Pages
1. Create a repository and upload all files, keeping the `lib` folder.
2. Settings > Pages > Deploy from branch > `main` / root.
3. Open `https://<username>.github.io/<repository>/`.

## Trainer settings
Press Trainer settings (registration screen or side menu). Default offline PIN is `1234` (`DEFAULT_PIN` in `config.js`).
When online, the PIN is checked by `TRAINER_PIN` in `Code.gs`.
Tabs: Details (lab title, trainer name, passing mark), Questions (pre-test), Results (table and CSV download).
