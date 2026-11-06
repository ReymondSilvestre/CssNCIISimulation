/* Offline support. Bump VERSION when you change files so devices refresh. */
const VERSION='css-lab-v7',CORE=["./", "index.html", "styles.css", "app.js", "trainer.js", "config.js", "manifest.json", "icon-192.png", "icon-512.png", "logo.png", "favicon.ico", "favicon.png", "apple-touch-icon.png", "lib/three.min.js"],HEAVY=[
"lib/mediapipe/hand_landmark_lite.tflite",
"lib/mediapipe/hands.binarypb",
"lib/mediapipe/hands.js",
"lib/mediapipe/hands_solution_packed_assets.data",
"lib/mediapipe/hands_solution_packed_assets_loader.js",
"lib/mediapipe/hands_solution_simd_wasm_bin.data",
"lib/mediapipe/hands_solution_simd_wasm_bin.js",
"lib/mediapipe/hands_solution_simd_wasm_bin.wasm",
"lib/mediapipe/hands_solution_wasm_bin.js",
"lib/mediapipe/hands_solution_wasm_bin.wasm"
];
self.addEventListener('install',e=>{e.waitUntil((async()=>{
  const c=await caches.open(VERSION);
  await c.addAll(CORE);
  await Promise.allSettled(HEAVY.map(u=>c.add(u)));   // hand tracking files: best effort
  self.skipWaiting();
})())});
self.addEventListener('activate',e=>{e.waitUntil((async()=>{
  for(const k of await caches.keys())if(k!==VERSION)await caches.delete(k);
  await self.clients.claim();
})())});
/* Cache first, refresh in the background. Google Sheet calls (POST) are never cached. */
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  e.respondWith((async()=>{
    const c=await caches.open(VERSION),hit=await c.match(r,{ignoreSearch:true});
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res}).catch(()=>null);
    if(hit){e.waitUntil(net);return hit}
    return (await net)||(r.mode==='navigate'?await c.match('index.html'):Response.error());
  })());
});
