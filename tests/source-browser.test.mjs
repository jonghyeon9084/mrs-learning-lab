import test from 'node:test';
import assert from 'node:assert/strict';
import {sourceLineStarts,sourceLineAt,sourceMatchOffsets} from '../docs/source-browser.js';
test('full source indexing includes all 27749 lines and final blank line',()=>{
 const text=Array.from({length:27749},(_,i)=>`line ${i+1}`).join('\n')+'\n';
 const starts=sourceLineStarts(text);
 assert.equal(starts.length,27750);
 assert.equal(sourceLineAt(starts,text.indexOf('line 24000')),24000);
 assert.equal(sourceLineAt(starts,text.length),27750);
 assert.equal(sourceLineAt(starts,0),1);
});
test('file search treats dotted names and brackets literally, without a result limit',()=>{
 const text='GVL.Axis[0].Q\n'.repeat(200);
 const hits=sourceMatchOffsets(text,'gvl.axis[0].q');
 assert.equal(hits.length,200);
 assert.equal(sourceLineAt(sourceLineStarts(text),hits[199]),200);
 assert.deepEqual(sourceMatchOffsets(text,''),[]);
 assert.deepEqual(sourceMatchOffsets(text,'Axis.*'),[]);
});
