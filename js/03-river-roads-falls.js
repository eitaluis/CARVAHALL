// 6. GEOMETRIA DE FAIXAS: ESTRADAS E RIO ANORA
// ============================================================================
function makeRibbon(curve,width,material,offset=.035,segments=100,widthFn=null){
  const verts=[],uv=[],indices=[];
  for(let i=0;i<=segments;i++){
    const t=i/segments,p=curve.getPointAt(t),tan=curve.getTangentAt(t).normalize();
    const side=new THREE.Vector3(-tan.z,0,tan.x).normalize();
    const w=widthFn?widthFn(t):width;
    const a=p.clone().addScaledVector(side,-w*.5),b=p.clone().addScaledVector(side,w*.5);
    a.y=groundHeight(a.x,a.z)+offset;b.y=groundHeight(b.x,b.z)+offset;
    verts.push(a.x,a.y,a.z,b.x,b.y,b.z);uv.push(0,t*10,1,t*10);
    if(i<segments){const n=i*2;indices.push(n,n+2,n+1,n+1,n+2,n+3);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
  const m=new THREE.Mesh(g,material);m.receiveShadow=true;scene.add(m);return m;
}
const riverCurve=new THREE.CatmullRomCurve3([
  new THREE.Vector3(-150,-.4,-565),new THREE.Vector3(-137,-.4,-445),new THREE.Vector3(-129,-.4,-300),
  new THREE.Vector3(-117,-.4,-145),new THREE.Vector3(-102,-.4,25),new THREE.Vector3(-82,-.4,205),
  new THREE.Vector3(-48,-.4,385),new THREE.Vector3(-12,-.4,590),new THREE.Vector3(18,-.4,790)
]);
const waterMat=new THREE.MeshStandardMaterial({color:0x668b91,metalness:.12,roughness:.2,transparent:true,opacity:.9,side:THREE.DoubleSide});
const riverMesh=makeRibbon(riverCurve,42,waterMat,-.95,180,t=>35+7*Math.sin(t*Math.PI*5));
const bankMat=new THREE.MeshStandardMaterial({color:0x877d62,roughness:1});
for(let i=0;i<150;i++){
  const t=rnd(),p=riverCurve.getPointAt(t),tan=riverCurve.getTangentAt(t),side=new THREE.Vector3(-tan.z,0,tan.x).normalize();
  const sign=rnd()<.5?-1:1,dist=22+rnd()*10;
  const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.7+rnd()*2.3,0),bankMat);
  rock.position.set(p.x+side.x*dist*sign,groundHeight(p.x+side.x*dist*sign,p.z+side.z*dist*sign)+.2,p.z+side.z*dist*sign);
  rock.rotation.set(rnd()*1.5,rnd()*Math.PI,rnd()*1.2);rock.scale.set(1+rnd(),.45+rnd()*.55,.7+rnd()*.6);rock.castShadow=true;scene.add(rock);
}
function nearRiver(x,z,margin=0){
  let best=1e9;for(let i=0;i<=90;i++){const p=riverCurve.getPointAt(i/90);best=Math.min(best,Math.hypot(x-p.x,z-p.z));}
  return best<21+margin;
}

// Estradas de terra batida. O traçado serve à circulação, mas não é uma planta canônica.
const roadPaths=[
  [[255,420],[220,290],[150,170],[105,65],[74,-38],[65,-175],[93,-320]],
  [[105,65],[190,100],[270,80],[345,38]],
  [[150,170],[40,190],[-15,125],[-48,30]],
  [[74,-38],[165,-80],[248,-150]],
  [[105,65],[18,5],[-8,-85],[-12,-160]]
];
const roadCurves=[];
for(const pts of roadPaths){const c=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(p[0],0,p[1])));roadCurves.push(c);makeRibbon(c,pts.length===5?8:6,dirtMat,.055,70);}
// Rodados leves nas bordas da via principal.
for(const c of roadCurves.slice(0,1)){
  for(const side of [-1,1]){
    const pts=[];for(let i=0;i<=70;i++){const t=i/70,p=c.getPointAt(t),tan=c.getTangentAt(t),n=new THREE.Vector3(-tan.z,0,tan.x).normalize();pts.push(new THREE.Vector3(p.x+n.x*side*2.2,groundHeight(p.x+n.x*side*2.2,p.z+n.z*side*2.2)+.09,p.z+n.z*side*2.2));}
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x65533b,transparent:true,opacity:.36}));scene.add(line);
  }
}

// ============================================================================
// 7. CATARATAS DE IGUALDA E CONTRAFORTES DA ESPINHA
// ============================================================================
const cliffMat=new THREE.MeshStandardMaterial({color:0x77776b,map:stoneTex,roughness:1});
const cliffDarkMat=new THREE.MeshStandardMaterial({color:0x55594f,roughness:1});
function addRockMass(x,y,z,sx,sy,sz,mat=cliffMat){
  const m=new THREE.Mesh(new THREE.DodecahedronGeometry(1,1),mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.set(rnd()*.4,rnd()*Math.PI,rnd()*.35);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;
}
// Parede rochosa distante ao norte; a cascata cai de uma grande escarpa.
for(let i=0;i<36;i++){
  const x=-300+rnd()*340,z=-630-rnd()*35,y=55+rnd()*95;
  addRockMass(x,y,z,22+rnd()*45,28+rnd()*55,20+rnd()*26,i%3?cliffMat:cliffDarkMat);
}
const fallsGlow=new THREE.PointLight(0xd7e7e8,1.0,230);fallsGlow.position.set(-145,24,-560);scene.add(fallsGlow);
const fallMat=new THREE.MeshStandardMaterial({color:0xc4d8d9,transparent:true,opacity:.78,roughness:.22,metalness:.08,side:THREE.DoubleSide,emissive:0x385d64,emissiveIntensity:.23});
const falls=[];
for(let i=0;i<4;i++){
  const w=13+rnd()*9,h=95+rnd()*36;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h,1,18),fallMat);
  mesh.position.set(-161+i*12,43+rnd()*8,-590+i*2);mesh.rotation.y=(rnd()-.5)*.08;scene.add(mesh);falls.push(mesh);
}
const pool=new THREE.Mesh(new THREE.CircleGeometry(38,40),new THREE.MeshStandardMaterial({color:0x718e91,roughness:.28,transparent:true,opacity:.86}));
pool.rotation.x=-Math.PI/2;pool.position.set(-145,-.65,-555);scene.add(pool);
for(let i=0;i<28;i++)addRockMass(-150+(rnd()-.5)*90,.5+rnd()*12,-550+(rnd()-.5)*75,5+rnd()*14,3+rnd()*12,5+rnd()*16,i%2?cliffMat:cliffDarkMat);
// Silhuetas irregulares das montanhas: cones deformados, cobertos por faixas de pinheiros.
function addMountain(x,z,r,h,withSnow=true){
  const g=new THREE.ConeGeometry(r,h,11,5);const a=g.attributes.position;
  for(let i=0;i<a.count;i++){
    const y=a.getY(i),xx=a.getX(i),zz=a.getZ(i),n=fbm(xx*.035+x*.01,zz*.035+z*.01,3);
    a.setX(i,xx*(.82+n*.34));a.setZ(i,zz*(.82+n*.34));a.setY(i,y+(n-.5)*h*.055);
  }
  g.computeVertexNormals();const m=new THREE.Mesh(g,cliffDarkMat);m.position.set(x,h*.46,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);
  if(withSnow){const snow=new THREE.Mesh(new THREE.ConeGeometry(r*.34,h*.27,11,2),new THREE.MeshStandardMaterial({color:0xb9c3bf,roughness:1}));snow.position.set(x,h*.86,z);scene.add(snow);}
}
addMountain(-650,-560,220,420,true);addMountain(-430,-770,190,370,true);addMountain(-760,-150,260,390,false);
addMountain(620,-650,240,330,true);addMountain(800,-150,230,350,false);
addMountain(-560,480,220,280,false);addMountain(700,520,260,270,false);

// ============================================================================
