// 10. CONSTRUÇÃO RURAL — CASAS BAIXAS DE TRONCOS, TELHADOS DE PALHA/SHINGLE
// ============================================================================
const BUILDINGS=[];
const smokeSprites=[];
function box(parent,w,h,d,mat,x,y,z,rx=0,ry=0,rz=0){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
}
function logBeam(parent,length,radius,x,y,z,axis='x',mat=woodMat){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(radius*.94,radius,length,7,1),mat);
  m.position.set(x,y,z);if(axis==='x')m.rotation.z=Math.PI/2;else if(axis==='z')m.rotation.x=Math.PI/2;
  m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
}
function makeSign(parent,text,x,y,z,w=3.2){
  const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');
  ctx.fillStyle='#3b2b1d';ctx.fillRect(0,0,512,128);ctx.strokeStyle='#b18b5c';ctx.lineWidth=8;ctx.strokeRect(8,8,496,112);
  ctx.fillStyle='#e4d0a7';ctx.font='bold 38px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,65,470);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,.9),new THREE.MeshStandardMaterial({map:t,roughness:.9}));m.position.set(x,y,z);parent.add(m);
  const rail=box(parent,w+.25,.13,.18,darkWoodMat,x,y-.54,z);return m;
}
function addStoneChimney(parent,x,z,yTop=6){
  const h=yTop-2.2;
  box(parent,1.15,h,1.15,stoneMat,x,2.2+h/2,z);
  for(let i=0;i<9;i++){
    const yy=2.35+i*.42;box(parent,1.22,.13,1.22,cliffDarkMat,x+(rnd()-.5)*.05,yy,z+(rnd()-.5)*.05,rnd()*.08,rnd()*.2,rnd()*.08);
  }
  box(parent,1.42,.2,1.42,cliffDarkMat,x,yTop,z);
  const hole=new THREE.Mesh(new THREE.BoxGeometry(.62,.06,.62),new THREE.MeshBasicMaterial({color:0x171715}));hole.position.set(x,yTop+.12,z);parent.add(hole);
  for(let i=0;i<6;i++){
    const spr=new THREE.Mesh(new THREE.SphereGeometry(.42+rnd()*.34,7,6),new THREE.MeshBasicMaterial({color:0xaaa59a,transparent:true,opacity:.1+rnd()*.1,depthWrite:false}));
    spr.position.set(x+(rnd()-.5)*.7,yTop+.6+i*.68,z+(rnd()-.5)*.4);spr.userData.baseY=spr.position.y;spr.userData.phase=rnd()*6.28;parent.add(spr);smokeSprites.push(spr);
  }
}
function addWindow(parent,x,y,z,rotY=0,lit=false){
  const frame=new THREE.Group();frame.position.set(x,y,z);frame.rotation.y=rotY;parent.add(frame);
  box(frame,1.15,1.15,.16,darkWoodMat,0,0,0);
  box(frame,.83,.83,.12,lit?warmGlassMat:glassMat,0,0,.1);
  box(frame,.11,1.02,.1,paleWoodMat,0,0,.18);box(frame,1.02,.11,.1,paleWoodMat,0,0,.18);
  box(frame,.08,1.0,.12,darkWoodMat,-.7,0,.06);box(frame,.08,1.0,.12,darkWoodMat,.7,0,.06);
}
function addDoor(parent,w,d){
  const doorW=1.55,doorH=2.35;
  box(parent,doorW+.28,doorH+.25,.22,darkWoodMat,0,1.77,-d/2-.02);
  const hinge=new THREE.Group();hinge.position.set(-doorW/2,0,-d/2-.15);parent.add(hinge);
  box(hinge,doorW,doorH,.16,woodMat,doorW/2,doorH/2,0,0,-.9,0);
  for(let i=0;i<4;i++)box(hinge,.09,.09,.2,ironMat,.18+i*.39,doorH*.52,0);
  box(parent,doorW+.35,.18,.22,paleWoodMat,0,2.99,-d/2-.05);
}
function addPorch(parent,w,d){
  const depth=2.0, front=-d/2-depth*.5;
  box(parent,w*.7,.22,depth,paleWoodMat,0,.62,front);
  for(const x of [-w*.34,w*.34]){
    box(parent,.22,2.7,.22,darkWoodMat,x,2.0,-d/2-depth+.14);
    box(parent,.2,.2,.2,paleWoodMat,x,3.4,-d/2-depth+.14);
  }
  box(parent,w*.72,.2,.25,darkWoodMat,0,3.35,-d/2-depth+.14);
  for(let i=0;i<3;i++)box(parent,w*.25,.16,.8,paleWoodMat,0,.3-i*.18,-d/2-depth-.28-i*.05);
}
function addInterior(parent,kind,w,d){
  const floor=new THREE.Mesh(new THREE.BoxGeometry(w-.55,.18,d-.55),new THREE.MeshStandardMaterial({color:0x4b3828,roughness:1}));floor.position.set(0,.48,0);parent.add(floor);
  if(kind==='tavern'){
    box(parent,4.4,.95,1.0,darkWoodMat,-2,1.12,1.2);
    box(parent,5.1,.18,1.45,paleWoodMat,-2,1.66,1.2);
    for(const x of [-3.5,0,3.0]){
      box(parent,2.6,.24,1.0,woodMat,x,1.05,-.6);
      for(const z of [-1.05,-.15])box(parent,.18,.95,.18,darkWoodMat,x,1.0,z);
    }
    for(let i=0;i<4;i++){
      const b=new THREE.Mesh(new THREE.CylinderGeometry(.48,.52,1.25,12),woodMat);b.rotation.z=Math.PI/2;b.position.set(3.9,1.1,-2.4+i*1.3);parent.add(b);
      for(let k=0;k<3;k++)box(parent,.05,1.2,.08,ironMat,3.9,1.1,-2.4+i*1.3-k*.02);
    }
    // Velas de sebo fumegantes e pequenas ripas/staves deixadas para entalhe no balcão.
    const waxMat=new THREE.MeshStandardMaterial({color:0xd8c49a,roughness:1});
    const candleFlame=new THREE.MeshStandardMaterial({color:0xffc16a,emissive:0xff8b28,emissiveIntensity:1.4});
    for(const [cx,cz,cy] of [[-3.5,-.6,1.22],[0,-.6,1.22],[3.0,-.6,1.22],[-2.0,1.2,1.82]]){
      const candle=new THREE.Mesh(new THREE.CylinderGeometry(.055,.07,.3,7),waxMat);candle.position.set(cx,cy,cz);parent.add(candle);
      const flame=new THREE.Mesh(new THREE.OctahedronGeometry(.07,0),candleFlame);flame.position.set(cx,cy+.19,cz);parent.add(flame);
    }
    for(let i=0;i<6;i++)box(parent,1.0,.055,.08,woodMat,1.2+i*.05,1.82+i*.065,1.2);
    addFireplace(parent,4.2,1.0,2.8);
  } else if(kind==='butcher'){
    box(parent,4.7,1.05,1.0,paleWoodMat,0,1.15,2.15);
    box(parent,4.9,.16,1.2,darkWoodMat,0,1.72,2.15);
    addFireplace(parent,-4.3,1.0,2.6);
    for(let i=0;i<3;i++)box(parent,.13,.16,2.2,ironMat,-3.8+i*.6,2.65,-2.3);
  } else if(kind==='forge'){
    addFireplace(parent,3.8,1.2,2.7,true);
    box(parent,1.5,.85,1.0,ironMat,-2.4,1.0,.4);
    box(parent,2.0,.18,1.3,ironMat,-2.4,1.5,.4);
    box(parent,1.3,.55,.7,darkWoodMat,-4.4,.85,-2.1);
    box(parent,.35,.2,.2,ironMat,-4.3,1.25,-2.1);
    // Fole e bigorna de Horst.
    box(parent,1.0,.4,1.4,woodMat,1.0,.82,-2.5);
    box(parent,.45,.8,.45,ironMat,1.0,1.25,-2.5);
    box(parent,1.05,.18,.55,ironMat,1.0,1.72,-2.5);
  } else {
    box(parent,2.3,.85,1.1,darkWoodMat,1.1,1.0,.6);
    box(parent,2.5,.16,1.2,paleWoodMat,1.1,1.47,.6);
    addFireplace(parent,-4.1,1.0,2.5);
  }
}
function addFireplace(parent,x,y,z,forge=false){
  box(parent,1.6,2.1,1.1,stoneMat,x,y+1.0,z);
  box(parent,1.02,1.0,.18,darkWoodMat,x,y+.55,z-.58);
  const fireMat=new THREE.MeshStandardMaterial({color:forge?0xff7b22:0xffa447,emissive:forge?0xff4a08:0xff7b17,emissiveIntensity:forge?1.7:1.15,roughness:.5});
  const fire=new THREE.Mesh(new THREE.DodecahedronGeometry(.42,0),fireMat);fire.position.set(x,y+.55,z-.72);parent.add(fire);
  const light=new THREE.PointLight(forge?0xff7b29:0xffb05c,forge?1.2:.75,forge?13:10);light.position.set(x,y+1,z-1);parent.add(light);
}
function addBarrel(parent,x,y,z){
  const b=new THREE.Mesh(new THREE.CylinderGeometry(.46,.52,1.15,12),woodMat);b.position.set(x,y+.58,z);b.castShadow=true;parent.add(b);
  for(const yy of [.16,.48,.86]){const ring=new THREE.Mesh(new THREE.TorusGeometry(.48,.045,5,12),ironMat);ring.rotation.x=Math.PI/2;ring.position.set(x,y+yy,z);parent.add(ring);}
}
function addHornPair(parent){
  for(const s of [-1,1]){
    const pts=[new THREE.Vector3(s*.65,0,0),new THREE.Vector3(s*.95,.35,0),new THREE.Vector3(s*1.05,.85,.03),new THREE.Vector3(s*.83,1.15,.1)];
    const curve=new THREE.CatmullRomCurve3(pts);const horn=new THREE.Mesh(new THREE.TubeGeometry(curve,14,.09,7,false),new THREE.MeshStandardMaterial({color:0xb9a57e,roughness:.75}));horn.position.set(0,3.15,-6.2);parent.add(horn);
  }
}
function createCabin(name,x,z,rot=0,opts={}){
  const w=opts.w||11.5,d=opts.d||9.5,wallH=3.05,base=.63,kind=opts.kind||'home',roofType=opts.roof||'thatch';
  const g=new THREE.Group();g.position.set(x,groundHeight(x,z),z);g.rotation.y=rot;scene.add(g);
  // Base irregular stone piers and floor.
  for(const xx of [-w/2+.7,w/2-.7])for(const zz of [-d/2+.7,d/2-.7]){
    const pier=new THREE.Mesh(new THREE.DodecahedronGeometry(.62,0),stoneMat);pier.position.set(xx,.35,zz);pier.scale.set(1.4,.8,1.15);g.add(pier);
  }
  box(g,w,.24,d,new THREE.MeshStandardMaterial({color:0x4b3929,roughness:1}),0,.53,0);
  const logR=.19,step=.38,rows=8;
  for(let i=0;i<rows;i++){
    const y=base+i*step;
    // Paredes laterais: toras contínuas que se cruzam nos cantos.
    logBeam(g,d+.72,logR,-w/2,y,0,'z',i%3?woodMat:darkWoodMat);
    logBeam(g,d+.72,logR,w/2,y,0,'z',i%3?woodMat:darkWoodMat);
    // Fachada da porta: os cursos baixos deixam a abertura real; acima há verga inteira.
    if(y-base<1.95){logBeam(g,(w-1.8)/2+.2,logR,-w/2+(w-1.8)/4,y,-d/2,'x',i%3?woodMat:darkWoodMat);logBeam(g,(w-1.8)/2+.2,logR,w/2-(w-1.8)/4,y,-d/2,'x',i%3?woodMat:darkWoodMat);}
    else logBeam(g,w+.75,logR,0,y,-d/2,'x',i%3?woodMat:darkWoodMat);
    logBeam(g,w+.75,logR,0,y,d/2,'x',i%3?woodMat:darkWoodMat);
  }
  // Chinking claro muito discreto entre alguns cursos.
  for(let i=0;i<rows-1;i+=2){
    const y=base+i*step+.27;
    for(const zz of [-d/2-.16,d/2+.16])box(g,w*.94,.045,.035,new THREE.MeshStandardMaterial({color:0x8a806b,roughness:1}),0,y,zz);
  }
  // Telhado baixo em duas águas, com beirais generosos.
  const eave=base+rows*step+.15,rise=1.65,run=d/2+.8,slope=Math.atan2(rise,run),sl=Math.sqrt(run*run+rise*rise);
  const roofMat=roofType==='shingle'?shingleMat:thatchMat;
  const a=box(g,w+1.55,.2,sl,roofMat,0,eave+rise/2,-run/2, -slope,0,0);
  const b=box(g,w+1.55,.2,sl,roofMat,0,eave+rise/2,run/2, slope,0,0);
  logBeam(g,w+1.3,.17,0,eave+rise+.03,0,'x',darkWoodMat);
  // Fascias e pontas de empena.
  for(const xx of [-w/2-.45,w/2+.45]){
    logBeam(g,sl,.12,xx,eave+rise/2,-run/2,'z',darkWoodMat);
    logBeam(g,sl,.12,xx,eave+rise/2,run/2,'z',darkWoodMat);
  }
  // Chaminé de pedra, presente sobretudo nas casas habitadas.
  if(opts.chimney!==false)addStoneChimney(g,w*.31,d*.22,6.25);
  addDoor(g,w,d);addPorch(g,w,d);
  // Janelas pequenas, encaixadas na fachada e nas laterais.
  addWindow(g,-w*.31,2.0,-d/2-.16,0,opts.lit!==false);
  addWindow(g,w*.31,2.0,-d/2-.16,0,opts.lit!==false);
  addWindow(g,-w/2-.17,2.0,0,Math.PI/2,false);
  addWindow(g,w/2+.17,2.0,0,-Math.PI/2,opts.lit===true);
  addInterior(g,kind,w,d);
  if(opts.sign)makeSign(g,opts.sign,0,3.13,-d/2-.22,Math.min(w*.62,6.0));
  if(kind==='tavern'){
    addHornPair(g);for(let i=0;i<3;i++)addBarrel(g,-w*.45+i*1.1,.62,-d/2-2.35);
  }
  // Pequena pilha de lenha junto à parede, comum nas casas de clima frio.
  for(let i=0;i<7;i++){
    const L=1.1+rnd()*.55,log=new THREE.Mesh(new THREE.CylinderGeometry(.11,.13,L,7),woodMat);
    log.rotation.z=Math.PI/2;log.position.set(-w*.35+(i%3)*.45,.78+Math.floor(i/3)*.22,d*.5+.5);g.add(log);
  }
  BUILDINGS.push({name,x,z,rot,w,d,doorW:1.55});
  return g;
}

// ============================================================================
// 11. POÇOS, CERCAS, CARROÇAS, CANTEIROS E CAMPOS
// ============================================================================
function makeWell(x,z){
  const g=new THREE.Group();g.position.set(x,groundHeight(x,z),z);scene.add(g);
  const ring=new THREE.Mesh(new THREE.CylinderGeometry(1.35,1.45,.95,12),stoneMat);ring.position.y=.52;ring.castShadow=true;g.add(ring);
  const dark=new THREE.Mesh(new THREE.CylinderGeometry(.92,.92,.16,16),new THREE.MeshBasicMaterial({color:0x172b2d}));dark.position.y=1.03;g.add(dark);
  for(const xx of [-1.05,1.05])box(g,.18,2.3,.18,darkWoodMat,xx,2.1,0);
  box(g,2.7,.18,.18,woodMat,0,3.25,0);
  const axle=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,2.5,8),ironMat);axle.rotation.z=Math.PI/2;axle.position.set(0,2.5,0);g.add(axle);
  const wheel=new THREE.Mesh(new THREE.TorusGeometry(.72,.09,7,16),darkWoodMat);wheel.position.set(1.35,2.48,0);wheel.rotation.y=Math.PI/2;g.add(wheel);
  const rope=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,1.5,6),paleWoodMat);rope.position.set(0,1.75,0);g.add(rope);
  const bucket=new THREE.Mesh(new THREE.CylinderGeometry(.22,.16,.4,9),woodMat);bucket.position.set(0,1.05,0);g.add(bucket);
  return g;
}
function makeFence(points,rails=2){
  for(const [a,b] of points.slice(0,-1).map((p,i)=>[p,points[i+1]])){
    const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),ang=Math.atan2(dz,dx),midX=(a[0]+b[0])/2,midZ=(a[1]+b[1])/2;
    for(let i=0;i<=Math.ceil(len/3);i++){
      const t=i/Math.ceil(len/3),x=a[0]+dx*t,z=a[1]+dz*t;
      const post=box(scene,.16,1.3,.16,darkWoodMat,x,groundHeight(x,z)+.65,z);post.rotation.y=ang;
    }
    for(let r=0;r<rails;r++){
      const y=groundHeight(midX,midZ)+.42+r*.42;
      const beam=box(scene,len,.13,.14,paleWoodMat,midX,y,midZ);beam.rotation.y=ang;
    }
  }
}
function makeWagon(x,z,scale=1,parent=scene){
  const g=new THREE.Group();g.position.set(x,groundHeight(x,z),z);g.rotation.y=.16;g.scale.setScalar(scale);parent.add(g);
  box(g,4.1,.45,2.3,darkWoodMat,0,1.55,0);
  for(let i=0;i<7;i++)box(g,.12,.85,2.2,paleWoodMat,-1.65+i*.55,2.15,0);
  for(const sx of [-1.25,1.25])for(const sz of [-1.25,1.25]){
    const wheel=new THREE.Mesh(new THREE.TorusGeometry(.72,.12,7,14),darkWoodMat);wheel.position.set(sx,.86,sz);wheel.rotation.y=Math.PI/2;g.add(wheel);
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(.17,.17,.25,9),ironMat);hub.rotation.z=Math.PI/2;hub.position.set(sx,.86,sz);g.add(hub);
  }
  logBeam(g,4.5,.1,0,1.25,2.05,'x',darkWoodMat);
  return g;
}
function makeCropField(x,z,w,d,rows=12){
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshStandardMaterial({color:0x9c8859,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.set(x,groundHeight(x,z)+.04,z);scene.add(ground);
  const cropGeo=new THREE.CylinderGeometry(.025,.045,.85,5,1);const cropMat=new THREE.MeshStandardMaterial({color:0x9b8d52,roughness:1});
  const headGeo=new THREE.ConeGeometry(.07,.28,5,1);const headMat=new THREE.MeshStandardMaterial({color:0xb69a61,roughness:1});
  const stems=new THREE.InstancedMesh(cropGeo,cropMat,rows*24),heads=new THREE.InstancedMesh(headGeo,headMat,rows*24);
  let idx=0;
  for(let r=0;r<rows;r++)for(let j=0;j<24;j++){
    const xx=x-w/2+1+j*(w-2)/23,zz=z-d/2+1+r*(d-2)/Math.max(1,rows-1),h=.45+rnd()*.58;
    dummy.position.set(xx,groundHeight(xx,zz)+h*.5,zz);dummy.rotation.set(0,rnd()*Math.PI,0);dummy.scale.set(1,h,1);dummy.updateMatrix();stems.setMatrixAt(idx,dummy.matrix);
    dummy.position.set(xx,groundHeight(xx,zz)+h+.06,zz);dummy.scale.set(1,.65+rnd()*.4,1);dummy.updateMatrix();heads.setMatrixAt(idx,dummy.matrix);idx++;
  }
  stems.instanceMatrix.needsUpdate=true;heads.instanceMatrix.needsUpdate=true;scene.add(stems,heads);
  makeFence([[x-w/2,z-d/2],[x+w/2,z-d/2],[x+w/2,z+d/2],[x-w/2,z+d/2],[x-w/2,z-d/2]],1);
}

// ============================================================================
// 12. EDIFÍCIOS IDENTIFICÁVEIS NAS NARRATIVAS DE ERAGON E ELDEST
//     As coordenadas exatas não são fornecidas; esta disposição é uma hipótese.
// ============================================================================
const tavern=createCabin('Seven Sheaves',76,-42,.08,{w:16,d:12,kind:'tavern',roof:'thatch',sign:'SEVEN SHEAVES',lit:true});
const butcher=createCabin('Açougue de Sloan',18,67,-.18,{w:12.5,d:10,kind:'butcher',roof:'shingle',sign:'AÇOUGUE',lit:true});
const forge=createCabin('Forja de Horst',206,48,.42,{w:14.5,d:12.5,kind:'forge',roof:'shingle',sign:'FORJA DE HORST',lit:true});
const fiskShop=createCabin('Oficina de Fisk',-14,-142,-.26,{w:13,d:10.5,kind:'home',roof:'thatch',sign:'OFICINA',lit:false});
const houses=[
  createCabin('Casa de aldeões A',-12,-20,.24,{w:10.5,d:8.7,roof:'thatch'}),
  createCabin('Casa de aldeões B',150,-145,-.18,{w:11.4,d:9,roof:'shingle'}),
  createCabin('Casa de aldeões C',-18,230,.12,{w:10,d:8.5,roof:'thatch'}),
  createCabin('Casa de aldeões D',267,-65,.48,{w:10.8,d:9.2,roof:'shingle'}),
  createCabin('Casa de aldeões E',276,192,-.28,{w:11.8,d:9.5,roof:'thatch'}),
  createCabin('Casa de aldeões F',92,255,.1,{w:10.5,d:8.7,roof:'shingle'}),
  createCabin('Casa de aldeões G',-22,-250,-.1,{w:10.2,d:8.6,roof:'thatch'}),
  createCabin('Casa de aldeões H',310,5,.18,{w:10.2,d:8.5,roof:'thatch'}),
  createCabin('Casa de aldeões I',172,310,.35,{w:11,d:9,roof:'shingle'})
];
makeWell(3,-94);

// Pequenos jardins, cercas, lenha, ferramentas e áreas de trabalho.
makeFence([[12,110],[55,112],[55,145],[12,145],[12,110]],2);
makeCropField(36,128,35,24,7);
makeCropField(344,126,66,47,13);
makeCropField(360,245,52,38,10);
makeWagon(320,-235,.9);
for(let i=0;i<18;i++){
  const x=190+(rnd()-.5)*28,z=85+(rnd()-.5)*24;
  const wood=new THREE.Mesh(new THREE.CylinderGeometry(.12,.16,1.6+rnd()*1.4,7),woodMat);wood.rotation.z=Math.PI/2;wood.position.set(x,groundHeight(x,z)+.45,z);scene.add(wood);
}

// ============================================================================
