// 1. CENA, CÂMERA E RENDERER
// ============================================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfc0b6);
scene.fog = new THREE.Fog(0xbfc0b6, 260, 1320);
const camera = new THREE.PerspectiveCamera(68, innerWidth/innerHeight, 0.1, 2800);
camera.rotation.order = 'YXZ';
const renderer = new THREE.WebGLRenderer({ antialias:true, powerPreference:'high-performance' });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.45));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.24;
document.body.appendChild(renderer.domElement);
renderer.domElement.classList.add('webgl');

// CÉU EM CAMADAS — gradiente atmosférico e nuvens finas perto do horizonte.
const skyCanvas=document.createElement('canvas');
skyCanvas.width=2048;skyCanvas.height=1024;
const skyCtx=skyCanvas.getContext('2d');
const skyGradient=skyCtx.createLinearGradient(0,0,0,1024);
skyGradient.addColorStop(0,'#778994');
skyGradient.addColorStop(.28,'#9daeb2');
skyGradient.addColorStop(.58,'#c0c4bc');
skyGradient.addColorStop(.78,'#d0c9b7');
skyGradient.addColorStop(1,'#c4b8a4');
skyCtx.fillStyle=skyGradient;skyCtx.fillRect(0,0,2048,1024);
for(let i=0;i<115;i++){
  const x=(i*173.17)%2048,y=310+((i*71.3)%390),w=70+(i%9)*27,h=5+(i%6)*2;
  const g=skyCtx.createRadialGradient(x,y,2,x,y,w);
  g.addColorStop(0,'rgba(236,231,215,.10)');
  g.addColorStop(1,'rgba(236,231,215,0)');
  skyCtx.fillStyle=g;skyCtx.beginPath();skyCtx.ellipse(x,y,w,h,((i%7)-3)*.025,0,Math.PI*2);skyCtx.fill();
}
const skyTexture=new THREE.CanvasTexture(skyCanvas);
skyTexture.colorSpace=THREE.SRGBColorSpace;
const skyDome=new THREE.Mesh(
  new THREE.SphereGeometry(1900,48,24),
  new THREE.MeshBasicMaterial({map:skyTexture,side:THREE.BackSide,depthWrite:false,fog:false})
);
skyDome.frustumCulled=false;skyDome.renderOrder=-1000;scene.add(skyDome);

addEventListener('resize', () => {
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// ============================================================================
// 2. ALEATORIEDADE DETERMINÍSTICA E RUÍDO DE TERRENO
// ============================================================================
let seed = 41327;
function rnd(){ seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
function hash2(x,z){ const v=Math.sin(x*127.1+z*311.7)*43758.5453123; return v-Math.floor(v); }
function noise2(x,z){
  const xi=Math.floor(x), zi=Math.floor(z), xf=x-xi, zf=z-zi;
  const u=xf*xf*(3-2*xf), v=zf*zf*(3-2*zf);
  const a=hash2(xi,zi), b=hash2(xi+1,zi), c=hash2(xi,zi+1), d=hash2(xi+1,zi+1);
  return a*(1-u)*(1-v)+b*u*(1-v)+c*(1-u)*v+d*u*v;
}
function fbm(x,z,oct=4){ let a=.5,f=1,v=0; for(let i=0;i<oct;i++){v+=a*noise2(x*f,z*f);f*=2;a*=.5;} return v; }
function smoothstep(a,b,x){ const t=THREE.MathUtils.clamp((x-a)/(b-a),0,1); return t*t*(3-2*t); }
function groundHeight(x,z){
  // O centro de Palancar permanece amplo e relativamente suave; as ondulações
  // aumentam gradualmente em direção às encostas, sem degraus ou montes isolados.
  const dist=Math.hypot(x*.94,(z+18)*1.02);
  const outer=smoothstep(170,690,dist);
  const broad=(fbm(x*.0028+41,z*.0028-19,5)-.5)*25;
  const folds=(fbm(x*.0065-13,z*.0065+33,4)-.5)*10;
  const shallow=(fbm(x*.016+8,z*.016-11,4)-.5)*2.8;
  const fine=(fbm(x*.045-4,z*.045+9,3)-.5)*.72;
  const basin=-Math.pow(Math.max(0,.39-fbm(x*.009+8,z*.009-11,3)),1.35)*5.5;
  return outer*(broad+folds+basin)+shallow+fine;
}

// ============================================================================
// 3. ILUMINAÇÃO — FIM DE TARDE FRIO, COM LUZ QUENTE NAS JANELAS
// ============================================================================
const hemi = new THREE.HemisphereLight(0xe8e9e3, 0x78644c, 1.58); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffe2c0, 2.08);
sun.position.set(-310,285,330); sun.castShadow=true;
sun.shadow.mapSize.set(1536,1536);
sun.shadow.camera.near=1; sun.shadow.camera.far=1550;
sun.shadow.camera.left=-620; sun.shadow.camera.right=620;
sun.shadow.camera.top=620; sun.shadow.camera.bottom=-620;
sun.shadow.bias=-0.00018; scene.add(sun); scene.add(sun.target);
const fill = new THREE.DirectionalLight(0xb7c7cb,.72); fill.position.set(350,180,-430); scene.add(fill);
const warmBounce = new THREE.DirectionalLight(0xffd5a5,.32);warmBounce.position.set(190,90,520);scene.add(warmBounce);

// ============================================================================
