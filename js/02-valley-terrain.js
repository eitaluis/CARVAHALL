// TERRENO DE PALANCAR — VALE AMPLO, SOLO SECO E ONDULAÇÃO CONTÍNUA
// A malha acompanha groundHeight(), compartilhada por caminhos, vegetação e jogador.

const terrainGeo=new THREE.PlaneGeometry(2100,2200,320,336);
terrainGeo.rotateX(-Math.PI/2);
const pAttr=terrainGeo.attributes.position;
const vColors=new Float32Array(pAttr.count*3);
const tmpColor=new THREE.Color();

for(let i=0;i<pAttr.count;i++){
  const x=pAttr.getX(i),z=pAttr.getZ(i);
  const y=groundHeight(x,z);
  pAttr.setY(i,y);

  const broad=fbm(x*.006,z*.006,4);
  const grain=fbm(x*.025+19,z*.025-7,3);
  const dry=fbm(x*.041-8,z*.041+27,3);
  // Variação de areia, terra batida e capim queimado; sem tapete verde uniforme.
  const hue=.092+broad*.035+dry*.012;
  const saturation=.20+grain*.12;
  const lightness=.285+broad*.105+grain*.045;
  tmpColor.setHSL(hue,saturation,lightness);
  vColors[i*3]=tmpColor.r;
  vColors[i*3+1]=tmpColor.g;
  vColors[i*3+2]=tmpColor.b;
}
terrainGeo.setAttribute('color',new THREE.BufferAttribute(vColors,3));
terrainGeo.computeVertexNormals();

const terrainMat=new THREE.MeshStandardMaterial({
  map:groundTex,
  normalMap:groundNormalTex,
  normalScale:new THREE.Vector2(.22,.22),
  vertexColors:true,
  roughness:1,
  metalness:0
});
const terrain=new THREE.Mesh(terrainGeo,terrainMat);
terrain.receiveShadow=true;
terrain.castShadow=false;
scene.add(terrain);

// Pequenas manchas de terra clara acompanham naturalmente os caminhos de circulação;
// o relevo continua sendo uma única superfície, sem placas ou blocos destacados.
