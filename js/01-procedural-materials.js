// 4. TEXTURAS PROCEDURAIS — TERRA, TRONCOS, PALHA, TELHAS E PEDRA
// ============================================================================
function canvasTexture(draw, size=512, repeat=1){
  const c=document.createElement('canvas'); c.width=c.height=size;
  const ctx=c.getContext('2d'); draw(ctx,size);
  const tex=new THREE.CanvasTexture(c); tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
  tex.repeat.set(repeat,repeat); tex.colorSpace=THREE.SRGBColorSpace; tex.anisotropy=8;
  return tex;
}
const groundTex=canvasTexture((ctx,s)=>{
  ctx.fillStyle='#a18e70';ctx.fillRect(0,0,s,s);
  const earth=[
    'rgba(73,61,43,.12)','rgba(128,103,69,.18)','rgba(174,148,108,.18)',
    'rgba(205,181,141,.16)','rgba(88,78,59,.10)','rgba(222,207,178,.18)'
  ];
  // Manchas de solo compactado e pequenas variações minerais.
  for(let i=0;i<1850;i++){
    const x=rnd()*s,y=rnd()*s,rx=3+rnd()*49,ry=2+rnd()*23;
    ctx.fillStyle=earth[Math.floor(rnd()*earth.length)];
    ctx.beginPath();ctx.ellipse(x,y,rx,ry,rnd()*Math.PI,0,Math.PI*2);ctx.fill();
  }
  // Grão fino, sem padrão quadriculado ou repetição muito marcada.
  for(let i=0;i<76000;i++){
    const x=rnd()*s,y=rnd()*s,v=rnd();
    ctx.fillStyle=v<.33?'rgba(65,55,42,.22)':v<.68?'rgba(224,207,171,.24)':'rgba(148,126,91,.16)';
    ctx.fillRect(x,y,.45+rnd()*1.4,.45+rnd()*1.1);
  }
  // Fibras curtas de capim seco e riscos irregulares de vento.
  for(let i=0;i<6200;i++){
    const x=rnd()*s,y=rnd()*s,a=(rnd()-.5)*.7,l=1+rnd()*12;
    ctx.strokeStyle=rnd()<.52?'rgba(111,103,68,.28)':'rgba(204,183,133,.34)';
    ctx.lineWidth=.35+rnd()*.8;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);ctx.stroke();
  }
  // Pedrinhas pequenas, achatadas e esparsas.
  for(let i=0;i<420;i++){
    const x=rnd()*s,y=rnd()*s,rx=1+rnd()*3.2,ry=.5+rnd()*1.3;
    ctx.fillStyle=rnd()<.5?'rgba(90,83,69,.30)':'rgba(213,202,177,.42)';
    ctx.beginPath();ctx.ellipse(x,y,rx,ry,rnd()*.8,0,Math.PI*2);ctx.fill();
  }
},1024,1);
groundTex.repeat.set(38,38);
const barkTex=canvasTexture((ctx,s)=>{
  ctx.fillStyle='#493324';ctx.fillRect(0,0,s,s);
  for(let i=0;i<260;i++){
    const x=rnd()*s,w=1+rnd()*9;
    ctx.strokeStyle=rnd()<.5?'rgba(20,14,10,.42)':'rgba(157,111,67,.27)';
    ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x,0);ctx.bezierCurveTo(x-7,150+rnd()*80,x+8,340+rnd()*60,x-3,s);ctx.stroke();
  }
},512,1);
const thatchTex=canvasTexture((ctx,s)=>{
  ctx.fillStyle='#927a4d';ctx.fillRect(0,0,s,s);
  for(let i=0;i<12000;i++){
    const x=rnd()*s,y=rnd()*s;
    ctx.strokeStyle=rnd()<.58?'rgba(218,190,126,.35)':'rgba(52,43,28,.32)';
    ctx.lineWidth=.5+rnd()*2;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(rnd()-.5)*6,y+4+rnd()*24);ctx.stroke();
  }
  for(let y=0;y<s;y+=29){ctx.strokeStyle='rgba(44,35,24,.18)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(s,y+6);ctx.stroke();}
},512,1);
thatchTex.repeat.set(2,2);
const shingleTex=canvasTexture((ctx,s)=>{
  ctx.fillStyle='#51483a';ctx.fillRect(0,0,s,s);
  const rows=15,cols=14,h=s/rows,w=s/cols;
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
    const x=c*w+(r%2)*w*.5,y=r*h;
    const v=Math.floor(56+rnd()*45);
    ctx.fillStyle=`rgb(${v},${v-5},${v-12})`;
    ctx.fillRect(x+1,y+1,w-2,h-2);
    ctx.strokeStyle='rgba(20,17,14,.45)';ctx.strokeRect(x+1,y+1,w-2,h-2);
    ctx.strokeStyle='rgba(197,174,133,.12)';ctx.beginPath();ctx.moveTo(x+4,y+4);ctx.lineTo(x+w-4,y+4);ctx.stroke();
  }
},512,1);
shingleTex.repeat.set(2,2);
const stoneTex=canvasTexture((ctx,s)=>{
  ctx.fillStyle='#666052';ctx.fillRect(0,0,s,s);
  for(let i=0;i<460;i++){
    const x=rnd()*s,y=rnd()*s,r=4+rnd()*18;
    ctx.fillStyle=rnd()<.5?'rgba(29,31,29,.22)':'rgba(191,179,149,.22)';
    ctx.beginPath();ctx.ellipse(x,y,r,r*.6,rnd(),0,Math.PI*2);ctx.fill();
  }
},512,1);
const woodMat=new THREE.MeshStandardMaterial({map:barkTex,color:0x92704c,roughness:1});
const darkWoodMat=new THREE.MeshStandardMaterial({map:barkTex,color:0x59402b,roughness:1});
const paleWoodMat=new THREE.MeshStandardMaterial({color:0xa9895c,roughness:1});
const stoneMat=new THREE.MeshStandardMaterial({map:stoneTex,color:0xaaa08d,roughness:1});
const ironMat=new THREE.MeshStandardMaterial({color:0x343536,metalness:.55,roughness:.65});
const thatchMat=new THREE.MeshStandardMaterial({map:thatchTex,color:0xd1b783,roughness:1});
const shingleMat=new THREE.MeshStandardMaterial({map:shingleTex,color:0xb5a58b,roughness:1});
const glassMat=new THREE.MeshStandardMaterial({color:0x242b29,emissive:0x503d21,emissiveIntensity:.28,roughness:.3});
const warmGlassMat=new THREE.MeshStandardMaterial({color:0xffc66e,emissive:0xffa33d,emissiveIntensity:1.1,roughness:.3});
const dirtMat=new THREE.MeshStandardMaterial({color:0x9b8056,map:groundTex,roughness:1});

// ============================================================================
