import test from 'node:test';
import assert from 'node:assert/strict';
import {compilePLC,VirtualPLC,sampleSource,plcSamples} from '../docs/virtual-plc.js';
test('statement stepping uses real source spans and commits only at scan end',()=>{
 const source='VAR x : INT; ok : BOOL := TRUE; END_VAR\nIF ok THEN\n x := 7;\nELSE\n x := 9;\nEND_IF;\nx := x + 1;';
 const p=new VirtualPLC(compilePLC(source)),it=p.scanSteps();let r=it.next();assert.equal(r.value.line,2);assert.equal(r.value.detail.result,true);
 r=it.next();assert.equal(r.value.line,3);assert.deepEqual(r.value.changes.x,{before:0,after:7});assert.equal(p.values.X,0);assert.equal(p.time,0);
 r=it.next();assert.equal(r.value.line,7);assert.equal(r.value.reads.x,7);assert.equal(it.next().done,true);assert.equal(p.values.X,8);assert.equal(p.scan,1);
 assert.ok(p.lastTrace.trace.every(e=>e.line!==5));
});
test('FB trace and stepped scan match normal scan without extra timer advancement',()=>{
 const program=compilePLC(sampleSource(plcSamples.find(s=>s.id==='members'))),a=new VirtualPLC(program),b=new VirtualPLC(program);
 a.write('bStart',true);b.write('bStart',true);const normal=a.step();const it=b.scanSteps();let r;do{r=it.next();}while(!r.done);assert.deepEqual(a.values,b.values);assert.equal(a.time,b.time);
 const call=normal.trace.find(e=>e.detail.type==='R_TRIG');assert.equal(call.changes['fbEdge.Q'].after,true);assert.match(call.explanation,/FALSE → TRUE/);
});
test('errors or cancellation do not commit intermediate writes, and spans handle same-line ELSIF',()=>{
 const p=new VirtualPLC(compilePLC('VAR x : INT; END_VAR\nx := 2;\nx := 1 / 0;')),it=p.scanSteps();it.next();assert.throws(()=>it.next(),/3행/);assert.equal(p.values.X,0);assert.equal(p.scan,0);
 const q=new VirtualPLC(compilePLC('VAR x : INT; END_VAR\nIF FALSE THEN x := 1; ELSIF TRUE THEN x := 3; END_IF;')),j=q.scanSteps();j.next();const branch=j.next().value;assert.equal(branch.kind,'if');assert.equal(branch.detail.result,true);assert.ok(branch.column>1);j.next();j.return();assert.equal(q.values.X,0);
});
test('loop trace records actual iterations and caps stored events',()=>{
 const p=new VirtualPLC(compilePLC('VAR i : INT; n : DINT; END_VAR\nFOR i := 1 TO 600 DO n := n + 1; END_FOR;'));const record=p.step();assert.equal(p.values.N,600);assert.equal(record.trace.length,500);assert.equal(record.truncated,true);assert.ok(record.eventCount>500);
});
