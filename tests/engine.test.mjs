import test from 'node:test';
import assert from 'node:assert/strict';
import {compile,execute,grade,newRobot,tickRobot,dialectCode,sourceFile} from '../docs/engine.js';
import {exercises,lessons,quizzes,sources} from '../docs/content.js';

for(const exercise of exercises){
  for(const dialect of ['st','scl'])test(`${exercise.id}: ${dialect} reference passes all scenarios`,()=>{
    assert.ok(grade(exercise,dialectCode(exercise.solution,dialect)).every(r=>r.pass));
  });
  test(`${exercise.id}: starter exposes intended missing logic`,()=>assert.ok(grade(exercise,exercise.code).some(r=>!r.pass)));
}
test('CASE does not execute the newly selected branch in same invocation',()=>{
  assert.equal(execute(compile('CASE State OF 0: State := 1; 1: State := 2; END_CASE;'),{State:0}).State,1);
});
test('nested CASE and ELSIF respect blocks',()=>{
  const c=compile('IF X THEN CASE S OF 0: IF Y THEN S := 2; ELSIF Z THEN S := 3; ELSE S := 4; END_IF; ELSE S := 5; END_CASE; ELSE S := 6; END_IF;');
  assert.equal(execute(c,{X:true,Y:false,Z:true,S:0}).S,3);
});
test('precedence, comments and case insensitive identifiers',()=>{
  const c=compile('(* heading *) result := 1 + 2 * 3; // comment\n okay := not False and (result = 7);');
  assert.deepEqual(execute(c,{Result:0,Okay:false}),{Result:7,Okay:true});
});
test('bad code rejected without executing host JavaScript',()=>{
  for(const s of ['alert(1);','window.location := 3;','VAR X: BOOL; END_VAR','X := ;','IF X THEN X := FALSE;','CASE X OF 0: X := 1; 0: X := 2; END_CASE;'])assert.throws(()=>compile(s));
  assert.throws(()=>execute(compile('Missing := TRUE;'),{Known:false}),/선언되지/);
  assert.throws(()=>execute(compile('X := 1 / 0;'),{X:0}),/0으로/);
  assert.throws(()=>execute(compile('X := TRUE;'),{X:0}),/자료형/);
  assert.throws(()=>execute(compile('X := FALSE;'),{X:true},['X']),/입력/);
});
const ready=()=>tickRobot(newRobot());
const moving=()=>tickRobot(ready(),{start:true});
function docking(){let r=moving();for(let i=0;i<20;i++)r=tickRobot(r);assert.equal(r.state,'Docking');return r;}
test('normal sequence reaches Done only after three confirmed docking scans',()=>{
  let r=docking();r=tickRobot(r,{dockConfirmed:true});assert.equal(r.state,'Docking');r=tickRobot(r,{dockConfirmed:true});assert.equal(r.state,'Docking');r=tickRobot(r,{dockConfirmed:true});assert.equal(r.state,'Done');assert.equal(r.command,0);
});
test('stable confirmation resets when false',()=>{
  let r=docking();r=tickRobot(r,{dockConfirmed:true});r=tickRobot(r,{dockConfirmed:false});assert.equal(r.stable,0);
});
for(const [input,alarm] of [[{obstacle:true},'OBSTACLE'],[{safetyOk:false},'PERMIT_LOST'],[{commOk:false},'COMM_LOST']])test(`global interlock ${alarm} latches and inhibits command`,()=>{
  let r=tickRobot(moving(),input);assert.equal(r.state,'Fault');assert.equal(r.command,0);assert.equal(r.alarm,alarm);
  r=tickRobot(r);assert.equal(r.state,'Fault');r=tickRobot(r,{reset:true});assert.equal(r.state,'Idle');r=tickRobot(r);assert.equal(r.state,'Ready');assert.equal(r.command,0);
});
test('reset cannot clear active fault or restart with held Start',()=>{
  let r=tickRobot(moving(),{obstacle:true});assert.equal(tickRobot(r,{reset:true,obstacle:true}).state,'Fault');assert.equal(tickRobot(r,{reset:true,start:true}).state,'Fault');
});
test('QR invalid/stale stops immediately on docking entry and during docking',()=>{
  for(const i of [{qrValid:false},{qrFresh:false}]){
    let r=tickRobot(docking(),i);assert.equal(r.state,'Fault');assert.equal(r.command,0);
    r=moving();for(let j=0;j<19;j++)r=tickRobot(r);r=tickRobot(r,i);assert.equal(r.state,'Fault');assert.equal(r.command,0);
  }
});
test('timeout at 50 docking scans; timeout wins simultaneous completion',()=>{
  let r=docking();for(let i=0;i<49;i++)r=tickRobot(r);assert.equal(r.state,'Docking');r=tickRobot({...r,stable:2},{dockConfirmed:true});assert.equal(r.alarm,'DOCK_TIMEOUT');assert.equal(r.command,0);
});
test('start held from Idle never starts Moving without a fresh edge',()=>{
  let r=tickRobot(newRobot(),{start:true});for(let i=0;i<5;i++)r=tickRobot(r,{start:true});assert.equal(r.state,'Ready');r=tickRobot(r);r=tickRobot(r,{start:true});assert.equal(r.state,'Moving');
});
test('all boolean input combinations inhibit output on faults',()=>{
  const names=['enable','obstacle','safetyOk','commOk','qrValid','qrFresh','dockConfirmed'];
  for(let mask=0;mask<128;mask++){
    const inputs=Object.fromEntries(names.map((n,i)=>[n,!!(mask&(1<<i))]));
    for(const state of [moving(),docking()]){
      const r=tickRobot(state,inputs);
      if(!inputs.safetyOk||inputs.obstacle||!inputs.commOk||!inputs.enable||r.state==='Fault')assert.equal(r.command,0);
      if(state.state==='Docking'&&(!inputs.qrValid||!inputs.qrFresh))assert.equal(r.command,0);
    }
  }
});
test('all lessons have valid source references and quizzes',()=>{
  assert.equal(lessons.length,21);assert.equal(quizzes.length,26);
  for(const l of lessons){assert.ok(l.refs.length);assert.ok(l.refs.every(r=>sources[r]));assert.ok(quizzes.some(q=>q.lesson===l.id));}
});
test('download templates separate SCL from ST',()=>{
  const e=exercises[2];assert.match(sourceFile(e,e.solution,'scl'),/VAR\n    PrevStart : BOOL/);assert.match(sourceFile(e,e.solution,'scl'),/#PrevStart/);assert.match(sourceFile(e,e.solution,'st'),/PROGRAM MAIN/);assert.doesNotMatch(sourceFile(e,e.solution,'st'),/#PrevStart/);
});
