import test from 'node:test';
import assert from 'node:assert/strict';
import {VirtualPLC,compilePLC,sampleSource,plcSamples} from '../docs/virtual-plc.js';
import {memberDeclaration,memberBody,memberTrace} from '../docs/twincat-examples.js';
import {lessons,quizzes,exercises,fieldChecks,curriculum,brands,sources} from '../docs/content.js';
import {referenceFiles,referenceSymbols} from '../docs/references.js';
import {resetRecords} from '../docs/records.js';
const machine=id=>new VirtualPLC(compilePLC(sampleSource(plcSamples.find(s=>s.id===id))));

test('TON/R_TRIG displayed trace matches every documented checkpoint',()=>{
 const p=machine('members');
 for(let scan=1;scan<=24;scan++){
  p.write('bStart',scan!==1&&scan!==23);const r=p.step(100);
  const expected=memberTrace.find(row=>row[0]===scan);if(!expected)continue;
  const v=p.values;
  assert.deepEqual([scan,r.time,v.BSTART,v.FBTIMER.ET,v.FBTIMER.Q,v.FBEDGE.Q,v.BREADY,v.NSTARTS],expected);
 }
});
test('provided MAIN listing parses in educational subset; not vendor compilation',()=>{
 const p=new VirtualPLC(compilePLC(memberDeclaration+'\n'+memberBody));p.step();assert.equal(p.values.BREADY,false);
});
test('TON TOF TP short-input timeline matches lesson including reset boundary',()=>{
 const p=machine('timer-modes');
 const expected=[
  [false,0,false,0,false,0],[false,0,true,0,true,0],
  [false,0,true,0,true,100],[false,0,true,100,true,200],
  [false,0,true,200,true,300],[false,0,true,300,true,400],
  [false,0,true,400,false,0],[false,0,false,500,false,0]
 ];
 expected.forEach((row,i)=>{p.write('bSignal',i===1);p.step(100);const v=p.values;assert.deepEqual([v.BON,v.TON,v.BOFF,v.TOFF,v.BPULSE,v.TPULSE],row);});
});
test('F_TRIG/R_TRIG detect opposite transitions, not held levels',()=>{
 const p=machine('edges');const rows=[[false,false,false],[true,true,false],[true,false,false],[false,false,true],[false,false,false]];
 for(const [input,rise,fall] of rows){p.write('bSignal',input);p.step();assert.equal(p.values.BRISE,rise);assert.equal(p.values.BFALL,fall);}
 assert.equal(p.values.NRISES,1);assert.equal(p.values.NFALLS,1);
});
test('reading before call and skipping calls preserves old edge output',()=>{
 const p=machine('call-order');p.write('bStart',true);p.step();assert.equal(p.values.BBEFORE,false);assert.equal(p.values.BAFTER,true);
 p.write('bCall',false);p.step();assert.equal(p.values.BBEFORE,true);assert.equal(p.values.BAFTER,true);
 p.write('bCall',true);p.step();assert.equal(p.values.BBEFORE,true);assert.equal(p.values.BAFTER,false);
});
test('TOF starts false, cancels off delay on TRUE, and restarts on next falling edge',()=>{
 const p=machine('timer-modes');p.step();assert.equal(p.values.BOFF,false);p.write('bSignal',true);p.step();p.write('bSignal',false);p.step();p.step();
 assert.equal(p.values.TOFF,100);p.write('bSignal',true);p.step();assert.equal(p.values.TOFF,0);assert.equal(p.values.BOFF,true);
 p.write('bSignal',false);p.step();assert.equal(p.values.TOFF,0);for(let i=0;i<5;i++)p.step();assert.equal(p.values.BOFF,false);
});
test('TP ignores an active-pulse retrigger and does not restart while held TRUE',()=>{
 const p=machine('timer-modes');for(const input of [false,true,false,true,true,true,true,true]){p.write('bSignal',input);p.step();}
 assert.equal(p.values.BPULSE,false);assert.equal(p.values.TPULSE,500);
 p.write('bSignal',false);p.step();p.write('bSignal',true);p.step();assert.equal(p.values.BPULSE,true);assert.equal(p.values.TPULSE,0);
});
test('zero PT and unsupported dynamic PT are explicit model behavior',()=>{
 for(const type of ['TON','TOF','TP']){
  const p=new VirtualPLC(compilePLC(`VAR_INPUT signal : BOOL; delay : TIME; END_VAR VAR t : ${type}; END_VAR t(IN := signal, PT := delay);`));
  p.write('signal',true);p.step();assert.equal(p.values.T.Q,type!=='TP');p.write('signal',false);p.step();assert.equal(p.values.T.Q,false);
 }
 const p=new VirtualPLC(compilePLC('VAR_INPUT delay : TIME := T#500ms; END_VAR VAR t : TON; END_VAR t(IN := TRUE, PT := delay);'));
 p.step();p.write('delay',600);assert.throws(()=>p.step(),/PT 변경/);assert.equal(p.scan,1);
});
test('unsupported STRUCT Property VAR_IN_OUT do not masquerade as implemented runtime',()=>{
 for(const source of ['VAR_IN_OUT x : BOOL; END_VAR x := TRUE;','VAR st : ST_Pose; END_VAR st.x := 1;'])assert.throws(()=>compilePLC(source));
 assert.throws(()=>sampleSource(plcSamples.find(s=>s.id==='members'),'scl'),/TwinCAT/);
});
test('old progress IDs, quiz meaning and exercise keys survive curriculum reordering',()=>{
 for(let i=1;i<=13;i++)assert.ok(lessons.some(l=>l.id===i));
 for(let i=1;i<=13;i++)assert.ok(quizzes.some(q=>q.id==='q'+i));
 assert.equal(quizzes.find(q=>q.id==='q7').answer,0);assert.match(quizzes.find(q=>q.id==='q7').q,/Siemens/);
 assert.deepEqual(exercises.map(e=>e.id),['permit','speed','edge','state','latch']);
 for(const id of ['controller','ide','architecture','lidar','camera','bumper','lamp','hmi','signals','workflow'])assert.ok(fieldChecks.some(c=>c[0]===id));
 assert.equal(new Set(lessons.map(l=>l.id)).size,lessons.length);
 assert.deepEqual(curriculum.flatMap(g=>g.ids),lessons.map(l=>l.id));
 assert.equal(new Set(brands.flatMap(b=>b.ids)).size,lessons.length);
 for(const lesson of lessons)for(const key of lesson.refs)assert.ok(sources[key],`${lesson.id}: ${key}`);
});
const saved={completed:[1,7,13],quiz:{q7:0},solved:['permit'],checks:['ide'],notes:'my personal notes',drafts:{permit:'DrivePermit := TRUE;'},extra:{keep:true}};
test('default record reset clears only progress; input object and code stay intact',()=>{
 const before=structuredClone(saved),after=resetRecords(saved);
 assert.deepEqual(saved,before);assert.deepEqual(after.completed,[]);assert.deepEqual(after.quiz,{});assert.deepEqual(after.solved,[]);
 for(const k of ['checks','notes','drafts','extra'])assert.deepEqual(after[k],saved[k]);
});
test('each optional reset category is independently selectable',()=>{
 for(const category of ['notes','checks','code']){
  const out=resetRecords(saved,{progress:false,[category]:true});assert.deepEqual(out.completed,saved.completed);assert.deepEqual(out.quiz,saved.quiz);
  assert.deepEqual(out.notes,category==='notes'?'':saved.notes);assert.deepEqual(out.checks,category==='checks'?[]:saved.checks);assert.deepEqual(out.drafts,category==='code'?{}:saved.drafts);
 }
});
test('cross-file links point to the documented symbol and valid source line',()=>{
 for(const symbol of referenceSymbols){assert.ok(symbol.refs.some(r=>r[2]==='Define'));for(const [file,line,,token] of symbol.refs)assert.ok(referenceFiles[file].split('\n')[line-1].includes(token),`${symbol.id}: ${file}:${line}`);}
 assert.equal(referenceSymbols.find(s=>s.id==='counter').refs[1][2],'Read + Write');
});
