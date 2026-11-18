// PONTOS DE INTERESSE, MINIMAPA E TELEPORTES — ERAGON
const POIS=[
  {name:'Taverna de Carvahall (nome não indicado)',x:76,z:-42,r:9,type:'tavern',building:'Taverna (nome não indicado)'},
  {name:'Açougue de Sloan',x:18,z:67,r:8,type:'butcher',building:'Açougue de Sloan'},
  {name:'Forja de Horst',x:206,z:48,r:9,type:'forge',building:'Forja de Horst'},
  {name:'Tanoaria de Gedric',x:-96,z:174,r:9,type:'tannery',building:'Tanoaria de Gedric'},
  {name:'Campo dos mercadores',x:407,z:18,r:18,type:'market'},
  {name:'Rua principal',x:240,z:78,r:12,type:'street'},
  {name:'Rio Anora',x:-102,z:25,r:10,type:'river'},
  {name:'Campos do vale',x:386,z:178,r:18,type:'field'},
  {name:'Cataratas de Igualda',x:-147,z:-520,r:24,type:'falls'}
];
const PONTOS=POIS;
let tpIndex=0;

function placePlayer(x,z,yaw=null,pitch=0){
  jogador.pos.set(x,groundHeight(x,z)+jogador.eye,z);
  jogador.vel.set(0,0,0);jogador.grounded=true;
  if(yaw!==null){camera.rotation.y=yaw;camera.rotation.x=pitch;}
  document.getElementById('tp').textContent='Local: '+(POIS.find(p=>Math.hypot(p.x-x,p.z-z)<55)?.name||'Exploração livre');
}
function teleport(i){
  tpIndex=(i+POIS.length)%POIS.length;
  const p=POIS[tpIndex];

  // Os quatro estabelecimentos têm aproximação calculada pela posição real
  // da fachada e pela rotação do edifício; o teleporte não termina dentro da parede.
  if(p.building){
    const building=BUILDINGS.find(b=>b.name===p.building);
    if(building){
      const distance=building.d/2+5.35;
      const outwardX=-Math.sin(building.rot),outwardZ=-Math.cos(building.rot);
      const x=building.x+outwardX*distance;
      const z=building.z+outwardZ*distance;
      placePlayer(x,z,building.rot+Math.PI,0);
      document.getElementById('tp').textContent='Entrada: '+p.name;
      return;
    }
  }

  const destinations={
    market:{x:p.x-15,z:p.z+100,yaw:0,pitch:0},
    street:{x:p.x+9,z:p.z-16,yaw:-.55,pitch:0},
    river:{x:p.x+18,z:p.z,yaw:1.7,pitch:0},
    field:{x:p.x-18,z:p.z-12,yaw:3.0,pitch:0},
    falls:{x:p.x+70,z:p.z+30,yaw:1.5,pitch:-.15}
  };
  const target=destinations[p.type]||{x:p.x+12,z:p.z+12,yaw:Math.PI*.95,pitch:0};
  placePlayer(target.x,target.z,target.yaw,target.pitch);
  document.getElementById('tp').textContent='Ponto: '+p.name;
}
function setMapVisibility(v){
  mapVisible=v;
  document.getElementById('map-wrap').style.display=v?'block':'none';
  document.getElementById('map-legend').style.display=v?'flex':'none';
}
const mapCanvas=document.getElementById('map'),mapCtx=mapCanvas.getContext('2d');
const MM=220,MAP_LIMIT=790;
let mapVisible=true,mapLocal=false;
function mapXY(x,z){
  if(mapLocal){
    const r=300;
    return {x:MM/2+(x-jogador.pos.x)/r*(MM/2),y:MM/2-(z-jogador.pos.z)/r*(MM/2)};
  }
  return {x:(x+MAP_LIMIT)/(MAP_LIMIT*2)*MM,y:MM-(z+MAP_LIMIT)/(MAP_LIMIT*2)*MM};
}
function mapPath(curve,color,width){
  const pts=curve.getPoints(120);mapCtx.strokeStyle=color;mapCtx.lineWidth=width;mapCtx.beginPath();
  pts.forEach((p,i)=>{const m=mapXY(p.x,p.z);if(i===0)mapCtx.moveTo(m.x,m.y);else mapCtx.lineTo(m.x,m.y);});
  mapCtx.stroke();
}
function drawMap(){
  if(!mapVisible)return;
  mapCtx.clearRect(0,0,MM,MM);
  mapCtx.fillStyle='#4a4436';mapCtx.fillRect(0,0,MM,MM);
  // Vale aberto, parcelas agrícolas isoladas e massas de pinheiros nas bordas.
  mapCtx.fillStyle='rgba(183,158,113,.36)';
  const v1=mapXY(-420,-460),v2=mapXY(460,430);
  mapCtx.fillRect(v1.x,v1.y,v2.x-v1.x,v2.y-v1.y);
  mapCtx.fillStyle='rgba(29,47,35,.56)';
  for(const [x,z,rad] of [[-600,-400,180],[-520,200,150],[580,-450,170],[650,230,160]]){
    const m=mapXY(x,z);mapCtx.beginPath();mapCtx.arc(m.x,m.y,rad/(MAP_LIMIT*2)*MM*2,0,Math.PI*2);mapCtx.fill();
  }
  mapPath(riverCurve,'rgba(116,164,174,.95)',4.4);
  for(const c of roadCurves)mapPath(c,'rgba(193,158,105,.82)',1.5);

  // Campo agrícola periférico e implantação compacta da vila.
  for(const [x,z] of [[386,178],[448,278],[-294,105]]){
    const m=mapXY(x,z);mapCtx.strokeStyle='rgba(220,190,129,.55)';
    mapCtx.strokeRect(m.x-5,m.y-5,10,10);
  }
  const village=mapXY(112,42);
  mapCtx.strokeStyle='rgba(235,200,146,.5)';mapCtx.lineWidth=1.2;
  mapCtx.setLineDash([3,4]);mapCtx.beginPath();
  mapCtx.ellipse(village.x,village.y,34,30,-.1,0,Math.PI*2);mapCtx.stroke();mapCtx.setLineDash([]);

  for(const p of POIS){
    const m=mapXY(p.x,p.z);
    const color=p.type==='river'?'#85b7c0':p.type==='falls'?'#d6e4e0':
      p.type==='forge'?'#e18a50':p.type==='market'?'#ddbd76':
      p.type==='tannery'?'#9d7650':p.type==='tavern'?'#d2a66e':'#d6b98b';
    mapCtx.fillStyle=color;mapCtx.beginPath();
    mapCtx.arc(m.x,m.y,mapLocal?4:Math.max(2.3,p.r/(MAP_LIMIT*2)*MM*2),0,Math.PI*2);mapCtx.fill();
    mapCtx.strokeStyle='rgba(20,20,16,.85)';mapCtx.lineWidth=1;mapCtx.stroke();
  }
  const player=mapXY(jogador.pos.x,jogador.pos.z);
  mapCtx.save();mapCtx.translate(player.x,player.y);mapCtx.rotate(-camera.rotation.y);
  mapCtx.fillStyle='#fff0d0';mapCtx.beginPath();
  mapCtx.moveTo(0,-7);mapCtx.lineTo(4,5);mapCtx.lineTo(0,2);mapCtx.lineTo(-4,5);mapCtx.closePath();mapCtx.fill();
  mapCtx.restore();
}
document.getElementById('map-wrap').addEventListener('wheel',event=>{
  event.preventDefault();mapLocal=!mapLocal;
  document.getElementById('map-scale').textContent=mapLocal?'zoom local':'visão geral';
},{passive:false});
