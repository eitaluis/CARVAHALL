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
function subtractWallOpenings(min,max,holes){
  let spans=[[min,max]];
  for(const [h0,h1] of holes){
    const next=[];
    for(const [a,b] of spans){
      if(h1<=a||h0>=b){next.push([a,b]);continue;}
      if(h0>a)next.push([a,h0]);
      if(h1<b)next.push([h1,b]);
    }
    spans=next;
  }
  return spans.filter(([a,b])=>b-a>.48);
}
function addStoneFooting(parent,w,d){
  const geo=new THREE.IcosahedronGeometry(1,1);
  const stones=new THREE.InstancedMesh(geo,stoneMat,40);
  const dummy=new THREE.Object3D();
  let n=0;
  const place=(x,z,angle)=>{
    dummy.position.set(x,.31+(rnd()-.5)*.035,z);
    dummy.rotation.set((rnd()-.5)*.10,angle+(rnd()-.5)*.18,(rnd()-.5)*.08);
    dummy.scale.set(.46+rnd()*.15,.28+rnd()*.08,.38+rnd()*.12);
    dummy.updateMatrix();stones.setMatrixAt(n++,dummy.matrix);
  };
  for(let i=0;i<14;i++){
    const x=-w/2+.35+i*(w-.7)/13;
    place(x,-d/2+.1,0);place(x,d/2-.1,0);
  }
  for(let i=0;i<6;i++){
    const z=-d/2+.5+i*(d-1)/5;
    place(-w/2+.1,z,Math.PI/2);place(w/2-.1,z,Math.PI/2);
  }
  stones.count=n;stones.instanceMatrix.needsUpdate=true;stones.castShadow=true;stones.receiveShadow=true;parent.add(stones);
}
function addDoorLantern(parent,x,y,z){
  const bracket=new THREE.Mesh(new THREE.CylinderGeometry(.035,.045,.42,8),ironMat);
  bracket.rotation.x=Math.PI/2;bracket.position.set(x,y,z);parent.add(bracket);
  const cage=new THREE.Mesh(new THREE.SphereGeometry(.16,10,8),new THREE.MeshStandardMaterial({color:0x3c3327,metalness:.45,roughness:.65}));
  cage.scale.set(.8,1.25,.8);cage.position.set(x,y-.25,z+.1);parent.add(cage);
  const glow=new THREE.Mesh(new THREE.SphereGeometry(.10,10,8),warmGlassMat);
  glow.position.copy(cage.position);parent.add(glow);
}
function createCabin(name,x,z,rot=0,opts={}){
  const w=opts.w||13.4,d=opts.d||11.2,base=.62,kind=opts.kind||'home';
  const roofType=opts.roof||'thatch',doorW=opts.doorW||1.65;
  const g=new THREE.Group();
  const facing=rot+Math.PI;
  g.position.set(x,groundHeight(x,z),z);g.rotation.y=facing;scene.add(g);
  addStoneFooting(g,w,d);
  box(g,w,.20,d,darkWoodMat,0,.50,0);
  const radius=.205,step=.385,rows=10;
  for(let i=0;i<rows;i++){
    const y=base+i*step+(i%2)*.012;
    const courseRadius=radius+(i%3)*.008;
    const mat=i%5===0?darkWoodMat:woodMat;
    // Interlocked side walls, with genuine voids for the side windows.
    const sideHoles=(y>1.72&&y<3.02)?[[-.86,.86]]:[];
    for(const side of [-1,1]){
      const spans=subtractWallOpenings(-d/2-.55,d/2+.55,sideHoles);
      for(const [lo,hi] of spans)logBeam(g,hi-lo,courseRadius,side*w/2,(y), (lo+hi)/2,'z',mat);
    }
    // The front elevation is cut around the arched doorway and the two windows.
    const frontHoles=[];
    if(y>1.72&&y<3.02){
      frontHoles.push([-w*.31-.83,-w*.31+.83],[w*.31-.83,w*.31+.83]);
    }
    if(y<3.00)frontHoles.push([-doorW/2-.18,doorW/2+.18]);
    const frontSpans=subtractWallOpenings(-w/2-.55,w/2+.55,frontHoles);
    for(const [lo,hi] of frontSpans)logBeam(g,hi-lo,courseRadius,(lo+hi)/2,y,-d/2,'x',mat);
    logBeam(g,w+1.1,courseRadius,0,y,d/2,'x',mat);
  }

  const eave=base+rows*step+.10,rise=3.0,run=d/2+1.25;
  addGableEnd(g,w,-d/2-.06,eave,rise);
  addGableEnd(g,w,d/2+.06,eave,rise);
  const roofMat=roofType==='shingle'?shingleMat:thatchMat;
  addRoofHalf(g,w,run,eave,rise,-1,roofMat);
  addRoofHalf(g,w,run,eave,rise,1,roofMat);
  logBeam(g,w+1.5,.18,0,eave+rise+.02,0,'x',darkWoodMat);
  // Visible bargeboards and eave beams explain how the roof is actually carried.
  for(const side of [-1,1]){
    beamBetween(g,new THREE.Vector3(-w/2-.45,eave+.04,side*run),new THREE.Vector3(w/2+.45,eave+.04,side*run),.12,darkWoodMat);
  }
  for(const xx of [-w/2-.48,w/2+.48]){
    beamBetween(g,new THREE.Vector3(xx,eave+.02,-run),new THREE.Vector3(xx,eave+rise,0),.095,woodMat);
    beamBetween(g,new THREE.Vector3(xx,eave+.02,run),new THREE.Vector3(xx,eave+rise,0),.095,woodMat);
  }
  if(opts.chimney!==false)addStoneChimney(g,w*.29,d*.18,eave+rise+1.1,kind==='forge'||kind==='butcher');
  addDoor(g,w,d,doorW);addPorch(g,w,d,roofMat);
  addWindow(g,-w*.31,2.36,-d/2-.18,0,opts.lit!==false);
  addWindow(g,w*.31,2.36,-d/2-.18,0,opts.lit!==false);
  addWindow(g,-w/2-.18,2.36,0,Math.PI/2,false);
  addWindow(g,w/2+.18,2.36,0,-Math.PI/2,opts.lit===true);
  addDoorLantern(g,-doorW*.78,2.85,-d/2-.42);
  addInterior(g,kind,w,d,eave,rise);

  // Lenha e barris junto à entrada, com pequenos volumes arredondados.
  for(let i=0;i<7;i++){
    const L=1.2+rnd()*.65;
    const wood=new THREE.Mesh(new THREE.CylinderGeometry(.105,.13,L,12,3),woodMat);
    wood.rotation.z=Math.PI/2;
    wood.position.set(-w*.54+(i%3)*.42,.73+Math.floor(i/3)*.20,-d*.5-2.25);
    g.add(wood);
  }
  if(kind==='tavern'||kind==='butcher'||kind==='forge'){
    addBarrel(g,-w*.52,.04,-d*.5-3.45,.92);
    addBarrel(g,w*.52,.04,-d*.5-3.45,.78);
  }else{
    const bucket=new THREE.Mesh(new THREE.CylinderGeometry(.23,.2,.46,14),darkWoodMat);
    bucket.position.set(w*.53,.75,-d*.5-2.45);g.add(bucket);
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
  const shedEave=2.92,shedRise=2.15,shedRun=d/2+.9;
  addGableEnd(g,w,-d/2-.06,shedEave,shedRise);
  addGableEnd(g,w,d/2+.06,shedEave,shedRise);
  addRoofHalf(g,w,shedRun,shedEave,shedRise,-1,shingleMat);
  addRoofHalf(g,w,shedRun,shedEave,shedRise,1,shingleMat);
  logBeam(g,w+1.35,.14,0,shedEave+shedRise,0,'x',darkWoodMat);
  addDoor(g,w,d,1.35);
  addInterior(g,'tannery',w,d,shedEave,shedRise);

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
makeResident(184,-18,0x61513e,.45,.98,0,'walker');
makeResident(221,15,0x46504c,-.9,1.01,1,'walker');

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
