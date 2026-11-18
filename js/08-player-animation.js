// 15. JOGADOR, MOVIMENTO, COLISÕES E POINTER LOCK
// ============================================================================
const jogador={pos:new THREE.Vector3(76,2,15),vel:new THREE.Vector3(),eye:1.68,grounded:true,radius:.36};
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
  if(e.code==='KeyH'){placePlayer(76,15,.02,0);document.getElementById('tp').textContent='Núcleo de Carvahall';}
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
function animateAmbientPerson(actor,time,dt,isMarket){
  const rig=actor.userData.animationRig;if(!rig)return;
  const phase=actor.userData.phase,role=actor.userData.role||'villager';
  const slow=time*.7+phase,breath=Math.sin(time*1.35+phase)*.019;
  actor.rotation.y=actor.userData.baseYaw+Math.sin(time*.31+phase)*.055;
  actor.position.y=actor.userData.baseY+Math.sin(time*1.7+phase)*.012;
  actor.position.x=actor.userData.baseX+Math.sin(time*.38+phase)*.045;
  rig.torso.scale.y=1+breath;
  rig.torso.position.y=(role==='child'?.76:1.12)+breath*.35;
  rig.headPivot.rotation.y=Math.sin(time*.48+phase*1.7)*.24;
  rig.headPivot.rotation.x=Math.sin(time*.73+phase)*.045;
  rig.headPivot.rotation.z=Math.sin(time*.62+phase)*.025;
  const talk=(role==='vendor'||role==='sloan'||role==='horst'||actor.userData.gesture)?1:0;
  for(const arm of rig.armPivots){
    const gesture=talk&&arm.side===1?Math.sin(time*1.65+phase)*.22:0;
    const idle=Math.sin(slow*1.55+arm.side)*.075;
    arm.pivot.rotation.z=arm.base+gesture+idle;
    arm.pivot.rotation.x=Math.sin(time*.8+phase+arm.side)*.035;
  }
  const weight=Math.sin(time*.85+phase)*.025;
  for(const leg of rig.legPivots){
    leg.pivot.rotation.x=Math.sin(time*.72+phase+leg.side*.8)*.065;
    leg.pivot.position.x=leg.side*(.14+weight);
  }
  if(isMarket&&role==='buyer'&&phase<2.1){
    actor.position.x=actor.userData.baseX+Math.sin(time*.34+phase)*.28;
    actor.position.z=actor.userData.baseZ+Math.cos(time*.34+phase)*.18;
    actor.position.y=groundHeight(actor.position.x,actor.position.z)+Math.sin(time*1.7+phase)*.012;
  }
  // A cada personagem cabe uma pequena ação recorrente, sem coreografia sincronizada.
  if(role==='child'){
    const bounce=Math.max(0,Math.sin(time*2.1+phase))*.018;
    actor.position.y+=bounce;
  }else if(role==='woman'||role==='katrina'){
    rig.headPivot.rotation.z+=Math.sin(time*.42+phase)*.018;
  }
}
const clock=new THREE.Clock();let waterTime=0;
function animate(){
  requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);waterTime+=dt;
  if(locked)updatePlayer(dt);
  if(grassWindShader)grassWindShader.uniforms.uWindTime.value=waterTime;
  for(const shader of treeWindShaders)shader.uniforms.uTreeWindTime.value=waterTime;
  // Fumaça leve, que sobe e se desfaz visualmente acima das chaminés.
  for(const s of smokeSprites){s.position.y=s.userData.baseY+Math.sin(waterTime*.7+s.userData.phase)*.16+((waterTime*.18+s.userData.phase)%1)*.7;s.material.opacity=.08+Math.sin(waterTime+s.userData.phase)*.025;}
  for(let i=0;i<falls.length;i++){
    const fall=falls[i];fall.position.y=fall.userData.baseY;
    const attr=fall.geometry.attributes.position,base=fall.userData.basePositions;
    for(let v=0;v<attr.count;v++){
      const x=base[v*3],y=base[v*3+1],z=base[v*3+2];
      attr.setZ(v,z+Math.sin(y*.14+waterTime*3.1+x*.11)*.16);
    }
    attr.needsUpdate=true;
  }
  riverMesh.material.opacity=.86+Math.sin(waterTime*1.7)*.025;
  if(waterfallMist){
    const mist=waterfallMist.geometry.attributes.position.array;
    for(let i=0;i<mist.length/3;i++){
      mist[i*3]+=Math.sin(waterTime*.32+i*.7)*dt*.12;
      mist[i*3+1]=waterfallBottom+.7+((i*.37+waterTime*.22)%1)*4.2;
      mist[i*3+2]=-583+Math.sin(waterTime*.24+i*.4)*2;
    }
    waterfallMist.geometry.attributes.position.needsUpdate=true;
  }
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
      if(positions[n+1]<.12){positions[n]=150+Math.random()*355;positions[n+1]=29+Math.random()*10;positions[n+2]=-105+Math.random()*235;}
    }
    marketSnowGeometry.attributes.position.needsUpdate=true;
    for(const actor of marketActors)animateAmbientPerson(actor,waterTime,dt,true);
  }
  for(const actor of eveningActors)animateAmbientPerson(actor,waterTime,dt,false);
  drawMap();renderer.render(scene,camera);
  window.CARVAHALL_RENDERED_FRAMES=(window.CARVAHALL_RENDERED_FRAMES||0)+1;
  window.CARVAHALL_RENDER_STATS={drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,objects:scene.children.length};
}
animate();

// Posição inicial na rua de entrada da vila.
document.getElementById('tp').textContent='Entrada de Carvahall · Palancar Valley';
