// FASE 3 — CARVAHALL EM PREPARAÇÃO DEFENSIVA (ELDEST)
// Variante histórica opcional: trincheira em cerca de dois terços do perímetro,
// terra acumulada pelo lado interno, paliçada de troncos e vegetação espinhosa.
// A posição exata do traçado é interpretativa; o flanco do rio permanece aberto.

const wartimeDefenses = (() => {
  const group=new THREE.Group();
  scene.add(group);

  const centerX=125,centerZ=30,rx=230,rz=246;
  const start=-2.16,end=2.16,segments=86;
  const soilMat=new THREE.MeshStandardMaterial({color:0x68533a,roughness:1});
  const trenchMat=new THREE.MeshStandardMaterial({color:0x29251f,roughness:1});
  const timberMat=new THREE.MeshStandardMaterial({color:0x493322,roughness:1});
  const thornMat=new THREE.MeshStandardMaterial({color:0x263629,roughness:1});
  const thornTipMat=new THREE.MeshStandardMaterial({color:0x596044,roughness:1});

  const trench=new THREE.InstancedMesh(
    new THREE.BoxGeometry(4.6,.14,1),trenchMat,segments
  );
  const berm=new THREE.InstancedMesh(
    new THREE.BoxGeometry(3.8,.95,1),soilMat,segments
  );
  const postCount=248;
  const posts=new THREE.InstancedMesh(
    new THREE.CylinderGeometry(.10,.20,3.25,6),timberMat,postCount
  );
  const points=new THREE.InstancedMesh(
    new THREE.ConeGeometry(.17,.52,6),timberMat,postCount
  );
  const rails=new THREE.InstancedMesh(
    new THREE.BoxGeometry(.18,.22,1),timberMat,postCount*2
  );
  const brambleCount=118;
  const brambles=new THREE.InstancedMesh(
    new THREE.SphereGeometry(1,7,6),thornMat,brambleCount
  );
  const thornTips=new THREE.InstancedMesh(
    new THREE.ConeGeometry(.075,.42,5),thornTipMat,brambleCount*3
  );
  const o=new THREE.Object3D();

  const pointAt=t=>({x:centerX+rx*Math.cos(t),z:centerZ+rz*Math.sin(t)});
  const inward=(x,z)=>{
    const dx=centerX-x,dz=centerZ-z,n=Math.hypot(dx,dz)||1;
    return {x:dx/n,z:dz/n};
  };

  // Fundo escuro da trincheira e talude de terra voltado para a vila.
  for(let i=0;i<segments;i++){
    const t1=start+(end-start)*i/segments;
    const t2=start+(end-start)*(i+1)/segments;
    const p1=pointAt(t1),p2=pointAt(t2);
    const mx=(p1.x+p2.x)/2,mz=(p1.z+p2.z)/2;
    const dx=p2.x-p1.x,dz=p2.z-p1.z,len=Math.hypot(dx,dz);
    const angle=Math.atan2(dx,dz);
    o.position.set(mx,groundHeight(mx,mz)+.08,mz);
    o.rotation.set(0,angle,0);o.scale.set(1,1,len+1.3);o.updateMatrix();
    trench.setMatrixAt(i,o.matrix);

    const n=inward(mx,mz),bx=mx+n.x*4.1,bz=mz+n.z*4.1;
    o.position.set(bx,groundHeight(bx,bz)+.46,bz);
    o.rotation.set(0,angle,0);o.scale.set(1,1,len+1.1);o.updateMatrix();
    berm.setMatrixAt(i,o.matrix);
  }

  // Estacas afiadas e travessas sobrepostas; instancing mantém o custo baixo.
  for(let i=0;i<postCount;i++){
    const t=start+(end-start)*i/(postCount-1);
    const p=pointAt(t),n=inward(p.x,p.z);
    const x=p.x+n.x*2.0+(rnd()-.5)*.45;
    const z=p.z+n.z*2.0+(rnd()-.5)*.45;
    const y=groundHeight(x,z);
    o.position.set(x,y+1.72,z);
    o.rotation.set((rnd()-.5)*.11,Math.atan2(n.x,n.z)+(rnd()-.5)*.08,(rnd()-.5)*.09);
    o.scale.set(1,1,1);o.updateMatrix();posts.setMatrixAt(i,o.matrix);
    o.position.set(x,y+3.42,z);o.rotation.set(0,0,0);
    o.scale.set(1,1,1);o.updateMatrix();points.setMatrixAt(i,o.matrix);

    const before=pointAt(Math.max(start,t-.006)),after=pointAt(Math.min(end,t+.006));
    const tangentAngle=Math.atan2(after.x-before.x,after.z-before.z);
    for(let row=0;row<2;row++){
      const k=i*2+row;
      o.position.set(x+n.x*.55,y+1.05+row*.85,z+n.z*.55);
      o.rotation.set(0,tangentAngle,0);o.scale.set(1,1,4.8);o.updateMatrix();
      rails.setMatrixAt(k,o.matrix);
    }
  }

  // Moitas espinhosas irregulares entre os troncos e a vala.
  for(let i=0;i<brambleCount;i++){
    const t=start+(end-start)*(i+.5)/brambleCount;
    const p=pointAt(t),n=inward(p.x,p.z);
    const x=p.x+n.x*5.7+(rnd()-.5)*2.4;
    const z=p.z+n.z*5.7+(rnd()-.5)*2.4;
    const y=groundHeight(x,z);
    o.position.set(x,y+.55,z);o.rotation.set(0,rnd()*Math.PI,0);
    o.scale.set(1.35+rnd()*.8,.55+rnd()*.35,.85+rnd()*.6);
    o.updateMatrix();brambles.setMatrixAt(i,o.matrix);
    for(let j=0;j<3;j++){
      const k=i*3+j;
      o.position.set(x+(rnd()-.5)*1.1,y+.85+rnd()*.35,z+(rnd()-.5)*.8);
      o.rotation.set((rnd()-.5)*.5,rnd()*Math.PI,(rnd()-.5)*.5);
      o.scale.set(1,1,1);o.updateMatrix();thornTips.setMatrixAt(k,o.matrix);
    }
  }

  for(const mesh of [trench,berm,posts,points,rails,brambles,thornTips]){
    mesh.instanceMatrix.needsUpdate=true;
    mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
  }
 
  group.visible=false;
  return group;
})();

let wartimeDefensesVisible=false;
addEventListener('keydown',event=>{
  if(event.code!=='KeyP'||event.repeat||window.carvahallBurnedMode)return;
  wartimeDefensesVisible=!wartimeDefensesVisible;
  wartimeDefenses.visible=wartimeDefensesVisible;
  document.getElementById('tp').textContent=wartimeDefensesVisible
    ? 'Variante histórica: defesas de Carvahall (Eldest)'
    : 'Vila cotidiana';
});
