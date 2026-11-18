// CARVAHALL EM ERAGON — ARQUITETURA E OFÍCIOS DA VILA
// Casas robustas de troncos, telhados baixos de palha ou shingles,
// varandas largas, chaminés, açougue de Sloan, forja de Horst e tanoaria
// de Gedric nos arredores. A disposição exata é uma hipótese espacial.

const BUILDINGS=[];
const smokeSprites=[];
const eveningActors=[];
const smokeCanvas=document.createElement('canvas');
smokeCanvas.width=smokeCanvas.height=128;
const smokeCtx=smokeCanvas.getContext('2d');
const smokeGrad=smokeCtx.createRadialGradient(64,64,3,64,64,62);
smokeGrad.addColorStop(0,'rgba(83,79,70,.38)');
smokeGrad.addColorStop(.45,'rgba(104,100,90,.17)');
smokeGrad.addColorStop(1,'rgba(122,117,104,0)');
smokeCtx.fillStyle=smokeGrad;smokeCtx.fillRect(0,0,128,128);
const smokeTexture=new THREE.CanvasTexture(smokeCanvas);
smokeTexture.colorSpace=THREE.SRGBColorSpace;

// Geometrias cúbicas compartilhadas: muitas tábuas e peças repetem dimensões.
const boxGeometryCache=new Map();
function sharedBoxGeometry(w,h,d){
  const key=[w,h,d].map(v=>Number(v).toFixed(3)).join("|");
  let geometry=boxGeometryCache.get(key);
  if(!geometry){
    geometry=new THREE.BoxGeometry(w,h,d);
    boxGeometryCache.set(key,geometry);
  }
  return geometry;
}

function box(parent,w,h,d,mat,x,y,z,rx=0,ry=0,rz=0){
  return softBox(parent,w,h,d,mat,x,y,z,rx,ry,rz);
}
function softBox(parent,w,h,d,mat,x,y,z,rx=0,ry=0,rz=0){
  // Geometria leve: milhares de peças da vila não devem gerar ExtrudeGeometry
  // individual. O detalhe de superfície vem dos materiais e das peças de madeira.
  const geo=sharedBoxGeometry(w,h,d);
  const mesh=new THREE.Mesh(geo,mat);
  mesh.position.set(x,y,z);mesh.rotation.set(rx,ry,rz);
  mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function logBeam(parent,length,radius,x,y,z,axis='x',mat=woodMat){
  const beamGeo=new THREE.CylinderGeometry(radius*.94,radius,length,22,5);
  const bp=beamGeo.attributes.position;
  for(let i=0;i<bp.count;i++){
    const yy=bp.getY(i),xx=bp.getX(i),zz=bp.getZ(i),angle=Math.atan2(zz,xx);
    const rough=1+.026*Math.sin(angle*3+yy*1.8)+.014*Math.sin(angle*7-yy*3);
    bp.setXYZ(i,xx*rough+Math.sin(yy*2.4)*radius*.035,yy,zz*rough+Math.cos(yy*1.9)*radius*.028);
  }
  beamGeo.computeVertexNormals();
  const mesh=new THREE.Mesh(beamGeo,mat);mesh.position.set(x,y,z);
  if(axis==='x')mesh.rotation.z=Math.PI/2;
  else if(axis==='z')mesh.rotation.x=Math.PI/2;
  mesh.castShadow=false;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function beamBetween(parent,start,end,radius,mat,segments=12){
  const delta=new THREE.Vector3().subVectors(end,start);
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius*.88,radius,delta.length(),segments,3),mat);
  mesh.position.copy(start).add(end).multiplyScalar(.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
  mesh.castShadow=false;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function addRoofHalf(parent,w,run,eave,rise,side,material){
  const halfWidth=w/2+1.05,thickness=.24;
  const top=[[-halfWidth,eave+rise,0],[halfWidth,eave+rise,0],[halfWidth,eave,side*run],[-halfWidth,eave,side*run]];
  const vertices=[];
  for(const p of top)vertices.push(...p);
  for(const p of top)vertices.push(p[0],p[1]-thickness,p[2]);
  const uv=[0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1];
  const indices=[0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,1,2,6,1,6,5,2,3,7,2,7,6,3,0,4,3,4,7];
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setIndex(indices);
  const flat=geo.toNonIndexed();flat.computeVertexNormals();material.side=THREE.DoubleSide;
  const mesh=new THREE.Mesh(flat,material);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function addStoneChimney(parent,x,z,yTop=6.0,sooty=false){
  const h=yTop-2.2;
  box(parent,1.08,h,1.08,stoneMat,x,2.2+h/2,z);
  const soot=sooty?cliffDarkMat:stoneMat;
  for(let i=0;i<8;i++){
    const y=2.36+i*.42;
    box(parent,1.15,.12,1.15,soot,x+(rnd()-.5)*.04,y,z+(rnd()-.5)*.04);
  }
  box(parent,1.34,.18,1.34,cliffDarkMat,x,yTop,z);
  const opening=new THREE.Mesh(new THREE.BoxGeometry(.58,.06,.58),new THREE.MeshBasicMaterial({color:0x191714}));
  opening.position.set(x,yTop+.11,z);parent.add(opening);
  for(let i=0;i<5;i++){
    const puff=new THREE.Sprite(new THREE.SpriteMaterial({
      map:smokeTexture,color:sooty?0x77736b:0xd0cbc0,
      transparent:true,opacity:sooty?.16:.105,depthWrite:false
    }));
    puff.scale.set(2.1+rnd()*.8,2.5+rnd()*.9,1);
    puff.position.set(x+(rnd()-.5)*.7,yTop+.4+i*.72,z+(rnd()-.5)*.45);
    puff.userData.baseY=puff.position.y;puff.userData.phase=rnd()*6.28;
    parent.add(puff);smokeSprites.push(puff);
  }
}
function addWindow(parent,x,y,z,rotY=0,lit=false){
  const frame=new THREE.Group();frame.position.set(x,y,z);frame.rotation.y=rotY;parent.add(frame);
  box(frame,1.34,1.18,.2,darkWoodMat,0,0,0);
  box(frame,1.02,.88,.10,lit?warmGlassMat:glassMat,0,.015,.12);
  box(frame,.105,.94,.11,paleWoodMat,0,0,.2);
  box(frame,1.08,.105,.11,paleWoodMat,0,0,.2);
  // Batentes laterais, peitoril profundo e pingadeira.
  box(frame,.11,1.05,.14,darkWoodMat,-.73,0,.02);
  box(frame,.11,1.05,.14,darkWoodMat,.73,0,.02);
  box(frame,1.55,.13,.34,woodMat,0,-.61,.13);
  box(frame,1.48,.11,.25,darkWoodMat,0,.66,.02);
  // Duas folhas de veneziana, com réguas aparentes e ferragens.
  for(const side of [-1,1]){
    const shutter=new THREE.Group();shutter.position.set(side*.82,0,.09);frame.add(shutter);
    box(shutter,.32,.94,.11,woodMat,0,0,0);
    for(let row=0;row<5;row++)box(shutter,.29,.075,.045,paleWoodMat,0,-.35+row*.17,.075);
    box(shutter,.35,.08,.07,darkWoodMat,0,.46,.04);
    box(shutter,.35,.08,.07,darkWoodMat,0,-.46,.04);
    const hinge=box(shutter,.045,.22,.06,ironMat,side*.12,0,.105);
    hinge.rotation.z=.12;
  }
}
function addDoor(parent,w,d,doorW=1.5){
  const front=-d/2-.19,doorH=2.42;
  beamBetween(parent,new THREE.Vector3(-doorW/2-.14,.58,front),new THREE.Vector3(-doorW/2-.14,3.0,front),.115,darkWoodMat);
  beamBetween(parent,new THREE.Vector3(doorW/2+.14,.58,front),new THREE.Vector3(doorW/2+.14,3.0,front),.115,darkWoodMat);
  const arch=new THREE.CatmullRomCurve3([
    new THREE.Vector3(-doorW/2-.18,2.92,front),new THREE.Vector3(-doorW*.28,3.13,front),
    new THREE.Vector3(0,3.22,front),new THREE.Vector3(doorW*.28,3.13,front),
    new THREE.Vector3(doorW/2+.18,2.92,front)
  ]);
  parent.add(new THREE.Mesh(new THREE.TubeGeometry(arch,18,.105,9,false),woodMat));
  const leaf=new THREE.Group();leaf.position.set(-doorW/2,.58,front-.12);parent.add(leaf);
  const shape=new THREE.Shape();shape.moveTo(0,0);shape.lineTo(doorW,0);shape.lineTo(doorW,2.12);
  shape.quadraticCurveTo(doorW,2.42,doorW/2,2.42);shape.quadraticCurveTo(0,2.42,0,2.12);shape.closePath();
  const geo=new THREE.ExtrudeGeometry(shape,{depth:.13,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.025,bevelThickness:.025,curveSegments:10});
  leaf.add(new THREE.Mesh(geo,woodMat));
  for(let i=0;i<5;i++)box(leaf,.055,2.24,.045,darkWoodMat,.11+i*(doorW-.22)/4,1.16,-.16);
  for(const yy of [.42,2.08])box(leaf,.58,.075,.055,ironMat,.34,yy,-.21);
  const handle=new THREE.Mesh(new THREE.SphereGeometry(.065,12,9),ironMat);
  handle.position.set(doorW-.19,1.2,-.22);leaf.add(handle);leaf.rotation.y=-.48;
}
function addPorch(parent,w,d,roofMat=thatchMat){
  const depth=3.05,z=-d/2-depth/2,front=-d/2-depth;
  box(parent,w*.9,.24,depth,woodMat,0,.62,z);
  for(const x of [-w*.42,-w*.14,w*.14,w*.42]){
    box(parent,.22,2.85,.22,darkWoodMat,x,1.98,front+.16);
    box(parent,.3,.18,.3,paleWoodMat,x,3.43,front+.16);
    const brace=box(parent,1.15,.14,.16,darkWoodMat,x+(x<0?.36:-.36),3.03,front+.18);
    brace.rotation.z=x<0?-.72:.72;
  }
  box(parent,w*.96,.22,.27,darkWoodMat,0,3.34,front+.16);
  box(parent,w*.97,.17,.24,woodMat,0,3.58,front+.16);
  // Cobertura inclinada da varanda: deixa a entrada visualmente abrigada,
  // com caibros aparentes e beiral à frente dos pilares.
  const canopyDepth=depth+.5,canopyRise=.52;
  const canopyLength=Math.hypot(canopyDepth,canopyRise);
  const canopySlope=Math.atan2(canopyRise,canopyDepth);
  const canopyCenterZ=-d/2-canopyDepth/2+.12;
  const canopyCenterY=4.15;
  box(parent,w+1.05,.2,canopyLength,roofMat,0,canopyCenterY,canopyCenterZ,-canopySlope,0,0);
  for(let i=0;i<7;i++){
    const x=-w*.43+i*w*.143;
    const rafter=box(parent,.13,.15,canopyLength,darkWoodMat,x,canopyCenterY-.12,canopyCenterZ,-canopySlope);
  }
  box(parent,w+1.1,.2,.18,darkWoodMat,0,3.53,front-.28);
  // Guarda-corpos baixos e corrimãos nas laterais da varanda.
  for(const x of [-w*.46,w*.46]){
    box(parent,.17,.72,depth*.82,darkWoodMat,x,.98,z);
    for(const zz of [-depth*.36,depth*.36])box(parent,.18,1.03,.18,paleWoodMat,x,1.05,z+zz);
    box(parent,.16,.14,depth*.88,paleWoodMat,x,1.42,z);
  }
  // Três degraus de madeira, largos e visíveis na aproximação.
  for(let step=0;step<3;step++){
    box(parent,w*.28,.17,.54,paleWoodMat,0,.49-step*.16,front-.28-step*.48);
  }
  // Banco corrido encostado à fachada.
  box(parent,w*.28,.15,.58,darkWoodMat,w*.23,.94,-d/2-.39);
  for(const x of [w*.11,w*.35])box(parent,.12,.72,.13,darkWoodMat,x,.58,-d/2-.39);
}
function addGableEnd(parent,w,z,eave,rise){
  const shape=new THREE.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(0,rise);shape.closePath();
  const panel=new THREE.Mesh(new THREE.ShapeGeometry(shape,24),new THREE.MeshStandardMaterial({map:barkTex,color:0x92714f,roughness:1,side:THREE.DoubleSide}));
  panel.position.set(0,eave,z);panel.castShadow=true;panel.receiveShadow=true;parent.add(panel);
  const offset=z<0?-.12:.12;
  beamBetween(parent,new THREE.Vector3(-w/2,eave,z),new THREE.Vector3(0,eave+rise,z),.16,darkWoodMat);
  beamBetween(parent,new THREE.Vector3(0,eave+rise,z),new THREE.Vector3(w/2,eave,z),.16,darkWoodMat);
  beamBetween(parent,new THREE.Vector3(-w/2,eave+.08,z+offset),new THREE.Vector3(w/2,eave+.08,z+offset),.11,woodMat);
  beamBetween(parent,new THREE.Vector3(0,eave+.12,z+offset),new THREE.Vector3(0,eave+rise-.12,z+offset),.09,darkWoodMat);
  for(let i=-4;i<=4;i++){
    const x=i*w*.095,height=rise*(1-Math.abs(x)/(w/2));
    if(height>.45)box(parent,.11,height*.84,.075,paleWoodMat,x,eave+height*.43,z+offset*1.2);
  }
}
function addBarrel(parent,x,y,z,scale=1){
  const body=new THREE.Mesh(new THREE.CylinderGeometry(.43*scale,.36*scale,1.05*scale,12,1),woodMat);
  body.position.set(x,y+.53*scale,z);body.castShadow=true;body.receiveShadow=true;parent.add(body);
  for(const yy of [.22,.82]){
    const hoop=new THREE.Mesh(new THREE.TorusGeometry(.405*scale,.035*scale,6,14),ironMat);
    hoop.rotation.x=Math.PI/2;hoop.position.set(x,y+yy*scale,z);parent.add(hoop);
  }
  const lid=new THREE.Mesh(new THREE.CircleGeometry(.37*scale,12),darkWoodMat);
  lid.rotation.x=-Math.PI/2;lid.position.set(x,y+1.06*scale,z);parent.add(lid);
  return body;
}
function addHearth(parent,x,z,forgeMode=false){
  const masonry=new THREE.MeshStandardMaterial({color:forgeMode?0x5c5750:0x756b5d,map:stoneTex,normalMap:stoneNormalTex,normalScale:new THREE.Vector2(.24,.24),roughness:1});
  const rockGeo=new THREE.IcosahedronGeometry(1,1);
  for(let row=0;row<3;row++)for(let i=0;i<(row===1?5:4);i++){
    const side=(i-(row===1?2:1.5))*.38+(row%2)*.12;
    const stone=new THREE.Mesh(rockGeo,masonry);
    stone.position.set(x+side,.34+row*.34,z-.48);
    stone.scale.set(.30+rnd()*.07,.24+rnd()*.05,.23+rnd()*.04);
    stone.rotation.set(rnd()*.12,rnd()*Math.PI,rnd()*.12);parent.add(stone);
  }
  const back=new THREE.Mesh(new THREE.SphereGeometry(.56,16,12),new THREE.MeshStandardMaterial({color:0x171512,roughness:1}));
  back.scale.set(1,.94,.12);back.position.set(x,.88,z-.55);parent.add(back);
  const fireMat=new THREE.MeshStandardMaterial({color:forgeMode?0xff7927:0xffa34a,emissive:forgeMode?0xf04a12:0xff8b27,emissiveIntensity:forgeMode?1.8:1.1,roughness:.55});
  const flame=new THREE.Group();
  for(let i=0;i<3;i++){
    const core=new THREE.Mesh(new THREE.ConeGeometry(.18-i*.025,.62+i*.12,9,3),fireMat);
    core.position.set((i-1)*.16,.75+i*.05,-.72+(i%2)*.04);core.rotation.z=(i-1)*.16;flame.add(core);
  }
  flame.position.set(x,0,z);parent.add(flame);
  const glow=new THREE.PointLight(forgeMode?0xff7938:0xffad62,forgeMode?1.4:.9,forgeMode?17:12);
  glow.position.set(x,1,z-1.05);parent.add(glow);
  beamBetween(parent,new THREE.Vector3(x-.78,1.48,z-.43),new THREE.Vector3(x+.78,1.48,z-.43),.105,masonry);
  return flame;
}
function makeOvalTable(parent,x,z,width,depth,height=1.02,material=woodMat){
  const top=new THREE.Mesh(new THREE.CylinderGeometry(.5,.52,.14,24,2),material);
  top.scale.set(width,1,depth);top.position.set(x,height,z);top.castShadow=true;top.receiveShadow=true;parent.add(top);
  const legGeo=new THREE.CylinderGeometry(.065,.105,Math.max(.35,height-.68),9,2);
  for(const sx of [-1,1])for(const sz of [-1,1]){
    const leg=new THREE.Mesh(legGeo,darkWoodMat);
    leg.position.set(x+sx*width*.72,height/2-.02,z+sz*depth*.70);parent.add(leg);
  }
  beamBetween(parent,new THREE.Vector3(x-width*.7,height*.48,z),new THREE.Vector3(x+width*.7,height*.48,z),.045,darkWoodMat,8);
}
function makeSeat(parent,x,z,length=.95){
  const top=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,.12,16,1),woodMat);
  top.scale.set(length,.7,.34);top.position.set(x,.91,z);top.castShadow=true;parent.add(top);
  for(const sx of [-1,1]){
    const leg=new THREE.Mesh(new THREE.CylinderGeometry(.055,.085,.50,8),darkWoodMat);
    leg.position.set(x+sx*length*.65,.69,z);parent.add(leg);
  }
}
function addInterior(parent,kind,w,d,eave=4.25,rise=2.8){
  const floorTop=.59;
  const floorMat=new THREE.MeshStandardMaterial({color:0x604a34,roughness:.98,map:barkTex});
  softBox(parent,w-.55,.15,d-.55,floorMat,0,.49,0);
  // Tábuas estreitas no sentido do comprimento, com juntas visíveis.
  const floorPalette=[woodMat,darkWoodMat,paleWoodMat],boardCount=Math.floor((w-1)/.34);
  for(let i=0;i<boardCount;i++){
    const x=-(boardCount-1)*.17+i*.34;
    softBox(parent,.30,.045,d-.85,floorPalette[i%3],x,floorTop,0);
  }
  // Rodapés, postes e caibros fecham a leitura do cômodo.
  for(const side of [-1,1]){
    const z=side*(d/2-.38);
    softBox(parent,w-1,.12,.13,darkWoodMat,0,.78,z);
    for(let x=-w*.42;x<=w*.42;x+=Math.max(2.5,w*.25))
      beamBetween(parent,new THREE.Vector3(x,.66,z),new THREE.Vector3(x,Math.min(eave-.28,4.15),z),.075,woodMat);
  }
  for(const side of [-1,1]){
    const x=side*(w/2-.40);
    softBox(parent,.13,.12,d-.9,darkWoodMat,x,.78,0);
    for(let z=-d*.34;z<=d*.34;z+=d*.34)
      beamBetween(parent,new THREE.Vector3(x,.66,z),new THREE.Vector3(x,Math.min(eave-.28,4.15),z),.075,woodMat);
  }
  for(let x=-w*.42;x<=w*.42;x+=2.5){
    beamBetween(parent,new THREE.Vector3(x,eave+rise-.22,0),new THREE.Vector3(x,eave-.12,-Math.min(d/2-.25,d/2+.85)),.085,darkWoodMat);
    beamBetween(parent,new THREE.Vector3(x,eave+rise-.22,0),new THREE.Vector3(x,eave-.12,Math.min(d/2-.25,d/2+.85)),.085,darkWoodMat);
  }
  for(const z of [-d*.32,0,d*.32])logBeam(parent,w-1.1,.10,0,eave-.18,z,'x',darkWoodMat);

  const warmRoomLight=new THREE.PointLight(kind==='forge'?0xff9a55:0xffc17a,kind==='forge'?1.35:.92,kind==='forge'?22:18);
  warmRoomLight.position.set(0,3.1,0);parent.add(warmRoomLight);
  const secondaryGlow=new THREE.Mesh(new THREE.SphereGeometry(.12,10,8),warmGlassMat);
  secondaryGlow.position.set(-w*.28,2.2,-d*.25);parent.add(secondaryGlow);
  const wallShelf=(x,y,z,length)=>{
    softBox(parent,length,.12,.34,darkWoodMat,x,y,z);
    for(let n=0;n<Math.max(2,Math.floor(length/.72));n++){
      const px=x-length*.42+n*(length*.84/Math.max(1,Math.floor(length/.72)-1));
      beamBetween(parent,new THREE.Vector3(px,y-.05,z),new THREE.Vector3(px,y-.48,z),.035,woodMat,7);
    }
  };
  if(kind==='butcher'){
    addHearth(parent,-w*.34,-d*.28,false);
    makeOvalTable(parent,w*.12,d*.28,w*.30,.48,1.12,paleWoodMat);
    makeOvalTable(parent,-w*.20,d*.02,1.22,.62,.98,woodMat);
    wallShelf(w*.28,2.65,-d*.39,3.7);
    for(let i=0;i<5;i++){
      const hook=new THREE.Mesh(new THREE.TorusGeometry(.105,.022,6,12,Math.PI),ironMat);
      hook.rotation.z=Math.PI;hook.position.set(-w*.25+i*1.05,2.45,-d*.38);parent.add(hook);
      const blade=new THREE.Mesh(new THREE.CapsuleGeometry(.035,.29,3,7),ironMat);
      blade.position.set(-w*.25+i*1.05,2.05,-d*.38);blade.rotation.z=.08;parent.add(blade);
    }
    const block=new THREE.Mesh(new THREE.CylinderGeometry(.42,.48,.76,14,2),woodMat);
    block.position.set(-w*.30,.99,d*.25);block.castShadow=true;parent.add(block);
  }else if(kind==='forge'){
    addHearth(parent,-w*.30,-d*.28,true);
    const anvilShape=new THREE.Shape();
    anvilShape.moveTo(-.55,0);anvilShape.lineTo(-.43,.24);anvilShape.lineTo(-.22,.36);
    anvilShape.lineTo(-.19,.68);anvilShape.lineTo(-.49,.77);anvilShape.lineTo(-.49,.91);
    anvilShape.lineTo(.42,.91);anvilShape.lineTo(.42,.76);anvilShape.lineTo(.18,.67);
    anvilShape.lineTo(.18,.36);anvilShape.lineTo(.42,.24);anvilShape.lineTo(.55,0);anvilShape.closePath();
    const anvilGeo=new THREE.ExtrudeGeometry(anvilShape,{depth:.42,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.035,bevelThickness:.035,curveSegments:6});
    const anvil=new THREE.Mesh(anvilGeo,ironMat);anvil.position.set(-w*.05,.65,-d*.02);anvil.castShadow=true;parent.add(anvil);
    const horn=new THREE.Mesh(new THREE.CylinderGeometry(.025,.15,.62,12,3),ironMat);
    horn.rotation.z=Math.PI/2;horn.position.set(-w*.05-.78,1.45,-d*.02);parent.add(horn);
    makeOvalTable(parent,w*.29,d*.22,2.5,.58,.95,darkWoodMat);
    const tub=new THREE.Mesh(new THREE.CylinderGeometry(.73,.82,.74,18,2,true),darkWoodMat);
    tub.position.set(w*.28,.94,d*.34);parent.add(tub);
    const water=new THREE.Mesh(new THREE.CircleGeometry(.68,24),new THREE.MeshStandardMaterial({color:0x5e7f81,roughness:.18,metalness:.08}));
    water.rotation.x=-Math.PI/2;water.position.set(w*.28,1.32,d*.34);parent.add(water);
    wallShelf(w*.30,2.78,-d*.39,4.0);
    for(let i=0;i<7;i++){
      const tool=new THREE.Mesh(new THREE.CylinderGeometry(.035,.045,.86,8),woodMat);
      tool.position.set(-w*.18+i*.62,2.05,-d*.37);tool.rotation.z=(i%2?-.12:.12);parent.add(tool);
    }
  }else if(kind==='tavern'){
    addHearth(parent,-w*.34,-d*.28,false);
    makeOvalTable(parent,0,d*.31,w*.53,.49,1.12,woodMat);
    for(const x of [-w*.28,-w*.09,w*.12,w*.29]){
      const mug=new THREE.Mesh(new THREE.CylinderGeometry(.085,.095,.22,12),new THREE.MeshStandardMaterial({color:0x8c7458,roughness:.9}));
      mug.position.set(x,1.31,d*.31);parent.add(mug);
      const rim=new THREE.Mesh(new THREE.TorusGeometry(.09,.016,5,12),darkWoodMat);
      rim.rotation.x=Math.PI/2;rim.position.set(x,1.43,d*.31);parent.add(rim);
    }
    for(const [x,z] of [[-w*.26,-.25],[w*.23,-.15],[-w*.05,d*.02]]){
      makeOvalTable(parent,x,z,1.12,.82,.99,woodMat);
      for(const [dx,dz] of [[-.95,0],[.95,0],[0,-.82],[0,.82]])makeSeat(parent,x+dx,z+dz,.72);
    }
    wallShelf(w*.28,2.72,d*.38,4.4);
    for(const side of [-1,1]){
      const curve=new THREE.CatmullRomCurve3([
        new THREE.Vector3(side*.2,2.8,0),new THREE.Vector3(side*.54,2.86,0),
        new THREE.Vector3(side*.88,3.08,.02),new THREE.Vector3(side*1.15,3.40,.04)
      ]);
      const horn=new THREE.Mesh(new THREE.TubeGeometry(curve,18,.085,9,false),darkWoodMat);
      horn.position.set(0,0,-d*.43);parent.add(horn);
    }
  }else if(kind==='tannery'){
    makeOvalTable(parent,-w*.22,d*.12,w*.32,.48,1.02,darkWoodMat);
    makeOvalTable(parent,w*.24,-d*.12,w*.25,.45,.92,woodMat);
    wallShelf(w*.20,2.5,-d*.37,3.3);
    const tub=new THREE.Mesh(new THREE.CylinderGeometry(.78,.85,.8,18,2,true),darkWoodMat);
    tub.position.set(0,.98,d*.28);parent.add(tub);
  }else{
    addHearth(parent,-w*.32,-d*.27,false);
    const bedX=-w*.22,bedZ=d*.20;
    softBox(parent,2.25,.28,3.0,darkWoodMat,bedX,.78,bedZ);
    for(const [dx,dz] of [[-1,-1.35],[1,-1.35],[-1,1.35],[1,1.35]]){
      const post=new THREE.Mesh(new THREE.CylinderGeometry(.06,.085,.68,9),woodMat);
      post.position.set(bedX+dx*.88,.87,bedZ+dz*.82);parent.add(post);
    }
    const mattress=new THREE.Mesh(new THREE.CapsuleGeometry(.48,2.05,5,12),linen);
    mattress.rotation.x=Math.PI/2;mattress.position.set(bedX,1.0,bedZ);mattress.scale.set(.9,.72,.75);parent.add(mattress);
    const blanket=new THREE.Mesh(new THREE.SphereGeometry(1,16,10),new THREE.MeshStandardMaterial({color:0x887052,roughness:1}));
    blanket.scale.set(1,.12,1.22);blanket.position.set(bedX,1.18,bedZ+.48);parent.add(blanket);
    makeOvalTable(parent,w*.22,-d*.12,1.45,.82,.96,woodMat);
    makeSeat(parent,w*.22+1.25,-d*.12,.72);
    softBox(parent,1.1,.78,.85,darkWoodMat,w*.30,.98,d*.31);
    wallShelf(w*.25,2.72,-d*.38,3.5);
    for(let i=0;i<4;i++){
      const bowl=new THREE.Mesh(new THREE.SphereGeometry(.15,12,9,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0x987d5d,roughness:1}));
      bowl.position.set(-w*.18+i*.55,2.82,-d*.35);parent.add(bowl);
    }
  }
}
function createCabin(name,x,z,rot=0,opts={}){
  const w=opts.w||13.4,d=opts.d||11.2,base=.58,kind=opts.kind||'home';
  const roofType=opts.roof||'thatch',doorW=opts.doorW||1.65;
  const g=new THREE.Group();
  const facing=rot+Math.PI; // Fachadas voltadas para a aproximação pela rua principal.
  g.position.set(x,groundHeight(x,z),z);g.rotation.y=facing;scene.add(g);

  // Fundação irregular de pedra e soleira elevada de madeira.
  for(const xx of [-w/2+.7,w/2-.7])for(const zz of [-d/2+.7,d/2-.7]){
    const stone=new THREE.Mesh(new THREE.IcosahedronGeometry(.62,1),stoneMat);
    stone.position.set(xx,.3,zz);stone.scale.set(1.15,.58,1.05);g.add(stone);
  }
  box(g,w,.24,d,darkWoodMat,0,.48,0);

  // Paredes de troncos grossos, encaixados nos cantos e com sombras entre cursos.
  const radius=.235,step=.415,rows=9;
  for(let i=0;i<rows;i++){
    const y=base+i*step,mat=i%4===0?darkWoodMat:woodMat;
    logBeam(g,d+1.15,radius,-w/2,y,0,'z',mat);
    logBeam(g,d+1.15,radius,w/2,y,0,'z',mat);
    if(y-base<2.12){
      const segment=(w-doorW)/2;
      logBeam(g,segment+.25,radius,-w/2+segment/2,y,-d/2,'x',mat);
      logBeam(g,segment+.25,radius,w/2-segment/2,y,-d/2,'x',mat);
    }else logBeam(g,w+1.15,radius,0,y,-d/2,'x',mat);
    logBeam(g,w+1.15,radius,0,y,d/2,'x',mat);
  }

  // Empenas preenchidas, estrutura de sustentação e telhado inclinado com beirais largos.
  const eave=base+rows*step+.14,rise=1.78,run=d/2+1.12;
  addGableEnd(g,w,-d/2-.07,eave,rise);
  addGableEnd(g,w,d/2+.07,eave,rise);
  const slope=Math.atan2(rise,run),length=Math.hypot(run,rise);
  const roofMat=roofType==='shingle'?shingleMat:thatchMat;
  box(g,w+2.0,.30,length,roofMat,0,eave+rise/2,-run/2,-slope,0,0);
  box(g,w+2.0,.30,length,roofMat,0,eave+rise/2,run/2,slope,0,0);
  logBeam(g,w+1.65,.2,0,eave+rise+.02,0,'x',darkWoodMat);
  for(const xx of [-w/2-.5,w/2+.5]){
    // Caibros acompanham a inclinação do telhado; não são postes verticais.
    box(g,.17,.17,length,darkWoodMat,xx,eave+rise/2,-run/2,-slope);
    box(g,.17,.17,length,darkWoodMat,xx,eave+rise/2,run/2,slope);
  }
  // Mãos-francesas curtas sob os beirais laterais.
  for(const side of [-1,1]){
    for(const zz of [-d/2-.72,d/2+.72]){
      const bracket=box(g,.16,.16,.9,darkWoodMat,side*(w/2+.12),eave-.18,zz,.52,0,0);
    }
  }

  if(opts.chimney!==false)addStoneChimney(g,w*.29,d*.18,eave+rise+1.1,kind==='forge'||kind==='butcher');
  addDoor(g,w,d,doorW);addPorch(g,w,d,roofMat);
  addWindow(g,-w*.31,2.35,-d/2-.18,0,opts.lit!==false);
  addWindow(g,w*.31,2.35,-d/2-.18,0,opts.lit!==false);
  addWindow(g,-w/2-.18,2.35,0,Math.PI/2,false);
  addWindow(g,w/2+.18,2.35,0,-Math.PI/2,opts.lit===true);
  addInterior(g,kind,w,d);

  // Elementos de uso diário junto à entrada.
  for(let i=0;i<7;i++){
    const L=1.25+rnd()*.65;
    const wood=new THREE.Mesh(new THREE.CylinderGeometry(.11,.13,L,8),woodMat);
    wood.rotation.z=Math.PI/2;
    wood.position.set(-w*.54+(i%3)*.42,.76+Math.floor(i/3)*.22,-d*.5-2.25);
    g.add(wood);
  }
  if(kind==='tavern'||kind==='butcher'||kind==='forge'){
    addBarrel(g,-w*.52,.04,-d*.5-3.45,.92);
    addBarrel(g,w*.52,.04,-d*.5-3.45,.78);
  }else{
    const bucket=new THREE.Mesh(new THREE.CylinderGeometry(.25,.2,.48,9),darkWoodMat);
    bucket.position.set(w*.53,.78,-d*.5-2.45);g.add(bucket);
    box(g,1.25,.16,.65,paleWoodMat,w*.53,.9,-d*.5-2.8);
  }
  BUILDINGS.push({name,x,z,rot:facing,w,d,doorW});
  return g;
}

// A tanoaria é situada nos arredores, como no episódio em que Eragon vai
// às tinas de Gedric e ao barracão de peles curtidas.
function createTannery(x,z){
  const w=12.5,d=10,rot=-.22;
  const g=new THREE.Group();g.position.set(x,groundHeight(x,z),z);g.rotation.y=rot;scene.add(g);
  for(let i=0;i<6;i++){
    const y=.62+i*.36,mat=i%3===0?darkWoodMat:woodMat;
    logBeam(g,d+.45,.18,-w/2,y,0,'z',mat);
    logBeam(g,d+.45,.18,w/2,y,0,'z',mat);
    if(y-.62<1.95){
      const side=(w-1.35)/2;
      logBeam(g,side+.15,.18,-w/2+side/2,y,-d/2,'x',mat);
      logBeam(g,side+.15,.18,w/2-side/2,y,-d/2,'x',mat);
    }else logBeam(g,w+.45,.18,0,y,-d/2,'x',mat);
    logBeam(g,w+.45,.18,0,y,d/2,'x',mat);
  }
  const shedEave=2.92,shedRise=1.15;
  addGableEnd(g,w,-d/2-.06,shedEave,shedRise);
  addGableEnd(g,w,d/2+.06,shedEave,shedRise);
  const slope=Math.atan2(shedRise,d/2+.25),roofLen=Math.hypot(shedRise,d/2+.25);
  box(g,w+1.1,.24,roofLen,shingleMat,0,shedEave+shedRise/2,-(d/2+.25)/2,-slope,0,0);
  box(g,w+1.1,.24,roofLen,shingleMat,0,shedEave+shedRise/2,(d/2+.25)/2,slope,0,0);
  addDoor(g,w,d,1.35);

  // O barracão fica encaixado numa encosta irregular, com terra e rocha
  // subindo atrás da construção em vez de uma parede artificial isolada.
  {
    const nx=34,nz=30,verts=[],uv=[],indices=[];
    const baseY=groundHeight(x,z),cos=Math.cos(rot),sin=Math.sin(rot);
    for(let j=0;j<=nz;j++){
      const v=j/nz,lz=3+v*35;
      for(let i=0;i<=nx;i++){
        const lx=-18+i/nx*36;
        const wx=x+cos*lx+sin*lz,wz=z-sin*lx+cos*lz;
        const side=Math.pow(Math.max(0,1-Math.abs(lx)/18),.72);
        const rise=(.25+Math.pow(v,1.18)*9.4)*side;
        const rough=(fbm(wx*.028,wz*.028,3)-.5)*1.35*side;
        verts.push(lx,groundHeight(wx,wz)-baseY+rise+rough,lz);
        uv.push(i/nx*4,v*4);
        if(i<nx&&j<nz){
          const a=j*(nx+1)+i,b=a+1,d=(j+1)*(nx+1)+i,e=d+1;
          indices.push(a,d,b,b,d,e);
        }
      }
    }
    const bankGeo=new THREE.BufferGeometry();
    bankGeo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
    bankGeo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    bankGeo.setIndex(indices);bankGeo.computeVertexNormals();
    const bank=new THREE.Mesh(bankGeo,new THREE.MeshStandardMaterial({
      map:groundTex,normalMap:groundNormalTex,normalScale:new THREE.Vector2(.2,.2),
      color:0x8f7d5c,roughness:1,side:THREE.DoubleSide
    }));
    bank.receiveShadow=true;g.add(bank);
  }

  // Pátio de trabalho em terra batida e três tinas grandes à frente do barracão.
  const yard=new THREE.Mesh(new THREE.PlaneGeometry(18,8),
    new THREE.MeshStandardMaterial({map:groundTex,normalMap:groundNormalTex,
      normalScale:new THREE.Vector2(.15,.15),color:0x96805a,roughness:1}));
  yard.rotation.x=-Math.PI/2;yard.position.set(0,.055,-d/2-3.9);g.add(yard);

  const vatWood=new THREE.MeshStandardMaterial({color:0x64472e,map:barkTex,roughness:1});
  const liquid=new THREE.MeshStandardMaterial({color:0x484b3d,roughness:.35});
  for(let i=0;i<3;i++){
    const vx=-4.8+i*4.8,vz=-d/2-3.6;
    const vat=new THREE.Mesh(new THREE.CylinderGeometry(1.08,1.18,1.55,16,2),vatWood);
    vat.position.set(vx,.82,vz);vat.castShadow=true;vat.receiveShadow=true;g.add(vat);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(1.05,.075,7,18),darkWoodMat);
    rim.rotation.x=Math.PI/2;rim.position.set(vx,1.62,vz);g.add(rim);
    const surface=new THREE.Mesh(new THREE.CircleGeometry(.94,18),liquid);
    surface.rotation.x=-Math.PI/2;surface.position.set(vx,1.625,vz);g.add(surface);
    for(let stave=0;stave<8;stave++){
      const angle=stave/8*Math.PI*2;
      const slat=new THREE.Mesh(new THREE.BoxGeometry(.055,1.38,.08),paleWoodMat);
      slat.position.set(vx+Math.cos(angle)*1.08,.82,vz+Math.sin(angle)*1.08);
      slat.rotation.y=-angle;g.add(slat);
    }
  }
  // Banco de raspagem, baldes e pilhas de couro pronto.
  box(g,3.8,.22,1.0,darkWoodMat,-1.2,.78,-d/2-7.2);
  box(g,3.9,.14,1.08,paleWoodMat,-1.2,.96,-d/2-7.2);
  addBarrel(g,6.1,.03,-d/2-4.2,.82);
  for(let i=0;i<3;i++){
    const hideRoll=new THREE.Mesh(new THREE.CylinderGeometry(.28,.32,1.25,10),new THREE.MeshStandardMaterial({color:0x72523a,roughness:1}));
    hideRoll.rotation.z=Math.PI/2;
    hideRoll.position.set(-6.8+i*.52,.42,-d/2-5.9);g.add(hideRoll);
  }

  // Barracão lateral com peles penduradas em fileiras.
  const rackX=4.2,rackZ=1.6;
  for(const xx of [rackX-1.7,rackX+1.7])box(g,.16,3.3,.16,darkWoodMat,xx,1.7,rackZ);
  logBeam(g,3.5,.12,rackX,3.2,rackZ,'x',darkWoodMat);
  const hideMat=new THREE.MeshStandardMaterial({color:0x6e4a31,roughness:1,side:THREE.DoubleSide});
  for(let i=0;i<4;i++){
    const hide=new THREE.Mesh(new THREE.PlaneGeometry(1.25,2.15),hideMat);
    hide.position.set(rackX-1.3+i*.85,1.92,rackZ-.1);
    hide.rotation.y=(rnd()-.5)*.12;g.add(hide);
  }
  BUILDINGS.push({name:'Tanoaria de Gedric',x,z,rot,w:12.5,d:10,doorW:1.35});
  return g;
}

// Disposição compacta, em pequenos espaços entre construções; coordenadas
// individuais não são fornecidas pelo texto e permanecem explicitamente
// interpretativas. O núcleo é uma clusterização de casas, não um quarteirão.
const villageTavern=createCabin('Taverna (nome não indicado)',76,-42,.08,{w:18,d:14,kind:'tavern',roof:'thatch'});
const butcher=createCabin('Açougue de Sloan',18,67,-.18,{w:19,d:14,kind:'butcher',roof:'shingle',lit:true});
const forge=createCabin('Forja de Horst',206,48,.42,{w:20,d:16,kind:'forge',roof:'shingle',lit:true});
const tannery=createTannery(-96,174);

const villageHouses=[
  createCabin('Casa de aldeões A',28,-18,.24,{w:13.2,d:10.5,roof:'thatch'}),
  createCabin('Casa de aldeões B',126,-73,-.18,{w:13.8,d:11,roof:'shingle'}),
  createCabin('Casa de aldeões C',192,-28,.12,{w:13.4,d:10.8,roof:'thatch'}),
  createCabin('Casa de aldeões D',255,2,.48,{w:13.6,d:10.8,roof:'shingle'}),
  createCabin('Casa de aldeões E',-18,111,-.28,{w:14.2,d:11.3,roof:'thatch'}),
  createCabin('Casa de aldeões F',69,151,.1,{w:13.2,d:10.5,roof:'shingle'}),
  createCabin('Casa de aldeões G',153,145,-.1,{w:13,d:10.5,roof:'thatch'}),
  createCabin('Casa de aldeões H',246,120,.18,{w:13.2,d:10.5,roof:'thatch'}),
  createCabin('Casa de aldeões I',-48,35,.35,{w:13.5,d:10.8,roof:'shingle'}),
  createCabin('Casa de aldeões J',289,-74,-.2,{w:13.4,d:10.8,roof:'thatch'}),
  createCabin('Casa de aldeões K',-27,220,.14,{w:13.2,d:10.7,roof:'shingle'}),
  createCabin('Casa de aldeões L',206,214,-.3,{w:13.8,d:11,roof:'thatch'})
];

// Pequenos grupos de moradores ao anoitecer, sugerindo a vida social descrita
// no romance. Roupas, rostos e posições individuais são escolhas interpretativas.
const eveningResidents=new THREE.Group();
scene.add(eveningResidents);
function makeResident(x,z,coatColor,yaw=0,scale=1,gesture=0,role='villager'){
  const g=new THREE.Group();g.position.set(x,groundHeight(x,z),z);g.rotation.y=yaw;g.scale.setScalar(scale);
  g.userData.baseY=g.position.y;g.userData.baseYaw=yaw;g.userData.baseX=x;g.userData.baseZ=z;g.userData.phase=rnd()*Math.PI*2;g.userData.gesture=gesture;g.userData.role=role;
  eveningResidents.add(g);
  const coat=new THREE.MeshStandardMaterial({color:coatColor,roughness:.94});
  const linen=new THREE.MeshStandardMaterial({color:role==='woman'||role==='katrina'?0x9d806d:0xb8aa8e,roughness:1});
  const skin=new THREE.MeshStandardMaterial({color:role==='sloan'?0x9b755e:0xb98d6d,roughness:.96});
  const hair=new THREE.MeshStandardMaterial({color:role==='horst'?0x4b382c:role==='sloan'?0x777064:0x35291f,roughness:1});
  const boots=new THREE.MeshStandardMaterial({color:0x362d25,roughness:1});
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.31,.62,5,12),coat);
  torso.position.y=1.12;torso.castShadow=true;g.add(torso);
  const chest=new THREE.Mesh(new THREE.SphereGeometry(.34,14,12),coat);
  chest.scale.set(1,.48,.76);chest.position.set(0,1.47,0);g.add(chest);
  const headPivot=new THREE.Group();headPivot.position.y=1.72;g.add(headPivot);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.205,18,14),skin);
  head.scale.set(.92,1.12,.94);head.position.y=.12;headPivot.add(head);
  const hairCap=new THREE.Mesh(new THREE.SphereGeometry(.218,16,12),hair);
  hairCap.scale.set(1,.53,1);hairCap.position.set(0,.27,-.015);headPivot.add(hairCap);
  const eyeMat=new THREE.MeshStandardMaterial({color:0x29241f,roughness:1});
  for(const side of [-1,1]){
    const eye=new THREE.Mesh(new THREE.SphereGeometry(.022,10,8),eyeMat);
    eye.position.set(side*.071,.125,.183);headPivot.add(eye);
    const brow=new THREE.Mesh(new THREE.CapsuleGeometry(.012,.055,3,6),hair);
    brow.position.set(side*.071,.17,.18);brow.rotation.z=side*.08;headPivot.add(brow);
    const ear=new THREE.Mesh(new THREE.SphereGeometry(.052,10,8),skin);
    ear.scale.set(.62,1,.68);ear.position.set(side*.19,.11,0);headPivot.add(ear);
  }
  const nose=new THREE.Mesh(new THREE.SphereGeometry(.035,10,8),skin);
  nose.scale.set(.72,1.25,1.5);nose.position.set(0,.075,.198);headPivot.add(nose);
  const neck=new THREE.Mesh(new THREE.CapsuleGeometry(.075,.13,3,9),skin);
  neck.position.y=1.63;g.add(neck);
  const armPivots=[],legPivots=[];
  for(const side of [-1,1]){
    const shoulder=new THREE.Group();shoulder.position.set(side*.34,1.47,0);g.add(shoulder);
    const sleeve=new THREE.Mesh(new THREE.CapsuleGeometry(.083,.48,4,10),coat);
    sleeve.position.set(side*.015,-.29,0);sleeve.rotation.z=side*.12;shoulder.add(sleeve);
    const cuff=new THREE.Mesh(new THREE.SphereGeometry(.085,10,8),linen);
    cuff.scale.set(1,.48,1);cuff.position.set(side*.018,-.55,0);shoulder.add(cuff);
    const hand=new THREE.Mesh(new THREE.SphereGeometry(.075,12,9),skin);
    hand.position.set(side*.025,-.64,.025);shoulder.add(hand);
    for(let finger=0;finger<4;finger++){
      const digit=new THREE.Mesh(new THREE.CapsuleGeometry(.014,.052,3,6),skin);
      digit.position.set(side*.025+(finger-1.5)*.027,-.705,.055);
      digit.rotation.x=-.18;shoulder.add(digit);
    }
    const thumb=new THREE.Mesh(new THREE.CapsuleGeometry(.018,.045,3,6),skin);
    thumb.position.set(side*.09,-.67,.035);thumb.rotation.z=side*.75;shoulder.add(thumb);
    armPivots.push({pivot:shoulder,side,base:0});
    const hip=new THREE.Group();hip.position.set(side*.145,.72,0);g.add(hip);
    const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.095,.48,4,10),role==='woman'||role==='katrina'?linen:boots);
    leg.position.y=-.31;hip.add(leg);
    const boot=new THREE.Mesh(new THREE.SphereGeometry(.12,12,9),boots);
    boot.scale.set(.9,.55,1.55);boot.position.set(0,-.61,.075);hip.add(boot);
    legPivots.push({pivot:hip,side});
  }
  const collar=new THREE.Mesh(new THREE.CylinderGeometry(.205,.24,.13,16),linen);
  collar.position.y=1.51;g.add(collar);
  const belt=new THREE.Mesh(new THREE.TorusGeometry(.29,.025,7,24),darkWoodMat);
  belt.position.y=.83;belt.rotation.x=Math.PI/2;g.add(belt);
  const hem=new THREE.Mesh(new THREE.CylinderGeometry(.32,.37,.15,16),role==='woman'||role==='katrina'?linen:coat);
  hem.position.y=.66;g.add(hem);
  // Costuras, carcela e pequenos botões quebram a silhueta lisa da roupa.
  const seamMat=new THREE.MeshStandardMaterial({color:role==='woman'||role==='katrina'?0x6f5748:0x3e3429,roughness:1});
  for(const side of [-1,1]){
    const seamCurve=new THREE.CatmullRomCurve3([
      new THREE.Vector3(side*.16,1.38,.245),
      new THREE.Vector3(side*.19,1.18,.286),
      new THREE.Vector3(side*.18,.91,.292),
      new THREE.Vector3(side*.16,.72,.265)
    ]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(seamCurve,10,.009,5,false),seamMat));
  }
  for(const y of [1.34,1.16,.98]){
    const button=new THREE.Mesh(new THREE.SphereGeometry(.025,8,6),ironMat);
    button.position.set(0,y,.292);g.add(button);
  }
  // Bolsa de couro e fivela simples, presas ao cinto.
  const pouch=softBox(g,.22,.24,.12,darkWoodMat,.245,.84,.205,0,0,-.08);
  const pouchFlap=softBox(g,.24,.07,.135,woodMat,.245,.96,.215);
  const buckle=new THREE.Mesh(new THREE.BoxGeometry(.095,.09,.025),ironMat);
  buckle.position.set(0,.84,.325);g.add(buckle);
  if(role==='horst'||role==='sloan'){
    const beard=new THREE.Mesh(new THREE.SphereGeometry(.14,14,11),hair);
    beard.scale.set(.95,1.35,.8);beard.position.set(0,1.67,.16);g.add(beard);
    const apron=new THREE.Mesh(new THREE.CapsuleGeometry(.19,.48,4,10),new THREE.MeshStandardMaterial({color:role==='horst'?0x4a3829:0x544538,roughness:1}));
    apron.scale.set(1,.9,.22);apron.position.set(0,1.03,.24);g.add(apron);
    const strap=softBox(g,.065,.64,.035,darkWoodMat,-.2,1.22,.245,0,0,-.25);
  }
  if(role==='katrina'||role==='woman'){
    const skirtGeo=new THREE.LatheGeometry([
      new THREE.Vector2(.22,0),new THREE.Vector2(.25,.12),new THREE.Vector2(.31,.35),
      new THREE.Vector2(.39,.64),new THREE.Vector2(.42,.76)
    ],20);
    const skirt=new THREE.Mesh(skirtGeo,linen);skirt.position.y=.23;g.add(skirt);
    const shawl=new THREE.Mesh(new THREE.SphereGeometry(.37,14,10),new THREE.MeshStandardMaterial({color:0x8d5140,roughness:1}));
    shawl.scale.set(1,.28,.7);shawl.position.set(0,1.48,-.015);g.add(shawl);
  }
  g.userData.animationRig={headPivot,armPivots,legPivots,torso};
  eveningActors.push(g);return g;
}
// Homens conversando do lado de fora, perto da taverna.
makeResident(49,-56,0x5b4937,-.2,1.0,1);
makeResident(57,-58,0x384b48,.35,1.02,1);
makeResident(67,-54,0x746144,-.5,.98,0);
// Moradores próximos à rua e ao açougue.
makeResident(3,54,0x5b4537,.2,1.0,1);
makeResident(31,83,0x6d5a43,2.7,.96,0);
// Uma moradora junto à varanda, em posição de chamar alguém para casa.
makeResident(140,-64,0x6e5547,-1.2,.94,1,'woman');
// Figuras identificáveis da cena do açougue: Horst, Sloan e Katrina.
// Traços físicos não especificados no texto permanecem escolhas discretas de arte.
makeResident(9,61,0x574536,.15,1.12,1,'sloan');
makeResident(25,58,0x4b4034,2.9,1.16,1,'horst');
makeResident(35,70,0x765b4d,2.1,.98,0,'katrina');
// Moradores adicionais na rua principal: pequenos encontros em pontos diferentes,
// com fases de animação independentes e circulação preservada.
makeResident(88,-8,0x62503c,.3,.98,1);
makeResident(108,-22,0x46504c,2.0,1.02,0);
makeResident(143,-7,0x80634d,-1.1,.96,0,'woman');
makeResident(164,18,0x5b493b,.8,1.0,1);

// Cercas baixas e pequenos campos quadrados nas bordas da povoação.
function makeFence(points,rails=1){
  for(const [a,b] of points.slice(0,-1).map((p,i)=>[p,points[i+1]])){
    const dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);
    const angle=Math.atan2(dz,dx),midX=(a[0]+b[0])/2,midZ=(a[1]+b[1])/2;
    const steps=Math.max(1,Math.ceil(length/3.2));
    for(let i=0;i<=steps;i++){
      const t=i/steps,x=a[0]+dx*t,z=a[1]+dz*t;
      const post=box(scene,.14,1.05,.14,darkWoodMat,x,groundHeight(x,z)+.53,z);
      post.rotation.y=angle;
    }
    for(let r=0;r<rails;r++){
      const y=groundHeight(midX,midZ)+.42+r*.36;
      const rail=box(scene,length,.12,.13,paleWoodMat,midX,y,midZ);rail.rotation.y=angle;
    }
  }
}
function makeCropField(x,z,w,d,rows=8){
  const earth=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshStandardMaterial({color:0x9b895f,roughness:1}));
  earth.rotation.x=-Math.PI/2;earth.position.set(x,groundHeight(x,z)+.035,z);scene.add(earth);
  const cropGeo=new THREE.CylinderGeometry(.025,.045,.62,5,1);
  const cropMat=new THREE.MeshStandardMaterial({color:0xa18b59,roughness:1});
  const headGeo=new THREE.ConeGeometry(.065,.23,5,1);
  const headMat=new THREE.MeshStandardMaterial({color:0xb59b67,roughness:1});
  const count=rows*20;
  const stems=new THREE.InstancedMesh(cropGeo,cropMat,count),heads=new THREE.InstancedMesh(headGeo,headMat,count);
  const cropDummy=new THREE.Object3D();let index=0;
  for(let r=0;r<rows;r++)for(let j=0;j<20;j++){
    const xx=x-w/2+1+j*(w-2)/19,zz=z-d/2+1+r*(d-2)/Math.max(1,rows-1),height=.25+rnd()*.5;
    cropDummy.position.set(xx,groundHeight(xx,zz)+height*.5,zz);
    cropDummy.rotation.y=rnd()*Math.PI;cropDummy.scale.set(1,height,1);cropDummy.updateMatrix();stems.setMatrixAt(index,cropDummy.matrix);
    cropDummy.position.set(xx,groundHeight(xx,zz)+height+.05,zz);
    cropDummy.scale.set(1,.55+rnd()*.35,1);cropDummy.updateMatrix();heads.setMatrixAt(index,cropDummy.matrix);index++;
  }
  stems.instanceMatrix.needsUpdate=true;heads.instanceMatrix.needsUpdate=true;scene.add(stems,heads);
  makeFence([[x-w/2,z-d/2],[x+w/2,z-d/2],[x+w/2,z+d/2],[x-w/2,z+d/2],[x-w/2,z-d/2]],1);
}

// Os campos aparecem como pequenas parcelas separadas ao redor do vilarejo,
// conforme a visão distante do vale; não são plantações extensas dentro da vila.
makeCropField(386,178,38,38,7);
makeCropField(448,278,34,34,7);
makeCropField(-294,105,36,36,7);

// Pilha de lenha e área de trabalho junto à forja de Horst.
for(let i=0;i<12;i++){
  const x=214+(rnd()-.5)*7,z=72+(rnd()-.5)*5;
  const wood=new THREE.Mesh(new THREE.CylinderGeometry(.12,.15,1.8+rnd()*.8,7),woodMat);
  wood.rotation.z=Math.PI/2;wood.position.set(x,groundHeight(x,z)+.42+i%3*.18,z);scene.add(wood);
}

// ============================================================================
