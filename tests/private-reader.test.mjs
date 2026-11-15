import test from 'node:test';
import assert from 'node:assert/strict';
import {validatePrivateBundle,findPrivateText} from '../docs/private-reader.js';
const sample=()=>({format:'mrs-private-study-v1',title:'내 연습',files:[{path:'source.st',content:'VAR flag : BOOL; END_VAR\nflag := TRUE;\n// flag is a comment',searchable:true},{path:'copy.st',content:'flag := TRUE;',searchable:false}],chapters:[{title:'시작',paragraphs:['조건과 쓰기'],refs:[{file:'source.st',line:1,end:2,label:'원문'}],question:'누가 쓰나?',answer:'2행'}]});
test('private bundle validates real source bounds before accepting a report',()=>{
 assert.equal(validatePrivateBundle(sample()).chapters.length,1);
 const missing=sample();missing.chapters[0].refs[0].file='missing';assert.throws(()=>validatePrivateBundle(missing),/근거/);
 const out=sample();out.chapters[0].refs[0].end=4;assert.throws(()=>validatePrivateBundle(out),/근거/);
 const duplicate=sample();duplicate.files.push(duplicate.files[0]);assert.throws(()=>validatePrivateBundle(duplicate),/중복/);
 assert.throws(()=>validatePrivateBundle({format:'wrong'}),/형식/);
});
test('search remains literal, includes comments, and avoids duplicate nonsearchable copies',()=>{
 const data=validatePrivateBundle(sample());assert.deepEqual(findPrivateText(data,'FLAG').map(r=>r.line),[1,2,3]);assert.deepEqual(findPrivateText(data,'flag := TRUE;').map(r=>r.line),[2]);assert.equal(findPrivateText(data,'[').length,0);assert.equal(findPrivateText(data,'f').length,0);
});
