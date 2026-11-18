// 15. JOGADOR, MOVIMENTO, COLISÕES E POINTER LOCK
// ============================================================================
const jogador={pos:new THREE.Vector3(76,2,-5),vel:new THREE.Vector3(),eye:1.68,grounded:true,radius:.36};
camera.position.copy(jogador.pos);camera.position.y=groundHeight(jogador.pos.x,jogador.pos.z)+jogador.eye;camera.rotation.set(0,.02,0);
const keys={};let locked=false,started=false;
const startEl=document.getElementById('start'),resumeEl=document.getElementById('resume');
function requestLock(){renderer.domElement.requestPointerLock?.();}
startEl.addEventListener('click',()=>{started=true;startEl.style.display='none';requestLock();});
resumeEl.addEventListener('click',()=>{resumeEl.style.display='none';requestLock();});
document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===renderer.domElement;if(started&&!locked)resumeEl.style.display='flex';else resumeEl.style.display='none';});
document.addEventListener('mousemove',e=>{if(!locked)return;camera.rotation.y-=e.movementX*.0022;camera.rotation.x-=e.movementY*.0022;camera.rotation.x=THREE.MathUtils.clamp(camera.rotation.x,-Math.PI/2+.02,Math.PI/2-.02);});
addEventListener('keydown',e=>{
  keys[e.code]=true;
  if(['Space','Tab'].includes(e.code))e.preventDefault();
  if(e.repeat)return;
  if(e.code==='Tab')setMapVisibility(!mapVisible);
  if(e.code==='KeyM')teleport(tpIndex+1);
  if(e.code==='KeyN')teleport(tpIndex-1);
  if(e.code==='KeyH'){placePlayer(76,-5,.02,0);document.getElementById('tp').textContent='Núcleo de Carvahall';}
  if(e.code==='KeyJ')teleport(2);
  if(e.code==='KeyG')teleport(6);
  if(e.code==='KeyF')teleport(8);
  if(e.code==='KeyT'){traderCamp.visible=!traderCamp.visible;window.CARVAHALL_MARKET_VISIBLE=traderCamp.visible;document.getElementById('tp').textContent=traderCamp.visible?'Mercado de inverno — Eragon':'Carvahall ao anoitecer';}
});
addEventListener('keyup',e=>{keys[e.code]=false;});
function localOf(b,x,z){const dx=x-b.x,dz=z-b.z,c=Math.cos(b.rot),s=Math.sin(b.rot);return {x:c*dx-s*dz,z:s*dx+c*dz};}
function collidesBuilding(x,z){
  for(const b of BUILDINGS){const p=localOf(b,x,z),r=jogador.radius+.22;
    const insideX=Math.abs(p.x)<b.w/2+r,insideZ=Math.abs(p.z)<b.d/2+r;
    if(!insideX||!insideZ)continue;
    const atFront=Math.abs(p.z+b.d/2)<r+.18;
    const doorOpen=atFront&&Math.abs(p.x)<b.doorW/2+.12;
    if(doorOpen)continue;
    // Bloqueia apenas a espessura das paredes; o interior da construção continua acessível.
    if(Math.abs(Math.abs(p.x)-b.w/2)<r || Math.abs(p.z-b.d/2)<r || (atFront&&!doorOpen))return true;
  }
  return false;
}
function isRiver(x,z){return nearRiver(x,z,-3);}
function collides(x,z){return collidesBuilding(x,z)||isRiver(x,z)||Math.abs(x)>850||Math.abs(z)>900;}
function updatePlayer(dt){
  const forward=new THREE.Vector3(-Math.sin(camera.rotation.y),0,-Math.cos(camera.rotation.y));
  const right=new THREE.Vector3(Math.cos(camera.rotation.y),0,-Math.sin(camera.rotation.y));
  const move=new THREE.Vector3();
  if(keys.KeyW||keys.ArrowUp)move.add(forward);
  if(keys.KeyS||keys.ArrowDown)move.sub(forward);
  if(keys.KeyD||keys.ArrowRight)move.add(right);
  if(keys.KeyA||keys.ArrowLeft)move.sub(right);
  if(move.lengthSq()>0)move.normalize();
  const sprint=keys.ShiftLeft||keys.ShiftRight,speed=sprint?11.2:6.7;
  const desiredX=move.x*speed,desiredZ=move.z*speed,accel=move.lengthSq()>0?26:18;
  jogador.vel.x+=(desiredX-jogador.vel.x)*Math.min(1,accel*dt);
  jogador.vel.z+=(desiredZ-jogador.vel.z)*Math.min(1,accel*dt);
  if(keys.Space&&jogador.grounded){jogador.vel.y=6.5;jogador.grounded=false;keys.Space=false;}
  jogador.vel.y-=18.5*dt;
  const nx=jogador.pos.x+jogador.vel.x*dt,nz=jogador.pos.z+jogador.vel.z*dt;
  if(!collides(nx,jogador.pos.z))jogador.pos.x=nx;else jogador.vel.x=0;
  if(!collides(jogador.pos.x,nz))jogador.pos.z=nz;else jogador.vel.z=0;
  jogador.pos.y+=jogador.vel.y*dt;
  const floor=groundHeight(jogador.pos.x,jogador.pos.z)+jogador.eye;
  if(jogador.pos.y<=floor){jogador.pos.y=floor;jogador.vel.y=0;jogador.grounded=true;}
  camera.position.copy(jogador.pos);
  document.getElementById('coords').textContent=`X ${jogador.pos.x.toFixed(1)} · Y ${jogador.pos.y.toFixed(1)} · Z ${jogador.pos.z.toFixed(1)} · ${sprint?'correndo':'andando'}`;
}

// ============================================================================
// 16. ANIMAÇÃO E LOOP
// ============================================================================
const clock=new THREE.Clock();let waterTime=0;
function animate(){
  requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);waterTime+=dt;
  if(locked)updatePlayer(dt);
  // Fumaça leve, que sobe e se desfaz visualmente acima das chaminés.
  for(const s of smokeSprites){s.position.y=s.userData.baseY+Math.sin(waterTime*.7+s.userData.phase)*.16+((waterTime*.18+s.userData.phase)%1)*.7;s.material.opacity=.08+Math.sin(waterTime+s.userData.phase)*.025;}
  for(let i=0;i<falls.length;i++){
    const fall=falls[i];
    fall.position.y=fall.userData.baseY+Math.sin(waterTime*1.8+i)*.18;
  }
  riverMesh.material.opacity=.86+Math.sin(waterTime*1.7)*.025;
  for(let i=0;i<marketFires.length;i++){
    const fire=marketFires[i];
    fire.fire.scale.set(.8,.92+Math.sin(waterTime*8+i*1.7)*.13,.8);
    fire.light.intensity=traderCamp.visible?1.55+Math.sin(waterTime*6+i)*.22:0;
    for(let j=0;j<(fire.smoke||[]).length;j++){
      const puff=fire.smoke[j],phase=(waterTime*.16+puff.userData.phase/(Math.PI*2)+j*.19)%1;
      puff.position.y=puff.userData.baseY+phase*3.1;
      puff.material.opacity=traderCamp.visible?.15*(1-phase):0;
    }
  }
  if(traderCamp.visible){
    const positions=marketSnowGeometry.attributes.position.array;
    for(let i=0;i<marketSnowCount;i++){
      const n=i*3;
      positions[n+1]-=dt*(1.25+(i%5)*.22);
      positions[n]+=.09*Math.sin(waterTime*.55+i*.23)*dt;
      positions[n+2]+=.24*dt;
      if(positions[n+1]<.12){
        positions[n]=150+Math.random()*355;
        positions[n+1]=29+Math.random()*10;
        positions[n+2]=-105+Math.random()*235;
      }
    }
    marketSnowGeometry.attributes.position.needsUpdate=true;
    for(const actor of marketActors){
      const phase=actor.userData.phase;
      actor.rotation.y=actor.userData.baseYaw+Math.sin(waterTime*.42+phase)*.045;
      actor.position.y=actor.userData.baseY+Math.sin(waterTime*1.5+phase)*.012;
    }
  }
  drawMap();renderer.render(scene,camera);
  window.CARVAHALL_RENDERED_FRAMES=(window.CARVAHALL_RENDERED_FRAMES||0)+1;
  window.CARVAHALL_RENDER_STATS={drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,objects:scene.children.length};
}
animate();

// Posição inicial na rua de entrada da vila.
document.getElementById('tp').textContent='Entrada de Carvahall · Palancar Valley';
