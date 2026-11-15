import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {flowSources,flowScenarios,runFlowScenario} from '../docs/workflow-case.js';
import {workflowPage} from '../docs/workflow.js';

test('normal job crosses scan boundaries and separates move, action, and feedback',()=>{
 const s=runFlowScenario('load').map(s=>s.after);
 assert.deepEqual(s.map(v=>v['fbJob.nStep']),[0,10,20,20,30,30,40,40]);
 assert.deepEqual(s.map(v=>v['fbDrive.rSpeed_mps']),[0,0,0,0.3,0,0,0,0]);
 assert.deepEqual(s.map(v=>v['GVL_Cell.stOutput.bLoad']),[false,false,false,false,false,true,false,false]);
 assert.equal(s[6]['fbJob.bDone'],false);assert.equal(s[7]['fbJob.bDone'],true);
 const u=runFlowScenario('unload');assert.equal(u[5].after['GVL_Cell.stOutput.bUnload'],true);assert.equal(u[5].after['GVL_Cell.stOutput.bLoad'],false);
});
test('blocked edge is not queued, faults latch, and accepted job survives changed HMI input',()=>{
 const h=runFlowScenario('held');assert.deepEqual(h.slice(0,6).map(s=>s.after['fbJob.nStep']),[0,0,0,0,0,10]);
 const o=runFlowScenario('obstacle');assert.equal(o[4].after['fbDrive.rSpeed_mps'],0);assert.equal(o[5].after['fbJob.nStep'],900);assert.equal(o[6].after['fbJob.nStep'],0);assert.equal(o[6].after['fbJob.bFault'],false);
 const bad=runFlowScenario('invalid');assert.equal(bad[2].after['fbJob.nStep'],900);assert.equal(bad[4].after['fbJob.nStep'],900);
 const copy=runFlowScenario('snapshot');assert.equal(copy[5].input['GVL_Cell.stHmi.nJob'],3);assert.equal(copy[5].after['fbJob.nJob'],2);assert.equal(copy[5].after['GVL_Cell.stOutput.bLoad'],true);
});
test('walkthrough code locations exist and published source files match the displayed source',()=>{
 for(const scenario of flowScenarios)for(const scan of runFlowScenario(scenario.id))for(const event of scan.events){assert.ok(event.line>0);assert.ok(event.endLine>=event.line);assert.ok(event.endLine<=flowSources[event.file].code.split('\n').length);}
 for(const [key,name] of Object.entries({gvl:'GVLs/GVL_Cell.st',main:'POUs/PRG_Learn.st',job:'POUs/FB_Job.st',drive:'POUs/FB_Drive.st'}))assert.equal(readFileSync(new URL('../docs/examples/workflow/'+name,import.meta.url),'utf8').replaceAll('\r\n','\n').trim(),flowSources[key].code.trim());
 for(const code of flowSources.types.code.split('\n\n')){const name=/TYPE (\w+)/.exec(code)[1];assert.equal(readFileSync(new URL('../docs/examples/workflow/DUTs/'+name+'.st',import.meta.url),'utf8').replaceAll('\r\n','\n').trim(),code.trim());}
 const html=workflowPage('main');assert.match(html,/전체 구조·모든 소스/);assert.match(html,/xxx.xxx.xxx 풀기/);assert.match(html,/회사 코드에 적용할 추적 지도/);
});
