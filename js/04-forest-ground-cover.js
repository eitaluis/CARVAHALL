// 8. FLORESTA DE PINHEIROS — MASSAS VARIADAS NA BORDA DO VALE
// ============================================================================
function irregularCone(radius=1,height=1,segments=8){
  const g=new THREE.ConeGeometry(radius,height,segments,2);
  const a=g.attributes.position;
  for(let i=0;i<a.count;i++){
    const x=a.getX(i),y=a.getY(i),z=a.getZ(i),n=hash2(Math.round(x*100+7),Math.round(z*100-3));
    if(y>-height*.49){a.setX(i,x*(.82+n*.38));a.setZ(i,z*(.82+n*.38));a.setY(i,y+(n-.5)*height*.055);}
  }
  g.computeVertexNormals();return g;
}
const trunkGeo=new THREE.CylinderGeometry(.17,.35,1,7,1);
const pineLayerGeo=[irregularCone(1,1.6,8),irregularCone(1,1.45,8),irregularCone(1,1.35,8),irregularCone(1,1.15,8)];
const trunkInst=new THREE.InstancedMesh(trunkGeo,new THREE.MeshStandardMaterial({color:0x57402b,roughness:1}),520);
const pineMats=[0x25392d,0x314636,0x3a4a36,0x283d31].map(c=>new THREE.MeshStandardMaterial({color:c,roughness:1}));
const pineInst=pineLayerGeo.map((g,i)=>new THREE.InstancedMesh(g,pineMats[i],520));
const dummy=new THREE.Object3D();
let treeCount=0;
for(let i=0;i<520;i++){
  let x,z;
  for(let tries=0;tries<12;tries++){
    x=(rnd()-.5)*1500;z=(rnd()-.5)*1500;
    const d=Math.hypot(x-100,z-20);
    if(d>340 && !nearRiver(x,z,20) && !(z>-70&&z<260&&x>-80&&x<360))break;
  }
  const h=13+rnd()*16,r=3.2+rnd()*4.8,rot=rnd()*Math.PI*2;
  dummy.position.set(x,groundHeight(x,z)+h*.47,z);dummy.rotation.set(0,rot,0);dummy.scale.set(r*.075,h,r*.075);dummy.updateMatrix();trunkInst.setMatrixAt(i,dummy.matrix);
  const shade=(rnd()-.5)*.18;
  for(let k=0;k<4;k++){
    const f=[.25,.43,.61,.77][k],rr=r*[1,.82,.62,.4][k],hh=h*[.34,.31,.28,.24][k];
    dummy.position.set(x,groundHeight(x,z)+h*f,z);dummy.rotation.set(0,rot+(rnd()-.5)*.12,0);dummy.scale.set(rr,hh,rr);dummy.updateMatrix();
    pineInst[k].setMatrixAt(i,dummy.matrix);pineInst[k].setColorAt(i,new THREE.Color().setHSL(.31+shade,.26,.16+shade*.3));
  }
  treeCount++;
}
trunkInst.count=treeCount;trunkInst.instanceMatrix.needsUpdate=true;scene.add(trunkInst);
for(const inst of pineInst){inst.count=treeCount;inst.instanceMatrix.needsUpdate=true;inst.castShadow=false;inst.receiveShadow=true;scene.add(inst);}

// ============================================================================
// 9. VEGETAÇÃO BAIXA, CAPIM SECO, MOITAS E SEIXOS
// ============================================================================
const grassGeo=new THREE.ConeGeometry(.15,.7,4,1);grassGeo.translate(0,.34,0);
const grassMat=new THREE.MeshStandardMaterial({color:0x938653,roughness:1});
const grassInst=new THREE.InstancedMesh(grassGeo,grassMat,1900);
for(let i=0;i<1900;i++){
  let x=(rnd()-.5)*1450,z=(rnd()-.5)*1450;
  if(Math.hypot(x-100,z)<160 || nearRiver(x,z,8)){x+=250;}
  const h=.35+rnd()*.9;dummy.position.set(x,groundHeight(x,z)+.02+h*.25,z);dummy.rotation.set((rnd()-.5)*.22,rnd()*Math.PI*2,(rnd()-.5)*.22);dummy.scale.set(.35+rnd()*.8,h,.35+rnd()*.8);dummy.updateMatrix();grassInst.setMatrixAt(i,dummy.matrix);
  grassInst.setColorAt(i,new THREE.Color().setHSL(.13+rnd()*.06,.24,.3+rnd()*.13));
}
grassInst.instanceMatrix.needsUpdate=true;scene.add(grassInst);
const shrubMat=new THREE.MeshStandardMaterial({color:0x4e5637,roughness:1});
for(let i=0;i<120;i++){
  const x=(rnd()-.5)*1000,z=(rnd()-.5)*1050;
  if(Math.hypot(x-100,z)<190||nearRiver(x,z,10))continue;
  const bush=new THREE.Mesh(new THREE.DodecahedronGeometry(1,1),shrubMat);bush.position.set(x,groundHeight(x,z)+.8,z);bush.scale.set(1.3+rnd()*2,.6+rnd()*.8,1+rnd()*1.6);bush.rotation.y=rnd()*Math.PI;scene.add(bush);
}

// ============================================================================
