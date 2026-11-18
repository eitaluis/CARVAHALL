// MERCADO DE INVERNO — CARVAHALL EM ERAGON
// Cena opcional do primeiro livro: carroças, tendas, quatro tendas coloridas
// dos trovadores, fogueiras, bancas e neve pisada na rua principal.

const traderCamp=new THREE.Group();
scene.add(traderCamp);
const marketActors=[];
const marketSnowCount=190;
const marketSnowPositions=new Float32Array(marketSnowCount*3);
for(let i=0;i<marketSnowCount;i++){
  marketSnowPositions[i*3]=150+rnd()*355;
  marketSnowPositions[i*3+1]=4+rnd()*33;
  marketSnowPositions[i*3+2]=-105+rnd()*235;
}
const marketSnowGeometry=new THREE.BufferGeometry();
marketSnowGeometry.setAttribute('position',new THREE.BufferAttribute(marketSnowPositions,3));
const marketSnow=new THREE.Points(marketSnowGeometry,new THREE.PointsMaterial({
  color:0xe6ecea,size:.12,transparent:true,opacity:.72,depthWrite:false,sizeAttenuation:true
}));
traderCamp.add(marketSnow);
traderCamp.visible=false;
window.CARVAHALL_MARKET_VISIBLE=false;

// Carroça de mercadores: estrutura de madeira, rodas e eixo.
function makeWagon(x,z,scale=1,parent=scene){
  const g=new THREE.Group();
  g.position.set(x,groundHeight(x,z),z);
  g.rotation.y=.16;
  g.scale.setScalar(scale);
  parent.add(g);
  box(g,4.1,.45,2.3,darkWoodMat,0,1.55,0);
  for(let i=0;i<7;i++)box(g,.12,.85,2.2,paleWoodMat,-1.65+i*.55,2.15,0);
  for(const sx of [-1.25,1.25])for(const sz of [-1.25,1.25]){
    const wheel=new THREE.Mesh(new THREE.TorusGeometry(.72,.12,7,14),darkWoodMat);
    wheel.position.set(sx,.86,sz);wheel.rotation.y=Math.PI/2;g.add(wheel);
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(.17,.17,.25,9),ironMat);
    hub.rotation.z=Math.PI/2;hub.position.set(sx,.86,sz);g.add(hub);
  }
  logBeam(g,4.5,.1,0,1.25,2.05,'x',darkWoodMat);
  return g;
}

function hexColor(value){return "#"+value.toString(16).padStart(6,"0");}
function clothTexture(baseColor,accentColor,striped=false){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle=hexColor(baseColor);ctx.fillRect(0,0,256,256);
  if(striped){
    for(let i=0;i<8;i++){
      ctx.fillStyle=i%2===0?hexColor(accentColor):'rgba(246,231,202,.72)';
      ctx.globalAlpha=.62;
      ctx.fillRect(i*32,0,16,256);
    }
    ctx.globalAlpha=1;
  }
  // Trama fina de fios verticais e pequenas irregularidades do tecido.
  for(let i=0;i<6200;i++){
    const x=rnd()*256,y=rnd()*256;
    ctx.strokeStyle=rnd()<.5?'rgba(255,244,220,.12)':'rgba(31,24,18,.075)';
    ctx.lineWidth=.35+rnd()*.65;
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(rnd()-.5)*1.2,y+2+rnd()*14);ctx.stroke();
  }
  for(let y=0;y<256;y+=32){
    ctx.strokeStyle='rgba(30,24,18,.09)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(256,y);ctx.stroke();
  }
  const tex=new THREE.CanvasTexture(canvas);
  tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
  tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=8;
  return tex;
}
function tentFabricPanel(parent,a,b,apex,material,segments=14){
  const verts=[],uvs=[],indices=[];
  for(let row=0;row<=segments;row++){
    const v=row/segments;
    for(let col=0;col<=segments;col++){
      const u=col/segments;
      const base=a.clone().lerp(b,u);
      const point=base.lerp(apex,v);
      const fold=Math.sin(u*Math.PI*7+.45)*.035*Math.sin(v*Math.PI);
      point.y+=Math.sin(u*Math.PI)*Math.sin(v*Math.PI)*.065+fold;
      point.x+=Math.sin(v*Math.PI)*Math.sin(u*Math.PI*3)*.025;
      verts.push(point.x,point.y,point.z);uvs.push(u*1.2,v*1.5);
      if(row<segments&&col<segments){
        const n=row*(segments+1)+col,k=n+1,m=n+segments+1,q=m+1;
        indices.push(n,m,k,k,m,q);
      }
    }
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  geo.setIndex(indices);geo.computeVertexNormals();
  const mesh=new THREE.Mesh(geo,material);
  mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);
  return mesh;
}
function marketTent(parent,x,z,w,d,topColor,lowerColor,striped=false){
  const g=new THREE.Group();g.position.set(x,groundHeight(x,z),z);parent.add(g);
  const accent=striped?0xe8d2a4:lowerColor;
  const topMat=new THREE.MeshStandardMaterial({
    map:clothTexture(topColor,accent,striped),color:0xffffff,
    roughness:1,side:THREE.DoubleSide
  });
  const lowerMat=new THREE.MeshStandardMaterial({
    map:clothTexture(lowerColor,accent,striped),color:0xffffff,
    roughness:1,side:THREE.DoubleSide
  });
  const apex=new THREE.Vector3(0,3.85,0);
  const corners=[
    new THREE.Vector3(-w/2,0,-d/2),new THREE.Vector3(w/2,0,-d/2),
    new THREE.Vector3(w/2,0,d/2),new THREE.Vector3(-w/2,0,d/2)
  ];
  for(let i=0;i<4;i++)tentFabricPanel(g,corners[i],corners[(i+1)%4],apex,topMat,16);

  // Saias de lona pendentes com bordas levemente onduladas; a entrada frontal permanece aberta.
  for(const side of [-1,1]){
    const panel=new THREE.Mesh(new THREE.PlaneGeometry(w*.46,1.22,12,5),lowerMat);
    const attr=panel.geometry.attributes.position;
    for(let i=0;i<attr.count;i++){
      const px=attr.getX(i),py=attr.getY(i);
      attr.setZ(i,Math.sin(px*2.8)*.065*(.5+Math.abs(py)));
      attr.setY(i,py+Math.sin(px*3.4)*.035);
    }
    panel.geometry.computeVertexNormals();
    panel.position.set(side*w*.235,.65,-d/2+.04);
    g.add(panel);
  }
  // Faixas verticais e franja de tecido na borda frontal.
  if(striped){
    for(let i=0;i<8;i++){
      const stripe=new THREE.Mesh(new THREE.PlaneGeometry(.25,1.18),
        new THREE.MeshStandardMaterial({
          map:clothTexture(i%2?0xe8d2a4:lowerColor,topColor,false),
          color:0xffffff,roughness:1,side:THREE.DoubleSide
        }));
      stripe.position.set(-w*.43+i*w*.123,.64,-d/2-.025);
      stripe.rotation.y=(rnd()-.5)*.035;g.add(stripe);
    }
    for(let i=0;i<12;i++){
      const tassel=new THREE.Mesh(new THREE.CylinderGeometry(.012,.018,.24,5),
        new THREE.MeshStandardMaterial({color:accent,roughness:1}));
      tassel.position.set(-w*.46+i*w*.083,.045,-d/2-.04);g.add(tassel);
    }
  }

  const ropeMat=new THREE.MeshStandardMaterial({color:0x9b8968,roughness:1});
  // Um mastro central sustenta o vértice da tenda; nenhum poste atravessa a lona nas quinas.
  const mast=new THREE.Mesh(new THREE.CylinderGeometry(.09,.14,3.82,9),darkWoodMat);
  mast.position.set(0,1.91,0);mast.castShadow=true;g.add(mast);
  for(const [px,pz] of [[-w/2,-d/2],[w/2,-d/2],[-w/2,d/2],[w/2,d/2]]){
    const stake=new THREE.Mesh(new THREE.CylinderGeometry(.045,.075,.48,6),darkWoodMat);
    const sx=px*1.28,sz=pz*1.38;
    stake.position.set(sx,.22,sz);stake.rotation.z=(px<0?-.22:.22);g.add(stake);
    const start=new THREE.Vector3(px,.12,pz),end=new THREE.Vector3(sx,.24,sz);
    const direction=new THREE.Vector3().subVectors(end,start),length=direction.length();
    const rope=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,length,5),ropeMat);
    rope.position.copy(start).add(end).multiplyScalar(.5);
    rope.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());
    g.add(rope);
  }
  // Costura grossa ao longo das quatro águas da cobertura.
  for(let i=0;i<4;i++){
    const edge=new THREE.Vector3().lerpVectors(corners[i],apex,.74);
    const bead=new THREE.Mesh(new THREE.SphereGeometry(.045,7,6),paleWoodMat);
    bead.position.copy(edge);g.add(bead);
  }
  const finial=new THREE.Mesh(new THREE.SphereGeometry(.13,9,7),paleWoodMat);
  finial.position.y=3.91;g.add(finial);
  return g;
}
function marketStall(parent,x,z,color){
  const g=new THREE.Group();g.position.set(x,groundHeight(x,z),z);parent.add(g);
  box(g,4.6,.28,2.3,darkWoodMat,0,1.05,0);
  box(g,4.9,.13,2.55,paleWoodMat,0,1.26,0);
  for(const px of [-2.1,2.1])for(const pz of [-.9,.9]){
    box(g,.14,2.7,.14,darkWoodMat,px,1.35,pz);
  }
  const canopy=new THREE.Mesh(new THREE.BoxGeometry(5.1,.18,3.0),
    new THREE.MeshStandardMaterial({color,roughness:1}));
  canopy.position.y=2.85;canopy.castShadow=true;g.add(canopy);
  // Mercadorias: sacos, tecidos dobrados, potes e ferragens.
  const goods=[0xb9a17a,0x80613e,0x9b4634,0x6e7460,0xaaa18e];
  for(let i=0;i<9;i++){
    const material=new THREE.MeshStandardMaterial({color:goods[i%goods.length],roughness:1});
    if(i%3===0){
      const sack=new THREE.Mesh(new THREE.SphereGeometry(.34,8,7),material);
      sack.scale.set(1,.72,1);sack.position.set(-1.7+(i%4)*.95,1.55,.1);g.add(sack);
    }else{
      const pot=new THREE.Mesh(new THREE.CylinderGeometry(.18,.24,.42,9),material);
      pot.position.set(-1.8+(i%5)*.86,1.52,.12);g.add(pot);
    }
  }
  return g;
}
function marketBonfire(parent,x,z,scale=1){
  const g=new THREE.Group();g.position.set(x,groundHeight(x,z),z);parent.add(g);
  for(let i=0;i<5;i++){
    const log=new THREE.Mesh(new THREE.CylinderGeometry(.13,.16,2.1,7),darkWoodMat);
    log.rotation.z=Math.PI/2;log.rotation.y=i*.62;log.position.y=.22+i*.025;g.add(log);
  }
  const fireMat=new THREE.MeshStandardMaterial({color:0xff8a36,emissive:0xff4a12,emissiveIntensity:1.8});
  const fire=new THREE.Mesh(new THREE.DodecahedronGeometry(.72*scale,1),fireMat);
  fire.position.y=.8;fire.scale.set(.8,1.2,.8);g.add(fire);
  const light=new THREE.PointLight(0xff8d42,1.8*scale,34*scale);
  light.position.set(0,2,0);g.add(light);
  const smoke=[];
  for(let i=0;i<5;i++){
    const puff=new THREE.Sprite(new THREE.SpriteMaterial({
      map:smokeTexture,color:0x89877f,transparent:true,opacity:.0,depthWrite:false
    }));
    puff.scale.set(2.4+i*.2,2.8+i*.25,1);
    puff.position.set((rnd()-.5)*.6,2.3+i*.7,(rnd()-.5)*.5);
    puff.userData.baseY=puff.position.y;puff.userData.phase=rnd()*6.28;
    g.add(puff);smoke.push(puff);
  }
  return {group:g,fire,light,smoke};
}
function marketHorse(parent,x,z,scale=1,rot=0){
  const g=new THREE.Group();g.position.set(x,groundHeight(x,z),z);g.rotation.y=rot;g.scale.setScalar(scale);parent.add(g);
  const coat=new THREE.MeshStandardMaterial({color:0x5a3928,roughness:1});
  const darkCoat=new THREE.MeshStandardMaterial({color:0x30231d,roughness:1});
  const mane=new THREE.MeshStandardMaterial({color:0x201a17,roughness:1});
  const body=new THREE.Mesh(new THREE.SphereGeometry(1,12,9),coat);
  body.scale.set(1.2,.58,.48);body.position.y=1.45;body.castShadow=true;g.add(body);
  const neck=new THREE.Mesh(new THREE.CylinderGeometry(.28,.42,1.2,9),coat);
  neck.position.set(.78,1.86,0);neck.rotation.z=-.38;neck.castShadow=true;g.add(neck);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.34,10,8),coat);
  head.scale.set(.65,1.35,.72);head.position.set(1.22,2.3,0);g.add(head);
  const muzzle=new THREE.Mesh(new THREE.SphereGeometry(.2,8,7),darkCoat);
  muzzle.position.set(1.42,2.07,0);g.add(muzzle);
  const earGeo=new THREE.ConeGeometry(.09,.42,6);
  for(const zoff of [-.17,.17]){
    const ear=new THREE.Mesh(earGeo,coat);ear.position.set(1.15,2.75,zoff);ear.rotation.z=-.15;g.add(ear);
  }
  const maneMesh=new THREE.Mesh(new THREE.BoxGeometry(.2,1.0,.44),mane);
  maneMesh.position.set(.74,2.1,0);maneMesh.rotation.z=-.3;g.add(maneMesh);
  const tail=new THREE.Mesh(new THREE.CylinderGeometry(.06,.11,.82,6),mane);
  tail.position.set(-1.12,1.63,0);tail.rotation.z=-.45;g.add(tail);
  for(const sx of [-.72,.72])for(const sz of [-.27,.27]){
    const leg=new THREE.Mesh(new THREE.CylinderGeometry(.085,.065,1.0,7),darkCoat);
    leg.position.set(sx,.53,sz);leg.castShadow=true;g.add(leg);
    const hoof=new THREE.Mesh(new THREE.CylinderGeometry(.11,.13,.19,6),ironMat);
    hoof.position.set(sx,.08,sz);g.add(hoof);
  }
  const rein=new THREE.Mesh(new THREE.TorusGeometry(.29,.025,5,16,Math.PI),darkWoodMat);
  rein.position.set(1.18,2.14,0);rein.rotation.y=Math.PI/2;g.add(rein);
  return g;
}
function snowPatch(parent,x,z,w,d,opacity=.85){
  const mat=new THREE.MeshStandardMaterial({color:0xd8dedb,roughness:1,transparent:true,opacity,depthWrite:false});
  const plane=new THREE.Mesh(new THREE.PlaneGeometry(w,d),mat);
  plane.rotation.x=-Math.PI/2;plane.position.set(x,groundHeight(x,z)+.075,z);parent.add(plane);
  return plane;
}

// Acampamento instalado no campo vazio da periferia, ligado à vila pela rua.
const campField=new THREE.Group();traderCamp.add(campField);
for(const [x,z,w,d] of [[386,-62,28,18],[431,-30,34,25],[389,24,33,25],[442,71,26,19],[352,66,28,22]]){
  snowPatch(campField,x,z,w,d,.82);
}
// Quatro tendas chamativas dos trovadores, com cores que se destacam na neve.
marketTent(campField,386,-65,13,10,0x8e3029,0xe5cba0,true);
marketTent(campField,432,-31,12,9,0x263f5b,0xd8d0b7,true);
marketTent(campField,388,24,11,9,0x8a6a28,0x5b2630,true);
marketTent(campField,442,72,13,10,0x4f5946,0xb5a16f,true);

// Outras tendas, carroças e fogueiras, espalhadas sem formar fileiras rígidas.
marketTent(campField,353,4,8,7,0x75624d,0x9c835f,false);
marketTent(campField,468,-72,7,6,0x72554a,0xc1aa86,false);
makeWagon(366,95,.9,campField);
makeWagon(414,108,.88,campField);
makeWagon(464,22,.82,campField);
makeWagon(360,-22,.82,campField);
const campFireA=marketBonfire(campField,407,-3,1.0);
const campFireB=marketBonfire(campField,455,52,.85);
const campFireC=marketBonfire(campField,376,49,.72);

// Cavalos presos junto a carroças.
marketHorse(campField,350,96,.82,.22);
marketHorse(campField,434,111,.86,-.28);

// Barracas de comércio que avançam pela rua principal, conforme a cena diurna.
const streetMarket=new THREE.Group();traderCamp.add(streetMarket);
marketStall(streetMarket,177,96,0x8b3d34);
marketStall(streetMarket,228,82,0x53614b);
marketStall(streetMarket,282,55,0x8a6d42);
marketStall(streetMarket,319,43,0x42576c);
for(const [x,z,w,d] of [[186,94,23,11],[232,80,22,10],[286,55,22,10],[320,43,18,9]]){
  snowPatch(streetMarket,x,z,w,d,.78);
}
// Trilhas de neve pisada, com bordas escurecidas por lama e cascos.
const trampledMat=new THREE.MeshStandardMaterial({color:0xb3b8b2,roughness:1,transparent:true,opacity:.75});
for(const [x,z,w,d] of [[105,65,22,10],[145,78,25,9],[190,96,29,9],[235,80,25,9],[280,56,23,8],[322,42,22,8]]){
  const patch=new THREE.Mesh(new THREE.PlaneGeometry(w,d),trampledMat);
  patch.rotation.x=-Math.PI/2;patch.position.set(x,groundHeight(x,z)+.09,z);streetMarket.add(patch);
}

// Pessoas no mercado: vendedores, compradores e crianças entre as bancas.
function marketPerson(parent,x,z,coatColor,heading=0,scale=1,child=false){
  const g=new THREE.Group();g.position.set(x,groundHeight(x,z),z);g.rotation.y=heading;g.scale.setScalar(scale);parent.add(g);
  g.userData.baseY=g.position.y;g.userData.baseYaw=heading;g.userData.phase=rnd()*6.28;
  marketActors.push(g);
  const coatMat=new THREE.MeshStandardMaterial({color:coatColor,roughness:1});
  const shirtMat=new THREE.MeshStandardMaterial({color:0xc2b08b,roughness:1});
  const skinMat=new THREE.MeshStandardMaterial({color:0xb88e6d,roughness:1});
  const hairMat=new THREE.MeshStandardMaterial({color:0x30231b,roughness:1});
  const bootMat=new THREE.MeshStandardMaterial({color:0x302a24,roughness:1});
  const torsoH=child?.72:1.02,headY=child?1.36:1.82;
  const torso=new THREE.Mesh(new THREE.BoxGeometry(child?.43:.52,torsoH,child?.3:.34),coatMat);
  torso.position.y=child?.75:1.15;torso.castShadow=true;g.add(torso);
  const head=new THREE.Mesh(new THREE.SphereGeometry(child?.19:.21,9,8),skinMat);
  head.position.set(0,headY,0);g.add(head);
  const hair=new THREE.Mesh(new THREE.SphereGeometry(child?.2:.22,8,7),hairMat);
  hair.scale.set(1,.52,1);hair.position.set(0,headY+.13,0);g.add(hair);
  const movingArms=[];
  const armLength=child?.52:.7;
  for(const side of [-1,1]){
    const arm=new THREE.Mesh(new THREE.CylinderGeometry(.07,.09,armLength,7),coatMat);
    arm.position.set(side*(child?.29:.35),child?.78:1.25,.02);
    arm.rotation.z=side*(.14+(side===1?.12:0));g.add(arm);movingArms.push({mesh:arm,side,baseZ:arm.rotation.z});
    const leg=new THREE.Mesh(new THREE.CylinderGeometry(.075,.06,child?.43:.7,7),bootMat);
    leg.position.set(side*.13,child?.22:.36,0);g.add(leg);
    const foot=new THREE.Mesh(new THREE.BoxGeometry(.16,.12,.28),bootMat);
    foot.position.set(side*.13,.06,.07);g.add(foot);
  }
  // Algumas figuras carregam uma cesta ou um pequeno embrulho.
  g.userData.head=head;g.userData.movingArms=movingArms;
  if(Math.abs(x%3)<1.35){
    const parcel=new THREE.Mesh(new THREE.BoxGeometry(.32,.27,.28),
      new THREE.MeshStandardMaterial({color:0x9a744c,roughness:1}));
    parcel.position.set(.42,.78,.12);g.add(parcel);
  }
  return g;
}
const marketCrowd=new THREE.Group();streetMarket.add(marketCrowd);
const crowdPalette=[0x544638,0x5b473a,0x62624b,0x7d4b38,0x4d5960,0x83704e,0x6c4539,0x4e493e];
const crowdSpots=[
  [166,83],[181,111],[197,92],[205,71],[216,101],[224,63],[240,73],
  [248,95],[260,48],[270,78],[292,67],[302,33],[315,60],[331,31],
  [175,58],[239,112],[285,91],[319,74]
];
for(let i=0;i<crowdSpots.length;i++){
  const [x,z]=crowdSpots[i];
  marketPerson(marketCrowd,x,z,crowdPalette[i%crowdPalette.length],(rnd()-.5)*Math.PI*2,1+(rnd()-.5)*.08,false);
}
// Crianças entre os adultos, perto das bordas da rua.
for(const [x,z] of [[189,69],[258,106],[305,85],[335,56]]){
  marketPerson(marketCrowd,x,z,0x866342,(rnd()-.5)*Math.PI*2,.78,true);
}

// Animação leve das chamas controlada pelo loop do jogador.
const marketFires=[campFireA,campFireB,campFireC];
