// Fictional front/rear independently steered drive modules. SI units internally.
// Kinematic rolling model; no mass, traction, braking distance, networking or safety runtime.
export const AMR_CONFIG={width:5,height:4,bodyRadius:0.25,halfSpacing:0.16,wheelRadius:0.06,dockX:4.3,dockY:2,obstacleX:2.5,obstacleY:2,obstacleRadius:0.25};
const rad=d=>d*Math.PI/180,deg=r=>r*180/Math.PI,wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
const angleDiff=(a,b)=>deg(wrap(rad(a-b)));
export class AmrWorld{
 constructor(){this.x=1.2;this.y=2;this.angle=0;this.time=0;this.obstacle=false;this.collided=false;this.contact=false;this.kinematicFault=false;this.motorFault=false;this.steerJam=false;this.driveJam=false;this.jamTime=0;this.steering=[0,0];this.targets=[0,0];this.commands=[0,0];this.speeds=[0,0];this.encoder=[0,0];this.velocity={vx:0,vy:0,w:0};this.trail=[{x:this.x,y:this.y}];this.events=[];this.status='대기';this.lastState=0;this.outputs={};}
 blocked(x,y){const c=AMR_CONFIG;return x<c.bodyRadius||x>c.width-c.bodyRadius||y<c.bodyRadius||y>c.height-c.bodyRadius||(this.obstacle&&Math.hypot(x-c.obstacleX,y-c.obstacleY)<c.bodyRadius+c.obstacleRadius);}
 ray(a){const c=AMR_CONFIG,dx=Math.cos(a),dy=Math.sin(a);let t=2;
  for(const [p,d,limit] of [[this.x,dx,c.width],[this.y,dy,c.height]])if(Math.abs(d)>1e-9)t=Math.min(t,(d>0?limit-p:-p)/d);
  if(this.obstacle){const ox=this.x-c.obstacleX,oy=this.y-c.obstacleY,b=ox*dx+oy*dy,disc=b*b-(ox*ox+oy*oy-c.obstacleRadius*c.obstacleRadius);if(disc>=0){const hit=-b-Math.sqrt(disc);if(hit>=0)t=Math.min(t,hit);}}
  return Math.max(0,t);
 }
 rays(){return [0,Math.PI].flatMap(base=>[-30,-15,0,15,30].map(d=>{const a=this.angle+base+rad(d);return {a,distance:this.ray(a),rear:base!==0};}));}
 sensors(){const c=AMR_CONFIG,rays=this.rays(),distance=Math.hypot(c.dockX-this.x,c.dockY-this.y);return {Obstacle:rays.some(r=>r.distance<.55),LidarFront:rays[2].distance,LidarRear:rays[7].distance,NearDock:distance<.65,AtDock:distance<=.12&&Math.abs(wrap(this.angle))<.2,SteeringReady:this.targets.every((t,i)=>Math.abs(angleDiff(t,this.steering[i]))<=.5),KinematicFault:this.kinematicFault,Bumper:this.contact,MotorFault:this.motorFault};}
 event(message){if(this.events.at(-1)?.message!==message)this.events.push({time:this.time,message});if(this.events.length>30)this.events.shift();}
 step(output,dt=100){
  if(!Number.isFinite(dt)||dt<=0||dt>1000)throw new Error('가상 운동 주기는 0~1000ms 범위입니다.');
  const get=k=>output[k]??output[k.toUpperCase()];
  const targets=[get('Module1Angle'),get('Module2Angle')],commands=[get('Module1Speed'),get('Module2Speed')],permit=get('DrivePermit');
  if(typeof permit!=='boolean'||![...targets,...commands].every(Number.isFinite))throw new Error('AMR 모듈 Angle/Speed 출력과 DrivePermit BOOL을 선언하세요.');
  if(targets.some(x=>Math.abs(x)>180)||commands.some(x=>Math.abs(x)>1))throw new Error('교육 모듈 범위: 조향 ±180°, 속도 ±1m/s. 실제 장비 제한값 아님.');
  this.outputs=Object.fromEntries(['State','Busy','Done','Fault','BlueLamp','FaultLamp','DrivePermit'].map(k=>[k,get(k)]));this.targets=targets;this.commands=commands;this.time+=dt;this.collided=false;const seconds=dt/1000;
  const pending=targets.some((t,i)=>Math.abs(angleDiff(t,this.steering[i]))>.5);
  if(!this.steerJam)this.steering=this.steering.map((a,i)=>a+Math.max(-90*seconds,Math.min(90*seconds,angleDiff(targets[i],a))));
  const ready=this.sensors().SteeringReady;
  if((this.steerJam&&pending)||(this.driveJam&&permit&&commands.some(v=>Math.abs(v)>.001)))this.jamTime+=dt;else this.jamTime=0;
  if(this.jamTime>=500)this.motorFault=true;
  if(!this.steerJam&&!this.driveJam)this.motorFault=false;
  const vectors=commands.map((s,i)=>({x:s*Math.cos(rad(this.steering[i])),y:s*Math.sin(rad(this.steering[i]))}));
  this.kinematicFault=permit&&ready&&Math.abs(vectors[0].x-vectors[1].x)>.005;
  const allowed=permit&&ready&&!this.kinematicFault&&!this.driveJam;
  let vx=allowed?(vectors[0].x+vectors[1].x)/2:0,vy=allowed?(vectors[0].y+vectors[1].y)/2:0,w=allowed?(vectors[0].y-vectors[1].y)/(.32):0;
  this.velocity={vx,vy,w};this.speeds=allowed?[...commands]:[0,0];
  const parts=Math.max(1,Math.ceil(Math.max(Math.hypot(vx,vy)*seconds/.005,Math.abs(w)*seconds/.02)));let applied=0;
  for(let i=0;i<parts;i++){const h=seconds/parts,old=this.angle,next=old+w*h;
   const dx=Math.abs(w)>1e-9?vx/w*(Math.sin(next)-Math.sin(old))+vy/w*(Math.cos(next)-Math.cos(old)):(vx*Math.cos(old)-vy*Math.sin(old))*h;
   const dy=Math.abs(w)>1e-9?-vx/w*(Math.cos(next)-Math.cos(old))+vy/w*(Math.sin(next)-Math.sin(old)):(vx*Math.sin(old)+vy*Math.cos(old))*h;
   if(this.blocked(this.x+dx,this.y+dy)){this.collided=true;this.contact=true;this.velocity={vx:0,vy:0,w:0};this.speeds=[0,0];break;}
   this.x+=dx;this.y+=dy;this.angle=wrap(next);applied+=h;
  }
  this.encoder=this.encoder.map((v,i)=>v+(allowed?commands[i]*applied/AMR_CONFIG.wheelRadius*180/Math.PI:0));
  if(!this.blocked(this.x,this.y)&&!this.collided)this.contact=false;
  this.trail.push({x:this.x,y:this.y});if(this.trail.length>1200)this.trail.shift();
  this.status=this.collided?'접촉 · 이동 중단':this.kinematicFault?'양 모듈 운동 불일치':this.motorFault?'모터 추종 오류':!ready?'조향 정렬 중':Math.hypot(vx,vy)>.001?'이동 중':Math.abs(w)>.001?'제자리 회전':'정지';
  if(this.collided||this.kinematicFault||this.motorFault)this.event(this.status);
  if(this.lastState!==this.outputs.State){this.event(`State ${this.lastState} → ${this.outputs.State}`);this.lastState=this.outputs.State;}
  return this;
 }
}
