import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

// Configura GAME_SERVER_URL con la URL HTTPS pública del servidor antes de publicar.
const SERVER_URL = window.GAME_SERVER_URL || "";
const socket = io(SERVER_URL || undefined, { transports: ["websocket", "polling"] });
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05090a);
scene.fog = new THREE.FogExp2(0x05090a, 0.045);
const camera = new THREE.PerspectiveCamera(72, innerWidth/innerHeight, .1, 100);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth,innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled = true; document.body.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0x9baead,0x111719,1.1));
const moon = new THREE.DirectionalLight(0x9bb4b2,1.1); moon.position.set(-5,12,4); moon.castShadow=true; scene.add(moon);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(32,32),new THREE.MeshStandardMaterial({color:0x182021,roughness:1}));
floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor);
const grid = new THREE.GridHelper(32,32,0x263536,0x202c2d); grid.position.y=.015; scene.add(grid);

function box(x,y,z,sx,sy,sz,color) {
 const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),new THREE.MeshStandardMaterial({color,roughness:.9}));
 m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;
}
// Ruinas y obstáculos
for(let i=0;i<28;i++){
 const x=(Math.random()-.5)*27,z=(Math.random()-.5)*27;
 if(Math.abs(x)<3 && z>2) continue;
 box(x,.8,z,.7+Math.random()*1.8,1.6+Math.random()*2,.7+Math.random()*1.8,0x293334);
}
for(let i=0;i<8;i++){
 const x=(i-4)*3.3; box(x,1,-14,.12,2.2,1.2,0x384748);
}
const playerMeshes=new Map();
let myId=null, started=false, yaw=0, pitch=0, lastMove=0, stepNoise=0, alive=true;
const keys={};
const monsterMesh=new THREE.Group();
const body=new THREE.Mesh(new THREE.CapsuleGeometry(.48,1.5,5,8),new THREE.MeshStandardMaterial({color:0x111516,roughness:.8}));
body.position.y=1.2;monsterMesh.add(body);
const head=new THREE.Mesh(new THREE.SphereGeometry(.43,12,10),new THREE.MeshStandardMaterial({color:0x080b0c}));
head.position.y=2.25;monsterMesh.add(head);
const eyesMat=new THREE.MeshBasicMaterial({color:0xff332b});
for(const x of [-.17,.17]){const e=new THREE.Mesh(new THREE.SphereGeometry(.055,8,8),eyesMat);e.position.set(x,2.28,.38);monsterMesh.add(e)}
scene.add(monsterMesh);
const flashlight=new THREE.SpotLight(0xc9e5df,65,18,Math.PI/7,.45,1.2);camera.add(flashlight);flashlight.position.set(0,0,0);flashlight.target.position.set(0,0,-1);camera.add(flashlight.target);scene.add(camera);

function makePlayer(p){
 let g=playerMeshes.get(p.id);
 if(!g){g=new THREE.Group();const mat=new THREE.MeshStandardMaterial({color:p.color});const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.32,.65,4,8),mat);torso.position.y=.85;g.add(torso);const h=new THREE.Mesh(new THREE.SphereGeometry(.23,12,10),new THREE.MeshStandardMaterial({color:0xc4b8a4}));h.position.y=1.48;g.add(h);scene.add(g);playerMeshes.set(p.id,g)}
 g.position.set(p.x,0,p.z);g.rotation.y=p.rot||0;g.visible=p.alive!==false;
}
socket.on("welcome",d=>{myId=d.id;d.players.forEach(makePlayer);});
socket.on("full",()=>{document.getElementById("warning").textContent="PARTIDA LLENA: YA HAY 3 JUGADORES";});
socket.on("state",d=>{
 d.players.forEach(makePlayer);
 for(const [id,g] of playerMeshes)if(!d.players.some(p=>p.id===id)){scene.remove(g);playerMeshes.delete(id)}
 if(d.monster){monsterMesh.position.set(d.monster.x,0,d.monster.z);document.getElementById("warning").textContent=d.monster.mode==="hunting"?"⚠ EL MONSTRUO HA ESCUCHADO ALGO":" "}
 document.getElementById("players").textContent=`Jugadores: ${d.players.length}/3`;
});
socket.on("soundPing",d=>{const ring=new THREE.Mesh(new THREE.RingGeometry(.15,.23,32),new THREE.MeshBasicMaterial({color:0xff554b,transparent:true,opacity:.8,side:THREE.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.set(d.x,.05,d.z);scene.add(ring);let s=0;const t=setInterval(()=>{s+=.06;ring.scale.setScalar(1+s*2);ring.material.opacity-=.035;if(ring.material.opacity<=0){scene.remove(ring);clearInterval(t)}},40)});
socket.on("caught",d=>{if(d.id===myId){alive=false;document.getElementById("warning").textContent="TE HA ENCONTRADO. ESTÁS FUERA.";document.getElementById("objective").textContent="ESPERA A QUE TERMINE LA PARTIDA."}});
socket.on("connect",()=>{document.getElementById("connection").textContent="EN LÍNEA";document.getElementById("dot").style.background="#64d68b"});
socket.on("disconnect",()=>{document.getElementById("connection").textContent="DESCONECTADO";document.getElementById("dot").style.background="#e34b43"});

document.getElementById("play").onclick=()=>{started=true;document.getElementById("start").style.display="none";renderer.domElement.requestPointerLock?.()};
document.addEventListener("pointerlockchange",()=>{});
document.addEventListener("mousemove",e=>{if(document.pointerLockElement===renderer.domElement){yaw-=e.movementX*.002;pitch=Math.max(-.7,Math.min(.7,pitch-e.movementY*.002));}});
let touchLook = null;
renderer.domElement.addEventListener("touchstart", e=>{ if(e.touches.length){touchLook={x:e.touches[0].clientX,y:e.touches[0].clientY};}}, {passive:true});
renderer.domElement.addEventListener("touchmove", e=>{
 if(!touchLook || !e.touches.length || !started)return;
 const t=e.touches[0], dx=t.clientX-touchLook.x, dy=t.clientY-touchLook.y;
 yaw-=dx*.006; pitch=Math.max(-.7,Math.min(.7,pitch-dy*.006));
 touchLook={x:t.clientX,y:t.clientY};
},{passive:true});
renderer.domElement.addEventListener("touchend",()=>touchLook=null,{passive:true});
document.addEventListener("keydown",e=>{keys[e.code]=true;if(e.code==="KeyE"&&started&&alive){socket.emit("noise",{power:8});toast("HAS LANZADO UN OBJETO");}});
document.addEventListener("keyup",e=>keys[e.code]=false);
function bindHold(id, code){
 const el=document.getElementById(id); if(!el)return;
 const down=e=>{e.preventDefault();keys[code]=true;};
 const up=e=>{e.preventDefault();keys[code]=false;};
 el.addEventListener("pointerdown",down); el.addEventListener("pointerup",up);
 el.addEventListener("pointercancel",up); el.addEventListener("pointerleave",up);
}
bindHold("up","KeyW");bindHold("down","KeyS");bindHold("left","KeyA");bindHold("right","KeyD");bindHold("run","ShiftLeft");
document.getElementById("throw").addEventListener("pointerdown",e=>{e.preventDefault();if(started&&alive){socket.emit("noise",{power:8});toast("HAS LANZADO UN OBJETO")}});

function toast(t){const el=document.getElementById("toast");el.textContent=t;setTimeout(()=>el.textContent="",1300)}
let last=performance.now();
function animate(now){
 requestAnimationFrame(animate);const dt=Math.min((now-last)/16.67,2);last=now;
 if(started&&alive){
  camera.rotation.order="YXZ";camera.rotation.y=yaw;camera.rotation.x=pitch;
  const forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));
  const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
  let dir=new THREE.Vector3();if(keys.KeyW)dir.add(forward);if(keys.KeyS)dir.sub(forward);if(keys.KeyD)dir.add(right);if(keys.KeyA)dir.sub(right);
  if(dir.lengthSq()>0){dir.normalize();const running=keys.ShiftLeft||keys.ShiftRight;const speed=running?.13:.065;camera.position.addScaledVector(dir,speed*dt);camera.position.x=THREE.MathUtils.clamp(camera.position.x,-14,14);camera.position.z=THREE.MathUtils.clamp(camera.position.z,-14,14);
   stepNoise+=dt*(running?1.4:.45);if(stepNoise>(running?8:25)){socket.emit("noise",{power:running?8:2.5});stepNoise=0}
  }
  if(now-lastMove>55){socket.emit("move",{x:camera.position.x,z:camera.position.z,rot:yaw,noise:keys.ShiftLeft?"run":null});lastMove=now}
 }
 const p=playerMeshes.get(myId);if(p&&started){camera.position.y=1.65;p.position.set(camera.position.x,0,camera.position.z)}
 renderer.render(scene,camera);
}
camera.position.set(0,1.65,7);requestAnimationFrame(animate);
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
