import test from 'node:test';
import assert from 'node:assert/strict';
import {VirtualPLC,compilePLC,plcSamples,sampleSource} from '../docs/virtual-plc.js';
const machine=(id,dialect='st')=>new VirtualPLC(compilePLC(sampleSource(plcSamples.find(s=>s.id===id),dialect)));
for(const mode of ['st','scl']){
  for(const s of plcSamples.filter(s=>mode==='st'||!s.stOnly))test(`${mode}: full ${s.id} source parses and executes`,()=>machine(s.id,mode).step());
  test(`${mode}: variable persists across scans`,()=>{const p=machine('variable',mode);p.step();p.step();assert.equal(p.values.COUNT,2);});
  test(`${mode}: TON starts at ET 0 and reaches 500ms on sixth 100ms sample`,()=>{const p=machine('timer',mode);p.write('QrValid',true);for(let i=0;i<5;i++){p.step();assert.equal(p.values.ELAPSED,i*100);assert.equal(p.values.STABLE,false);}p.step();assert.equal(p.values.STABLE,true);assert.equal(p.values.ELAPSED,500);p.write('QrValid',false);p.step();assert.equal(p.values.ELAPSED,0);assert.equal(p.values.STABLE,false);});
  test(`${mode}: rising edge only once for held input`,()=>{const p=machine('trigger',mode);p.write('Start',true);p.step();assert.equal(p.values.PULSE,true);p.step();assert.equal(p.values.PULSE,false);assert.equal(p.values.COUNT,1);p.write('Start',false);p.step();p.write('Start',true);p.step();assert.equal(p.values.COUNT,2);});
  test(`${mode}: FOR sums array in one scan`,()=>{const p=machine('array',mode);p.step();assert.equal(p.values.TOTAL,60);assert.equal(p.values.I,4);});
  test(`${mode}: mini docking completion and timeout`,()=>{const p=machine('docking',mode);p.write('Start',true);p.step();assert.equal(p.values.STATE,1);p.write('QrValid',true);p.step();assert.equal(p.values.STATE,2);p.write('DockConfirmed',true);p.step();assert.equal(p.values.STATE,3);assert.equal(p.values.DRIVEPERMIT,false);const q=machine('docking',mode);q.write('Start',true);q.write('QrValid',true);q.step();q.step();for(let i=0;i<20;i++)q.step();assert.equal(q.values.STATE,2);q.step();assert.equal(q.values.STATE,99);assert.equal(q.values.FAULT,true);});
}
test('runtime errors do not partially commit scan state',()=>{const p=new VirtualPLC(compilePLC('VAR x : INT; a : ARRAY[1..2] OF INT; END_VAR x := 5; a[3] := 8;'));assert.throws(()=>p.step(),/배열 범위/);assert.equal(p.values.X,0);assert.equal(p.scan,0);});
test('INT overflow, type mismatch, division by zero are explicit errors',()=>{
  for(const body of ['x := 32768;','x := TRUE;','x := 1 / 0;']){const p=new VirtualPLC(compilePLC(`VAR x : INT; END_VAR ${body}`));assert.throws(()=>p.step());}
});
test('loop watchdog and BY zero terminate with no commit',()=>{for(const body of ['FOR i := 1 TO 32767 DO x := x; END_FOR;','FOR i := 1 TO 3 BY 0 DO x := x; END_FOR;']){const p=new VirtualPLC(compilePLC(`VAR i : INT; x : INT; END_VAR ${body}`));assert.throws(()=>p.step());assert.equal(p.scan,0);}});
test('TIME literals, ABS, output mappings and IEC_TIMER.TON',()=>{const p=new VirtualPLC(compilePLC('VAR t : IEC_TIMER; q : BOOL; e : TIME; x : REAL; END_VAR t.TON(IN := TRUE, PT := T#100ms, Q => q, ET => e); x := ABS(-3.0);'));p.step();assert.equal(p.values.Q,false);p.step();assert.equal(p.values.Q,true);assert.equal(p.values.E,100);assert.equal(p.values.X,3);});
test('unknown symbols and unsupported declarations fail visibly',()=>{for(const source of ['VAR x : INT; END_VAR missing := 1;','VAR x : MAGIC; END_VAR x := 1;','VAR x : INT; END_VAR IF x THEN x := 2;'])assert.throws(()=>compilePLC(source));});
test('input BOOL validation and read-only assignment constraint',()=>{const p=machine('condition');assert.throws(()=>p.write('Start',1));const q=new VirtualPLC(compilePLC('VAR_INPUT x : BOOL; END_VAR x := TRUE;'));assert.throws(()=>q.step());});
test('separate PLC instances do not share timer state',()=>{const a=machine('timer'),b=machine('timer');a.write('QrValid',true);for(let i=0;i<6;i++)a.step();b.step();assert.equal(a.values.STABLE,true);assert.equal(b.values.STABLE,false);});
