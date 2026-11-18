// 5. TERRENO DO VALE — CENTRO SUAVE, CAMPOS E CONTRAFORTES AO REDOR
// ============================================================================
const terrainGeo=new THREE.PlaneGeometry(1760,1900,176,190); terrainGeo.rotateX(-Math.PI/2);
const pAttr=terrainGeo.attributes.position;
const vColors=new Float32Array(pAttr.count*3);
const tmpColor=new THREE.Color();
for(let i=0;i<pAttr.count;i++){
  const x=pAttr.getX(i),z=pAttr.getZ(i),y=groundHeight(x,z);pAttr.setY(i,y);
  const n=fbm(x*.012,z*.012,3), dry=fbm(x*.035+17,z*.035-8,3);
  tmpColor.setHSL(.105+n*.055,.17+dry*.09,.36+n*.07);
  vColors[i*3]=tmpColor.r;vColors[i*3+1]=tmpColor.g;vColors[i*3+2]=tmpColor.b;
}
terrainGeo.setAttribute('color',new THREE.BufferAttribute(vColors,3)); terrainGeo.computeVertexNormals();
const terrain=new THREE.Mesh(terrainGeo,new THREE.MeshStandardMaterial({map:groundTex,vertexColors:true,roughness:1}));
terrain.receiveShadow=true;scene.add(terrain);

// ============================================================================
