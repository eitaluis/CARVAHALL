// MERCADO DE INVERNO — CARVAHALL EM ERAGON
// Cena opcional do primeiro livro: carroças, tendas, quatro tendas coloridas
// dos trovadores, fogueiras, bancas e neve pisada na rua principal.

const traderCamp=new THREE.Group();
scene.add(traderCamp);
traderCamp.visible=false;

function marketTent(parent,x,z,w,d,topColor,lowerColor,striped=false){
  const g=new THREE.Group();g.position.set(x,groundHeight(x,z),z);parent.add(g);
  const topMat=new THREE.MeshStandardMaterial({color:topColor,roughness:1,side:THREE.DoubleSide});
  const lowerMat=new THREE.MeshStandardMaterial({color:lowerColor,roughness:1,side:THREE.DoubleSide});
  const verts=[
    -w/2,0,-d/2, w/2,0,-d/2, 0,3.6,0,
    w/2,0,-d/2, w/2,0,d/2, 0,3.6,0,
    w/2,0,d/2, -w/2,0,d/2, 0,3.6,0,
    -w/2,0,d/2, -w/2,0,-d/2, 0,3.6,0
  ];
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));geo.setIndex([
    0,1,2,3,4,5,6,7,8,9,10,11
  ]);geo.computeVertexNormals();
  const canopy=new THREE.Mesh(geo,topMat);canopy.castShadow=true;g.add(canopy);
  // Saias de tecido e listras verticais.
  for(const side of [-1,1]){
    const panel=new THREE.Mesh(new THREE.PlaneGeometry(w*.48,1.05),lowerMat);
    panel.position.set(side*w*.23,.55,-d/2+.03);g.add(panel);
  }
  if(striped){
    for(let i=0;i<6;i++){
      const stripe=new THREE.Mesh(new THREE.PlaneGeometry(.32,1.0),
        new THREE.MeshStandardMaterial({color:i%2?0xe8d2a4:lowerColor,roughness:1,side:THREE.DoubleSide}));
      stripe.position.set(-w*.42+i*w*.168,.55,-d/2-.015);g.add(stripe);
    }
  }
  for(const [px,pz] of [[-w/2,-d/2],[w/2,-d/2],[-w/2,d/2],[w/2,d/2]]){
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.07,.09,2.1,7),darkWoodMat);
    pole.position.set(px,.98,pz);pole.castShadow=true;g.add(pole);
  }
  const finial=new THREE.Mesh(new THREE.SphereGeometry(.16,8,7),paleWoodMat);
  finial.position.y=3.68;g.add(finial);
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
  return {group:g,fire,light};
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

// Animação leve das chamas controlada pelo loop do jogador.
const marketFires=[campFireA,campFireB,campFireC];
