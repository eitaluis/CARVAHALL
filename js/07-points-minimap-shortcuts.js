// 14. PONTOS DE INTERESSE, MINIMAPA E ATALHOS
// ============================================================================
const POIS=[
  {name:'Seven Sheaves',x:76,z:-42,r:10,type:'tavern'},
  {name:'Açougue de Sloan',x:18,z:67,r:8,type:'butcher'},
  {name:'Forja de Horst',x:206,z:48,r:9,type:'forge'},
  {name:'Poço de Fisk',x:3,z:-94,r:5,type:'well'},
  {name:'Oficina de Fisk',x:-14,z:-142,r:7,type:'workshop'},
  {name:'Margem do Anora',x:-65,z:30,r:7,type:'river'},
  {name:'Campos e horta',x:344,z:126,r:15,type:'field'},
  {name:'Campo dos mercadores',x:407,z:18,r:18,type:'market'},
  {name:'Cataratas de Igualda',x:-147,z:-520,r:24,type:'falls'}
];
const PONTOS=POIS;
let tpIndex=0;
function placePlayer(x,z,yaw=null,pitch=0){
  jogador.pos.set(x,groundHeight(x,z)+jogador.eye,z);jogador.vel.set(0,0,0);jogador.grounded=true;
  if(yaw!==null){camera.rotation.y=yaw;camera.rotation.x=pitch;}
  document.getElementById('tp').textContent='Local: '+(POIS.find(p=>Math.hypot(p.x-x,p.z-z)<60)?.name || 'Exploração livre');
}
function teleport(i){
  tpIndex=(i+POIS.length)%POIS.length;const p=POIS[tpIndex];
  const offsets={tavern:[17,12],butcher:[-14,15],forge:[-18,15],well:[-13,-5],workshop:[13,10],river:[18,0],field:[-18,-12],market:[-25,7],falls:[70,30]};
  const o=offsets[p.type]||[12,12];const yaw=p.type==='falls'?1.5:(p.type==='river'?1.7:Math.PI*.95);
  placePlayer(p.x+o[0],p.z+o[1],yaw,p.type==='falls'?-.15:0);
  document.getElementById('tp').textContent='TP: '+p.name;
}
function setMapVisibility(v){mapVisible=v;document.getElementById('map-wrap').style.display=v?'block':'none';document.getElementById('map-legend').style.display=v?'flex':'none';}
const mapCanvas=document.getElementById('map'),mapCtx=mapCanvas.getContext('2d');
const MM=220,MAP_LIMIT=790;let mapVisible=true,mapLocal=false;
function mapXY(x,z){
  if(mapLocal){const r=300;return {x:MM/2+(x-jogador.pos.x)/r*(MM/2),y:MM/2-(z-jogador.pos.z)/r*(MM/2)};}
  return {x:(x+MAP_LIMIT)/(MAP_LIMIT*2)*MM,y:MM-(z+MAP_LIMIT)/(MAP_LIMIT*2)*MM};
}
function mapPath(curve,color,width){const pts=curve.getPoints(120);mapCtx.strokeStyle=color;mapCtx.lineWidth=width;mapCtx.beginPath();pts.forEach((p,i)=>{const m=mapXY(p.x,p.z);if(i===0)mapCtx.moveTo(m.x,m.y);else mapCtx.lineTo(m.x,m.y);});mapCtx.stroke();}
function drawMap(){
  if(!mapVisible)return;
  mapCtx.clearRect(0,0,MM,MM);mapCtx.fillStyle='#34372d';mapCtx.fillRect(0,0,MM,MM);
  // Mancha clara do vale e manchas de floresta/montanha.
  mapCtx.fillStyle='rgba(160,145,103,.3)';const v1=mapXY(-420,-460),v2=mapXY(460,430);mapCtx.fillRect(v1.x,v1.y,v2.x-v1.x,v2.y-v1.y);
  mapCtx.fillStyle='rgba(22,43,34,.42)';
  for(const [x,z,r] of [[-600,-400,180],[-520,200,150],[580,-450,170],[650,230,160]]){const m=mapXY(x,z);mapCtx.beginPath();mapCtx.arc(m.x,m.y,r/(MAP_LIMIT*2)*MM*2,0,Math.PI*2);mapCtx.fill();}
  mapPath(riverCurve,'rgba(104,157,169,.95)',4.4);
  for(const c of roadCurves)mapPath(c,'rgba(187,151,101,.74)',1.35);
  // Mancha da área habitada, deliberadamente espaçada.
  const c=mapXY(125,30);mapCtx.strokeStyle='rgba(226,192,139,.42)';mapCtx.lineWidth=1;mapCtx.setLineDash([3,4]);mapCtx.beginPath();mapCtx.ellipse(c.x,c.y,46,37,-.1,0,Math.PI*2);mapCtx.stroke();mapCtx.setLineDash([]);
  for(const p of POIS){const m=mapXY(p.x,p.z);mapCtx.fillStyle=p.type==='river'?'#85b3bd':p.type==='falls'?'#d6e4e0':p.type==='forge'?'#e28a50':p.type==='tavern'?'#e7c58d':'#d6b98b';mapCtx.beginPath();mapCtx.arc(m.x,m.y,mapLocal?4:Math.max(2.3,p.r/(MAP_LIMIT*2)*MM*2),0,Math.PI*2);mapCtx.fill();mapCtx.strokeStyle='rgba(20,20,16,.85)';mapCtx.lineWidth=1;mapCtx.stroke();}
  const pm=mapXY(jogador.pos.x,jogador.pos.z);mapCtx.save();mapCtx.translate(pm.x,pm.y);mapCtx.rotate(-camera.rotation.y);mapCtx.fillStyle='#fff0d0';mapCtx.beginPath();mapCtx.moveTo(0,-7);mapCtx.lineTo(4,5);mapCtx.lineTo(0,2);mapCtx.lineTo(-4,5);mapCtx.closePath();mapCtx.fill();mapCtx.restore();
}
document.getElementById('map-wrap').addEventListener('wheel',e=>{e.preventDefault();mapLocal=!mapLocal;document.getElementById('map-scale').textContent=mapLocal?'zoom local':'visão geral';},{passive:false});

// ============================================================================
