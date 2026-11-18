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
  makeRibbon(curve,pts.length===5?8.5:6.5,dirtMat,.065,100);
}
// Marcas discretas de roda, interrompidas pela irregularidade do solo.
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

// CATARATAS DE IGUALDA — uma queda contínua presa à face da escarpa.
const waterfallBottom=groundHeight(-146,-564)+.42;
const waterfallTop=cliffTop(-146)-1.8;
const waterfallHeight=Math.max(82,waterfallTop-waterfallBottom);
const fallsGlow=new THREE.PointLight(0xc8d9d9,.72,190);
fallsGlow.position.set(-146,waterfallBottom+waterfallHeight*.22,-613);scene.add(fallsGlow);
const fallMat=new THREE.MeshStandardMaterial({
  color:0xc5d7d6,vertexColors:true,transparent:true,opacity:.58,roughness:.18,metalness:.025,
  side:THREE.DoubleSide,emissive:0x263f42,emissiveIntensity:.12,depthWrite:false
});
const falls=[];
{
  const nx=72,ny=54,verts=[],uvs=[],colors=[],indices=[],col=new THREE.Color();
  for(let j=0;j<=ny;j++){
    const v=j/ny;
    for(let i=0;i<=nx;i++){
      const u=i/nx,x=(u-.5)*62;
      const top=cliffTop(-146+x)-1.8;
      const bottom=waterfallBottom+Math.sin(u*Math.PI)*.6;
      const y=bottom+(top-bottom)*v;
      const waviness=Math.sin(v*19+u*8)*.34+Math.sin(v*43-u*17)*.12;
      const z=-646+(1-v)*82+waviness;
      verts.push(x,y-waterfallBottom,z);
      uvs.push(u*2.5,v*3.8);
      const streak=.5+.5*Math.sin(u*92+Math.sin(v*13)*2);
      const shade=.72+streak*.18;
      col.setRGB(shade*.82,shade*.91,shade*.92);
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
  sheet.userData.baseY=waterfallBottom;sheet.userData.basePositions=new Float32Array(geo.attributes.position.array);
  scene.add(sheet);falls.push(sheet);
}
const pool=new THREE.Mesh(
  new THREE.CircleGeometry(28,72),
  new THREE.MeshStandardMaterial({color:0x718b8e,roughness:.22,metalness:.04,transparent:true,opacity:.82})
);
pool.rotation.x=-Math.PI/2;pool.position.set(-146,waterfallBottom-.22,-588);scene.add(pool);
// Névoa fina e baixa no encontro da água, sem véus soltos no céu.
const mistGeo=new THREE.BufferGeometry(),mistPositions=new Float32Array(38*3);
for(let i=0;i<38;i++){
  mistPositions[i*3]=-146+(rnd()-.5)*56;
  mistPositions[i*3+1]=waterfallBottom+.6+rnd()*5;
  mistPositions[i*3+2]=-583+(rnd()-.5)*18;
}
mistGeo.setAttribute('position',new THREE.BufferAttribute(mistPositions,3));
const waterfallMist=new THREE.Points(mistGeo,new THREE.PointsMaterial({
  color:0xd7e0dc,size:1.25,transparent:true,opacity:.12,depthWrite:false,sizeAttenuation:true
}));
scene.add(waterfallMist);
// Rochas de base da cachoeira: fragmentos angulares apoiados no chão, não empilhados em esfera.
const talusGeo=new THREE.IcosahedronGeometry(1,1);
{
  const a=talusGeo.attributes.position;
  for(let i=0;i<a.count;i++){
    const x=a.getX(i),y=a.getY(i),z=a.getZ(i),n=hash2(i*3.1,Math.round(y*40));
    a.setXYZ(i,x*(.75+n*.42),y*(.58+n*.22),z*(.78+n*.35));
  }
  talusGeo.computeVertexNormals();
}
const talus=new THREE.InstancedMesh(talusGeo,cliffMat,34);
for(let i=0;i<34;i++){
  const x=-153+(rnd()-.5)*92,z=-556+(rnd()-.5)*66;
  bankDummy.position.set(x,groundHeight(x,z)+.08,z);
  bankDummy.rotation.set((rnd()-.5)*.23,rnd()*Math.PI*2,(rnd()-.5)*.18);
  bankDummy.scale.set(2+rnd()*8,.5+rnd()*2.4,1.5+rnd()*6);
  bankDummy.updateMatrix();talus.setMatrixAt(i,bankDummy.matrix);
}
talus.instanceMatrix.needsUpdate=true;talus.castShadow=true;scene.add(talus);

// ============================================================================