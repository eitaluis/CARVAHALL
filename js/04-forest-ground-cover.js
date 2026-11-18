// FLORESTA E COBERTURA DO SOLO — PINHEIROS ALTOS, COPAS IRREGULARES E CAPIM SECO
// Instancing mantém a densidade de vegetação sem criar milhares de chamadas de desenho.

function makeFirCrown(variant=0){
  // Copas compostas por tufos independentes: sem faixa contínua de cone/árvore de Natal.
  const verts=[],colors=[],indices=[],col=new THREE.Color();
  const tiers=variant===0?[.19,.30,.42,.54,.66,.77,.87,.94]:variant===1?[.16,.28,.39,.51,.64,.76,.88,.95]:[.21,.34,.47,.59,.70,.80,.89,.96];
  const spreads=variant===0?[.48,.62,.67,.64,.57,.47,.34,.20]:variant===1?[.58,.68,.61,.72,.58,.43,.30,.16]:[.42,.57,.72,.66,.62,.51,.37,.22];
  const branches=variant===1?8:variant===2?10:9;
  const sphere=new THREE.SphereGeometry(1,8,5);
  const pos=sphere.attributes.position;
  for(let tier=0;tier<tiers.length;tier++){
    for(let branch=0;branch<branches;branch++){
      const angle=branch/branches*Math.PI*2+tier*(variant===1?.29:variant===2?.43:.37)+(hash2(tier,branch+variant*17)-.5)*.36;
      const radial=new THREE.Vector3(Math.cos(angle),0,Math.sin(angle));
      const tangent=new THREE.Vector3(-radial.z,0,radial.x);
      const center=radial.clone().multiplyScalar(spreads[tier]*.57);
      center.y=tiers[tier]+(hash2(branch,tier*7)-.5)*.035;
      const length=spreads[tier]*(.57+hash2(tier,branch+variant*13)*.29);
      const width=.12+hash2(branch+variant*11,tier+3)*.075;
      const height=.075+hash2(branch+8+variant*5,tier)*.065;
      const base=verts.length/3;
      for(let i=0;i<pos.count;i++){
        const p=new THREE.Vector3(pos.getX(i),pos.getY(i),pos.getZ(i));
        const along=p.x*length;
        const around=p.z*width;
        const y=p.y*height;
        const out=center.clone().addScaledVector(radial,along).addScaledVector(tangent,around);
        out.y+=y;
        out.x+=(hash2(i,tier*11+branch)-.5)*.018;
        out.z+=(hash2(i+5,tier*13+branch)-.5)*.018;
        verts.push(out.x,out.y,out.z);
        const light=.18+tiers[tier]*.075+(hash2(i,branch*9+tier+variant*23)-.5)*.065;
        col.setHSL(.285+(hash2(i,branch)-.5)*.045,.34,light);
        colors.push(col.r,col.g,col.b);
      }
      const sphereIndex=sphere.index.array;
      for(let k=0;k<sphereIndex.length;k++)indices.push(base+sphereIndex[k]);
    }
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
  g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  g.setIndex(indices);g.computeVertexNormals();return g;
}
const firCrownGeos=[makeFirCrown(0),makeFirCrown(1),makeFirCrown(2)];
const trunkGeo=new THREE.CylinderGeometry(.13,.38,1,16,7);
{
  const a=trunkGeo.attributes.position;
  for(let i=0;i<a.count;i++){
    const y=a.getY(i);
    a.setX(i,a.getX(i)+Math.sin(y*3.7)*.045);
    a.setZ(i,a.getZ(i)+Math.cos(y*2.8)*.035);
  }
  trunkGeo.computeVertexNormals();
}
// Ramos e tufos de agulhas sobre a copa: a silhueta ganha textura de pinheiro,
// em vez de parecer uma pilha de cones ou uma massa de esferas verdes.
function makeFirDetailGeometry(){
  const verts=[],colors=[],indices=[],col=new THREE.Color();
  function addBranch(start,end,r1,r2){
    const axis=new THREE.Vector3().subVectors(end,start).normalize();
    let u=new THREE.Vector3().crossVectors(axis,new THREE.Vector3(0,1,0));
    if(u.lengthSq()<.001)u.set(1,0,0);
    u.normalize();
    const v=new THREE.Vector3().crossVectors(axis,u).normalize();
    const sides=5,base=verts.length/3;
    for(let ring=0;ring<2;ring++){
      const center=ring?end:start,r=ring?r2:r1;
      for(let k=0;k<sides;k++){
        const a=k/sides*Math.PI*2;
        const p=center.clone().addScaledVector(u,Math.cos(a)*r).addScaledVector(v,Math.sin(a)*r);
        verts.push(p.x,p.y,p.z);
        col.setHSL(.09,.22,ring?.15:.19);colors.push(col.r,col.g,col.b);
      }
    }
    for(let k=0;k<sides;k++){
      const n=(k+1)%sides,a=base+k,b=base+n,d=base+sides+k,e=base+sides+n;
      indices.push(a,d,b,b,d,e);
    }
  }
  function addNeedle(anchor,radial,tangent,fan,seedValue){
    const direction=radial.clone().multiplyScalar(.76)
      .addScaledVector(tangent,fan*.42)
      .add(new THREE.Vector3(0,.24+((seedValue%3)-1)*.08,0)).normalize();
    const length=.115+(seedValue%4)*.018,width=.012+(seedValue%3)*.002;
    const side=new THREE.Vector3().crossVectors(direction,new THREE.Vector3(0,1,0));
    if(side.lengthSq()<.001)side.set(1,0,0);
    side.normalize().multiplyScalar(width);
    const tip=anchor.clone().addScaledVector(direction,length);
    const n=verts.length/3;
    verts.push(
      anchor.x-side.x,anchor.y-side.y,anchor.z-side.z,
      anchor.x+side.x,anchor.y+side.y,anchor.z+side.z,
      tip.x,tip.y,tip.z
    );
    const light=.18+(seedValue%5)*.018;
    col.setHSL(.30+(seedValue%4)*.009,.38,light);colors.push(col.r,col.g,col.b);
    col.setHSL(.32+(seedValue%3)*.008,.42,light+.035);colors.push(col.r,col.g,col.b);
    col.setHSL(.31,.34,light+.02);colors.push(col.r,col.g,col.b);
    indices.push(n,n+1,n+2,n+2,n+1,n);
  }

  const tiers=[.18,.31,.44,.57,.70,.82,.91];
  const spreads=[.55,.68,.61,.73,.56,.45,.28];
  for(let tier=0;tier<tiers.length;tier++){
    const y=tiers[tier],spread=spreads[tier];
    for(let b=0;b<7;b++){
      const a=b/7*Math.PI*2+tier*.31;
      const radial=new THREE.Vector3(Math.cos(a),0,Math.sin(a));
      const tangent=new THREE.Vector3(-Math.sin(a),0,Math.cos(a));
      const start=new THREE.Vector3(0,y,0);
      const end=radial.clone().multiplyScalar(spread).add(new THREE.Vector3(0,-.035,0));
      addBranch(start,end,.018,.006);
      for(const t of [.58,.94]){
        const anchor=start.clone().lerp(end,t);
        for(let n=0;n<5;n++)addNeedle(anchor,radial,tangent,(n-2)*.48,tier*41+b*7+n);
      }
    }
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
  g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  g.setIndex(indices);g.computeVertexNormals();return g;
}
const firDetailGeo=makeFirDetailGeometry();
const firDetailMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide});
const trunkMat=new THREE.MeshStandardMaterial({color:0x56402d,roughness:1});
const crownMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1});
const treeWindShaders=[];
function addTreeWind(material,amount){
  material.onBeforeCompile=shader=>{
    shader.uniforms.uTreeWindTime={value:0};treeWindShaders.push(shader);
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float uTreeWindTime;');
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',
      '#include <begin_vertex>\n      float treePhase=uTreeWindTime*.42+dot(instanceMatrix[3].xz,vec2(.012,.016));\n      transformed.x+=sin(treePhase+transformed.y*2.1)*transformed.y*'+amount.toFixed(3)+';\n      transformed.z+=cos(treePhase*.76+transformed.y*1.7)*transformed.y*'+(amount*.58).toFixed(3)+';');
  };
}
addTreeWind(crownMat,.045);addTreeWind(firDetailMat,.06);
const treeClusters=[
  [-310,-310],[-500,-590],[405,-365],[690,-470],
  [-430,315],[520,315],[-520,670],[560,680]
];
const treeCount=520;
const trunkInst=new THREE.InstancedMesh(trunkGeo,trunkMat,treeCount);
const crownInsts=firCrownGeos.map(geo=>new THREE.InstancedMesh(geo,crownMat,treeCount));
const crownCounts=[0,0,0];
const firDetailInst=new THREE.InstancedMesh(firDetailGeo,firDetailMat,treeCount);
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
  const h=27+rnd()*19,radius=5.2+rnd()*5.6,ground=groundHeight(x,z);
  const rot=rnd()*Math.PI*2;
  treeDummy.position.set(x,ground+h*.34,z);
  treeDummy.rotation.set(0,rot,0);
  treeDummy.scale.set(radius*.105,h*.68,radius*.105);
  treeDummy.updateMatrix();trunkInst.setMatrixAt(placedTrees,treeDummy.matrix);

  treeDummy.position.set(x,ground+h*.19,z);
  treeDummy.rotation.set(0,rot,0);
  const crownVariant=Math.floor(rnd()*3),crownInst=crownInsts[crownVariant],crownSlot=crownCounts[crownVariant]++;
  const widthFactor=crownVariant===1?.92:crownVariant===2?1.08:1;
  treeDummy.scale.set(radius*widthFactor,h*(crownVariant===1?.88:crownVariant===2?.78:.82),radius*widthFactor);
  treeDummy.updateMatrix();crownInst.setMatrixAt(crownSlot,treeDummy.matrix);
  const tint=new THREE.Color().setHSL(.292+(rnd()-.5)*.055,.30,.64+(rnd()-.5)*.11);
  crownInst.setColorAt(crownSlot,tint);
  firDetailInst.setMatrixAt(placedTrees,treeDummy.matrix);
  placedTrees++;
}
trunkInst.count=placedTrees;firDetailInst.count=placedTrees;
for(let variant=0;variant<3;variant++){
  const crown=crownInsts[variant];crown.count=crownCounts[variant];
  crown.instanceMatrix.needsUpdate=true;crown.castShadow=false;crown.receiveShadow=true;
  if(crown.instanceColor)crown.instanceColor.needsUpdate=true;
}
trunkInst.instanceMatrix.needsUpdate=true;firDetailInst.instanceMatrix.needsUpdate=true;
trunkInst.castShadow=false;trunkInst.receiveShadow=true;
firDetailInst.castShadow=false;firDetailInst.receiveShadow=true;
scene.add(trunkInst,...crownInsts,firDetailInst);

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
let grassWindShader=null;
const grassMat=new THREE.MeshStandardMaterial({
  color:0xb4a071,roughness:1,side:THREE.DoubleSide
});
grassMat.onBeforeCompile=shader=>{
  shader.uniforms.uWindTime={value:0};
  grassWindShader=shader;
  shader.vertexShader=shader.vertexShader.replace(
    '#include <common>',
    `#include <common>
uniform float uWindTime;`
  );
  shader.vertexShader=shader.vertexShader.replace(
    '#include <begin_vertex>',
    `#include <begin_vertex>
    float windPhase=uWindTime*1.15+dot(instanceMatrix[3].xz,vec2(.017,.013));
    transformed.x+=sin(windPhase+transformed.y*3.1)*transformed.y*.095;
    transformed.z+=cos(windPhase*.72+transformed.y*2.3)*transformed.y*.065;`
  );
};
// Clareiras de circulação ao redor das casas e da rua: o capim cresce em faixas,
 // não como um tapete uniforme sobre portas, caminhos e margens de água.
const villageKeepClear=[
  [76,-42,15],[18,67,18],[206,48,19],[-96,174,15],
  [28,-18,12],[126,-73,12],[192,-28,12],[255,2,12],
  [-18,111,13],[69,151,12],[153,145,12],[246,120,12],
  [-48,35,13],[289,-74,12],[-27,220,12],[206,214,12]
];
function villageGrassBlocked(x,z){
  if(villageKeepClear.some(([cx,cz,r])=>(x-cx)*(x-cx)+(z-cz)*(z-cz)<r*r))return true;
  for(const curve of roadCurves){
    for(let j=0;j<=24;j++){
      const p=curve.getPointAt(j/24),dx=x-p.x,dz=z-p.z;
      if(dx*dx+dz*dz<6.2*6.2)return true;
    }
  }
  return false;
}
const grassCount=14200;
const grassInst=new THREE.InstancedMesh(grassGeo,grassMat,grassCount);
const grassDummy=new THREE.Object3D();
let grassPlaced=0;
for(let i=0;i<grassCount;i++){
  let x,z;
  if(i<6500){
    // Borda viva da povoação, com tufos visíveis já no enquadramento inicial.
    const a=rnd()*Math.PI*2,rad=25+Math.sqrt(rnd())*155;
    x=100+Math.cos(a)*rad;z=25+Math.sin(a)*rad;
  }else if(i<11200){
    const a=rnd()*Math.PI*2,rad=150+Math.sqrt(rnd())*340;
    x=100+Math.cos(a)*rad;z=25+Math.sin(a)*rad;
  }else{
    x=(rnd()-.5)*1900;z=(rnd()-.5)*1900;
  }
  if(Math.hypot(x-100,z-25)<19||nearRiver(x,z,8)||villageGrassBlocked(x,z))continue;
  const h=.58+rnd()*1.5;
  grassDummy.position.set(x,groundHeight(x,z)+.025,z);
  grassDummy.rotation.set((rnd()-.5)*.14,rnd()*Math.PI*2,(rnd()-.5)*.14);
  grassDummy.scale.set(.62+rnd()*1.05,h,.62+rnd()*1.05);
  grassDummy.updateMatrix();grassInst.setMatrixAt(grassPlaced,grassDummy.matrix);
  const tint=new THREE.Color().setHSL(.105+rnd()*.04,.32,.37+rnd()*.16);
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
const shrubs=new THREE.InstancedMesh(shrubGeo,shrubMat,520);
let shrubPlaced=0;
for(let i=0;i<520;i++){
  let x,z;
  if(i<280){
    const a=rnd()*Math.PI*2,rad=27+Math.sqrt(rnd())*135;
    x=100+Math.cos(a)*rad;z=25+Math.sin(a)*rad;
  }else{
    x=(rnd()-.5)*1500;z=(rnd()-.5)*1500;
  }
  if(Math.hypot(x-100,z-25)<20||nearRiver(x,z,14)||villageGrassBlocked(x,z))continue;
  treeDummy.position.set(x,groundHeight(x,z)+.025,z);
  treeDummy.rotation.set(0,rnd()*Math.PI*2,0);
  treeDummy.scale.set(.9+rnd()*1.8,.8+rnd()*.8,.9+rnd()*1.8);
  treeDummy.updateMatrix();shrubs.setMatrixAt(shrubPlaced++,treeDummy.matrix);
}
shrubs.count=shrubPlaced;shrubs.instanceMatrix.needsUpdate=true;shrubs.castShadow=false;scene.add(shrubs);

// ============================================================================