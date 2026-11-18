// FASE 4 — CARVAHALL DESTRUÍDA PELO INCÊNDIO (ELDEST)
// Variante posterior: as casas desaparecem e dão lugar a fundações, vigas
// carbonizadas, telhados abatidos e áreas de cinza. A posição dos escombros
// acompanha a implantação interpretativa da vila-base.

window.carvahallBurnedMode=false;

const burnedVillage = (() => {
  const group=new THREE.Group();
  scene.add(group);
  const charMat=new THREE.MeshStandardMaterial({color:0x211d19,roughness:1});
  const sootMat=new THREE.MeshStandardMaterial({color:0x181714,roughness:1});
  const ashMat=new THREE.MeshStandardMaterial({color:0x37332d,roughness:1,transparent:true,opacity:.72,depthWrite:false});
  const burntThatchMat=new THREE.MeshStandardMaterial({color:0x30271e,roughness:1,side:THREE.DoubleSide});
  const stoneMatBurnt=new THREE.MeshStandardMaterial({color:0x514b40,roughness:1});
  const emberMat=new THREE.MeshStandardMaterial({color:0xd65b21,emissive:0x9e2b08,emissiveIntensity:1.2,roughness:.8});

  for(let i=0;i<BUILDINGS.length;i++){
    const b=BUILDINGS[i];
    const ruin=new THREE.Group();
    ruin.position.set(b.x,groundHeight(b.x,b.z),b.z);
    ruin.rotation.y=b.rot;
    group.add(ruin);

    const scorch=new THREE.Mesh(new THREE.CircleGeometry(Math.max(b.w,b.d)*.68+2.6,20),ashMat);
    scorch.rotation.x=-Math.PI/2;scorch.position.y=.035;ruin.add(scorch);

    // Pedras de fundação expostas e fragmentos espalhados no chão.
    for(let j=0;j<14;j++){
      const angle=j/14*Math.PI*2,rX=b.w*.43+(rnd()-.5)*1.8,rZ=b.d*.42+(rnd()-.5)*1.8;
      const stone=new THREE.Mesh(new THREE.DodecahedronGeometry(.55+rnd()*.38,0),stoneMatBurnt);
      stone.position.set(Math.cos(angle)*rX,.24+rnd()*.18,Math.sin(angle)*rZ);
      stone.scale.set(1.3,.65,1.0);stone.rotation.set(rnd()*.4,rnd()*Math.PI,rnd()*.4);
      stone.castShadow=true;ruin.add(stone);
    }

    // Vigas carbonizadas caídas em cruz, algumas ainda apoiadas nas paredes.
    for(let j=0;j<7;j++){
      const len=(j%2===0?b.w:b.d)*(.65+rnd()*.34);
      const beam=new THREE.Mesh(new THREE.CylinderGeometry(.12,.2,len,7),charMat);
      beam.rotation.set((rnd()-.5)*.24,rnd()*Math.PI,Math.PI/2+(rnd()-.5)*.22);
      beam.position.set((rnd()-.5)*b.w*.45,.5+rnd()*.65,(rnd()-.5)*b.d*.45);
      beam.castShadow=true;ruin.add(beam);
    }

    // Fragmentos do telhado de palha/tábuas, abatidos sobre a estrutura.
    for(let j=0;j<3;j++){
      const panel=new THREE.Mesh(
        new THREE.BoxGeometry(b.w*(.42+rnd()*.28),.17,b.d*(.28+rnd()*.32)),
        burntThatchMat
      );
      panel.position.set((rnd()-.5)*b.w*.35,.56+rnd()*.38,(rnd()-.5)*b.d*.3);
      panel.rotation.set((rnd()-.5)*.48,rnd()*Math.PI,(rnd()-.5)*.34);
      panel.castShadow=true;ruin.add(panel);
    }

    // Um trecho curto de chaminé permanece em algumas casas.
    if(i%3!==1){
      const chimney=new THREE.Mesh(new THREE.BoxGeometry(.95,1.75,.95),stoneMatBurnt);
      chimney.position.set(b.w*.28,.85,b.d*.2);chimney.rotation.z=(rnd()-.5)*.14;
      chimney.castShadow=true;ruin.add(chimney);
      for(let k=0;k<3;k++){
        const brick=new THREE.Mesh(new THREE.BoxGeometry(1.12,.17,1.12),charMat);
        brick.position.set(b.w*.28,1.65+k*.17,b.d*.2);brick.rotation.y=rnd()*.2;ruin.add(brick);
      }
    }

    // Pequenos focos de brasa: resíduo luminoso, sem incêndio ativo.
    for(let j=0;j<2;j++){
      const ember=new THREE.Mesh(new THREE.SphereGeometry(.13+rnd()*.08,7,6),emberMat);
      ember.position.set((rnd()-.5)*b.w*.5,.24,(rnd()-.5)*b.d*.5);ruin.add(ember);
    }
  }
  group.visible=false;
  return group;
})();

const intactVillageStructures=[tavern,butcher,forge,fiskShop,...houses,hayBarn];
function setBurnedVillage(active){
  burnedVillage.visible=active;
  intactVillageStructures.forEach(object=>object.visible=!active);
  if(Array.isArray(smokeSprites))smokeSprites.forEach(object=>{object.visible=!active;});
  window.carvahallBurnedMode=active;
  if(active){
    historicFlock.visible=false;
    wartimeDefenses.visible=false;
    traderCamp.visible=false;
  }
  document.getElementById('tp').textContent=active
    ? 'Variante histórica: Carvahall após o incêndio (Eldest)'
    : 'Vila cotidiana';
}
let burnedVillageVisible=false;
addEventListener('keydown',event=>{
  if(event.code!=='KeyO'||event.repeat)return;
  burnedVillageVisible=!burnedVillageVisible;
  setBurnedVillage(burnedVillageVisible);
});
