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
When online, the PIN is checked by the Google Sheet. `TRAINER_PIN` in `Code.gs` is the first PIN; after the trainer changes it in Trainer settings > PIN, the new PIN is stored in Script properties. Forgot it? Run `resetPin` in the Apps Script editor.
Tabs: Details (lab title, trainer name, passing mark), Questions (pre-test), Results (table and CSV download).

## Offline after uploading to GitHub Pages or Vercel
The site saves itself on the device (service worker). Open the site **once with internet**, wait a few seconds, then it opens offline.
On phones and Chrome/Edge you can also choose Install app / Add to Home screen.
- Works only over https (GitHub Pages and Vercel both are). Opening `index.html` directly from a folder also works offline.
- When you change any file and upload again, change `VERSION` in `sw.js` (for example `css-lab-v2`) so devices download the update.
- Hand tracking files are bundled in `lib/mediapipe`. Upload that folder too.
- Offline results stay in memory and are lost on reload. Download the CSV before closing.

## Side menu
The side menu has two divisions: **1 Lab menu** (student, units, finish) and **2 Work station** (modes, ESD strap, auto build, quiz, power, parts list). Click a division title to fold it. The round arrow button at the top hides the whole menu; press **Menu** to bring it back.

## Editing questions and activities (Trainer settings)
Tabs: Details, Pre-test, Units 2-4, Results.
In **Units 2-4** the trainer can edit, add and delete questions and steps for the multiple-choice, ordering and select-all activities, and add new activities. The three interactive simulations (network devices, IP settings, folder permissions) and the RJ45 wire order can be renamed but their content is fixed. Unit 1 is the hands-on work station.
Changes save into the `Config` tab of the Google Sheet (limit about 45,000 characters) and students get them on their next page load. After uploading these files, `VERSION` in `sw.js` is already bumped to `css-lab-v8`.

## Trainer settings
There is no Trainer settings button for students. The trainer opens it with the small **person icon** next to the **Rear view** button (top right), then enters the PIN.

## Full screen
The square-corner icon in the top-right toolbar switches full screen on or off (Android, tablets, computers). iPhone Safari does not allow it: use Share > Add to Home Screen, then open the app from the home screen. The button hides itself when the app already runs full screen.

## Part description and hand control
The part description panel is now at the top (under the Menu button on phones). The hand control is a round hand icon below the top-right toolbar: tap it to turn hand tracking on (it turns yellow) and tap again to turn it off. The camera preview and hints show in the bottom-right corner only while it is on.
