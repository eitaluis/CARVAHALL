// CARVAHALL EM ERAGON — ARQUITETURA E OFÍCIOS DA VILA
// Casas robustas de troncos, telhados baixos de palha ou shingles,
// varandas largas, chaminés, açougue de Sloan, forja de Horst e tanoaria
// de Gedric nos arredores. A disposição exata é uma hipótese espacial.

const BUILDINGS=[];
const smokeSprites=[];

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
    const puff=new THREE.Mesh(
      new THREE.SphereGeometry(.37+rnd()*.25,7,6),
      new THREE.MeshBasicMaterial({color:0xbebbb1,transparent:true,opacity:.085,depthWrite:false})
    );
    puff.position.set(x+(rnd()-.5)*.5,yTop+.5+i*.62,z+(rnd()-.5)*.35);
    puff.userData.baseY=puff.position.y;puff.userData.phase=rnd()*6.28;
    parent.add(puff);smokeSprites.push(puff);
  }
}
function addWindow(parent,x,y,z,rotY=0,lit=false){
  const frame=new THREE.Group();frame.position.set(x,y,z);frame.rotation.y=rotY;parent.add(frame);
  box(frame,1.12,1.02,.16,darkWoodMat,0,0,0);
  box(frame,.82,.74,.10,lit?warmGlassMat:glassMat,0,0,.1);
  box(frame,.09,.83,.1,paleWoodMat,0,0,.17);
  box(frame,.92,.09,.1,paleWoodMat,0,0,.17);
  box(frame,.07,.82,.11,darkWoodMat,-.65,0,.04);
  box(frame,.07,.82,.11,darkWoodMat,.65,0,.04);
}
function addDoor(parent,w,d,doorW=1.5){
  const doorH=2.25;
  box(parent,doorW+.3,doorH+.22,.22,darkWoodMat,0,1.7,-d/2-.035);
  const leaf=new THREE.Group();leaf.position.set(-doorW/2,0,-d/2-.15);parent.add(leaf);
  box(leaf,doorW,doorH,.15,woodMat,doorW/2,doorH/2,0,0,-.07,0);
  for(let i=0;i<5;i++)box(leaf,.055,doorH-.12,.08, darkWoodMat,.12+i*(doorW-.24)/4,doorH/2,-.095);
  box(parent,doorW+.38,.16,.22,paleWoodMat,0,2.88,-d/2-.08);
}
function addPorch(parent,w,d){
  const depth=2.65,z=-d/2-depth/2;
  box(parent,w*.84,.2,depth,woodMat,0,.62,z);
  for(const x of [-w*.39,0,w*.39]){
    box(parent,.19,2.45,.19,darkWoodMat,x,1.9,-d/2-depth+.13);
    box(parent,.25,.18,.25,paleWoodMat,x,3.18,-d/2-depth+.13);
  }
  box(parent,w*.88,.17,.2,darkWoodMat,0,3.03,-d/2-depth+.13);
  for(const x of [-w*.4,w*.4]){
    box(parent,.15,.52,depth*.78,paleWoodMat,x,.91,z);
  }
  box(parent,w*.22,.16,.92,paleWoodMat,0,.3,-d/2-depth-.42);
  box(parent,w*.24,.16,.92,paleWoodMat,0,.14,-d/2-depth-.93);
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
    box(parent,2.1,.75,1.0,darkWoodMat,w*.2,.9,d*.18);
    box(parent,2.25,.14,1.08,paleWoodMat,w*.2,1.34,d*.18);
  }
}
function createCabin(name,x,z,rot=0,opts={}){
  const w=opts.w||11.5,d=opts.d||9.5,base=.6,kind=opts.kind||'home';
  const roofType=opts.roof||'thatch',doorW=opts.doorW||1.5;
  const g=new THREE.Group();
  g.position.set(x,groundHeight(x,z),z);g.rotation.y=rot;scene.add(g);

  // Pedras baixas sob os cantos, sem transformar a casa numa construção de pedra.
  for(const xx of [-w/2+.65,w/2-.65])for(const zz of [-d/2+.65,d/2-.65]){
    const stone=new THREE.Mesh(new THREE.DodecahedronGeometry(.55,0),stoneMat);
    stone.position.set(xx,.28,zz);stone.scale.set(1.35,.72,1.15);g.add(stone);
  }
  box(g,w,.2,d,darkWoodMat,0,.48,0);

  // Paredes feitas de cursos contínuos de troncos arredondados, com encaixes
  // que ultrapassam os cantos. Abertura funcional para a porta na fachada.
  const radius=.205,step=.37,rows=8;
  for(let i=0;i<rows;i++){
    const y=base+i*step,mat=i%3===0?darkWoodMat:woodMat;
    logBeam(g,d+.85,radius,-w/2,y,0,'z',mat);
    logBeam(g,d+.85,radius,w/2,y,0,'z',mat);
    if(y-base<1.92){
      const segment=(w-doorW)/2;
      logBeam(g,segment+.18,radius,-w/2+segment/2,y,-d/2,'x',mat);
      logBeam(g,segment+.18,radius,w/2-segment/2,y,-d/2,'x',mat);
    }else logBeam(g,w+.85,radius,0,y,-d/2,'x',mat);
    logBeam(g,w+.85,radius,0,y,d/2,'x',mat);
  }

  // Beirais profundos e telhado baixo em duas águas.
  const eave=base+rows*step+.12,rise=1.38,run=d/2+.82;
  const slope=Math.atan2(rise,run),length=Math.hypot(run,rise);
  const roofMat=roofType==='shingle'?shingleMat:thatchMat;
  box(g,w+1.5,.22,length,roofMat,0,eave+rise/2,-run/2,-slope,0,0);
  box(g,w+1.5,.22,length,roofMat,0,eave+rise/2,run/2,slope,0,0);
  logBeam(g,w+1.25,.16,0,eave+rise+.02,0,'x',darkWoodMat);
  for(const xx of [-w/2-.42,w/2+.42]){
    logBeam(g,length,.115,xx,eave+rise/2,-run/2,'z',darkWoodMat);
    logBeam(g,length,.115,xx,eave+rise/2,run/2,'z',darkWoodMat);
  }

  if(opts.chimney!==false)addStoneChimney(g,w*.29,d*.2,6.1,kind==='forge'||kind==='butcher');
  addDoor(g,w,d,doorW);addPorch(g,w,d);
  addWindow(g,-w*.31,2.02,-d/2-.15,0,opts.lit!==false);
  addWindow(g,w*.31,2.02,-d/2-.15,0,opts.lit!==false);
  addWindow(g,-w/2-.16,2.02,0,Math.PI/2,false);
  addWindow(g,w/2+.16,2.02,0,-Math.PI/2,opts.lit===true);
  addInterior(g,kind,w,d);

  // Lenha empilhada perto da parede: detalhe doméstico, não instalação defensiva.
  for(let i=0;i<6;i++){
    const L=1.15+rnd()*.5;
    const wood=new THREE.Mesh(new THREE.CylinderGeometry(.1,.12,L,7),woodMat);
    wood.rotation.z=Math.PI/2;
    wood.position.set(-w*.32+(i%3)*.42,.72+Math.floor(i/3)*.19,d*.5+.44);
    g.add(wood);
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
const villageTavern=createCabin('Taverna (nome não indicado)',76,-42,.08,{w:14,d:11,kind:'tavern',roof:'thatch'});
const butcher=createCabin('Açougue de Sloan',18,67,-.18,{w:14,d:11,kind:'butcher',roof:'shingle',lit:true});
const forge=createCabin('Forja de Horst',206,48,.42,{w:15,d:13,kind:'forge',roof:'shingle',lit:true});
const tannery=createTannery(-96,174);

const villageHouses=[
  createCabin('Casa de aldeões A',28,-18,.24,{w:10.5,d:8.7,roof:'thatch'}),
  createCabin('Casa de aldeões B',126,-73,-.18,{w:11.4,d:9,roof:'shingle'}),
  createCabin('Casa de aldeões C',192,-28,.12,{w:10,d:8.5,roof:'thatch'}),
  createCabin('Casa de aldeões D',255,2,.48,{w:10.8,d:9.2,roof:'shingle'}),
  createCabin('Casa de aldeões E',-18,111,-.28,{w:11.8,d:9.5,roof:'thatch'}),
  createCabin('Casa de aldeões F',69,151,.1,{w:10.5,d:8.7,roof:'shingle'}),
  createCabin('Casa de aldeões G',153,145,-.1,{w:10.2,d:8.6,roof:'thatch'}),
  createCabin('Casa de aldeões H',246,120,.18,{w:10.2,d:8.5,roof:'thatch'}),
  createCabin('Casa de aldeões I',-48,35,.35,{w:11,d:9,roof:'shingle'}),
  createCabin('Casa de aldeões J',289,-74,-.2,{w:10.4,d:8.7,roof:'thatch'}),
  createCabin('Casa de aldeões K',-27,220,.14,{w:10.5,d:8.8,roof:'shingle'}),
  createCabin('Casa de aldeões L',206,214,-.3,{w:11.2,d:9.3,roof:'thatch'})
];

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
