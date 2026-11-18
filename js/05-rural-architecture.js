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
  mesh.castShadow=false;mesh.receiveShadow=true;parent.add(mesh);return mesh;
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
  const floorMat=new THREE.MeshStandardMaterial({color:0x59432e,roughness:1});
  const floor=new THREE.Mesh(new THREE.BoxGeometry(w-.45,.16,d-.45),floorMat);
  floor.position.set(0,.48,0);parent.add(floor);
  // Tábuas individuais, travessas e luz ambiente tornam o espaço legível
  // quando observado da porta; a disposição do mobiliário é interpretativa.
  const plankMat=[darkWoodMat,woodMat,paleWoodMat];
  for(let i=0;i<Math.floor((w-.8)/1.05);i++){
    const x=-(w-.8)/2+i*1.05;
    box(parent,1.0,.035,d-.8,plankMat[i%3],x,.585,0);
    box(parent,.035,.035,d-.8,darkWoodMat,x+.5,.586,0);
  }
  for(const z of [-d*.39,d*.39]){
    box(parent,w-.9,.18,.2,darkWoodMat,0,4.18,z);
    for(let x=-w*.42;x<=w*.42;x+=w*.21)
      box(parent,.16,.62,.18,darkWoodMat,x,3.9,z);
  }
  const warmRoomLight=new THREE.PointLight(kind==='forge'?0xff9a55:0xffc17a,kind==='forge'?1.05:.72,kind==='forge'?18:14);
  warmRoomLight.position.set(0,3.25,0);parent.add(warmRoomLight);
  const wallShelf=(x,y,z,length)=>{
    box(parent,length,.13,.5,darkWoodMat,x,y,z);
    for(let i=0;i<Math.max(2,Math.floor(length/.55));i++){
      const px=x-length*.42+i*(length*.84/Math.max(1,Math.floor(length/.55)-1));
      box(parent,.09,.45,.1,darkWoodMat,px,y-.28,z+.13);
    }
  };

  if(kind==='butcher'){
    // Açougue de Sloan: sala ampla, lareira de pedra, balcão simples ao fundo,
    // piso de palha e limpeza rigorosa — sem aparência de loja moderna.
    addHearth(parent,-w*.34,-d*.28,false);
    box(parent,w*.67,.12,1.1,paleWoodMat,0,1.08,d*.28);
    box(parent,w*.68,.12,1.18,darkWoodMat,0,1.42,d*.28);
    for(let i=0;i<7;i++)box(parent,.045,.48,.055,darkWoodMat,-w*.29+i*w*.096,1.72,d*.28);
    const strawMat=new THREE.MeshStandardMaterial({color:0xb8a06a,roughness:1});
    for(let i=0;i<34;i++){
      const straw=new THREE.Mesh(new THREE.CylinderGeometry(.012,.018,.45+rnd()*.65,4),strawMat);
      straw.rotation.z=Math.PI/2+(rnd()-.5)*.35;
      straw.position.set((rnd()-.5)*(w-2),.61,(rnd()-.5)*(d-2));parent.add(straw);
    }
    for(let i=0;i<4;i++){
      const hook=new THREE.Mesh(new THREE.TorusGeometry(.11,.025,5,8,Math.PI),ironMat);
      hook.position.set(-w*.25+i*1.05,2.55,-d*.34);hook.rotation.z=Math.PI;parent.add(hook);
      const blade=box(parent,.045,.46,.035,ironMat,-w*.25+i*1.05,2.17,-d*.34);blade.rotation.z=-.08;
    }
    wallShelf(w*.29,2.7,-d*.39,3.4);
  } else if(kind==='forge'){
    addHearth(parent,w*.25,-d*.26,true);
    const anvilX=-w*.22,anvilZ=d*.15;
    box(parent,1.3,.94,1.08,darkWoodMat,anvilX,.95,anvilZ);
    box(parent,1.6,.2,.78,ironMat,anvilX,1.53,anvilZ);
    box(parent,1.18,.28,.62,ironMat,anvilX,1.76,anvilZ);
    const horn=new THREE.Mesh(new THREE.CylinderGeometry(.055,.19,.72,9),ironMat);
    horn.rotation.z=Math.PI/2;horn.position.set(anvilX-.98,1.68,anvilZ);parent.add(horn);
    box(parent,.42,.25,.65,ironMat,anvilX+.95,1.68,anvilZ);
    for(const sx of [-.48,.48])for(const sz of [-.34,.34])box(parent,.14,.4,.14,ironMat,anvilX+sx,.24,anvilZ+sz);
    const leather=new THREE.MeshStandardMaterial({color:0x68452f,roughness:1});
    box(parent,1.35,.62,.48,leather,w*.33,1.05,-d*.12,0,0,-.18);
    box(parent,1.42,.1,.55,darkWoodMat,w*.33,1.38,-d*.12,0,0,-.18);
    const nozzle=new THREE.Mesh(new THREE.CylinderGeometry(.09,.13,.85,8),ironMat);
    nozzle.rotation.z=Math.PI/2;nozzle.position.set(w*.24,1.22,-d*.2);parent.add(nozzle);
    const trough=new THREE.Mesh(new THREE.BoxGeometry(2.25,.68,.82),darkWoodMat);
    trough.position.set(-w*.05,.47,d*.34);parent.add(trough);
    const water=new THREE.Mesh(new THREE.BoxGeometry(2.0,.055,.58),new THREE.MeshStandardMaterial({color:0x536f70,roughness:.25,metalness:.12}));
    water.position.set(-w*.05,.83,d*.34);parent.add(water);
    for(let i=0;i<5;i++)logBeam(parent,1.15,.07,-w*.33+i*.42,1.95,d*.3,'x',ironMat);
    const rackZ=-d*.41;box(parent,w*.43,.16,.2,darkWoodMat,0,2.65,rackZ);
    for(let i=0;i<6;i++){
      const tx=-w*.19+i*w*.076;
      const handle=new THREE.Mesh(new THREE.CylinderGeometry(.045,.06,.78,7),woodMat);
      handle.position.set(tx,2.12,rackZ-.12);parent.add(handle);
      box(parent,.46,.17,.22,ironMat,tx,2.47,rackZ-.12);
    }
    box(parent,2.9,.2,1.0,darkWoodMat,w*.32,.95,d*.24);
    box(parent,2.98,.12,1.08,paleWoodMat,w*.32,1.12,d*.24);
    for(let i=0;i<4;i++)logBeam(parent,.9,.035,w*.22+i*.22,1.82,d*.24,'z',ironMat);
    // Escória, barras e tenazes junto à área de trabalho.
    for(let i=0;i<8;i++){
      const billet=box(parent,.85,.09,.12,i%2?ironMat:darkWoodMat,-w*.39+(i%4)*.42,.68+i%2*.1,-d*.03+Math.floor(i/4)*.25);
      billet.rotation.y=(rnd()-.5)*.18;
    }
  } else if(kind==='tavern'){
    // Morn's tavern: bar longo e baixo; os chifres de Urgal sobre a entrada
    // e os bastões riscados são detalhes descritos no primeiro romance.
    addHearth(parent,-w*.34,-d*.28,false);
    box(parent,w*.68,.22,1.05,darkWoodMat,0,1.05,-d*.27);
    box(parent,w*.7,.14,1.12,paleWoodMat,0,1.23,-d*.27);
    for(let i=0;i<9;i++){
      const stave=box(parent,.09,.48,.09,woodMat,-w*.29+i*w*.073,1.55,-d*.27);
      stave.rotation.z=(rnd()-.5)*.05;
      for(let mark=0;mark<3;mark++)box(parent,.012,.12,.012,ironMat,-w*.29+i*w*.073-.025,1.42+mark*.12,-d*.315);
    }
    for(const z of [-d*.04,d*.29]){
      box(parent,w*.39,.18,.95,woodMat,0,1.02,z);
      box(parent,w*.41,.14,1.02,paleWoodMat,0,1.43,z);
      for(const side of [-1,1]){
        const benchZ=z+side*.91;
        box(parent,w*.3,.16,.43,darkWoodMat,0,.68,benchZ);
        for(const x of [-w*.13,w*.13])box(parent,.12,.58,.12,darkWoodMat,x,.37,benchZ);
      }
      for(let i=0;i<4;i++){
        const mug=new THREE.Mesh(new THREE.CylinderGeometry(.09,.1,.24,9),new THREE.MeshStandardMaterial({color:0x8b765d,roughness:.9}));
        mug.position.set(-w*.14+i*w*.095,1.54,z);parent.add(mug);
        const rim=new THREE.Mesh(new THREE.TorusGeometry(.09,.018,5,10),darkWoodMat);
        rim.rotation.x=Math.PI/2;rim.position.set(-w*.14+i*w*.095,1.67,z);parent.add(rim);
      }
    }
    // Par de chifres curvos, montados acima do campo de visão da porta.
    for(const side of [-1,1]){
      const hornCurve=new THREE.CatmullRomCurve3([
        new THREE.Vector3(side*.22,2.75,0),new THREE.Vector3(side*.55,2.82,0),
        new THREE.Vector3(side*.9,3.08,0),new THREE.Vector3(side*1.18,3.42,.02)
      ]);
      const hornMesh=new THREE.Mesh(new THREE.TubeGeometry(hornCurve,12,.105,7,false),darkWoodMat);
      hornMesh.position.set(0,0,-d*.43);parent.add(hornMesh);
    }
    addBarrel(parent,-w*.36,.05,d*.29,.9);addBarrel(parent,w*.36,.05,d*.29,.9);
    wallShelf(w*.27,2.65,d*.37,4.2);
  } else {
    addHearth(parent,-w*.3,-d*.26,false);
    box(parent,2.45,.16,1.45,darkWoodMat,w*.18,.92,d*.16);
    box(parent,2.55,.12,1.5,paleWoodMat,w*.18,1.08,d*.16);
    for(const x of [w*.07,w*.29])for(const z of [d*.08,d*.25])box(parent,.14,.78,.14,darkWoodMat,x,.45,z);
    box(parent,2.15,.5,3.0,darkWoodMat,-w*.25,.8,d*.23);
    box(parent,2.02,.2,2.75,paleWoodMat,-w*.25,1.14,d*.23);
    box(parent,2.1,.24,2.8,new THREE.MeshStandardMaterial({color:0x74614a,roughness:1}),-w*.25,1.34,d*.23);
    box(parent,1.15,.72,.82,woodMat,w*.31,.85,-d*.15);
    box(parent,1.25,.12,.9,paleWoodMat,w*.31,1.27,-d*.15);
    box(parent,2.8,.14,.55,darkWoodMat,-w*.1,2.52,-d*.38);
    for(let i=0;i<4;i++){
      const pot=new THREE.Mesh(new THREE.SphereGeometry(.16,8,7),new THREE.MeshStandardMaterial({color:0x89785f,roughness:.9}));
      pot.scale.set(.8,1.1,.8);pot.position.set(-w*.2+i*.48,2.73,-d*.35);parent.add(pot);
    }
    // Baú menor, banquinho, cesto e utensílios domésticos.
    box(parent,1.25,.82,1.0,darkWoodMat,-w*.37,.91,-d*.12);
    for(let i=0;i<5;i++){
      const bowl=new THREE.Mesh(new THREE.SphereGeometry(.17,8,6,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0x987d5d,roughness:1}));
      bowl.position.set(-w*.16+i*.55,1.7,-d*.36);parent.add(bowl);
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
  const g=new THREE.Group();
  g.position.set(x,groundHeight(x,z),z);g.rotation.y=yaw;g.scale.setScalar(scale);
  g.userData.baseYaw=yaw;g.userData.phase=rnd()*6.28;g.userData.gesture=gesture;g.userData.role=role;
  const movingArms=[];eveningResidents.add(g);
  const coat=new THREE.MeshStandardMaterial({color:coatColor,roughness:1});
  const linen=new THREE.MeshStandardMaterial({color:role==='woman'?0x9d806d:0xb8aa8e,roughness:1});
  const skin=new THREE.MeshStandardMaterial({color:role==='sloan'?0x9b755e:0xb98d6d,roughness:1});
  const hair=new THREE.MeshStandardMaterial({color:role==='horst'?0x4b382c:role==='sloan'?0x777064:0x35291f,roughness:1});
  const boots=new THREE.MeshStandardMaterial({color:0x362d25,roughness:1});
  const torso=new THREE.Mesh(new THREE.CylinderGeometry(.3,.38,1.0,9),coat);
  torso.position.y=1.12;torso.castShadow=true;g.add(torso);
  const shoulder=new THREE.Mesh(new THREE.CylinderGeometry(.39,.34,.25,9),coat);
  shoulder.position.y=1.52;g.add(shoulder);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.215,12,10),skin);
  head.position.y=1.82;head.scale.set(1,1.12,.92);g.add(head);
  const neck=new THREE.Mesh(new THREE.CylinderGeometry(.095,.11,.2,8),skin);
  neck.position.y=1.63;g.add(neck);
  const cap=new THREE.Mesh(new THREE.SphereGeometry(.225,10,8),hair);
  cap.scale.set(1,.48,1);cap.position.y=2.01;g.add(cap);
  // Face with visible brow, eyes, nose and ears; keep details readable at street distance.
  const eyeMat=new THREE.MeshStandardMaterial({color:0x29241f,roughness:1});
  for(const side of [-1,1]){
    const eye=new THREE.Mesh(new THREE.SphereGeometry(.027,7,6),eyeMat);
    eye.position.set(side*.078,1.84,.19);g.add(eye);
    const brow=new THREE.Mesh(new THREE.BoxGeometry(.075,.025,.035),hair);
    brow.position.set(side*.078,1.9,.185);g.add(brow);
    const ear=new THREE.Mesh(new THREE.SphereGeometry(.065,7,6),skin);
    ear.position.set(side*.215,1.81,0);ear.scale.set(.65,1,.65);g.add(ear);
    const arm=new THREE.Mesh(new THREE.CylinderGeometry(.085,.105,.72,8),coat);
    arm.position.set(side*.39,1.25,0);
    arm.rotation.z=side*(gesture&&side===1?-.68:.1);arm.castShadow=true;g.add(arm);
    movingArms.push({mesh:arm,side,baseZ:arm.rotation.z});
    const hand=new THREE.Mesh(new THREE.SphereGeometry(.095,7,6),skin);
    hand.position.set(side*.4,.88,.015);g.add(hand);
    const leg=new THREE.Mesh(new THREE.CylinderGeometry(.105,.085,.72,8),boots);
    leg.position.set(side*.15,.42,0);g.add(leg);
    const boot=new THREE.Mesh(new THREE.BoxGeometry(.2,.16,.34),boots);
    boot.position.set(side*.15,.1,.07);g.add(boot);
  }
  const nose=new THREE.Mesh(new THREE.ConeGeometry(.052,.13,6),skin);
  nose.position.set(0,1.77,.205);nose.rotation.x=Math.PI/2;g.add(nose);
  const collar=new THREE.Mesh(new THREE.CylinderGeometry(.24,.27,.15,9),linen);
  collar.position.y=1.55;g.add(collar);
  // Camadas de roupa, cinto e barra da túnica em vez de um único bloco colorido.
  const belt=new THREE.Mesh(new THREE.TorusGeometry(.29,.035,5,12),darkWoodMat);
  belt.position.y=.82;belt.rotation.x=Math.PI/2;g.add(belt);
  const hem=new THREE.Mesh(new THREE.CylinderGeometry(.39,.43,.16,9),role==='woman'?linen:coat);
  hem.position.y=.65;g.add(hem);
  if(role==='horst'){
    const beard=new THREE.Mesh(new THREE.ConeGeometry(.19,.48,9),hair);
    beard.position.set(0,1.48,.18);beard.rotation.x=-.12;g.add(beard);
    const apron=new THREE.Mesh(new THREE.BoxGeometry(.43,.72,.07),new THREE.MeshStandardMaterial({color:0x4a3829,roughness:1}));
    apron.position.set(0,1.02,.23);g.add(apron);
    const strap=new THREE.Mesh(new THREE.BoxGeometry(.07,.66,.07),darkWoodMat);
    strap.position.set(-.22,1.17,.2);strap.rotation.z=-.25;g.add(strap);
  }else if(role==='sloan'){
    const beard=new THREE.Mesh(new THREE.SphereGeometry(.16,9,7),hair);
    beard.scale.set(1,1.3,.8);beard.position.set(0,1.58,.15);g.add(beard);
    const apron=new THREE.Mesh(new THREE.BoxGeometry(.5,.78,.08),new THREE.MeshStandardMaterial({color:0x544538,roughness:1}));
    apron.position.set(0,1.03,.22);g.add(apron);
  }else if(role==='katrina'||role==='woman'){
    const skirt=new THREE.Mesh(new THREE.CylinderGeometry(.31,.48,.72,10),linen);
    skirt.position.y=.55;g.add(skirt);
    const hairBack=new THREE.Mesh(new THREE.SphereGeometry(.2,9,7),hair);
    hairBack.scale.set(1,1.35,.7);hairBack.position.set(0,1.85,-.13);g.add(hairBack);
    if(role==='katrina'){
      const shawl=new THREE.Mesh(new THREE.BoxGeometry(.72,.2,.38),new THREE.MeshStandardMaterial({color:0x8d5140,roughness:1}));
      shawl.position.set(0,1.47,0);g.add(shawl);
    }
  }
  g.userData.movingArms=movingArms;eveningActors.push(g);return g;
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
