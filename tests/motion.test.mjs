import test from 'node:test';
import assert from 'node:assert/strict';
import {MotionWorld,motionBodies,MOTION_CONFIG} from '../docs/motion.js';
import {VirtualPLC,compilePLC,plcSamples,sampleSource} from '../docs/virtual-plc.js';
function setup(variant='normal',mode='st',obstacle=false){const sample={...plcSamples.find(s=>s.id==='motion'),body:motionBodies[variant]};const plc=new VirtualPLC(compilePLC(sampleSource(sample,mode))),world=new MotionWorld();world.obstacle=obstacle;plc.write('Start',true);return {plc,world};}
function step(system,count=1){const {plc,world}=system;for(let i=0;i<count;i++){for(const [k,v] of Object.entries(world.sensors()))plc.write(k,v);plc.step(100);world.step({DrivePermit:plc.values.DRIVEPERMIT,Speed:plc.values.SPEED,TurnRate:plc.values.TURNRATE},100);}return world;}
for(const mode of ['st','scl']){
  test(`${mode}: normal code reaches goal and stops without crossing`,()=>{const s=setup('normal',mode);const w=step(s,120);assert.equal(w.status,'도킹 위치 정지');assert.equal(w.velocity,0);assert.ok(Math.abs(w.x-MOTION_CONFIG.dockX)<=0.12);assert.equal(w.events.length,0);});
  test(`${mode}: obstacle interlock stops before contact`,()=>{const s=setup('normal',mode,true),w=step(s,80);assert.ok(w.x<1.1);assert.equal(w.collided,false);assert.equal(w.velocity,0);assert.equal(s.plc.values.OBSTACLE,true);assert.equal(w.events.length,0);});
  test(`${mode}: missing obstacle condition visibly collides and preserves bad command`,()=>{const s=setup('obstacle',mode,true),w=step(s,50);assert.equal(w.collided,true);assert.equal(w.status,'충돌');assert.ok(w.events.some(e=>e.status==='장애물 무시'));assert.ok(w.events.some(e=>e.status==='충돌'));assert.equal(s.plc.values.SPEED,0.5);assert.equal(w.velocity,0);});
  test(`${mode}: missing goal condition overshoots`,()=>{const s=setup('overshoot',mode),w=step(s,53);assert.ok(w.x>2.85);assert.ok(w.events.some(e=>e.status==='목표 지나침'));});
  test(`${mode}: negative speed moves backward and warns`,()=>{const s=setup('reverse',mode),w=step(s,3);assert.ok(w.x<0.3);assert.equal(w.status,'반대 방향');});
  test(`${mode}: excessive turn creates a curved trajectory`,()=>{const s=setup('turn',mode),w=step(s,5);assert.ok(w.y>1);assert.ok(w.angle>1);assert.ok(w.events.some(e=>e.status==='큰 회전 명령'));});
  test(`${mode}: QR loss stops near dock and can resume`,()=>{const s=setup('normal',mode);s.plc.write('QrValid',false);const w=step(s,100);assert.equal(w.velocity,0);assert.ok(w.x>=2&&w.x<2.1);s.plc.write('QrValid',true);step(s,70);assert.equal(w.status,'도킹 위치 정지');});
}
test('collision checks do not tunnel across obstacle on a long virtual step',()=>{const w=new MotionWorld();w.obstacle=true;w.step({DrivePermit:true,Speed:2,TurnRate:0},2000);assert.equal(w.collided,true);assert.ok(w.x<1.33);});
test('DrivePermit false prevents displacement even with a nonzero command',()=>{const w=new MotionWorld();w.step({DrivePermit:false,Speed:1,TurnRate:2},1000);assert.equal(w.x,0.3);assert.equal(w.angle,0);});
test('out of model command range fails explicitly',()=>{assert.throws(()=>new MotionWorld().step({DrivePermit:true,Speed:100,TurnRate:0}),/모델 범위/);});
