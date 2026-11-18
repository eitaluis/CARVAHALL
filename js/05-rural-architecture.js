// CARVAHALL EM ERAGON — ARQUITETURA E OFÍCIOS DA VILA
// Casas robustas de troncos, telhados baixos de palha ou shingles,
// varandas largas, chaminés, açougue de Sloan, forja de Horst e tanoaria
// de Gedric nos arredores. A disposição exata é uma hipótese espacial.

const BUILDINGS=[];
const smokeSprites=[];
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

function box(parent,w,h,d,mat,x,y,z,rx=0,ry=0,rz=0){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
  mesh.position.set(x,y,z);mesh.rotation.set(rx,ry,rz);
  mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function logBeam(parent,length,radius,x,y,z,axis='x',mat=woodMat){
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius*.94,radius,length,8,1),mat);
  mesh.position.set(x,y,z);
  if(axis==='x')mesh.rotation.z=Math.PI/2;
  else if(axis==='z')mesh.rotation.x=Math.PI/2;
  mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
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
  if(lit){
    const glow=new THREE.PointLight(0xffc47a,.16,7);
    glow.position.set(x,y,z+1.1);parent.add(glow);
  }
}
function addDoor(parent,w,d,doorW=1.5){
  const doorH=2.32,front=-d/2-.12;
  box(parent,doorW+.42,doorH+.28,.28,darkWoodMat,0,1.78,front);
  box(parent,doorW+.14,.13,.34,paleWoodMat,0,3.02,front-.035);
  const leaf=new THREE.Group();leaf.position.set(-doorW/2,0,front-.17);parent.add(leaf);
  box(leaf,doorW,doorH,.17,woodMat,doorW/2,doorH/2,0,0,-.07,0);
  for(let i=0;i<5;i++)box(leaf,.065,doorH-.14,.085,darkWoodMat,.12+i*(doorW-.24)/4,doorH/2,-.105);
  for(const y of [.36,doorH-.34]){
    const hinge=box(leaf,.62,.09,.07,ironMat,.36,y,-.19);
    hinge.rotation.z=.02;
  }
  const latch= new THREE.Mesh(new THREE.SphereGeometry(.075,8,6),ironMat);
  latch.position.set(doorW-.18,1.18,-.19);leaf.add(latch);
  // Porta deixada entreaberta para que a entrada e o interior sejam legíveis.
  leaf.rotation.y=-.62;
}
function addPorch(parent,w,d){
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
  const shape=new THREE.Shape();
  shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(0,rise);shape.closePath();
  const panel=new THREE.Mesh(
    new THREE.ShapeGeometry(shape,16),
    new THREE.MeshStandardMaterial({map:barkTex,color:0x846143,roughness:1,side:THREE.DoubleSide})
  );
  panel.position.set(0,eave,z);panel.castShadow=true;panel.receiveShadow=true;parent.add(panel);
  // Pranchas verticais e travessas dão espessura visual às empenas.
  for(let i=-5;i<=5;i++){
    const x=i*w*.085,height=rise*(1-Math.abs(x)/(w/2));
    if(height>.22)box(parent,.13,height,.12,paleWoodMat,x,eave+height/2,z+(z<0?-.08:.08));
  }
  box(parent,w*.94,.19,.16,darkWoodMat,0,eave+.12,z+(z<0?-.09:.09));
  const king=box(parent,.2,rise,.18,darkWoodMat,0,eave+rise/2,z+(z<0?-.1:.1));
  king.rotation.z=0;
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
  const hearthMat=new THREE.MeshStandardMaterial({color:0x625b4f,roughness:1});
  box(parent,1.75,2.1,1.15,hearthMat,x,1.1,z);
  box(parent,1.13,1.03,.13,darkWoodMat,x,.58,z-.61);
  const fireMat=new THREE.MeshStandardMaterial({
    color:forgeMode?0xff7927:0xffa34a,
    emissive:forgeMode?0xf04a12:0xff8b27,
    emissiveIntensity:forgeMode?1.5:1.0,roughness:.65
  });
  const flame=new THREE.Mesh(new THREE.DodecahedronGeometry(forgeMode?.5:.34,0),fireMat);
  flame.position.set(x,.65,z-.72);parent.add(flame);
  const glow=new THREE.PointLight(forgeMode?0xff7e38:0xffb064,forgeMode?1.1:.65,forgeMode?13:9);
  glow.position.set(x,1.0,z-1);parent.add(glow);
  return flame;
}
function addInterior(parent,kind,w,d){
  const floor=new THREE.Mesh(
    new THREE.BoxGeometry(w-.45,.16,d-.45),
    new THREE.MeshStandardMaterial({color:0x59432e,roughness:1})
  );
  floor.position.set(0,.48,0);parent.add(floor);

  if(kind==='butcher'){
    // Interior apoiado na descrição do açougue: sala ampla, lareira de pedra,
    // balcão simples, chão de palha solta e limpeza rigorosa.
    addHearth(parent,-w*.34,-d*.28,false);
    box(parent,w*.67,.12,1.1,paleWoodMat,0,1.08,d*.28);
    box(parent,w*.68,.12,1.18,darkWoodMat,0,1.42,d*.28);
    const strawMat=new THREE.MeshStandardMaterial({color:0xb8a06a,roughness:1});
    for(let i=0;i<34;i++){
      const straw=new THREE.Mesh(new THREE.CylinderGeometry(.012,.018,.45+rnd()*.65,4),strawMat);
      straw.rotation.z=Math.PI/2+(rnd()-.5)*.35;
      straw.position.set((rnd()-.5)*(w-2),.59+(rnd()-.5)*.04,(rnd()-.5)*(d-2));
      parent.add(straw);
    }
    // Ganchos e facas de açougue, sem exagerar a decoração.
    for(let i=0;i<4;i++){
      const hook=new THREE.Mesh(new THREE.TorusGeometry(.11,.025,5,8,Math.PI),ironMat);
      hook.position.set(-w*.25+i*1.05,2.55,-d*.34);hook.rotation.z=Math.PI;parent.add(hook);
      const blade=box(parent,.045,.46,.035,ironMat,-w*.25+i*1.05,2.17,-d*.34);
      blade.rotation.z=-.08;
    }
  } else if(kind==='forge'){
    addHearth(parent,w*.25,-d*.26,true);
    // Bigorna, bloco de trabalho e ferramentas simples.
    box(parent,1.25,.92,1.05,darkWoodMat,-w*.22,.95,d*.15);
    box(parent,1.55,.22,.74,ironMat,-w*.22,1.52,d*.15);
    box(parent,.5,.28,.35,ironMat,-w*.22,1.74,d*.15);
    box(parent,.82,.62,.8,woodMat,w*.27,.82,d*.25);
    for(let i=0;i<3;i++){
      const tool=logBeam(parent,.95,.045,-w*.22-.8+i*.24,2.05,d*.15,'z',ironMat);
      tool.rotation.x=Math.PI/2;
    }
  } else if(kind==='tavern'){
    // A existência de uma taverna é mencionada em Eragon; nome e decoração
    // específicos não são fornecidos. Bancos e mesas são interpretação.
    addHearth(parent,-w*.34,-d*.28,false);
    for(const z of [-d*.18,d*.19]){
      box(parent,w*.42,.2,1.0,woodMat,0,1.02,z);
      box(parent,w*.44,.16,1.1,paleWoodMat,0,1.48,z);
      for(const x of [-w*.17,w*.17])box(parent,.16,.8,.16,darkWoodMat,x,.94,z+1.0);
    }
  } else {
    addHearth(parent,-w*.3,-d*.26,false);
    // Interior doméstico: mesa, cama, baú, banco e prateleiras.
    box(parent,2.45,.16,1.45,darkWoodMat,w*.18,.92,d*.16);
    box(parent,2.55,.12,1.5,paleWoodMat,w*.18,1.08,d*.16);
    for(const x of [w*.07,w*.29])for(const z of [d*.08,d*.25])
      box(parent,.14,.78,.14,darkWoodMat,x,.45,z);
    box(parent,2.15,.5,3.0,darkWoodMat,-w*.25,.8,d*.23);
    box(parent,2.02,.2,2.75,paleWoodMat,-w*.25,1.14,d*.23);
    box(parent,2.1,.24,2.8,new THREE.MeshStandardMaterial({color:0x74614a,roughness:1}),-w*.25,1.34,d*.23);
    box(parent,1.15,.72,.82,woodMat,w*.31,.85,-d*.15);
    box(parent,1.25,.12,.9,paleWoodMat,w*.31,1.27,-d*.15);
    // Prateleira com louça e pequenos recipientes.
    box(parent,2.8,.14,.55,darkWoodMat,-w*.1,2.52,-d*.38);
    for(let i=0;i<4;i++){
      const pot=new THREE.Mesh(new THREE.SphereGeometry(.16,8,7),new THREE.MeshStandardMaterial({color:0x89785f,roughness:.9}));
      pot.scale.set(.8,1.1,.8);pot.position.set(-w*.2+i*.48,2.73,-d*.35);parent.add(pot);
    }
  }
}
function createCabin(name,x,z,rot=0,opts={}){
  const w=opts.w||13.4,d=opts.d||11.2,base=.58,kind=opts.kind||'home';
  const roofType=opts.roof||'thatch',doorW=opts.doorW||1.65;
  const g=new THREE.Group();
  g.position.set(x,groundHeight(x,z),z);g.rotation.y=rot;scene.add(g);

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
    const frontRafter=logBeam(g,length,.14,xx,eave+rise/2,-run/2,'z',darkWoodMat);
    frontRafter.rotation.x=slope;
    const backRafter=logBeam(g,length,.14,xx,eave+rise/2,run/2,'z',darkWoodMat);
    backRafter.rotation.x=-slope;
  }
  // Caibros visíveis sob o beiral e testeiras nas laterais.
  for(const side of [-1,1]){
    for(const zz of [-d/2-.85,d/2+.85]){
      const brace=box(g,.15,1.5,.17,darkWoodMat,side*(w/2+.35),eave-.35,zz);
      brace.rotation.z=side*.38;
    }
  }

  if(opts.chimney!==false)addStoneChimney(g,w*.29,d*.18,eave+rise+1.1,kind==='forge'||kind==='butcher');
  addDoor(g,w,d,doorW);addPorch(g,w,d);
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
    wood.position.set(-w*.34+(i%3)*.48,.76+Math.floor(i/3)*.22,d*.5+.5);
    g.add(wood);
  }
  if(kind==='tavern'||kind==='butcher'||kind==='forge'){
    addBarrel(g,-w*.38,.04,d*.5+.95,.92);
    addBarrel(g,w*.38,.04,d*.5+.95,.78);
  }else{
    const bucket=new THREE.Mesh(new THREE.CylinderGeometry(.25,.2,.48,9),darkWoodMat);
    bucket.position.set(w*.38,.78,d*.5+.58);g.add(bucket);
    box(g,1.25,.16,.65,paleWoodMat,w*.31,.9,d*.5+.85);
  }
  BUILDINGS.push({name,x,z,rot,w,d,doorW});
  return g;
}

// A tanoaria é situada nos arredores, como no episódio em que Eragon vai
// às tinas de Gedric e ao barracão de peles curtidas.
function createTannery(x,z){
  const w=10,d=8,rot=-.22;
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
  const slope=Math.atan2(1.1,d/2+.25),roofLen=Math.hypot(1.1,d/2+.25);
  box(g,w+.7,.2,roofLen,shingleMat,0,3.38,-d/4,-slope,0,0);
  box(g,w+.7,.2,roofLen,shingleMat,0,3.38,d/4,slope,0,0);
  addDoor(g,w,d,1.35);

  const vatWood=new THREE.MeshStandardMaterial({color:0x64472e,roughness:1});
  const liquid=new THREE.MeshStandardMaterial({color:0x484b3d,roughness:.35});
  for(let i=0;i<3;i++){
    const vx=-8+i*3.5,vz=1.2;
    const vat=new THREE.Mesh(new THREE.CylinderGeometry(.93,1.02,1.35,11),vatWood);
    vat.position.set(vx,.72,vz);vat.castShadow=true;g.add(vat);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(.91,.07,6,14),darkWoodMat);
    rim.rotation.x=Math.PI/2;rim.position.set(vx,1.4,vz);g.add(rim);
    const surface=new THREE.Mesh(new THREE.CircleGeometry(.82,12),liquid);
    surface.rotation.x=-Math.PI/2;surface.position.set(vx,1.405,vz);g.add(surface);
  }

  // Barracão lateral com peles penduradas em fileiras.
  const rackX=7.3,rackZ=-2.4;
  for(const xx of [rackX-1.7,rackX+1.7])box(g,.16,3.3,.16,darkWoodMat,xx,1.7,rackZ);
  logBeam(g,3.5,.12,rackX,3.2,rackZ,'x',darkWoodMat);
  const hideMat=new THREE.MeshStandardMaterial({color:0x6e4a31,roughness:1,side:THREE.DoubleSide});
  for(let i=0;i<4;i++){
    const hide=new THREE.Mesh(new THREE.PlaneGeometry(1.25,2.15),hideMat);
    hide.position.set(rackX-1.3+i*.85,1.92,rackZ-.1);
    hide.rotation.y=(rnd()-.5)*.12;g.add(hide);
  }
  BUILDINGS.push({name:'Tanoaria de Gedric',x,z,rot,w:12,d:9,doorW:1.35});
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
function makeResident(x,z,coatColor,yaw=0,scale=1,gesture=0){
  const g=new THREE.Group();
  g.position.set(x,groundHeight(x,z),z);g.rotation.y=yaw;g.scale.setScalar(scale);
  eveningResidents.add(g);
  const coat=new THREE.MeshStandardMaterial({color:coatColor,roughness:1});
  const linen=new THREE.MeshStandardMaterial({color:0xb8aa8e,roughness:1});
  const skin=new THREE.MeshStandardMaterial({color:0xb28a6a,roughness:1});
  const hair=new THREE.MeshStandardMaterial({color:0x35291f,roughness:1});
  const boots=new THREE.MeshStandardMaterial({color:0x362d25,roughness:1});
  const torso=new THREE.Mesh(new THREE.CylinderGeometry(.27,.34,.95,7),coat);
  torso.position.y=1.13;torso.castShadow=true;g.add(torso);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.205,8,7),skin);
  head.position.y=1.79;g.add(head);
  const cap=new THREE.Mesh(new THREE.SphereGeometry(.218,8,7),hair);
  cap.scale.set(1,.42,1);cap.position.y=1.94;g.add(cap);
  for(const side of [-1,1]){
    const arm=new THREE.Mesh(new THREE.CylinderGeometry(.075,.09,.7,6),coat);
    arm.position.set(side*.34,1.25,0);
    arm.rotation.z=side*(gesture&&side===1?-.75:.12);g.add(arm);
    const leg=new THREE.Mesh(new THREE.CylinderGeometry(.095,.075,.72,6),boots);
    leg.position.set(side*.14,.42,0);g.add(leg);
  }
  const collar=new THREE.Mesh(new THREE.CylinderGeometry(.22,.25,.13,8),linen);
  collar.position.y=1.56;g.add(collar);
  return g;
}
// Homens conversando do lado de fora, perto da taverna.
makeResident(49,-56,0x5b4937,-.2,1.0,1);
makeResident(57,-58,0x384b48,.35,1.02,1);
makeResident(67,-54,0x746144,-.5,.98,0);
// Moradores próximos à rua e ao açougue.
makeResident(3,54,0x5b4537,.2,1.0,1);
makeResident(31,83,0x6d5a43,2.7,.96,0);
// Uma moradora junto à varanda, em posição de chamar alguém para casa.
makeResident(140,-64,0x6e5547,-1.2,.94,1);

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
