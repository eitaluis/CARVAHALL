// 13. ACAMPAMENTO DE MERCADORES — EVENTO SAZONAL OPCIONAL (T)
// ============================================================================
const traderCamp=new THREE.Group();scene.add(traderCamp);traderCamp.visible=false;
function makeTent(parent,x,z,w=7,d=5){
  const g=new THREE.Group();g.position.set(x,groundHeight(x,z),z);parent.add(g);
  const cloth=new THREE.MeshStandardMaterial({color:0x9a7951,roughness:1,side:THREE.DoubleSide});
  const geo=new THREE.BufferGeometry();const v=[-w/2,0,-d/2,w/2,0,-d/2,0,3.2,0,-w/2,0,d/2,w/2,0,d/2];const ind=[0,1,2,1,4,2,4,3,2,3,0,2];geo.setAttribute('position',new THREE.Float32BufferAttribute(v,3));geo.setIndex(ind);geo.computeVertexNormals();g.add(new THREE.Mesh(geo,cloth));
  logBeam(g,3,.08,0,1.5,0,'z',darkWoodMat);
}
makeTent(traderCamp,390,-30,8,6);makeTent(traderCamp,418,-4,7,5);makeTent(traderCamp,392,31,6,5);
makeWagon(398,70,.82,traderCamp);makeWagon(444,75,.78,traderCamp);
const campFire=new THREE.Mesh(new THREE.DodecahedronGeometry(.55,0),new THREE.MeshStandardMaterial({color:0xff8a2e,emissive:0xff4a0a,emissiveIntensity:1.5}));campFire.position.set(410,groundHeight(410,12)+.65,12);traderCamp.add(campFire);
const campLight=new THREE.PointLight(0xff8d3c,1.2,24);campLight.position.copy(campFire.position);traderCamp.add(campLight);

// ============================================================================
