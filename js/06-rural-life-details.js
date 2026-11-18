// FASE 2 — VIDA RURAL E VARIANTE HISTÓRICA DO REBANHO
// Este módulo vem depois da arquitetura rural: usa BUILDINGS, makeFence,
// logBeam, box, groundHeight, materiais e a cena já inicializada.

// Celeiro de feno interpretativo: a narrativa menciona o celeiro e o perigo
// do fogo, mas não fixa sua posição exata dentro do vilarejo.
const hayBarn = (() => {
  const x=392,z=282,rot=-.14,w=18,d=14,base=.58,rows=7,step=.39,logR=.22;
  const g=new THREE.Group();
  g.position.set(x,groundHeight(x,z),z);
  g.rotation.y=rot;
  scene.add(g);

  // Fundação irregular de pedra.
  for(const xx of [-w/2+.6,w/2-.6]){
    for(const zz of [-d/2+.6,d/2-.6]){
      const p=new THREE.Mesh(new THREE.DodecahedronGeometry(.62,0),stoneMat);
      p.position.set(xx,.35,zz);p.scale.set(1.45,.72,1.2);p.castShadow=true;g.add(p);
    }
  }

  // Paredes de troncos; a fachada dianteira mantém um vão largo para feno.
  const doorW=4.4;
  for(let i=0;i<rows;i++){
    const y=base+i*step;
    logBeam(g,d+.7,logR,-w/2,y,0,'z',i%3?woodMat:darkWoodMat);
    logBeam(g,d+.7,logR,w/2,y,0,'z',i%3?woodMat:darkWoodMat);
    logBeam(g,w+.7,logR,0,y,d/2,'x',i%3?woodMat:darkWoodMat);
    const half=(w-doorW)/4;
    logBeam(g,half*2+.1,logR,-w/2+half,y,-d/2,'x',i%3?woodMat:darkWoodMat);
    logBeam(g,half*2+.1,logR,w/2-half,y,-d/2,'x',i%3?woodMat:darkWoodMat);
  }
  for(const xx of [-w/2+.1,-doorW/2,doorW/2,w/2-.1]){
    box(g,.26,3.15,.28,darkWoodMat,xx,2.0,-d/2-.05);
  }
  box(g,doorW+.4,.25,.34,darkWoodMat,0,3.45,-d/2-.06);

  // Portas duplas parcialmente abertas, com tábuas e travessas.
  for(const side of [-1,1]){
    const leaf=new THREE.Group();
    leaf.position.set(side*doorW/2,0,-d/2-.14);
    g.add(leaf);
    const panel=box(leaf,doorW/2-.15,2.75,.18,woodMat,side*(doorW/4-.08),1.48,0);
    for(let j=0;j<4;j++){
      box(leaf,.09,2.58,.07,paleWoodMat,
        side*(.22+j*.23),1.48,-.12);
    }
    box(leaf,doorW/2-.2,.14,.12,darkWoodMat,side*(doorW/4-.08),.72,-.13);
    box(leaf,doorW/2-.2,.14,.12,darkWoodMat,side*(doorW/4-.08),2.22,-.13);
    leaf.rotation.y=side*.48;
  }

  // Empena de madeira sob o telhado.
  const shape=new THREE.Shape();
  const eave=base+rows*step+.15,rise=1.95,run=d/2+1;
  shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(0,rise);shape.closePath();
  const gableMat=new THREE.MeshStandardMaterial({color:0x6d5238,roughness:1,side:THREE.DoubleSide});
  const gableGeo=new THREE.ShapeGeometry(shape);
  for(const zz of [-d/2-.08,d/2+.08]){
    const gm=new THREE.Mesh(gableGeo,gableMat);gm.position.set(0,eave,zz);gm.castShadow=true;g.add(gm);
  }

  const slope=Math.atan2(rise,run),sl=Math.hypot(run,rise);
  box(g,w+1.7,.25,sl,thatchMat,0,eave+rise/2,-run/2,-slope,0,0);
  box(g,w+1.7,.25,sl,thatchMat,0,eave+rise/2,run/2,slope,0,0);
  logBeam(g,w+1.3,.2,0,eave+rise+.04,0,'x',darkWoodMat);

  // Abertura do sótão, pequenas ripas e placa sem nome próprio.
  box(g,3.1,1.15,.12,darkWoodMat,0,eave+.85,-d/2-.12);
  for(let i=0;i<7;i++)box(g,.08,1.02,.08,paleWoodMat,-1.3+i*.43,eave+.85,-d/2-.2);
  const sign=box(g,3.4,.82,.12,darkWoodMat,0,4.9,-d/2-.18);
  makeSign(g,'CELEIRO',0,4.95,-d/2-.27,3.1);

  // Dois montes de feno e fardos prensados junto à parede lateral.
  const hayMat=new THREE.MeshStandardMaterial({color:0xb79b5e,roughness:1});
  const hayDarkMat=new THREE.MeshStandardMaterial({color:0x8d7546,roughness:1});
  for(let i=0;i<5;i++){
    const bale=new THREE.Mesh(new THREE.BoxGeometry(1.65,1.05,1.15),hayMat);
    bale.position.set(w/2+1.1,groundHeight(x+w/2+1.1,z-3+i*1.3)-groundHeight(x,z)+.55,z*0+(-3+i*1.3));
    bale.rotation.y=(i%2)*.12;bale.castShadow=true;g.add(bale);
    box(g,1.72,.055,1.2,hayDarkMat,w/2+1.1,1.05,-3+i*1.3);
  }

  BUILDINGS.push({name:'Celeiro de feno (posição interpretativa)',x,z,rot,w,d,doorW});
  return g;
})();

// Cercado de pastagem ao lado do celeiro. A posição é uma solução de cena,
// não uma localização explicitamente cartografada no romance.
makeFence([[414,248],[466,248],[466,318],[414,318],[414,248]],2);

// Rebanho histórico opcional de mais de cem ovelhas, associado à retirada dos
// animais do lado oriental do vale em Eldest. Fica oculto na vila cotidiana.
const historicFlock = (() => {
  const group=new THREE.Group();
  scene.add(group);
  const count=108;
  const bodyMat=new THREE.MeshStandardMaterial({color:0xd7d0bd,roughness:1});
  const woolMat=new THREE.MeshStandardMaterial({color:0xe7e0cf,roughness:1});
  const faceMat=new THREE.MeshStandardMaterial({color:0x655a4d,roughness:1});
  const muzzleMat=new THREE.MeshStandardMaterial({color:0x9a8772,roughness:1});
  const hoofMat=new THREE.MeshStandardMaterial({color:0x403a32,roughness:1});
  const bodyGeo=new THREE.SphereGeometry(1,10,8);
  const woolGeo=new THREE.SphereGeometry(1,8,7);
  const headGeo=new THREE.SphereGeometry(1,8,7);
  const muzzleGeo=new THREE.SphereGeometry(1,7,6);
  const legGeo=new THREE.CylinderGeometry(.065,.052,1,6);
  const bodies=new THREE.InstancedMesh(bodyGeo,bodyMat,count);
  const wool=new THREE.InstancedMesh(woolGeo,woolMat,count*5);
  const heads=new THREE.InstancedMesh(headGeo,faceMat,count);
  const muzzles=new THREE.InstancedMesh(muzzleGeo,muzzleMat,count);
  const legs=new THREE.InstancedMesh(legGeo,hoofMat,count*4);
  const o=new THREE.Object3D();
  let wi=0,li=0;
  const set=(mesh,index,x,y,z,yaw,sx,sy,sz)=>{
    o.position.set(x,y,z);o.rotation.set(0,yaw,0);o.scale.set(sx,sy,sz);o.updateMatrix();mesh.setMatrixAt(index,o.matrix);
  };
  for(let i=0;i<count;i++){
    const t=i/(count-1),lane=(i%12)-5.5,rank=Math.floor(i/12)-4;
    const cx=449-78*t,cz=268+150*t;
    const x=cx+lane*2.0+(rnd()-.5)*1.25;
    const z=cz+rank*2.2+(rnd()-.5)*1.35;
    const y=groundHeight(x,z),yaw=.42+(rnd()-.5)*.45;
    set(bodies,i,x,y+.91,z,yaw,.77,.56,.48);
    const tufts=[
      [-.42,.15,-.25],[-.05,.27,-.32],[.34,.16,-.22],
      [-.38,.08,.22],[.02,.27,.31],[.38,.08,.2]
    ];
    for(let j=0;j<5;j++){
      const [ox,oy,oz]=tufts[j];
      const rx=ox*Math.cos(yaw)+oz*Math.sin(yaw),rz=-ox*Math.sin(yaw)+oz*Math.cos(yaw);
      set(wool,wi++,x+rx,y+.92+oy,z+rz,yaw,.31,.29,.3);
    }
    const hx=x+Math.sin(yaw)*.55,hz=z+Math.cos(yaw)*.55;
    set(heads,i,hx,y+1.0,hz,yaw,.23,.29,.24);
    set(muzzles,i,hx+Math.sin(yaw)*.13,y+.88,hz+Math.cos(yaw)*.13,yaw,.14,.13,.17);
    for(const sx of [-.31,.31])for(const sz of [-.25,.25]){
      const lx=x+sx*Math.cos(yaw)+sz*Math.sin(yaw);
      const lz=z-sx*Math.sin(yaw)+sz*Math.cos(yaw);
      set(legs,li++,lx,y+.34,lz,yaw,.075,.54,.075);
    }
  }
  for(const mesh of [bodies,wool,heads,muzzles,legs]){
    mesh.instanceMatrix.needsUpdate=true;
    mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
  }
  group.visible=false;
  return group;
})();

let historicFlockVisible=false;
addEventListener('keydown',event=>{
  if(event.code!=='KeyL'||event.repeat||window.carvahallBurnedMode)return;
  historicFlockVisible=!historicFlockVisible;
  historicFlock.visible=historicFlockVisible;
  const tp=document.getElementById('tp');
  tp.textContent=historicFlockVisible
    ? 'Variante histórica: rebanho em deslocamento (Eldest)'
    : 'Vila cotidiana';
});
