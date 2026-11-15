// Per-browser source library. No network; separate from learning progress.
const database='mrs-private-library-v1',table='study';
let queue=Promise.resolve();
function transact(mode,work){
 const operation=()=>new Promise((resolve,reject)=>{
  let blocked=false;
  const request=indexedDB.open(database,1);
  request.onupgradeneeded=()=>request.result.createObjectStore(table);
  request.onerror=()=>reject(request.error||new Error('브라우저 자료 저장소를 열 수 없습니다.'));
  request.onblocked=()=>{blocked=true;reject(new Error('다른 탭의 자료 저장소 작업이 끝난 뒤 다시 시도하세요.'));};
  request.onsuccess=()=>{
   const db=request.result;if(blocked){db.close();return;}db.onversionchange=()=>db.close();
   let result,tx;
   try{tx=db.transaction(table,mode);result=work(tx.objectStore(table));}catch(error){db.close();reject(error);return;}
   tx.oncomplete=()=>{db.close();resolve(typeof result==='function'?result():result);};
   tx.onabort=()=>{db.close();reject(tx.error||new Error('브라우저 자료 저장에 실패했습니다.'));};
   tx.onerror=()=>{}; // onabort is the final failure signal.
  };
 });
 const pending=queue.then(operation);queue=pending.catch(()=>{});return pending;
}
export function readPrivateStudy(){return transact('readonly',store=>{const data=store.get('bundle'),position=store.get('position');return ()=>({bundle:data.result,position:position.result});});}
export function writePrivateStudy(bundle,position){return transact('readwrite',store=>{store.put(bundle,'bundle');store.put(position,'position');});}
export function writePrivatePosition(position){return transact('readwrite',store=>{store.put(position,'position');});}
export function removePrivateStudy(){return transact('readwrite',store=>{store.delete('bundle');store.delete('position');});}
export function restorePrivatePosition(bundle,position){
 const chapter=Number.isInteger(position?.chapter)&&position.chapter>=0&&position.chapter<bundle.chapters.length?position.chapter:0;
 const candidate=position?.selected,file=bundle.files.find(f=>f.path===candidate?.file);
 const selected=file&&Number.isInteger(candidate.line)&&Number.isInteger(candidate.end)&&candidate.line>=1&&candidate.end>=candidate.line&&candidate.end<=file.content.split('\n').length?{file:candidate.file,line:candidate.line,end:candidate.end}:bundle.chapters[chapter]?.refs[0]||{file:bundle.files[0].path,line:1,end:1};
 return {chapter,selected};
}
