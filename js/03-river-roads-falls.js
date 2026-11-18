// RIO ANORA, ESTRADAS DE TERRA, CATARATAS E RELEVOS ROCHOSOS
// Superfícies orgânicas contínuas substituem os antigos agrupamentos de formas redondas.

function makeRibbon(curve,width,material,offset=.035,segments=120,widthFn=null){
  const verts=[],uv=[],indices=[];
  for(let i=0;i<=segments;i++){
    const t=i/segments,p=curve.getPointAt(t),tan=curve.getTangentAt(t).normalize();
    const side=new THREE.Vector3(-tan.z,0,tan.x).normalize();
    const w=widthFn?widthFn(t):width;
    const a=p.clone().addScaledVector(side,-w*.5),b=p.clone().addScaledVector(side,w*.5);
    a.y=groundHeight(a.x,a.z)+offset;b.y=groundHeight(b.x,b.z)+offset;
    verts.push(a.x,a.y,a.z,b.x,b.y,b.z);
    uv.push(0,t*13,1,t*13);
    if(i<segments){const n=i*2;indices.push(n,n+2,n+1,n+1,n+2,n+3);}
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  g.setIndex(indices);g.computeVertexNormals();
  const m=new THREE.Mesh(g,material);m.receiveShadow=true;scene.add(m);return m;
}

const riverCurve=new THREE.CatmullRomCurve3([
  new THREE.Vector3(-150,-.4,-565),new THREE.Vector3(-137,-.4,-445),
  new THREE.Vector3(-129,-.4,-300),new THREE.Vector3(-117,-.4,-145),
  new THREE.Vector3(-102,-.4,25),new THREE.Vector3(-82,-.4,205),
  new THREE.Vector3(-48,-.4,385),new THREE.Vector3(-12,-.4,590),
  new THREE.Vector3(18,-.4,790)
]);
const waterMat=new THREE.MeshStandardMaterial({
  color:0x78969a,metalness:.06,roughness:.25,transparent:true,
  opacity:.92,side:THREE.DoubleSide
});
const riverMesh=makeRibbon(riverCurve,40,waterMat,-.72,220,t=>34+6*Math.sin(t*Math.PI*4.5));

function nearRiver(x,z,margin=0){
  let best=1e9;
  for(let i=0;i<=120;i++){
    const p=riverCurve.getPointAt(i/120);
    best=Math.min(best,Math.hypot(x-p.x,z-p.z));
  }
  return best<20+margin;
}

// Pedras baixas e achatadas nas margens — nenhuma massa esférica isolada.
const bankMat=new THREE.MeshStandardMaterial({color:0x817b6c,map:stoneTex,roughness:1});
const bankRockGeo=new THREE.IcosahedronGeometry(1,1);
{
  const a=bankRockGeo.attributes.position;
  for(let i=0;i<a.count;i++){
    const x=a.getX(i),y=a.getY(i),z=a.getZ(i);
    const n=hash2(Math.round(x*31+8),Math.round(z*29-4));
    a.setXYZ(i,x*(.82+n*.34),y*(.48+n*.18),z*(.8+n*.3));
  }
  bankRockGeo.computeVertexNormals();
}
const bankRocks=new THREE.InstancedMesh(bankRockGeo,bankMat,115);
const bankDummy=new THREE.Object3D();
for(let i=0;i<115;i++){
  const t=rnd(),p=riverCurve.getPointAt(t),tan=riverCurve.getTangentAt(t);
  const side=new THREE.Vector3(-tan.z,0,tan.x).normalize();
  const sign=rnd()<.5?-1:1,dist=20+rnd()*12;
  const x=p.x+side.x*dist*sign,z=p.z+side.z*dist*sign;
  bankDummy.position.set(x,groundHeight(x,z)+.12,z);
  bankDummy.rotation.set((rnd()-.5)*.18,rnd()*Math.PI*2,(rnd()-.5)*.14);
  bankDummy.scale.set(.8+rnd()*2.3,.22+rnd()*.42,.65+rnd()*1.55);
  bankDummy.updateMatrix();bankRocks.setMatrixAt(i,bankDummy.matrix);
}
bankRocks.instanceMatrix.needsUpdate=true;bankRocks.castShadow=true;bankRocks.receiveShadow=true;scene.add(bankRocks);

// Estradas de terra batida, com traçado orgânico e largura variável.
const roadPaths=[
  [[255,420],[220,290],[150,170],[105,65],[74,-38],[65,-175],[93,-320]],
  [[105,65],[190,100],[270,80],[345,38]],
  [[150,170],[40,190],[-15,125],[-48,30]],
  [[74,-38],[165,-80],[248,-150]],
  [[105,65],[18,5],[-8,-85],[-12,-160]]
];
const roadCurves=[];
for(const pts of roadPaths){
  const curve=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(p[0],0,p[1])));
  roadCurves.push(curve);
  const roadWidth=pts.length===5?8.5:6.5;
  makeRibbon(curve,roadWidth,dirtMat,.065,100);
  // Ombros de terra mais solta integram o leito à relva seca, sem bordas de placa.
  const shoulderMat=new THREE.MeshStandardMaterial({color:0x806d4e,map:groundTex,normalMap:groundNormalTex,normalScale:new THREE.Vector2(.12,.12),roughness:1});
  for(const sideSign of [-1,1]){
    const shoulderPoints=[];
    for(let j=0;j<=72;j++){
      const t=j/72,p=curve.getPointAt(t),tan=curve.getTangentAt(t).normalize();
      const side=new THREE.Vector3(-tan.z,0,tan.x).normalize();
      shoulderPoints.push(new THREE.Vector3(p.x+side.x*sideSign*(roadWidth*.5+1.0),0,p.z+side.z*sideSign*(roadWidth*.5+1.0)));
    }
    const shoulderCurve=new THREE.CatmullRomCurve3(shoulderPoints);
    makeRibbon(shoulderCurve,1.7,shoulderMat,.028,90,t=>1.25+.28*Math.sin(t*Math.PI*5));
  }
}
// Marcas de roda escurecidas, rasas e irregulares, acompanhando os caminhos de terra.
const wheelRutMat=new THREE.MeshStandardMaterial({color:0x594b37,roughness:1,transparent:true,opacity:.34,depthWrite:false});
for(const curve of roadCurves){
  for(const sideSign of [-1,1]){
    const rutPoints=[];
    for(let j=0;j<=78;j++){
      const t=j/78,p=curve.getPointAt(t),tan=curve.getTangentAt(t).normalize();
      const side=new THREE.Vector3(-tan.z,0,tan.x).normalize();
      const offset=sideSign*(curve===roadCurves[0]?2.05:1.55);
      rutPoints.push(new THREE.Vector3(p.x+side.x*offset,0,p.z+side.z*offset));
    }
    const rutCurve=new THREE.CatmullRomCurve3(rutPoints);
    makeRibbon(rutCurve,.58,wheelRutMat,.095,85,t=>.46+.12*Math.sin(t*Math.PI*7));
  }
}
// Pequenas pedras roladas nos ombros, instanciadas para evitar uma placa uniforme.
const vergeStoneGeo=new THREE.IcosahedronGeometry(.13,1);
const vergeStoneMat=new THREE.MeshStandardMaterial({color:0x8d826f,map:stoneTex,roughness:1});
const vergeStones=new THREE.InstancedMesh(vergeStoneGeo,vergeStoneMat,260);
const vergeDummy=new THREE.Object3D();
for(let i=0;i<260;i++){
  const curve=roadCurves[Math.floor(rnd()*roadCurves.length)],t=rnd(),p=curve.getPointAt(t),tan=curve.getTangentAt(t).normalize();
  const side=new THREE.Vector3(-tan.z,0,tan.x).normalize(),sign=rnd()<.5?-1:1;
  const distance=(curve===roadCurves[0]?5.0:4.1)+rnd()*2.4;
  const x=p.x+side.x*sign*distance,z=p.z+side.z*sign*distance;
  vergeDummy.position.set(x,groundHeight(x,z)+.08,z);
  vergeDummy.rotation.set(rnd()*.2,rnd()*Math.PI*2,rnd()*.2);
  vergeDummy.scale.set(.55+rnd()*1.3,.28+rnd()*.38,.45+rnd()*.9);
  vergeDummy.updateMatrix();vergeStones.setMatrixAt(i,vergeDummy.matrix);
}
vergeStones.instanceMatrix.needsUpdate=true;vergeStones.castShadow=false;vergeStones.receiveShadow=true;scene.add(vergeStones);

// Marcas de roda discretas já incorporadas às faixas escuras acima.
for(const curve of roadCurves.slice(0,1)){
  for(const side of [-1,1]){
    const pts=[];
    for(let i=0;i<=90;i++){
      const t=i/90,p=curve.getPointAt(t),tan=curve.getTangentAt(t);
      const n=new THREE.Vector3(-tan.z,0,tan.x).normalize(),x=p.x+n.x*side*2.25,z=p.z+n.z*side*2.25;
      pts.push(new THREE.Vector3(x,groundHeight(x,z)+.075,z));
    }
    const line=new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts),
      new THREE.LineBasicMaterial({color:0x65543d,transparent:true,opacity:.28})
    );
    scene.add(line);
  }
}

// ROCHA — malhas facetadas e estratos alongados, sem cones ou bolas gigantes.
const cliffMat=new THREE.MeshStandardMaterial({
  color:0x918b7d,map:stoneTex,normalMap:stoneNormalTex,normalScale:new THREE.Vector2(.28,.28),roughness:1,metalness:0,side:THREE.DoubleSide
});
const cliffDarkMat=new THREE.MeshStandardMaterial({
  color:0x66645d,roughness:1,side:THREE.DoubleSide
});
const cliffLightMat=new THREE.MeshStandardMaterial({
  color:0xa39b8a,roughness:1,side:THREE.DoubleSide
});

function cliffTop(x){
  return 105+fbm(x*.014+17,-640*.012,4)*52+
    Math.sin(x*.026+1.4)*13+Math.sin(x*.061)*5;
}
function buildEscarpment(){
  const nx=112,ny=34,x0=-395,x1=95,zFace=-646;
  const vertices=[],colors=[],uvs=[],indices=[];
  const color=new THREE.Color();
  for(let j=0;j<=ny;j++){
    const v=j/ny;
    for(let i=0;i<=nx;i++){
      const u=i/nx,x=x0+(x1-x0)*u,top=cliffTop(x);
      const y=3+v*top+(fbm(x*.035+v*7,v*9-4,3)-.5)*4.2;
      const z=zFace+(fbm(x*.018+v*5,v*8+2,4)-.5)*17+
        Math.sin(x*.052+v*8)*2.4;
      vertices.push(x,y,z);uvs.push(u*5,v*3);
      const shade=.36+v*.18+(fbm(x*.045,v*13,3)-.5)*.12;
      color.setHSL(.105,.075,THREE.MathUtils.clamp(shade,.22,.62));
      colors.push(color.r,color.g,color.b);
      if(i<nx&&j<ny){
        const a=j*(nx+1)+i,b=a+1,c=a+nx+1,d=c+1;
        indices.push(a,c,b,b,c,d);
      }
    }
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  g.setIndex(indices);g.computeVertexNormals();
  const face=new THREE.Mesh(g,new THREE.MeshStandardMaterial({
    map:stoneTex,vertexColors:true,roughness:1,side:THREE.DoubleSide
  }));
  face.castShadow=true;face.receiveShadow=true;scene.add(face);

  // Lajes horizontais quebradas acompanham os planos da escarpa.
  for(const fraction of [.22,.43,.66,.84]){
    const verts=[],ids=[];
    for(let i=0;i<=100;i++){
      const u=i/100,x=x0+(x1-x0)*u,top=cliffTop(x);
      const y=3+top*fraction+(fbm(x*.03,fraction*9,3)-.5)*3;
      const z=zFace-3+(fbm(x*.04,fraction*7,3)-.5)*8;
      verts.push(x,y+.75,z-1.3,x,y-.2,z+1.5);
      if(i<100){const n=i*2;ids.push(n,n+2,n+1,n+1,n+2,n+3);}
    }
    const lg=new THREE.BufferGeometry();
    lg.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
    lg.setIndex(ids);lg.computeVertexNormals();
    const ledge=new THREE.Mesh(lg,fraction===.43?cliffLightMat:cliffDarkMat);
    ledge.castShadow=true;ledge.receiveShadow=true;scene.add(ledge);
  }
}
buildEscarpment();

// Cadeias montanhosas longas, com cristas irregulares, encostas e silhuetas sobrepostas.
function addMountainRidge(axis,alongStart,alongEnd,front,depth,amplitude,base,phase){
  const na=250,nd=64,verts=[],colors=[],uvs=[],indices=[],color=new THREE.Color();
  for(let j=0;j<=nd;j++){
    const v=j/nd;
    // A encosta cai para trás de modo assimétrico; evita o perfil de lona triangular.
    const profile=Math.pow(1-v,1.38)*(1-.08*Math.sin(v*Math.PI));
    for(let i=0;i<=na;i++){
      const u=i/na,along=alongStart+(alongEnd-alongStart)*u;
      const broad=.26+.72*fbm(u*4.4+phase,phase*1.9,5);
      const peakNoise=fbm(u*17.5+phase*2.3,phase*3.7,3);
      const sharp=Math.pow(Math.max(0,Math.sin(u*25.7+phase+peakNoise*2.2)),2.4)*(.08+peakNoise*.22);
      const peaks=broad+sharp;
      const fine=(fbm(u*53+phase,v*37-phase,4)-.5)*12;
      const shoulder=(fbm(u*13+phase,v*11,4)-.5)*13;
      const gullies=Math.pow(Math.abs(Math.sin(u*12.1+phase*1.3+v*2)),7)*8;
      let x,z;if(axis==='x'){x=along;z=front+v*depth;}else{x=front+v*depth;z=along;}
      const y=base+profile*(amplitude*peaks+fine)+shoulder-gullies*profile;
      verts.push(x,y,z);uvs.push(u*8,v*5);
      const altitude=THREE.MathUtils.clamp(profile*.72+fbm(u*19,v*15+phase,4)*.22,.03,.96);
      const rockWarm=.5+fbm(u*7+phase,v*6,3)*.5;
      color.setHSL(.095+rockWarm*.018,.055+altitude*.055,.19+altitude*.29);
      colors.push(color.r,color.g,color.b);
      if(i<na&&j<nd){
        const a=j*(na+1)+i,b=a+1,d=a+na+1,e=d+1;
        if(axis==='x')indices.push(a,d,b,b,d,e);else indices.push(a,b,d,b,e,d);
      }
    }
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
  g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  g.setIndex(indices);g.computeVertexNormals();
  const mesh=new THREE.Mesh(g,new THREE.MeshStandardMaterial({
    map:stoneTex,normalMap:stoneNormalTex,normalScale:new THREE.Vector2(.42,.42),
    vertexColors:true,roughness:1,side:THREE.DoubleSide
  }));
  mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);
}
addMountainRidge('x',-1420,1420,-1160,440,315,-18,2.2);
addMountainRidge('z',-980,1040,-1280,430,245,-20,5.1);
addMountainRidge('z',-980,1040,850,410,230,-18,8.3);

// CATARATAS DE IGUALDA — queda vertical aderida à escarpa e leito de escoamento no pé.
const waterfallBottom=groundHeight(-146,-636)+.42;
const waterfallTop=cliffTop(-146)-1.2;
const waterfallHeight=Math.max(76,waterfallTop-waterfallBottom);
const fallsGlow=new THREE.PointLight(0xb9d9df,.68,145);
fallsGlow.position.set(-146,waterfallBottom+waterfallHeight*.28,-638);scene.add(fallsGlow);

// Textura de água com fios verticais quebrados, sem faixas retas repetidas.
const fallCanvas=document.createElement('canvas');
fallCanvas.width=256;fallCanvas.height=512;
const fallCtx=fallCanvas.getContext('2d');
const fallGradient=fallCtx.createLinearGradient(0,0,0,512);
fallGradient.addColorStop(0,'rgba(214,239,241,.72)');
fallGradient.addColorStop(.45,'rgba(172,213,218,.85)');
fallGradient.addColorStop(1,'rgba(224,241,240,.92)');
fallCtx.fillStyle=fallGradient;fallCtx.fillRect(0,0,256,512);
for(let i=0;i<88;i++){
  const x=(i*47.13)%256,w=1+(i%6)*.65,alpha=.07+(i%5)*.025;
  fallCtx.strokeStyle='rgba(246,255,255,'+alpha.toFixed(3)+')';
  fallCtx.lineWidth=w;fallCtx.beginPath();
  fallCtx.moveTo(x,0);fallCtx.bezierCurveTo(x-4,130,x+5,300,x+(i%3-1)*2,512);fallCtx.stroke();
}
for(let i=0;i<140;i++){
  const x=(i*83.7)%256,y=(i*127.3)%512;
  fallCtx.fillStyle='rgba(255,255,255,'+(0.025+(i%4)*.012).toFixed(3)+')';
  fallCtx.fillRect(x,y,2+i%3,8+i%13);
}
const fallTexture=new THREE.CanvasTexture(fallCanvas);
fallTexture.wrapS=THREE.RepeatWrapping;fallTexture.wrapT=THREE.RepeatWrapping;
fallTexture.repeat.set(1.7,1.35);fallTexture.colorSpace=THREE.SRGBColorSpace;

const fallMat=new THREE.MeshStandardMaterial({
  map:fallTexture,color:0xe1f0f0,vertexColors:true,
  transparent:true,opacity:.80,roughness:.13,metalness:.015,
  side:THREE.DoubleSide,emissive:0x294d52,emissiveIntensity:.11,depthWrite:false
});
const falls=[];
{
  const nx=64,ny=64,verts=[],uvs=[],colors=[],indices=[],col=new THREE.Color();
  for(let j=0;j<=ny;j++){
    const v=j/ny;
    for(let i=0;i<=nx;i++){
      const u=i/nx;
      const width=32+Math.sin(v*8.4)*1.6;
      const edge=(fbm(u*15+3,v*11+7,3)-.5)*.75;
      const centerDrift=Math.sin(v*4.4)*.75;
      const x=(u-.5)*width+centerDrift+edge;
      const top=cliffTop(-146+x*.7)-1.1;
      const y=waterfallBottom+(top-waterfallBottom)*v;
      // A lâmina permanece junto à face; a turbulência é pequena e volumétrica.
      const z=-642+Math.sin(u*12.5+v*8.2)*.85+Math.sin(u*34-v*17)*.22;
      verts.push(x,y-waterfallBottom,z);
      uvs.push(u*2.2,v*1.55);
      const streak=.5+.5*Math.sin(u*81+Math.sin(v*17)*1.7);
      const foam=Math.pow(Math.max(0,Math.sin((1-v)*Math.PI*8+u*9)),8)*.08;
      const shade=.78+streak*.14+foam;
      col.setRGB(shade*.82,shade*.94,shade*.96);
      colors.push(col.r,col.g,col.b);
      if(i<nx&&j<ny){
        const n=j*(nx+1)+i;
        indices.push(n,n+nx+1,n+1,n+1,n+nx+1,n+nx+2);
      }
    }
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
  geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  geo.setIndex(indices);geo.computeVertexNormals();
  const sheet=new THREE.Mesh(geo,fallMat);
  sheet.position.set(-146,waterfallBottom,0);
  sheet.userData.baseY=waterfallBottom;
  sheet.userData.basePositions=new Float32Array(geo.attributes.position.array);
  scene.add(sheet);falls.push(sheet);
}

// Piscina de impacto encostada à escarpa; depois da queda, um canal raso segue até ao Anora.
const pool=new THREE.Mesh(new THREE.CircleGeometry(20,80),
  new THREE.MeshStandardMaterial({color:0x789da2,roughness:.16,metalness:.04,transparent:true,opacity:.88}));
pool.rotation.x=-Math.PI/2;pool.scale.set(1.18,.82,1);
pool.position.set(-146,groundHeight(-146,-630)+.13,-630);scene.add(pool);
const poolRim=new THREE.Mesh(new THREE.TorusGeometry(18,.34,8,80),
  new THREE.MeshStandardMaterial({color:0x9caaa1,roughness:.9,transparent:true,opacity:.52}));
poolRim.rotation.x=Math.PI/2;poolRim.scale.set(1.18,.82,1);
poolRim.position.copy(pool.position);poolRim.position.y+=.035;scene.add(poolRim);

const cascadeRunoutCurve=new THREE.CatmullRomCurve3([
  new THREE.Vector3(-146,0,-630),new THREE.Vector3(-146,0,-616),
  new THREE.Vector3(-148,0,-598),new THREE.Vector3(-151,0,-580),
  new THREE.Vector3(-151,0,-565)
]);
const cascadeRunout=makeRibbon(cascadeRunoutCurve,10.5,waterMat,-.10,90,t=>11.5-4.4*t);
cascadeRunout.material.opacity=.95;

// Névoa e espuma ficam restritas ao impacto na piscina, nunca suspensas a meia encosta.
const mistGeo=new THREE.BufferGeometry(),mistPositions=new Float32Array(54*3);
for(let i=0;i<54;i++){
  mistPositions[i*3]=-146+(rnd()-.5)*42;
  mistPositions[i*3+1]=waterfallBottom+.35+rnd()*4.2;
  mistPositions[i*3+2]=-629+(rnd()-.5)*17;
}
mistGeo.setAttribute('position',new THREE.BufferAttribute(mistPositions,3));
const waterfallMist=new THREE.Points(mistGeo,new THREE.PointsMaterial({
  color:0xe2eeee,size:1.05,transparent:true,opacity:.20,depthWrite:false,sizeAttenuation:true
}));
scene.add(waterfallMist);
const splashGeo=new THREE.BufferGeometry(),splashPositions=new Float32Array(42*3);
for(let i=0;i<42;i++){
  splashPositions[i*3]=-146+(rnd()-.5)*33;
  splashPositions[i*3+1]=waterfallBottom+.25+rnd()*1.8;
  splashPositions[i*3+2]=-629+(rnd()-.5)*10;
}
splashGeo.setAttribute('position',new THREE.BufferAttribute(splashPositions,3));
const splash=new THREE.Points(splashGeo,new THREE.PointsMaterial({
  color:0xf1f7f5,size:.34,transparent:true,opacity:.42,depthWrite:false
}));
scene.add(splash);

// Fragmentos achatados de rocha moldam o entorno do poço e as margens do canal.
const talusGeo=new THREE.IcosahedronGeometry(1,1);
{
  const a=talusGeo.attributes.position;
  for(let i=0;i<a.count;i++){
    const x=a.getX(i),y=a.getY(i),z=a.getZ(i),n=hash2(i*3.1,Math.round(y*40));
    a.setXYZ(i,x*(.78+n*.38),y*(.52+n*.17),z*(.82+n*.30));
  }
  talusGeo.computeVertexNormals();
}
const talus=new THREE.InstancedMesh(talusGeo,cliffMat,44);
for(let i=0;i<44;i++){
  const angle=rnd()*Math.PI*2,rad=18+Math.sqrt(rnd())*34;
  const x=-146+Math.cos(angle)*rad,z=-622+Math.sin(angle)*rad*.66;
  bankDummy.position.set(x,groundHeight(x,z)+.12,z);
  bankDummy.rotation.set((rnd()-.5)*.2,rnd()*Math.PI*2,(rnd()-.5)*.16);
  bankDummy.scale.set(1.8+rnd()*6,.35+rnd()*1.4,1.4+rnd()*4.2);
  bankDummy.updateMatrix();talus.setMatrixAt(i,bankDummy.matrix);
}
talus.instanceMatrix.needsUpdate=true;talus.castShadow=true;scene.add(talus);

// ============================================================================