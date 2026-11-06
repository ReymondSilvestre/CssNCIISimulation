
const $=id=>document.getElementById(id);
const canvas=$('c');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
const scene=new THREE.Scene();scene.background=new THREE.Color(0xd5dde0);
const cam=new THREE.PerspectiveCamera(45,1,.1,200);
scene.add(new THREE.AmbientLight(0xffffff,.65));
const sun=new THREE.DirectionalLight(0xffffff,.8);sun.position.set(8,14,16);scene.add(sun);
const grid=new THREE.GridHelper(70,35,0x8fa3ab,0xb4c2c8);grid.position.y=-9.3;scene.add(grid);

/* ---------- model helpers ---------- */
const M=(c,o={})=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.55,metalness:.25},o));
function bx(g,w,h,d,c,x,y,z,o){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),M(c,o));m.position.set(x,y,z);g.add(m);return m}
function cy(g,r,h,c,x,y,z){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,28),M(c));m.rotation.x=Math.PI/2;m.position.set(x,y,z);g.add(m);return m}

/* static case frame */
/* workstation: repair bench with ESD mat */
const world=new THREE.Group();scene.add(world);
bx(world,52,.5,34,0xa07c55,1,-.56,0,{roughness:.8,metalness:0});
[[-24,-15],[26,-15],[-24,15],[26,15]].forEach(([x,z])=>bx(world,.9,8.4,.9,0x4a5058,x,-5,z));
bx(world,48,.06,32,0x2f6f5e,1,-.28,0,{roughness:.9,metalness:0});
bx(world,70,.3,50,0xc4ced2,1,-9.5,0,{metalness:0});
bx(world,2.2,.4,.4,0xe63946,3,-.05,-12);bx(world,3.2,.12,.12,0xc8ccd0,5.8,-.05,-12);
bx(world,3,.3,2,0x6b7580,10,-.1,-12.5);
const ws=new THREE.Mesh(new THREE.TorusGeometry(.7,.12,8,20),M(0x2f6fe0));ws.rotation.x=Math.PI/2;ws.position.set(15,-.1,-12);world.add(ws);
/* computer case lies on its side: open side faces up */
const rig=new THREE.Group();rig.rotation.x=-Math.PI/2;rig.position.y=-.05;scene.add(rig);
const body=new THREE.Group();rig.add(body);
bx(body,8.4,10.4,.2,0x2c3440,0,0,-.1);
bx(body,.2,10.4,2.4,0x39424f,-4.2,0,1.1);bx(body,.2,10.4,2.4,0x39424f,4.2,0,1.1);
bx(body,8.6,.2,2.4,0x39424f,0,5.2,1.1);bx(body,8.6,.2,2.4,0x39424f,0,-5.2,1.1);


/* ---------- parts ---------- */
const parts=[];
let inWorld=false;
function def(id,name,fn,tip,home,tray,needs,build,homeRot=0,trayRot=0){
  const g=new THREE.Group();build(g);
  if(!inWorld&&tray[2]==null){const b=new THREE.Box3().setFromObject(g);tray=[tray[0],tray[1],-.2-b.min.z]}
  ;(inWorld?scene:rig).add(g);
  const p={id,name,fn,tip,needs,g,home:new THREE.Vector3(...home),tray:new THREE.Vector3(...tray),hr:homeRot,tr:trayRot,inst:true,mats:[]};
  g.traverse(o=>{if(o.isMesh){o.userData.p=p;p.mats.push(o.material)}});
  g.position.copy(p.home);g.rotation.y=homeRot;p.tp=p.home.clone();p.rt=homeRot;
  parts.push(p);return p;
}
const P=id=>parts.find(p=>p.id===id);

def('panel','Side panel','Covers the internal components, keeps out dust and guides airflow.','Always the first part removed and the last part installed.',[0,0,2.25],[4,-11.5,null],
  ['psu','mobo','cpu','cooler','ram1','ram2','gpu','hdd','ssd'],
  g=>{bx(g,8.2,10.2,.08,0x9fd0e0,0,0,0,{transparent:true,opacity:.25,metalness:.8,roughness:.1});bx(g,8.3,.25,.2,0x222a33,0,5.05,0);bx(g,8.3,.25,.2,0x222a33,0,-5.05,0);bx(g,.25,10.2,.2,0x222a33,-4.05,0,0);bx(g,.25,10.2,.2,0x222a33,4.05,0,0)},0,0);

def('psu','Power supply unit (PSU)','Converts 230V/115V AC from the wall into the DC voltages (+3.3V, +5V, +12V) the components use.','Unplug the power cord and press the power button to discharge before opening.',[-2.2,-3.9,1],[12,-2.5,null],[],
  g=>{bx(g,3.2,2.2,2,0x333b45,0,0,0);cy(g,.85,.1,0x111111,0,0,1.02);bx(g,.8,.5,.05,0xffb703,1,.7,1.03);bx(g,.3,.3,.8,0x111111,1.3,-.5,-1.2)});

def('mobo','Motherboard','Main circuit board. Connects the CPU, RAM, storage and expansion cards and passes data between them.','Mount on brass standoffs that match the case holes. Never let it touch bare metal.',[.5,1.2,.1],[12,4,null],['psu'],
  g=>{bx(g,5,5,.15,0x1f7a4a,0,0,0);bx(g,1.2,1.2,.06,0xbfc5c9,0,1.1,.1);bx(g,.16,2.6,.2,0x151515,2,1.4,.12);bx(g,.16,2.6,.2,0x151515,2.4,1.4,.12);bx(g,3.6,.18,.2,0x151515,0,-1.4,.12);bx(g,.8,.8,.25,0x555b63,0,-.2,.12);bx(g,1.4,.5,.3,0x555b63,-1.8,1.9,.12);for(let i=0;i<4;i++)bx(g,.5,.2,.2,0xb71c1c,-1.5+i*.6,-2.2,.12);bx(g,.5,.5,.2,0xdddddd,2,-2.1,.12)});

def('cpu','CPU (processor)','Executes program instructions. The “brain” of the computer.','Match the triangle mark on the CPU to the socket. Never force it in.',[.5,2.3,.3],[17,-.5,null],['mobo'],
  g=>{bx(g,.9,.9,.1,0xcfcfcf,0,0,0,{metalness:.7});bx(g,.5,.5,.12,0x8a8f94,0,0,.01)});

def('cooler','CPU cooler (heatsink and fan)','Pulls heat away from the CPU. Thermal paste fills the gap between CPU and heatsink.','Apply a pea-sized drop of thermal paste, then plug the fan into the CPU_FAN header.',[.5,2.3,.85],[20,-.5,null],['cpu'],
  g=>{bx(g,1.8,1.8,.9,0x9aa4ad,0,0,0,{metalness:.8});cy(g,.75,.3,0x1c1c1c,0,0,.55);cy(g,.2,.35,0x555555,0,0,.58)});

def('ram1','RAM module 1 (DIMM)','Fast temporary memory for running programs. Contents are lost when power is off.','Match the notch to the slot key, then press both ends until the clips click.',[2.5,2.6,.55],[17,-3.5,null],['mobo'],
  g=>{bx(g,.22,2.5,.5,0x1d4ed8,0,0,0);for(let i=0;i<3;i++)bx(g,.26,.4,.4,0x111111,0,-.7+i*.7,0);bx(g,.2,2.5,.05,0xd4af37,0,0,-.26)});

def('ram2','RAM module 2 (DIMM)','Second memory module. Matched pairs enable dual-channel mode for more bandwidth.','Use the slots recommended in the motherboard manual for dual channel.',[2.9,2.6,.55],[18.2,-3.5,null],['mobo'],
  g=>{bx(g,.22,2.5,.5,0xdc2626,0,0,0);for(let i=0;i<3;i++)bx(g,.26,.4,.4,0x111111,0,-.7+i*.7,0);bx(g,.2,2.5,.05,0xd4af37,0,0,-.26)});

def('gpu','Graphics card (GPU)','Processes images and video and sends the picture to the monitor.','Seat it firmly in the PCIe x16 slot and plug in the extra power cable if it has one.',[.5,-.2,.95],[19,6.5,null],['mobo'],
  g=>{bx(g,4,1.2,1.4,0x1a1a1f,0,0,0);cy(g,.45,.1,0x666666,-.9,0,.72);cy(g,.45,.1,0x666666,.9,0,.72);bx(g,4,.08,.2,0xff6f00,0,.62,.4)});

def('hdd','Hard disk drive (HDD)','Stores the operating system and files on spinning magnetic platters. Large and cheap.','Handle gently. Do not shake or drop a drive that is powered on.',[-3.2,.2,.4],[17.5,3,null],[],
  g=>{bx(g,1.5,2.2,.5,0xb8c0c8,0,0,0,{metalness:.8});bx(g,1.2,1.6,.02,0x222222,0,0,.26)});

def('ssd','Solid state drive (SSD)','Flash storage with no moving parts. Much faster boot and load times than an HDD.','Connects with a SATA data cable and a SATA power cable.',[-3.2,3,.35],[20.5,3,null],[],
  g=>{bx(g,1.1,1.8,.25,0x2b2b2b,0,0,0);bx(g,.9,.8,.02,0xffb703,0,.3,.14)});

/* ---------- peripherals, cables, power button ---------- */
const sc=document.createElement('canvas');sc.width=512;sc.height=300;const sx=sc.getContext('2d');const stex=new THREE.CanvasTexture(sc);
const kcv=document.createElement('canvas');kcv.width=300;kcv.height=100;
{const k=kcv.getContext('2d');k.fillStyle='#222a33';k.fillRect(0,0,300,100);k.fillStyle='#d7dee4';for(let r=0;r<5;r++)for(let c=0;c<20;c++)if(r<4||(c>2&&c<14))k.fillRect(6+c*14.4,6+r*18,12,15)}
const ktex=new THREE.CanvasTexture(kcv);
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
/* rear sockets on the left wall; power strip on the bench */
bx(body,.1,.8,1.1,0x111111,-4.35,-3.9,1);bx(body,.1,.3,.7,0x2f6fe0,-4.35,-.2,.95);bx(body,.1,.4,.7,0x2f6fe0,-4.35,-1.6,.6);
bx(world,2.4,.4,.8,0x444b55,-12.5,-.05,3.9);
const stripM=M(0x22ee66);const sl=new THREE.Mesh(new THREE.BoxGeometry(.3,.1,.3),stripM);sl.position.set(-13.3,.18,3.9);world.add(sl);
inWorld=true;

def('monitor','Monitor','Shows the picture from the graphics card. Needs power and a video cable.','Plug the video cable into the graphics card port, not the motherboard port.',[-13.5,5.21,-4],[-13.5,5.21,-11.5],[],
  g=>{bx(g,7,4.2,.3,0x15191f,0,0,0);bx(g,.6,1.6,.3,0x2b323b,0,-2.9,-.1);bx(g,3,.2,2,0x2b323b,0,-3.8,-.1);
  const m=new THREE.Mesh(new THREE.PlaneGeometry(6.6,3.8),new THREE.MeshBasicMaterial({map:stex}));m.position.z=.16;g.add(m)});
def('keyboard','Keyboard','Input device for typing. During start-up, press DEL (or F2) to enter BIOS setup.','Connect the keyboard before powering on, or you cannot enter BIOS.',[-13.5,-.125,1.6],[-13.5,-.125,8.5],[],
  g=>{bx(g,6.2,.25,2.1,0x222a33,0,0,0);const m=new THREE.Mesh(new THREE.PlaneGeometry(6,1.9),new THREE.MeshBasicMaterial({map:ktex}));m.rotation.x=-Math.PI/2;m.position.y=.14;g.add(m)});

P('monitor').g.scale.setScalar(1.4);
function cable(id,name,fn,tip,E,way,F,loose,col,needs){
  const p=def(id,name,fn,tip,[0,0,0],[0,0,0],needs,g=>{g.userData.tube=new THREE.Mesh(new THREE.BufferGeometry(),M(col));g.add(g.userData.tube);g.userData.head=bx(g,.5,.4,.4,0x222a33,0,0,0)});
  p.E=V(...E);p.way=way.map(w=>V(...w));p.F=V(...F);p.loose=V(...loose);p.cur=p.E.clone();p.cable=true;cabUpd(p,true);return p;
}
function cabUpd(p,f){
  const tg=p.inst?p.E:p.loose,pv=p.cur.clone();
  p.cur.lerp(tg,.14);if(p.cur.distanceTo(tg)<.02)p.cur.copy(tg);
  if(!f&&p.cur.equals(pv))return;
  const k=Math.max(0,Math.min(1,1-p.cur.distanceTo(p.E)/p.E.distanceTo(p.loose))),n=p.way.length;
  const pts=[p.cur.clone(),...p.way.map((w,i)=>w.clone().lerp(p.cur.clone().lerp(p.F,(i+1)/(n+1)),1-k)),p.F.clone()];
  const t=p.g.userData.tube;t.geometry.dispose();t.geometry=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),40,.1,6);
  p.g.userData.head.position.copy(p.cur);
}
cable('pcord','Power cord','Carries AC power from the wall outlet to the PSU.','Unplug it before opening the case. Plug it in last.',[-4.4,.95,3.9],[[-5.8,.6,3.9],[-7.2,-.13,3.9],[-9.6,-.13,3.9]],[-11.3,-.05,3.9],[-9.3,-.13,5.6],0x111111,['psu']);
cable('hdmi','Monitor cable (HDMI)','Carries the video signal from the graphics card to the monitor.','Plug into the graphics card port at the rear of the case.',[-4.4,.9,.2],[[-5.8,.75,.2],[-6.9,-.13,-1.2],[-7.7,-.13,-3],[-8.3,1.5,-3.9]],[-8.55,3.3,-4],[-7.4,-.13,-5],0x2f6fe0,['gpu','monitor']);
cable('kbc','Keyboard cable (USB)','Connects the keyboard to a USB port on the motherboard.','No keyboard connected means no BIOS access.',[-4.4,.55,1.6],[[-5.8,.3,1.6],[-7.2,-.13,1.6],[-9,-.13,1.6]],[-10.4,-.125,1.6],[-8,-.13,3],0x8a929a,['mobo','keyboard']);

/* power button and LED on top of the case */
const pwrM=M(0x888888),ledM=M(0x224422);
const pb=new THREE.Mesh(new THREE.CylinderGeometry(.35,.35,.18,20),pwrM);pb.position.set(4.35,3.2,1.1);pb.rotation.z=Math.PI/2;body.add(pb);
const led=new THREE.Mesh(new THREE.SphereGeometry(.12,10,10),ledM);led.position.set(4.4,2.3,1.1);body.add(led);
const PWR={sw:true,name:'Power button',fn:'Starts the PC. Press it once everything is connected and the power cord is plugged in.',tip:'The green LED shows the PC is on.',mats:[pwrM]};pb.userData.p=PWR;

/* ---------- state ---------- */
let mode='identify',esd=false,errors=0,quiz=null,auto=null;
const order=['pcord','hdmi','kbc','monitor','keyboard','panel','gpu','ram1','ram2','cooler','cpu','hdd','ssd','mobo','psu'];
function setInst(p,v){p.inst=v;p.tp.copy(v?p.home:p.tray);p.rt=v?p.hr:p.tr;refresh();if(p.id==='pcord'){stripM.color.setHex(v?0x22ee66:0x224422);if(!v&&pc.on)offPc()}screen()}
function blocker(p){return parts.find(q=>q.inst&&q.needs.includes(p.id))}
function refresh(){
  $('list').innerHTML=parts.map(p=>`<li class="${p.inst?'':'out'}"><b>${p.name.split(' (')[0]}</b><span>${p.inst?'installed':'out'}</span></li>`).join('');
  $('stat').textContent=`${parts.filter(p=>p.inst).length}/${parts.length} installed. Mistakes: ${errors}`;
}
let tt;function toast(t){const e=$('toast');e.textContent=t;e.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>e.classList.remove('show'),2400)}
function showInfo(p){$('info').innerHTML=`<h2>${p.name}</h2><p>${p.fn}</p><p class="tip">Tip: ${p.tip}</p>`}

function act(p){
  if(p.sw)return togglePower();
  if(p.id==='keyboard'&&(pc.st==='post'||pc.st==='err')){showInfo(p);return enterBios()}
  if(quiz)return answer(p);
  showInfo(p);
  if(mode==='identify')return;
  if(!esd)return toast('Put on your ESD wrist strap first.');
  if(p.id!=='pcord'&&P('pcord').inst)return toast('Unplug the power cord first.');
  if(mode==='dis'){
    if(!p.inst)return toast(p.name+' is already removed.');
    const b=blocker(p);if(b){errors++;refresh();return toast('Remove the '+b.name+' first.')}
    setInst(p,false);if(parts.every(q=>!q.inst))S.dis=true;
  }else{
    if(p.inst)return toast(p.name+' is already installed.');
    const m=p.needs.map(P).find(q=>!q.inst);
    if(m){errors++;refresh();return toast('Install the '+m.name+' first.')}
    setInst(p,true);if(S.dis&&!S.asm&&parts.every(q=>q.inst)){S.asm=true;toast('Assembly complete! Power on the PC, configure the BIOS, then press Finish.')}
  }
}
function runAuto(dir){
  if(auto)clearInterval(auto);
  const seq=dir?order.slice():order.slice().reverse();let i=0;
  auto=setInterval(()=>{if(i>=seq.length){clearInterval(auto);auto=null;return}setInst(P(seq[i++]),dir?false:true)},650);
}
function startQuiz(){
  quiz={n:0,score:0,cur:null};setInst(P('panel'),false);nextQ();
}
function nextQ(){
  if(quiz.n>=5){S.quiz=quiz.score;toast(`Quiz done: ${quiz.score}/5`);$('info').innerHTML=`<h2>Quiz finished</h2><p>You scored ${quiz.score} out of 5.</p>`;quiz=null;$('quiz').textContent='Start quiz (5 questions)';return}
  const ps=parts.filter(p=>p.id!=='panel'&&!p.cable&&p!==(quiz.cur||{}));quiz.cur=ps[Math.floor(Math.random()*ps.length)];quiz.n++;
  $('quiz').textContent='Stop quiz';
  $('info').innerHTML=`<h2>Question ${quiz.n} of 5</h2><p>Click the part described here: ${quiz.cur.fn}</p>`;
}
function answer(p){
  if(p===quiz.cur){quiz.score++;toast('Correct: '+p.name)}else toast('Not quite. That is the '+p.name+'.');
  nextQ();
}

/* ---------- power, POST and BIOS ---------- */
const pc={on:false,st:'off',lines:[],timers:[]};
const BO=['USB Flash','Network','HDD','SSD'];
const bios={date:'2010-01-01',boot1:'USB Flash',secure:true,xmp:false,saved:false};
let bw={...bios};
const osDrive=()=>P('ssd').inst?'SSD':P('hdd').inst?'HDD':null;
const kbOK=()=>P('keyboard').inst&&P('kbc').inst;
const later=(ms,fn)=>pc.timers.push(setTimeout(fn,ms));
const clr=()=>{pc.timers.forEach(clearTimeout);pc.timers=[]};
function screen(){
  const on=pc.on&&P('pcord').inst,link=P('gpu').inst&&P('hdmi').inst&&P('monitor').inst;
  let bg='#000',fg='#bfffd0',L=[];
  if(!on){}
  else if(!link){bg='#10203a';fg='#8fb4e0';L=['','','        No signal','   Check the video cable']}
  else if(pc.st==='bios'){bg='#0b2a8f';fg='#e8ecff';L=['BIOS Setup Utility','','Date: '+bw.date,'Boot #1: '+bw.boot1,'','F10 save and exit','Esc exit without saving']}
  else if(pc.st==='os'){bg='#15506e';fg='#fff';L=['','  Welcome, '+S.name,'','  Operating system loaded.','  The computer is ready.']}
  else if(pc.st==='err'){fg='#ff9a90';L=pc.lines}
  else L=pc.lines;
  sx.fillStyle=bg;sx.fillRect(0,0,512,300);sx.fillStyle=fg;sx.font='17px monospace';
  L.slice(-12).forEach((l,i)=>sx.fillText(l,14,26+i*22));stex.needsUpdate=true;
}
function ui(){
  $('pwr').textContent=pc.on?'Power off the PC':'Power on the PC';
  $('del').disabled=!(pc.st==='post'||pc.st==='err');
  ledM.color.setHex(pc.on?0x22ee66:0x224422);
}
function offPc(){clr();pc.on=false;pc.st='off';pc.lines=[];$('bios').style.display='none';ui();screen()}
function togglePower(){
  if(pc.on){offPc();return toast('PC powered off.')}
  const g=id=>P(id).inst;
  if(!g('pcord'))return toast('No power. Plug in the power cord first.');
  if(!g('psu')||!g('mobo'))return toast('Nothing happens. Check the PSU and the motherboard.');
  if(!g('cpu')||!(g('ram1')||g('ram2')))return toast('Beep error: the CPU or RAM is missing.');
  if(!g('cooler'))return toast('The PC shuts down at once: the CPU cooler is missing.');
  startPost();
}
function startPost(){
  clr();pc.on=true;pc.st='post';pc.lines=['CSS NC II BIOS v1.0'];
  const n=['ram1','ram2'].filter(x=>P(x).inst).length,dr=[P('ssd').inst&&'SSD 256 GB',P('hdd').inst&&'HDD 1 TB'].filter(Boolean).join(', ')||'none';
  const L=['CPU: detected','Memory test: '+n*8+' GB OK','Drives: '+dr,'Keyboard: '+(kbOK()?'detected':'NOT FOUND'),'','Press DEL to enter BIOS Setup'];
  L.forEach((l,i)=>later(400+i*500,()=>{pc.lines.push(l);screen()}));
  later(400+L.length*500+3500,bootOs);ui();screen();
}
function bootOs(){
  const d=osDrive();
  if(!d)pc.lines.push('','No bootable device found.','Install a drive, then restart.');
  else if(bios.boot1!==d)pc.lines.push('','Boot device not found: '+bios.boot1,'Press DEL to open BIOS Setup','and fix the boot order.');
  if(!d||bios.boot1!==d)pc.st='err';else{pc.st='os';S.boot=true}
  ui();screen();
}
function enterBios(){
  if(!(pc.on&&(pc.st==='post'||pc.st==='err')))return;
  if(!kbOK())return toast('Keyboard not detected. Connect the keyboard cable and restart.');
  if(!(P('gpu').inst&&P('hdmi').inst&&P('monitor').inst))return toast('No display. Check the monitor and its cable.');
  clr();pc.st='bios';bw={...bios};renderBios();$('bios').style.display='flex';ui();screen();
}
function renderBios(){
  const n=['ram1','ram2'].filter(x=>P(x).inst).length,dr=[P('ssd').inst&&'SSD 256 GB',P('hdd').inst&&'HDD 1 TB'].filter(Boolean).join(', ')||'none';
  $('bwin').innerHTML=`<h2>CSS NC II BIOS Setup Utility</h2>
<div class="bi">CPU: ${P('cpu').inst?'detected':'none'}<br>Memory: ${n*8} GB in ${n} module(s)<br>Drives: ${dr}<br>Operating system is installed on: ${osDrive()||'no drive'}</div>
<div class="bi" style="color:#ffb703">Tasks: 1. Set the system date to ${esc(S.date)}. 2. Make the operating system drive Boot Option #1. 3. Save and exit.</div>
<label>System date<input type="date" id="bd" value="${bw.date}"></label>
<button data-a="boot">Boot Option #1: [${bw.boot1}] (click to change)</button>
<button data-a="sec">Secure Boot: [${bw.secure?'Enabled':'Disabled'}]</button>
<button data-a="xmp">XMP memory profile: [${bw.xmp?'Enabled':'Disabled'}]</button>
<button data-a="def">Load default settings</button>
<button data-a="save">Save and exit (F10)</button>
<button data-a="esc">Exit without saving (Esc)</button>`;
}
function exitBios(save){
  if(save)Object.assign(bios,bw,{saved:true});
  $('bios').style.display='none';toast(save?'Settings saved. Restarting…':'Exited without saving. Restarting…');startPost();
}
$('bwin').onclick=e=>{
  const b=e.target.closest('button');if(!b)return;const a=b.dataset.a;
  if(a==='boot')bw.boot1=BO[(BO.indexOf(bw.boot1)+1)%BO.length];
  else if(a==='sec')bw.secure=!bw.secure;else if(a==='xmp')bw.xmp=!bw.xmp;
  else if(a==='def')bw={date:'2010-01-01',boot1:'USB Flash',secure:true,xmp:false};
  else if(a==='save')return exitBios(true);else if(a==='esc')return exitBios(false);
  renderBios();screen();
};
$('bwin').oninput=e=>{if(e.target.id==='bd'){bw.date=e.target.value;screen()}};
$('pwr').onclick=togglePower;$('del').onclick=enterBios;
$('rv').onclick=()=>{if(yaw>-.5){yaw=-1.2;pitch=.7}else{yaw=.2;pitch=.62}};
addEventListener('keydown',e=>{
  if(e.key==='Delete'&&pc.st!=='bios')enterBios();
  else if(pc.st==='bios'&&e.key==='F10'){e.preventDefault();exitBios(true)}
  else if(pc.st==='bios'&&e.key==='Escape')exitBios(false);
});

/* ---------- camera orbit ---------- */
let yaw=.2,pitch=.62,R=34;
function fit(){
  const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);cam.aspect=w/h;cam.fov=cam.aspect<1?60:45;cam.updateProjectionMatrix();
  R=Math.max(34,Math.min(80,40/cam.aspect));
}
addEventListener('resize',fit);fit();
const CT=V(2,0,0);
function placeCam(){cam.position.set(CT.x+R*Math.cos(pitch)*Math.sin(yaw),CT.y+R*Math.sin(pitch),CT.z+R*Math.cos(pitch)*Math.cos(yaw));cam.lookAt(CT)}

/* ---------- unified pointer (mouse and hand) ---------- */
const ray=new THREE.Raycaster(),v2=new THREE.Vector2();
function pick(x,y){
  v2.set(x/innerWidth*2-1,-(y/innerHeight)*2+1);ray.setFromCamera(v2,cam);
  const h=ray.intersectObjects([...parts.map(p=>p.g),pb],true)[0];return h?h.object.userData.p:null;
}
const ptr={down:0,x:0,y:0,moved:0,hit:null,th:10,r:0};
/* forgiving pick: if the cursor is close to a part you can use, choose it (helps with small parts) */
const _bb=new THREE.Box3(),_c=new THREE.Vector3();
function pickNear(x,y,r){
  const hit=pick(x,y),usable=p=>!p.cable&&!p.sw&&(canHold(p)||mode==='identify'||!!quiz);
  if(hit&&(hit.cable||hit.sw||usable(hit)))return hit;
  let best=null,bd=r;
  if(r>0)for(const p of parts){
    if(!usable(p))continue;
    _bb.setFromObject(p.g).getCenter(_c).project(cam);
    const d=Math.hypot((_c.x+1)/2*innerWidth-x,(1-_c.y)/2*innerHeight-y);
    if(d<bd){bd=d;best=p}
  }
  return best||hit;
}
const handR=()=>Math.max(55,Math.min(innerWidth,innerHeight)*.1);
let hov=null;
function hover(p){
  if(p===hov)return;
  if(hov)hov.mats.forEach(m=>m.emissive&&m.emissive.setHex(0));
  hov=p;if(p){p.mats.forEach(m=>m.emissive&&m.emissive.setHex(0x2a4d70));if(!quiz)showInfo(p)}
}
function pDown(x,y){ptr.down=1;ptr.x=x;ptr.y=y;ptr.moved=0;ptr.hit=pickNear(x,y,ptr.r)}
function pMove(x,y){
  const dx=x-ptr.x,dy=y-ptr.y;ptr.x=x;ptr.y=y;
  if(ptr.down){ptr.moved+=Math.abs(dx)+Math.abs(dy);
    if(!held&&ptr.hit&&ptr.moved>ptr.th&&canHold(ptr.hit))startHold(ptr.hit);
    if(held)dragTo(held,x,y);
    else if(!ptr.hit||ptr.moved>ptr.th){yaw-=dx*.008;pitch=Math.max(-.15,Math.min(1.45,pitch+dy*.006))}}
  else hover(pick(x,y));
}
function pUp(){if(held&&ptr.down){endGrab();ptr.down=0;return}if(ptr.down&&ptr.hit&&ptr.moved<=ptr.th)act(ptr.hit);ptr.down=0}
canvas.addEventListener('pointerdown',e=>{ptr.th=10;ptr.r=e.pointerType==='touch'?40:0;canvas.setPointerCapture(e.pointerId);pDown(e.clientX,e.clientY)});
canvas.addEventListener('pointermove',e=>pMove(e.clientX,e.clientY));
canvas.addEventListener('pointerup',pUp);
canvas.addEventListener('wheel',e=>{e.preventDefault();R=Math.max(12,Math.min(80,R+e.deltaY*.02))},{passive:false});

/* ---------- hand tracking ---------- */
const cur=$('cursor'),vid=$('vid');
let handOn=false,hands=null,stream=null,pinch=false,hx=0,hy=0,uiClick=false;
async function startHand(){
  if(!window.Hands)return toast('Hand tracking library did not load. Reload the page once while online.');
  try{stream=await navigator.mediaDevices.getUserMedia({video:{width:640,height:480}})}
  catch(e){return toast('Camera blocked. Allow camera access and try again.')}
  vid.srcObject=stream;await vid.play();
  hands=new Hands({locateFile:f=>'lib/mediapipe/'+f});
  hands.setOptions({maxNumHands:1,modelComplexity:0,minDetectionConfidence:.6,minTrackingConfidence:.5});
  hands.onResults(onHand);
  handOn=true;cur.style.display='block';$('cam').classList.add('on');
  $('hand').textContent='Hand control: on';$('hand').classList.add('on');
  $('hs').textContent='Looking for your hand…';handLoop();
}
function stopHand(){
  handOn=false;if(pinch)release();cur.style.display='none';$('cam').classList.remove('on');
  if(stream)stream.getTracks().forEach(t=>t.stop());
  $('hand').textContent='Hand control: off';$('hand').classList.remove('on');
  $('hs').textContent='Point to move the cursor. Pinch thumb and index finger to click. Pinch to grab a part, move your hand, open your fingers to drop it.';
}
async function handLoop(){
  if(!handOn)return;
  try{if(vid.readyState>=2)await hands.send({image:vid})}catch(e){}
  requestAnimationFrame(handLoop);
}
let held=null;
function release(){endGrab();pinch=false;uiClick=false;cur.classList.remove('pinch')}
/* pinch = grab. The part follows the hand. Open the fingers to drop it. */
const canHold=p=>!(p.sw||p.cable||quiz||mode==='identify'||on3||(p.id==='keyboard'&&(pc.st==='post'||pc.st==='err')))&&esd&&!P('pcord').inst&&(mode==='dis'?p.inst&&!blocker(p):!p.inst&&p.needs.map(P).every(q=>q.inst));
function tryGrab(p){if(!canHold(p))return act(p);startHold(p)}
function startHold(p){
  held=p;showInfo(p);p.mats.forEach(m=>m.emissive&&m.emissive.setHex(0x6a8f2a));
  toast('Holding '+p.name.split(' (')[0]+(mode==='dis'?'. Drop it beside the case.':'. Drop it inside the case.'));
}
function dragTo(p,x,y){
  v2.set(x/innerWidth*2-1,-y/innerHeight*2+1);ray.setFromCamera(v2,cam);
  const pt=V(0,0,0);if(!ray.ray.intersectPlane(new THREE.Plane(V(0,1,0),-5),pt))return;
  pt.x=Math.max(-30,Math.min(30,pt.x));pt.z=Math.max(-22,Math.min(22,pt.z));
  p.tp.copy(p.g.parent===rig?rig.worldToLocal(pt):pt);
}
function endGrab(){
  const p=held;if(!p)return;held=null;p.mats.forEach(m=>m.emissive&&m.emissive.setHex(0));
  const t=p.tp,over=p.g.parent===rig?Math.abs(t.x)<4.8&&Math.abs(t.y)<5.8:Math.hypot(t.x-p.home.x,t.z-p.home.z)<5;
  if(mode==='dis'&&!over){setInst(p,false);if(parts.every(q=>!q.inst))S.dis=true}
  else if(mode==='asm'&&over){setInst(p,true);if(S.dis&&!S.asm&&parts.every(q=>q.inst)){S.asm=true;toast('Assembly complete! Power on the PC, configure the BIOS, then press Finish.')}}
  else p.tp.copy(p.inst?p.home:p.tray);
}
/* hand gestures never rotate the view */
function handSelect(x,y){
  if(on3&&g3){q3.set(x/innerWidth*2-1,-y/innerHeight*2+1);rc3.setFromCamera(q3,c3);
    const h=rc3.intersectObjects(g3.children,true).find(o=>o.object.userData.k);if(h)clickK(h.object.userData.k);return}
  const p=pickNear(x,y,handR());if(p)tryGrab(p);
}
function onHand(r){
  const l=r.multiHandLandmarks&&r.multiHandLandmarks[0];
  if(!l){$('hs').textContent='No hand seen. Show your hand to the camera.';if(pinch)release();return}
  $('hs').textContent=pinch?'Pinching (click / drag)':'Hand tracked. Pinch to click.';
  const t={x:(l[4].x+l[8].x)/2,y:(l[4].y+l[8].y)/2};
  const nx=Math.max(0,Math.min(1,(1-t.x-.5)*1.5+.5)),ny=Math.max(0,Math.min(1,(t.y-.5)*1.5+.5));
  hx+=(nx*innerWidth-hx)*.45;hy+=(ny*innerHeight-hy)*.45;
  cur.style.transform=`translate(${hx}px,${hy}px)`;
  const size=Math.hypot(l[0].x-l[9].x,l[0].y-l[9].y)||1;
  const d=Math.hypot(l[4].x-l[8].x,l[4].y-l[8].y)/size;
  if(!pinch&&d<.3){
    pinch=true;cur.classList.add('pinch');
    const el=document.elementFromPoint(hx,hy),b=el&&el!==canvas&&el.closest('button');
    if(b){uiClick=true;b.click()}else handSelect(hx,hy);
  }else if(pinch&&d>.5)release();
  if(held)dragTo(held,hx,hy);else if(!pinch&&!on3)hover(pickNear(hx,hy,handR()));
}
$('hand').onclick=()=>handOn?stopHand():startHand();

/* ---------- UI ---------- */
document.querySelectorAll('#modes button').forEach(b=>b.onclick=()=>{
  mode=b.dataset.m;document.querySelectorAll('#modes button').forEach(x=>x.classList.toggle('on',x===b));
  if(quiz){quiz=null;$('quiz').textContent='Start quiz (5 questions)'}
  const msg={identify:'Identify: click parts to see their name and function.',dis:'Disassemble: click a part, or drag it out of the case. Start with the side panel.',asm:'Assemble: click a part, or drag it into the case. The side panel goes on last.'};
  toast(msg[mode]);
});
$('esd').onclick=()=>{esd=!esd;$('esd').textContent='ESD strap: '+(esd?'on':'off');$('esd').classList.toggle('on',esd);$('esd').classList.toggle('warn',!esd)};
$('autoD').onclick=()=>runAuto(true);$('autoA').onclick=()=>runAuto(false);
$('quiz').onclick=()=>{if(quiz){quiz=null;$('quiz').textContent='Start quiz (5 questions)';return}startQuiz()};
$('zi').onclick=()=>R=Math.max(12,R-3);$('zo').onclick=()=>R=Math.min(80,R+3);

/* ---------- units 2 to 4 ---------- */
const AS={};let cu=2,ci=0,H=null;
const sh=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const stripe=c=>`repeating-linear-gradient(45deg,#fff 0 6px,${c} 6px 12px)`;
const WIRE=[['White/Orange',stripe('#f28c28')],['Orange','#f28c28'],['White/Green',stripe('#2e9e4f')],['Blue','#2f6fe0'],['White/Blue',stripe('#2f6fe0')],['Green','#2e9e4f'],['White/Brown',stripe('#8b5a2b')],['Brown','#8b5a2b']];
const UN={
 2:{t:'Set up computer networks',a:[
  {id:'cab',t:'Make an RJ45 cable (T568B)',max:4,type:'order',intro:'Click the wires in T568B order, from pin 1 to pin 8.',items:WIRE},
  {id:'cabq',t:'Choose the cable type',max:1,type:'choice',qs:[['Which cable connects a PC to a switch?',['Crossover cable','Straight-through cable','Coaxial cable','Console (rollover) cable'],1,'A PC-to-switch link uses a straight-through cable: the same T568B order on both ends.']]},
  {id:'topo',t:'Connect the network devices',max:3,type:'topo'},
  {id:'ip',t:'Configure the IP address',max:4,type:'ip'}]},
 3:{t:'Set up computer servers',a:[
  {id:'osi',t:'Install the server OS',max:4,type:'order',intro:'Click the installation steps in the correct order.',items:['Check hardware requirements and back up data','Boot from the installation media','Partition and format the disk','Install the server operating system','Set a strong administrator password','Configure a static IP address','Install updates and the server roles']},
  {id:'role',t:'Server roles and RAID',max:4,type:'choice',qs:[
   ['Which server role gives IP addresses to clients automatically?',['DNS server','DHCP server','File server','Web server'],1,'DHCP leases IP addresses, masks, gateways and DNS to clients.'],
   ['Which role translates names like www.school.edu into IP addresses?',['DNS server','DHCP server','Print server','Mail server'],0,'DNS resolves host names to IP addresses.'],
   ['Which role lets users store and share files on the network?',['Web server','DHCP server','File server','Proxy server'],2,'A file server hosts shared folders with permissions.'],
   ['Which RAID level mirrors two disks so one disk can fail?',['RAID 0','RAID 1','JBOD','RAID 0+0'],1,'RAID 1 writes the same data to both disks (mirroring).']]},
  {id:'perm',t:'Folder permissions',max:3,type:'perm'}]},
 4:{t:'Maintain and repair computer systems and networks',a:[
  {id:'prev',t:'Preventive maintenance',max:3,type:'multi',intro:'Select every task that is preventive maintenance, then press Check answers.',items:[['Clean dust with a blower or soft brush',1],['Update the operating system and antivirus',1],['Run disk cleanup and check the disk',1],['Check that cables are firmly connected',1],['Back up important data',1],['Open the PSU while it is plugged in to clean it',0],['Wipe the motherboard with a wet cloth',0],['Ignore system alerts until the PC fails',0]]},
  {id:'ts',t:'Troubleshoot the computer',max:5,type:'choice',qs:[
   ['The PC does not turn on. No lights and no fan. What do you check first?',['Reinstall the operating system','Replace the CPU','Power cord, outlet and power strip','Update the BIOS'],2,'Start with the simplest cause: is power reaching the PSU?'],
   ['The PC is on but the monitor says “No signal”.',['Format the hard disk','Check the video cable and reseat the graphics card','Replace the keyboard','Reset the router'],1,'No signal usually means a loose video cable or graphics card.'],
   ['The PC beeps repeatedly and does not start (memory error).',['Reseat or replace the RAM','Replace the monitor','Change the mouse','Install an antivirus'],0,'Repeated beeps at POST point to RAM. Reseat it, then test another module.'],
   ['The PC is very slow and shows pop-ups.',['Replace the power supply','Scan for malware and clean up the disk','Change the HDMI cable','Remove the CPU cooler'],1,'Slowness with pop-ups suggests malware and a full or cluttered disk.'],
   ['The PC shuts down by itself after a few minutes and the fan is loud.',['Clean the dust and check the CPU cooler and thermal paste','Replace the keyboard','Change the boot order','Reset the date'],0,'Overheating: dust, a weak fan or dried thermal paste.']]},
  {id:'ping',t:'Ping test order',max:3,type:'order',intro:'Click the ping tests in the standard troubleshooting order.',items:['ping 127.0.0.1 (tests the TCP/IP stack)','ping your own IP address (tests the network card)','ping the default gateway (tests the local network)','ping a remote IP such as 8.8.8.8 (tests the internet link)','ping a website name (tests DNS)']},
  {id:'nts',t:'Troubleshoot the network',max:3,type:'choice',qs:[
   ['A cable tester shows pins 1 and 2 are not connected.',['Re-crimp the RJ45 connector','Reinstall Windows','Replace the monitor','Update the BIOS'],0,'An open pin usually means a bad crimp. Re-terminate the connector.'],
   ['A PC shows the IP address 169.254.10.5 and has no internet.',['The DNS name is wrong','It cannot reach the DHCP server: check the cable, switch and DHCP','The monitor is broken','The RAM is faulty'],1,'A 169.254.x.x address is APIPA: the PC got no answer from DHCP.'],
   ['You can ping the gateway but cannot open websites by name.',['Replace the network cable','Check the DNS server setting','Replace the switch','Reseat the RAM'],1,'Reaching IPs but not names points to DNS.']]}]}
};
function rList(){$('alist').innerHTML=`<h2>${UN[cu].t}</h2>`+UN[cu].a.map((a,i)=>`<button data-i="${i}" class="${i===ci?'on':''}">${AS[a.id]?'✓ ':''}${a.t} (${AS[a.id]?AS[a.id].pts:0}/${a.max})</button>`).join('')}
function openUnit(u,i){
  cu=u;ci=i==null?Math.max(0,UN[u].a.findIndex(a=>!AS[a.id])):i;
  $('act').style.display='block';
  document.querySelectorAll('#atop [data-u],#units [data-u]').forEach(b=>b.classList.toggle('on',+b.dataset.u===u));
  rList();rAct();
}
function closeAct(){$('act').style.display='none';document.querySelectorAll('#units [data-u]').forEach(b=>b.classList.toggle('on',b.dataset.u==='1'))}
function rAct(){const a=UN[cu].a[ci];({order:rOrder,choice:rChoice,multi:rMulti,topo:rTopo,ip:rIp,perm:rPerm})[a.type](a)}
function done(a,p,extra){
  p=Math.round(p*10)/10;AS[a.id]={pts:Math.max(p,AS[a.id]?AS[a.id].pts:0)};rList();
  const last=ci+1>=UN[cu].a.length;
  $('amain').innerHTML=`<h2>${a.t}</h2><p class="big">${p} / ${a.max}</p>${extra||''}<button data-n="r">Try again</button>${last?'<p>Unit finished. Open another unit above, or press Finish and see score.</p>':'<button data-n="n" class="on">Next activity</button>'}`;
  H=b=>{if(b.dataset.n==='r'){a.s=null;rAct()}else{ci++;rList();rAct()}};
}
function rOrder(a){
  const s=a.s||(a.s={l:sh(a.items.map((_,i)=>i)),d:[],e:0}),lab=i=>Array.isArray(a.items[i])?a.items[i]:[a.items[i],null];
  $('amain').innerHTML=`<h2>${a.t}</h2><p>${a.intro}</p><p><b>Your order</b></p><ol>${s.d.map(i=>`<li>${lab(i)[0]}</li>`).join('')||'<li style="opacity:.5">Nothing chosen yet</li>'}</ol><div>${s.l.map(i=>`<button class="chip" data-i="${i}">${lab(i)[1]?`<i style="background:${lab(i)[1]}"></i>`:''}${lab(i)[0]}</button>`).join('')}</div><p class="meta">Mistakes: ${s.e} (each costs half a point)</p>`;
  H=b=>{const i=+b.dataset.i;
    if(i===s.d.length){s.d.push(i);s.l=s.l.filter(x=>x!==i);if(s.l.length)rOrder(a);else done(a,Math.max(0,a.max-s.e*.5),'<p>Correct order completed.</p>')}
    else{s.e++;toast('Not that one yet. Think about the correct order.');rOrder(a)}};
}
function rChoice(a){
  const s=a.s||(a.s={i:0,p:0,a:null}),q=a.qs[s.i];
  $('amain').innerHTML=`<h2>${a.t}</h2><p class="meta">Question ${s.i+1} of ${a.qs.length}</p><p><b>${q[0]}</b></p>`+q[1].map((o,i)=>`<button class="opt ${s.a==null?'':i===q[2]?'good':i===s.a?'bad':''}" data-i="${i}">${o}</button>`).join('')+(s.a!=null?`<p>${q[3]}</p><button data-n="1" class="on">${s.i+1<a.qs.length?'Next question':'See result'}</button>`:'');
  H=b=>{if(b.dataset.n){if(s.i+1<a.qs.length){s.i++;s.a=null;rChoice(a)}else done(a,s.p)}else if(s.a==null){s.a=+b.dataset.i;if(s.a===q[2])s.p++;rChoice(a)}};
}
function rMulti(a){
  const s=a.s||(a.s={x:new Set()});
  $('amain').innerHTML=`<h2>${a.t}</h2><p>${a.intro}</p>`+a.items.map((it,i)=>`<button class="opt ${s.x.has(i)?'on':''}" data-i="${i}">${it[0]}</button>`).join('')+'<button data-c="1" class="on">Check answers</button>';
  H=b=>{if(b.dataset.c){const tot=a.items.filter(i=>i[1]).length;let g=0,w=0;s.x.forEach(i=>a.items[i][1]?g++:w++);
      done(a,Math.max(0,(g-w)/tot*a.max),`<p>Correct selections: ${g} of ${tot}. Wrong selections: ${w}.</p><p><b>Preventive tasks:</b></p><ul>${a.items.filter(i=>i[1]).map(i=>`<li>${i[0]}</li>`).join('')}</ul>`)}
    else{const i=+b.dataset.i;s.x.has(i)?s.x.delete(i):s.x.add(i);rMulti(a)}};
}
const DEV={isp:['Internet modem',6,50],rtr:['Router',28,50],sw:['Switch',52,50],pc1:['PC 1',86,16],pc2:['PC 2',86,50],prn:['Printer',86,84]};
const NEED=['isp-rtr','rtr-sw','pc1-sw','pc2-sw','prn-sw'];
function rTopo(a){
  const s=a.s||(a.s={l:new Set(),sel:null});
  const ln=[...s.l].map(k=>{const[u,v]=k.split('-'),p=DEV[u],q=DEV[v];return `<line x1="${p[1]*6.4}" y1="${p[2]*3}" x2="${q[1]*6.4}" y2="${q[2]*3}" stroke="#10253a" stroke-width="3"/>`}).join('');
  $('amain').innerHTML=`<h2>${a.t}</h2><p>Click one device, then another, to connect them with a cable. Connect the same pair again to remove the cable.</p><div id="topo"><svg viewBox="0 0 640 300" preserveAspectRatio="none">${ln}</svg>${Object.entries(DEV).map(([k,d])=>`<button class="dev ${s.sel===k?'on':''}" data-d="${k}" style="left:${d[1]}%;top:${d[2]}%">${d[0]}</button>`).join('')}</div><button data-t="1" class="on">Test the network</button>`;
  H=b=>{
    if(b.dataset.t){const c=NEED.filter(k=>s.l.has(k)).length,w=s.l.size-c;
      done(a,Math.max(0,3*c/5-.5*w),`<p>Correct links: ${c} of 5. Wrong or extra links: ${w}.</p><p>Hint: end devices connect to the switch, the switch connects to the router, and the router connects to the internet modem.</p>`)}
    else{const d=b.dataset.d;if(!s.sel)s.sel=d;else if(s.sel===d)s.sel=null;else{const k=[s.sel,d].sort().join('-');s.l.has(k)?s.l.delete(k):s.l.add(k);s.sel=null}rTopo(a)}};
}
const IPF=[['IP address',['192.168.1.25','192.168.10.10','192.168.10.25','192.168.10.300'],2],['Subnet mask',['255.255.0.0','255.255.255.0','255.0.0.0','255.255.255.252'],1],['Default gateway',['192.168.10.25','192.168.1.1','192.168.10.1','192.168.10.255'],2],['DNS server',['192.168.10.255','8.8.8.8','0.0.0.0','255.255.255.0'],1]];
function rIp(a){
  const s=a.s||(a.s={v:[0,0,0,0]});
  $('amain').innerHTML=`<h2>${a.t}</h2><p>Set a static IP on PC 1. The network is 192.168.10.0/24 and the router (gateway) is 192.168.10.1. The printer already uses 192.168.10.10. Use Google public DNS. Click a field to change its value.</p>`+IPF.map((f,i)=>`<button class="opt" data-f="${i}">${f[0]}: [${f[1][s.v[i]]}]</button>`).join('')+'<button data-t="1" class="on">Apply and test (ping)</button>';
  H=b=>{
    if(b.dataset.t){const v=s.v,ok=IPF.map((f,i)=>v[i]===f[2]),gw=v[0]===2&&v[1]===1,net=gw&&v[2]===2;
      const L=[['127.0.0.1 (loopback)',1],['your own IP address',v[0]!==3],['192.168.10.1 (gateway)',gw],['8.8.8.8 (internet)',net],['www.google.com (by name)',net&&v[3]===1]];
      done(a,ok.filter(Boolean).length,`<div class="pg">${L.map(l=>`Ping ${l[0]}: ${l[1]?'Reply received':'Request timed out'}`).join('<br>')}${v[0]===1?'<br>Warning: duplicate IP address (the printer uses it).':''}</div><p>Correct settings: ${ok.filter(Boolean).length} of 4.</p>`)}
    else{const i=+b.dataset.f;s.v[i]=(s.v[i]+1)%4;rIp(a)}};
}
const PG=['Admins','Staff','Students'],PP=['Read','Write','Full control'],PN=[[1,1,1],[1,1,0],[1,0,0]];
function rPerm(a){
  const s=a.s||(a.s={m:PG.map(()=>[0,0,0])});
  $('amain').innerHTML=`<h2>${a.t}</h2><p>Shared folder “Grades”: Admins have full control, Staff can read and write, Students can only read. Click to switch each permission on or off.</p><table><tr><th></th>${PP.map(p=>`<th>${p}</th>`).join('')}</tr>${PG.map((g,r)=>`<tr><th>${g}</th>${PP.map((p,c)=>`<td><button class="${s.m[r][c]?'on':''}" data-r="${r}" data-c="${c}">${s.m[r][c]?'Allowed':'Off'}</button></td>`).join('')}</tr>`).join('')}</table><button data-t="1" class="on">Apply permissions</button>`;
  H=b=>{if(b.dataset.t){const g=PG.filter((_,r)=>s.m[r].join()===PN[r].join()).length;done(a,g,`<p>Correct groups: ${g} of 3.</p>`)}
    else{const r=+b.dataset.r,c=+b.dataset.c;s.m[r][c]=1-s.m[r][c];rPerm(a)}};
}
$('amain').onclick=e=>{const b=e.target.closest('button');if(b&&H)H(b)};
$('alist').onclick=e=>{const b=e.target.closest('button');if(b){ci=+b.dataset.i;rList();rAct()}};
$('atop').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.id==='afin')finish();else if(b.dataset.u==='1')closeAct();else openUnit(+b.dataset.u,null)};
$('units').onclick=e=>{const b=e.target.closest('button');if(!b)return;+b.dataset.u===1?closeAct():openUnit(+b.dataset.u,null)};

/* ---------- student info, pre-test, final score ---------- */
const S={name:'',age:'',date:'',pre:0,quiz:null,dis:false,asm:false,t0:0,boot:false};
const ov=$('ov');
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let QS=[
 ['Which part converts AC power from the wall into DC power for the components?',['Motherboard','Power supply unit (PSU)','CPU','RAM'],1],
 ['Which part is called the “brain” of the computer?',['Hard disk drive','RAM','CPU','Power supply unit'],2],
 ['Which memory loses its contents when the power is turned off?',['RAM','SSD','Hard disk drive','DVD disc'],0],
 ['What is applied between the CPU and the heatsink?',['Lubricating oil','Thermal paste','Super glue','Masking tape'],1],
 ['What should you wear before touching internal components?',['Rubber gloves','ESD wrist strap','Wool gloves','Nothing, if the PC is off'],1],
 ['Which part connects the CPU, RAM, storage and expansion cards together?',['Expansion card','Heat sink','Motherboard','Power supply'],2],
 ['Which storage device has no moving parts?',['Hard disk drive','Solid state drive (SSD)','Floppy disk','Optical drive'],1],
 ['Which slot is normally used by a dedicated graphics card?',['DIMM slot','SATA port','PCIe x16 slot','USB header'],2],
 ['What do you do first when disassembling a computer unit?',['Remove the CPU','Unplug the power cord and remove the side panel','Remove the motherboard','Remove the RAM'],1],
 ['Which part is installed last when assembling a computer unit?',['Side panel','Power supply unit','Motherboard','CPU'],0]
];
function show(h){ov.innerHTML='<div class="card">'+h+'</div>';ov.style.display='flex'}
function regForm(){
  const today=new Date().toISOString().slice(0,10);
  show(`${hdr()}<h2>Student information</h2><label>Full name<input id="fn" autocomplete="name"></label><label>Age<input id="fa" type="number" min="5" max="99"></label><label>Date<input id="fd" type="date" value="${today}"></label><button id="go">Continue to pre-test</button><button id="tbtn" class="opt">Trainer settings</button><p class="err" id="er"></p>`);
  $('go').onclick=()=>{
    const n=$('fn').value.trim(),a=parseInt($('fa').value,10),d=$('fd').value;
    if(n.length<2)return $('er').textContent='Enter your full name.';
    if(!(a>=5&&a<=99))return $('er').textContent='Enter a valid age (5 to 99).';
    if(!d)return $('er').textContent='Choose the date.';
    S.name=n;S.age=a;S.date=d;S.pre=0;S.sid=Date.now().toString(36)+Math.random().toString(36).slice(2,6);startPre();
  };
}
let qi=0;
function startPre(){qi=0;askQ()}
function askQ(){
  if(qi>=QS.length){
    return show(`<h2>Pre-test finished</h2><p class="big">${S.pre} / ${QS.length}</p><p>Your answers are saved for your final score. Start the lab activity when you are ready.</p><button id="go">Start the lab</button>`),
      $('go').onclick=()=>{ov.style.display='none';S.t0=Date.now();$('stu').textContent=`${S.name}, age ${S.age}, ${S.date}`};
  }
  const q=QS[qi];
  show(`<p class="meta">Pre-test: question ${qi+1} of ${QS.length}</p><h2>${q[0]}</h2>`+q[1].map((o,i)=>`<button class="opt" data-i="${i}">${o}</button>`).join(''));
  ov.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{if(+b.dataset.i===q[2])S.pre++;qi++;askQ()});
}
function finish(){
  if(!S.name)return;
  if(quiz){quiz=null;$('quiz').textContent='Start quiz (5 questions)'}
  const mins=Math.max(1,Math.round((Date.now()-S.t0)/60000));
  const pen=errors*.5,prac=Math.max(0,(S.dis?5:0)+(S.asm?5:0)-pen),okD=bios.saved&&bios.date===S.date,okB=bios.saved&&osDrive()&&bios.boot1===osDrive(),bp=(bios.saved?1:0)+(okD?2:0)+(okB?2:0),up=u=>UN[u].a.reduce((t,a)=>t+(AS[a.id]?AS[a.id].pts:0),0),um=u=>UN[u].a.reduce((t,a)=>t+a.max,0),mx=15+um(2)+um(3)+um(4),total=prac+bp+up(2)+up(3)+up(4),pct=Math.round(total/mx*100);
  const rows=[['Trainer',CFG.trainer+', '+CFG.role],['Name',S.name],['Age',S.age],['Date',S.date],
    ['Pre-test (not counted)',`${S.pre} / ${QS.length}`],
    ['Disassembly completed by hand',S.dis?'Yes (5 / 5)':'No (0 / 5)'],
    ['Assembly completed by hand',S.asm?'Yes (5 / 5)':'No (0 / 5)'],
    ['Wrong-order mistakes',`${errors} (−${pen} points)`],
    ['Practical score',`${prac.toFixed(1)} / 10`],
    ['BIOS settings saved',bios.saved?'Yes (1 / 1)':'No (0 / 1)'],['BIOS system date',okD?'Correct (2 / 2)':'Not set (0 / 2)'],['BIOS first boot device',okB?'Correct (2 / 2)':'Not set (0 / 2)'],['PC booted to the operating system',S.boot?'Yes':'No'],
    ['Identification quiz (not counted)',S.quiz==null?'not taken':`${S.quiz} / 5`],
    ['Time in lab',`${mins} min`],['Unit 1: Install and configure',`${(prac+bp).toFixed(1)} / 15 `+(prac+bp>=15*PASS()?'(Competent)':'(Not yet competent)')],
    ...[2,3,4].map(u=>['Unit '+u+': '+UN[u].t,`${up(u).toFixed(1)} / ${um(u)} `+(up(u)>=um(u)*PASS()?'(Competent)':'(Not yet competent)')]),['TOTAL',`${total.toFixed(1)} / ${mx} (${pct}%)`],
    ['Remark',pct>=CFG.pass?'Passed':'Needs more practice (passing mark '+CFG.pass+'%)']];
  saveResult({id:S.sid,name:S.name,age:S.age,date:S.date,pre:S.pre,preMax:QS.length,u1:+(prac+bp).toFixed(1),u1max:15,u2:+up(2).toFixed(1),u2max:um(2),u3:+up(3).toFixed(1),u3max:um(3),u4:+up(4).toFixed(1),u4max:um(4),total:+total.toFixed(1),max:mx,pct,remark:pct>=CFG.pass?'Passed':'Needs practice',mistakes:errors,mins});
  show(`${hdr()}<h2>Activity result</h2><p class="big">${pct}%</p><table>${rows.map(r=>`<tr><td>${r[0]}</td><td>${esc(r[1])}</td></tr>`).join('')}</table>
  <div class="btns"><button id="sv">Save result</button><button id="pr">Print</button><button id="kp">Keep practicing</button><button id="nw">New student</button></div>`);
  $('sv').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([rows.map(r=>r[0]+': '+r[1]).join('\n')],{type:'text/plain'}));a.download='CSS-NC2-'+S.name.replace(/\W+/g,'_')+'.txt';a.click()};
  $('pr').onclick=()=>window.print();
  $('kp').onclick=()=>{ov.style.display='none'};
  $('nw').onclick=()=>location.reload();
}
$('fin').onclick=()=>{
  if(!S.dis&&!S.asm&&!confirm('You have not completed the disassembly and assembly by hand yet. Finish anyway?'))return;
  finish();
};
/* regForm() is started by trainer.js after the settings load */

/* ---------- loop ---------- */
function tick(){
  requestAnimationFrame(tick);
  for(const p of parts){p.g.position.lerp(p.tp,p===held?.4:.1);p.g.rotation.y+=(p.rt-p.g.rotation.y)*.1;if(p.cable)cabUpd(p)}
  placeCam();if(on3)step3();else renderer.render(scene,cam);
}
refresh();ui();screen();tick();

/* ===== 3D simulations for units 2-4, per-unit scoring and unit gating ===== */
const cv3=canvas;
const s3=new THREE.Scene(),c3=new THREE.PerspectiveCamera(45,1,.1,200);
s3.background=new THREE.Color(0xcfd8dc);s3.add(new THREE.AmbientLight(0xffffff,.7));{const d=new THREE.DirectionalLight(0xffffff,.8);d.position.set(6,14,10);s3.add(d)}
var on3=false;let g3=null,T={},u3=0,y3=.3,p3=.55,R3=30,pk=[],glowed=[];const ct=V(0,1,0),cg=V(0,1,0);
function lbl(t,x,y,z,w){const c=document.createElement('canvas');c.width=256;c.height=64;const k=c.getContext('2d');k.fillStyle='rgba(16,37,58,.88)';k.fillRect(0,0,256,64);k.fillStyle='#fff';k.font='bold 26px sans-serif';k.textAlign='center';k.fillText(t,128,42);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c)}));s.scale.set(w,w/4,1);s.position.set(x,y,z);return s}
function glow(o,c){o.traverse(m=>{if(m.isMesh&&m.material.emissive)m.material.emissive.setHex(c||0)})}
function dev(k,nm,w,h,d,col,x,z){const g=new THREE.Group();bx(g,w,h,d,col,0,h/2,0);bx(g,.3,.15,.15,0x22ee66,w/2-.5,h*.6,d/2+.01);g.add(lbl(nm,0,h+1.2,0,4));g.position.set(x,0,z);g.traverse(o=>{if(o.isMesh)o.userData.k=k});(T.d=T.d||{})[k]=g;T.nm[k]=nm;g3.add(g);return g}
function tube(a,b){const p=T.d[a].position,q=T.d[b].position;T.cab.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(p.x,.5,p.z),V((p.x+q.x)/2,.1,(p.z+q.z)/2),V(q.x,.5,q.z)]),20,.12,6),M(0x1e88e5)))}
function pkt(ks,col){const P=ks.map(k=>{const q=T.d[k].position.clone();q.y=2;return q}),m=new THREE.Mesh(new THREE.SphereGeometry(.4,10,10),new THREE.MeshBasicMaterial({color:col}));m.position.copy(P[0]);g3.add(m);pk.push({m,P,i:1})}
function scr3(L){const c=T.sc.getContext('2d');c.fillStyle='#0b2a8f';c.fillRect(0,0,512,300);c.fillStyle='#e8ecff';c.font='16px monospace';L.slice(-11).forEach((l,i)=>c.fillText(l.slice(0,58),12,26+i*24));T.st.needsUpdate=true}
function build2(){
 T.cab=new THREE.Group();g3.add(T.cab);
 dev('isp','Internet modem',3,1.2,2,0x555b63,-10,0);dev('rtr','Router',3,1,2,0x2f6fe0,-5,0);dev('sw','Switch',4,.8,2,0x39424f,0,0);
 dev('pc1','PC 1',2.2,2.6,2,0x2c3440,6,-5);dev('pc2','PC 2',2.2,2.6,2,0x2c3440,6,0);dev('prn','Printer',3,1.4,2.4,0xb8c0c8,6,5);
 g3.add(lbl('RJ45 plug',0,2.6,10,3.5));bx(g3,3,1.2,1.6,0xdfe6ea,0,.6,10);
 const sl=sh([0,1,2,3,4,5,6,7]);T.w=[];
 WIRE.forEach((w,i)=>{const c=new THREE.Color(w[1].match(/#[0-9a-f]{6}/gi).pop());if(w[1][0]==='r')c.lerp(new THREE.Color(0xffffff),.6);
  const m=cy(g3,.22,3,c,0,0,0);m.userData.k='w'+i;m.sl=V(-7+sl[i]*2,.3,14.5);m.pl=V(-1.75+i*.5,.6,12.3);m.position.copy(m.sl);
  m.lb=lbl(w[0],0,1.2,0,2.2);m.lb.rotation.z=0;m.add(m.lb);T.w.push(m)});
 T.h.cabq=[[T.d.pc1,T.d.sw]];T.f={cab:V(0,1,11),cabq:V(3,1,-2),topo:V(-2,1,0),ip:V(6,1,-2)};cg.set(0,1,6);R3=30}
function build3(){
 T.cab=new THREE.Group();g3.add(T.cab);
 dev('srv','Server',4.6,6,3.6,0x39424f,-8,0);dev('c1','Client 1',2.2,2.4,2,0x2c3440,6,-6);dev('c2','Client 2',2.2,2.4,2,0x2c3440,6,0);dev('c3','Client 3',2.2,2.4,2,0x2c3440,6,6);
 ['c1','c2','c3'].forEach(k=>tube('srv',k));
 T.dk=[0,1,2,3].map(j=>bx(g3,.9,.6,.3,0xb8c0c8,-9.65+j*1.1,4.3,1.95));
 T.sc=document.createElement('canvas');T.sc.width=512;T.sc.height=300;T.st=new THREE.CanvasTexture(T.sc);
 bx(g3,7,4.4,.3,0x15191f,-1,3.6,-2);const m=new THREE.Mesh(new THREE.PlaneGeometry(6.6,3.8),new THREE.MeshBasicMaterial({map:T.st}));m.position.set(-1,3.6,-1.83);g3.add(m);g3.add(lbl('Server console',-1,6.4,-2,4));
 scr3(['Server OS setup','','Waiting for the installation steps...']);
 T.h.role=[T.d.c1,T.d.c2,T.d.c3,[T.dk[0],T.dk[1]]];T.h.perm=[T.d.srv];T.f={osi:V(-3,3,0),role:V(0,2,0),perm:V(-3,3,0)};cg.set(-1,2,0);R3=30}
function build4(){
 T.cab=new THREE.Group();g3.add(T.cab);
 dev('pc','PC under repair',4.6,6,4,0x2c3440,-8,2);
 const fan=cy(g3,1.2,.3,0x1c1c1c,-8,4.2,4.1);T.dust=[];for(let i=0;i<16;i++){const d=new THREE.Mesh(new THREE.SphereGeometry(.2+Math.random()*.15,6,6),M(0x8d8d8d,{roughness:1}));const a=Math.random()*6.28,r=Math.random()*1.1;d.position.set(-8+Math.cos(a)*r,4.2+Math.sin(a)*r,4.4);g3.add(d);T.dust.push(d)}
 const cord=bx(g3,3,.2,.2,0x111111,-12.5,.1,4),hd=bx(g3,.2,.2,3,0x2f6fe0,-5,.1,6),ram=bx(g3,.3,1.8,.5,0x1d4ed8,-8,1.6,4.2),dk=bx(g3,1.5,.5,1.5,0xb8c0c8,-6.2,1.2,4.2);
 [['cord',cord],['hdmi',hd],['ram',ram],['disk',dk]].forEach(([n,o])=>{g3.add(lbl(n,o.position.x,o.position.y+1.6,o.position.z,2.2))});
 dev('tst','Cable tester',3,.8,1.6,0xffb703,0,7);T.led=[];for(let i=0;i<8;i++)T.led.push(bx(g3,.2,.2,.2,0x22ee66,-1.2+i*.34,.9,7));
 dev('pcA','Your PC',2.2,2.6,2,0x2c3440,2,-6);dev('sw','Switch',3,.8,2,0x39424f,7,-6);dev('rtr','Router',3,1,2,0x2f6fe0,12,-6);dev('isp','Internet',3,1.2,2,0x555b63,17,-6);
 T.h.ts=[cord,hd,ram,dk,fan];T.h.nts=[T.d.tst,T.d.pcA,T.d.sw];T.f={prev:V(-8,3,3),ts:V(-6,2,3),ping:V(8,1,-6),nts:V(5,1,0)};cg.set(4,1,0);R3=36}
function vis(a,res){
 if(!g3||!a)return;const s=a.s||{},id=a.id;
 if(T.f&&T.f[id])cg.copy(T.f[id]);
 glowed.forEach(o=>glow(o));glowed=[];
 const H=T.h&&T.h[id];if(H&&!res){const o=H[Math.min(s.i||0,H.length-1)];[].concat(o).forEach(x=>{glow(x,0x8a5a00);glowed.push(x)})}
 if(id==='cab'&&T.w)T.w.forEach((w,i)=>{const on=s.d&&s.d.includes(i);w.tp=on?w.pl:w.sl;w.lb.visible=!on});
 if(id==='topo'&&T.cab){while(T.cab.children.length)T.cab.remove(T.cab.children[0]);if(s.l)s.l.forEach(k=>{const[u,v]=k.split('-');tube(u,v)});if(s.sel&&T.d[s.sel]){glow(T.d[s.sel],0x8a5a00);glowed.push(T.d[s.sel])}}
 if(id==='osi'&&T.sc){const L=['Server OS setup',''].concat((s.d||[]).map(i=>'[OK] '+a.items[i]));if(res)L.push('','Server installed and ready.');scr3(L)}
 if(id==='ping'&&s.d&&s.d.length>(s.n||0)){s.n=s.d.length;if(s.n>=3)pkt(['pcA','sw','rtr','isp'].slice(0,s.n===3?3:4),0x22ee66)}
 if(!res)return;
 if(id==='ip'){const gw=/\(gateway\): Reply/.test(res.x),net=/\(internet\): Reply/.test(res.x);if(gw)pkt(['pc1','sw','rtr'],0x22ee66);if(net)setTimeout(()=>g3&&pkt(['pc1','sw','rtr','isp'],0x22ee66),900);if(!gw)pkt(['pc1','sw'],0xe63946)}
 if(id==='role'){const ok=res.p>=a.max*.75;['c1','c2','c3'].forEach((k,i)=>setTimeout(()=>g3&&pkt([k,'srv'],ok?0x22ee66:0xe63946),i*400))}
 if(id==='perm')pkt(['c1','srv'],res.p>=2?0x22ee66:0xe63946);
 if(id==='prev'&&T.dust)T.dust.forEach((d,i)=>d.visible=i>=Math.round(res.p/a.max*T.dust.length));
 if(id==='nts'&&T.led)T.led.forEach(l=>l.material.color.setHex(0x22ee66));
}
function step3(){
 if(T.w)T.w.forEach(w=>{if(w.tp)w.position.lerp(w.tp,.12)});
 pk=pk.filter(p=>{const t=p.P[p.i],d=t.clone().sub(p.m.position);if(d.length()<.3){p.i++;if(p.i>=p.P.length){g3.remove(p.m);return false}}else p.m.position.add(d.setLength(.22));return true});
 ct.lerp(cg,.05);c3.position.set(ct.x+R3*Math.cos(p3)*Math.sin(y3),ct.y+R3*Math.sin(p3),ct.z+R3*Math.cos(p3)*Math.cos(y3));c3.lookAt(ct);renderer.render(s3,c3)}
function rs3(){c3.aspect=innerWidth/innerHeight;c3.fov=c3.aspect<1?70:45;c3.updateProjectionMatrix()}addEventListener('resize',rs3);
function start3d(u){
 if(u3!==u||!g3){if(g3)s3.remove(g3);g3=new THREE.Group();s3.add(g3);T={nm:{},h:{},f:{}};pk=[];glowed=[];bx(g3,60,.4,44,0xb7c2c8,3,-.2,0);({2:build2,3:build3,4:build4})[u]();u3=u;ct.copy(cg)}
 rs3();on3=true}
const rc3=new THREE.Raycaster(),q3=new THREE.Vector2();let dn3=null;
cv3.addEventListener('pointerdown',e=>{if(!on3)return;cv3.setPointerCapture(e.pointerId);dn3={x:e.clientX,y:e.clientY,m:0}});
cv3.addEventListener('pointermove',e=>{if(!on3||!dn3)return;const dx=e.clientX-dn3.x,dy=e.clientY-dn3.y;dn3.x=e.clientX;dn3.y=e.clientY;dn3.m+=Math.abs(dx)+Math.abs(dy);y3-=dx*.008;p3=Math.max(.1,Math.min(1.4,p3+dy*.006))});
cv3.addEventListener('pointerup',e=>{if(!on3)return;const d=dn3;dn3=null;if(!d||d.m>6||!g3)return;q3.set(e.clientX/innerWidth*2-1,-e.clientY/innerHeight*2+1);rc3.setFromCamera(q3,c3);const h=rc3.intersectObjects(g3.children,true).find(x=>x.object.userData.k);if(h)clickK(h.object.userData.k)});
cv3.addEventListener('wheel',e=>{if(!on3)return;R3=Math.max(10,Math.min(70,R3+e.deltaY*.03))},{passive:false});
function clickK(k){const m=$('amain'),a=UN[cu].a[ci];let b=null;
 if(/^w\d$/.test(k))b=m.querySelector(`.chip[data-i="${k[1]}"]`);else if(a.type==='topo')b=m.querySelector(`[data-d="${k}"]`);
 if(b)b.click();else toast(T.nm[k]||k)}
['rOrder','rChoice','rMulti','rTopo','rIp','rPerm'].forEach(n=>{const o=window[n];window[n]=function(a){o(a);vis(a)}});
{const o=window.done;window.done=function(a,p,x){o(a,p,x);vis(a,{p:Math.round(p*10)/10,x:String(x||'')})}}
/* per-unit scoring and gating */
const u1s=()=>{const prac=Math.max(0,(S.dis?5:0)+(S.asm?5:0)-errors*.5);return prac+(bios.saved?1:0)+(bios.saved&&bios.date===S.date?2:0)+(bios.saved&&osDrive()&&bios.boot1===osDrive()?2:0)};
const usc=u=>UN[u].a.reduce((t,a)=>t+(AS[a.id]?AS[a.id].pts:0),0),umx=u=>UN[u].a.reduce((t,a)=>t+a.max,0);
const sco=u=>u===1?u1s():usc(u),mxs=u=>u===1?15:umx(u),pass=u=>sco(u)>=mxs(u)*PASS();
function lockMsg(u){show(`<h2>Unit ${u} not passed yet</h2><p class="big">${sco(u).toFixed(1)} / ${mxs(u)}</p><p>You need at least ${CFG.pass}% (${(mxs(u)*PASS()).toFixed(1)} points) in Unit ${u} to open Unit ${u+1}.</p><p>${u===1?'Finish the disassembly and assembly by hand, then set the BIOS date and boot order and save.':'Open Unit '+u+' and improve your score in its activities.'}</p><button id="go">OK</button>`);$('go').onclick=()=>ov.style.display='none'}
{const oo=window.openUnit,oc=window.closeAct;
 window.openUnit=function(u,i){if(u>1&&!pass(u-1))return lockMsg(u-1);start3d(u);oo(u,i)};
 window.closeAct=function(){oc();on3=false}}
$('stu').insertAdjacentHTML('afterend','<div class="stat" id="comp"></div>');
function updComp(){$('comp').innerHTML=[1,2,3,4].map(u=>`<b>Unit ${u}</b>: ${sco(u).toFixed(1)}/${mxs(u)} ${u>1&&!pass(u-1)?'(locked)':pass(u)?'(competent)':'(not yet)'}`).join('<br>');document.querySelectorAll('#units [data-u]').forEach(b=>{const u=+b.dataset.u;b.style.opacity=u>1&&!pass(u-1)?.5:1})}
setInterval(updComp,800);updComp();

/* ---------- small-screen menu drawer ---------- */
const setMenu=o=>{document.body.classList.toggle('menu',o);$('menu').textContent=o?'Close':'Menu'};
$('menu').onclick=()=>setMenu(!document.body.classList.contains('menu'));
$('side').addEventListener('click',e=>{if(innerWidth<=900&&e.target.closest('button')&&e.target.id!=='esd')setMenu(false)});
