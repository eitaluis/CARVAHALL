// 1. CENA, CÂMERA E RENDERER
// ============================================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9faeb0);
scene.fog = new THREE.FogExp2(0xaab4b1, 0.00105);
const camera = new THREE.PerspectiveCamera(72, innerWidth/innerHeight, 0.1, 2600);
camera.rotation.order = 'YXZ';
const renderer = new THREE.WebGLRenderer({ antialias:true, powerPreference:'high-performance' });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.45));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
document.body.appendChild(renderer.domElement);
renderer.domElement.classList.add('webgl');
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
  const dist=Math.hypot(x,z*.92);
  const far=smoothstep(190,590,dist);
  const low=(fbm(x*.008,z*.008,3)-.5)*1.8;
  const rolling=(fbm(x*.0024+41,z*.0024-19,5)-.5)*23;
  const ridge=Math.pow(Math.max(0,fbm(x*.0048-13,z*.0048+33,4)-.48),1.4)*18;
  const basin=-Math.pow(Math.max(0,.35-fbm(x*.012+8,z*.012-11,3)),1.3)*7;
  return low + far*(rolling+ridge+basin);
}

// ============================================================================
// 3. ILUMINAÇÃO — FIM DE TARDE FRIO, COM LUZ QUENTE NAS JANELAS
// ============================================================================
const hemi = new THREE.HemisphereLight(0xdde5e4, 0x665543, 1.12); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffd8a8, 1.65);
sun.position.set(-420,260,370); sun.castShadow=true;
sun.shadow.mapSize.set(1536,1536);
sun.shadow.camera.near=1; sun.shadow.camera.far=1550;
sun.shadow.camera.left=-620; sun.shadow.camera.right=620;
sun.shadow.camera.top=620; sun.shadow.camera.bottom=-620;
sun.shadow.bias=-0.00018; scene.add(sun); scene.add(sun.target);
const fill = new THREE.DirectionalLight(0x9cb2bd,.42); fill.position.set(350,180,-430); scene.add(fill);

// ============================================================================
