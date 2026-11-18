// FLORESTA E COBERTURA DO SOLO — PINHEIROS ALTOS, COPAS IRREGULARES E CAPIM SECO
// Instancing mantém a densidade de vegetação sem criar milhares de chamadas de desenho.

function makeFirCrown(){
  const profile=[
    [0.00,.10],[.08,.34],[.17,.53],[.25,.45],[.36,.72],
    [.46,.57],[.57,.70],[.68,.50],[.78,.58],[.89,.30],[1,.015]
  ];
  const segments=32,verts=[],colors=[],indices=[],col=new THREE.Color();
  for(let r=0;r<profile.length;r++){
    const y=profile[r][0],baseRadius=profile[r][1];
    for(let s=0;s<=segments;s++){
      const a=s/segments*Math.PI*2;
      const lobe=1+.12*Math.sin(a*7+r*.73)+.065*Math.sin(a*13-r*1.2);
      const noise=(hash2(r*17+s*3.1, s*11-r*5.7)-.5)*.12;
      const radius=baseRadius*(lobe+noise);
      const centerX=Math.sin(r*.65)*.025,centerZ=Math.cos(r*.52)*.025;
      verts.push(
        Math.cos(a)*radius+centerX,
        y+(hash2(s*2.7,r*13.1)-.5)*.018,
        Math.sin(a)*radius+centerZ
      );
      const shade=.17+y*.055+(hash2(s*4.3,r*19.7)-.5)*.045;
      col.setHSL(.30+(hash2(s*8,r*5)-.5)*.035,.31,shade);
      colors.push(col.r,col.g,col.b);
      if(r<profile.length-1&&s<segments){
        const a0=r*(segments+1)+s,b0=a0+1,c0=a0+segments+1,d0=c0+1;
        indices.push(a0,c0,b0,b0,c0,d0);
      }
    }
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
  g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  g.setIndex(indices);g.computeVertexNormals();
  return g;
}

const firCrownGeo=makeFirCrown();
const trunkGeo=new THREE.CylinderGeometry(.13,.38,1,9,5);
{
  const a=trunkGeo.attributes.position;
  for(let i=0;i<a.count;i++){
    const y=a.getY(i);
    a.setX(i,a.getX(i)+Math.sin(y*3.7)*.045);
    a.setZ(i,a.getZ(i)+Math.cos(y*2.8)*.035);
  }
  trunkGeo.computeVertexNormals();
}
const trunkMat=new THREE.MeshStandardMaterial({color:0x56402d,roughness:1});
const crownMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1});
const treeClusters=[
  [-660,-455],[-330,-770],[310,-805],[735,-450],
  [-770,120],[770,190],[-540,650],[510,710]
];
const treeCount=470;
const trunkInst=new THREE.InstancedMesh(trunkGeo,trunkMat,treeCount);
const crownInst=new THREE.InstancedMesh(firCrownGeo,crownMat,treeCount);
const treeDummy=new THREE.Object3D();
let placedTrees=0;

for(let i=0;i<treeCount;i++){
  let x=0,z=0,valid=false;
  for(let attempt=0;attempt<26;attempt++){
    if(rnd()<.84){
      const center=treeClusters[Math.floor(rnd()*treeClusters.length)];
      const angle=rnd()*Math.PI*2,rad=75+Math.sqrt(rnd())*190;
      x=center[0]+Math.cos(angle)*rad*1.3;
      z=center[1]+Math.sin(angle)*rad;
    }else{
      x=(rnd()-.5)*1740;z=(rnd()-.5)*1740;
    }
    const villageDistance=Math.hypot(x-100,z-25);
    if(villageDistance>300&&!nearRiver(x,z,34)&&Math.abs(x)<930&&Math.abs(z)<930){valid=true;break;}
  }
  if(!valid)continue;
  const h=16+rnd()*17,radius=3.8+rnd()*3.6,ground=groundHeight(x,z);
  const rot=rnd()*Math.PI*2;
  treeDummy.position.set(x,ground+h*.34,z);
  treeDummy.rotation.set(0,rot,0);
  treeDummy.scale.set(radius*.105,h*.68,radius*.105);
  treeDummy.updateMatrix();trunkInst.setMatrixAt(placedTrees,treeDummy.matrix);

  treeDummy.position.set(x,ground+h*.19,z);
  treeDummy.rotation.set(0,rot,0);
  treeDummy.scale.set(radius,h*.82,radius);
  treeDummy.updateMatrix();crownInst.setMatrixAt(placedTrees,treeDummy.matrix);
  const tint=new THREE.Color().setHSL(.30+(rnd()-.5)*.035,.22,.86+(rnd()-.5)*.12);
  crownInst.setColorAt(placedTrees,tint);
  placedTrees++;
}
trunkInst.count=placedTrees;crownInst.count=placedTrees;
trunkInst.instanceMatrix.needsUpdate=true;crownInst.instanceMatrix.needsUpdate=true;
if(crownInst.instanceColor)crownInst.instanceColor.needsUpdate=true;
trunkInst.castShadow=false;trunkInst.receiveShadow=true;
crownInst.castShadow=false;crownInst.receiveShadow=true;
scene.add(trunkInst,crownInst);

// Tufo de capim: folhas finas, curvas e pontiagudas em vez de cones geométricos.
function makeGrassTuft(){
  const verts=[],indices=[];
  for(let b=0;b<5;b++){
    const a=b/5*Math.PI*2+(b%2)*.35;
    const spread=.10+(b%3)*.035;
    const height=.62+(b%3)*.16;
    const dx=Math.cos(a),dz=Math.sin(a),px=-dz,pz=dx;
    const baseX=dx*spread,baseZ=dz*spread;
    const bend=.16+(b%2)*.08;
    const first=verts.length/3;
    verts.push(
      baseX-px*.045,.02,baseZ-pz*.045,
      baseX+px*.045,.02,baseZ+pz*.045,
      baseX+dx*bend+px*.012,height,baseZ+dz*bend+pz*.012
    );
    indices.push(first,first+1,first+2,first+2,first+1,first);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
  g.setIndex(indices);g.computeVertexNormals();return g;
}
const grassGeo=makeGrassTuft();
const grassMat=new THREE.MeshStandardMaterial({
  color:0xb4a071,roughness:1,side:THREE.DoubleSide
});
const grassCount=5200;
const grassInst=new THREE.InstancedMesh(grassGeo,grassMat,grassCount);
const grassDummy=new THREE.Object3D();
let grassPlaced=0;
for(let i=0;i<grassCount;i++){
  const x=(rnd()-.5)*1900,z=(rnd()-.5)*1900;
  if(Math.hypot(x-100,z-25)<135||nearRiver(x,z,8))continue;
  const h=.45+rnd()*1.1;
  grassDummy.position.set(x,groundHeight(x,z)+.025,z);
  grassDummy.rotation.set((rnd()-.5)*.12,rnd()*Math.PI*2,(rnd()-.5)*.12);
  grassDummy.scale.set(.55+rnd()*.85,h,.55+rnd()*.85);
  grassDummy.updateMatrix();grassInst.setMatrixAt(grassPlaced,grassDummy.matrix);
  const tint=new THREE.Color().setHSL(.105+rnd()*.035,.30,.38+rnd()*.14);
  grassInst.setColorAt(grassPlaced,tint);
  grassPlaced++;
}
grassInst.count=grassPlaced;grassInst.instanceMatrix.needsUpdate=true;
if(grassInst.instanceColor)grassInst.instanceColor.needsUpdate=true;
grassInst.castShadow=false;scene.add(grassInst);

// Moitas baixas de folhas estreitas: pequenas massas irregulares em vez de esferas.
function makeBramble(){
  const verts=[],indices=[];
  for(let i=0;i<13;i++){
    const a=i*2.399963,rad=.18+(i%4)*.13;
    const x=Math.cos(a)*rad,z=Math.sin(a)*rad,y=.18+(i%5)*.11;
    const len=.55+(i%4)*.16,w=.11+(i%3)*.035;
    const side=a+Math.PI/2,dx=Math.cos(side)*w,dz=Math.sin(side)*w;
    const tipX=x+Math.cos(a)*len,tipZ=z+Math.sin(a)*len,tipY=y+.08+(i%3)*.05;
    const n=verts.length/3;
    verts.push(x-dx,y,z-dz,x+dx,y,z+dz,tipX,tipY,tipZ);
    indices.push(n,n+1,n+2,n+2,n+1,n);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
  g.setIndex(indices);g.computeVertexNormals();return g;
}
const shrubGeo=makeBramble();
const shrubMat=new THREE.MeshStandardMaterial({color:0x71744c,roughness:1,side:THREE.DoubleSide});
const shrubs=new THREE.InstancedMesh(shrubGeo,shrubMat,145);
for(let i=0;i<145;i++){
  const x=(rnd()-.5)*1500,z=(rnd()-.5)*1500;
  if(Math.hypot(x-100,z-25)<180||nearRiver(x,z,14))continue;
  treeDummy.position.set(x,groundHeight(x,z)+.025,z);
  treeDummy.rotation.set(0,rnd()*Math.PI*2,0);
  treeDummy.scale.set(.9+rnd()*1.8,.8+rnd()*.8,.9+rnd()*1.8);
  treeDummy.updateMatrix();shrubs.setMatrixAt(i,treeDummy.matrix);
}
shrubs.instanceMatrix.needsUpdate=true;shrubs.castShadow=false;scene.add(shrubs);

// ============================================================================