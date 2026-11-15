import assert from 'node:assert/strict';
import test from 'node:test';
import {SemiSimulation} from '../docs/semi-sim-engine.js';
const config={nodes:[{id:1,x:100,y:100,type:2},{id:2,x:100,y:1100,type:4}],links:[{id:11,start:1,end:2,distance:1000,speed:60},{id:21,start:2,end:1,distance:1000,speed:60}]};
function prepared(){const s=new SemiSimulation(config);s.input('semi',true);s.input('activeRequest',true);for(let n=0;n<4;n++)s.scan();assert.equal(s.v.mainStep,2);return s;}
function scans(s,n){for(let k=0;k<n;k++)s.scan();}
test('HMI request waits for next Auto_Main, drives to waypoint and completes; reverse request also works',()=>{
 const s=prepared();s.input('startRequest',true);s.scan();assert.equal(s.v.renew,true);assert.equal(s.v.commandType,0);s.scan();assert.equal(s.v.commandStart,true);assert.equal(s.v.commandType,0);s.scan();assert.deepEqual(s.v.dataList,[11]);scans(s,70);assert.equal(s.v.currentNode,2);assert.equal(s.v.y,1100);assert.equal(s.v.performed,1);assert.equal(s.v.mainStep,2);
 s.input('dest',1);s.input('startRequest',true);scans(s,80);assert.equal(s.v.currentNode,1);assert.equal(s.v.performed,2);
});
test('wrong mode condition, held start, missing route and steering feedback prevent motion',()=>{
 const a=prepared();a.input('test',false);a.input('startRequest',true);scans(a,12);assert.equal(a.v.y,100);assert.equal(a.v.active,false);
 const b=prepared();b.input('holdStart',true);scans(b,12);assert.equal(b.v.commandType,0);assert.equal(b.v.y,100);assert.equal(b.block.code,'pathGate');b.input('holdStart',false);scans(b,70);assert.equal(b.v.currentNode,2);
 const c=prepared();c.input('mapAvailable',false);c.input('startRequest',true);scans(c,30);assert.equal(c.v.y,100);assert.equal(c.v.commandType,0);
 const d=prepared();d.input('steering',false);d.input('startRequest',true);scans(d,30);assert.equal(d.v.moveStep,5);assert.equal(d.v.y,100);assert.equal(d.block.code,'steerCheck');
});
test('stop during motion removes permission and freezes position; stalled feedback leaves command without false arrival',()=>{
 const s=prepared();s.input('startRequest',true);for(let n=0;n<60&&s.v.actualSpeed===0;n++)s.scan();assert.ok(s.v.y>100&&s.v.y<1100);s.input('stop',true);s.scan();const stopped=s.v.y;scans(s,10);assert.equal(s.v.y,stopped);assert.equal(s.v.speed,0);assert.equal(s.v.active,false);
 const d=prepared();d.input('feedback',false);d.input('startRequest',true);scans(d,50);assert.equal(d.v.moveStep,7);assert.equal(d.v.y,100);assert.ok(d.v.speed>0);assert.equal(d.v.timerQ,false);assert.equal(d.v.performed,0);
});
