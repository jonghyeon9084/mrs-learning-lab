import test from 'node:test';
import assert from 'node:assert/strict';
import {checkFlowConditions,validateOperationFlow} from '../docs/operation-flow.js';
import {validatePrivateBundle} from '../docs/private-reader.js';
const files=[{path:'sample.st',content:'flag := TRUE;'}],ref={file:'sample.st',line:1,end:1,label:'근거'};
const sample=()=>({version:1,title:'학습',scope:'정적 예',example:'요청',stages:[{title:'접수',owner:'프로그램',paragraphs:['읽기'],checks:['요청 있음','허가 있음'],pass:'다음 연결',fail:'차단',values:[['상태','이전','이후']],next:'소비자',timing:'호출 뒤',refs:[ref],question:'왜?',answer:'조건'}],storage:{rows:[],refs:[ref],writers:[],chain:[],nodes:[],links:[],notes:[]},exercises:[]});
test('condition comparison reports a missing gate without treating other gates as false',()=>{
 assert.deepEqual(checkFlowConditions(['request','permission'],[]).map(c=>c.met),[true,true]);
 assert.deepEqual(checkFlowConditions(['request','permission'],[true,false]),[{label:'request',met:true},{label:'permission',met:false}]);
});
test('operation data accepts legacy bundles and checks all source references',()=>{
 validateOperationFlow(undefined,files);
 validateOperationFlow(sample(),files);
 const bad=sample();bad.stages[0].refs=[{...ref,line:2,end:2}];assert.throws(()=>validateOperationFlow(bad,files),/근거/);
 const storage=sample();storage.storage.chain=[{expression:'x',value:'1',meaning:'값',refs:[{...ref,file:'missing'}]}];assert.throws(()=>validateOperationFlow(storage,files),/웨이포인트/);
 const bundle={format:'mrs-private-study-v1',title:'기존 자료',files,chapters:[]};assert.equal(validatePrivateBundle(bundle),bundle);
 bundle.operationFlow=bad;assert.throws(()=>validatePrivateBundle(bundle),/근거/);
});
