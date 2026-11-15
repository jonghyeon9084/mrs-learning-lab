// Source library stays in this browser's IndexedDB, never in network requests.
import {readPrivateStudy,writePrivateStudy,writePrivatePosition,removePrivateStudy,restorePrivatePosition} from './private-store.js';
import {mountSourceBrowser} from './source-browser.js?v=20261116-source';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let bundle=null,chapter=0,selected=null,revision=0;
export function validatePrivateBundle(data){
 if(!data||data.format!=='mrs-private-study-v1'||typeof data.title!=='string'||!Array.isArray(data.files)||!Array.isArray(data.chapters)||!data.files.length||data.files.length>400||data.chapters.length>100)throw new Error('개인 학습자료 JSON 형식을 확인하세요. ZIP 파일은 먼저 분석 자료로 준비해야 합니다.');
 let total=0;const ids=new Set();
 for(const f of data.files){if(!f||typeof f.path!=='string'||!f.path||f.path.length>250||ids.has(f.path)||typeof f.content!=='string')throw new Error('중복되거나 잘못된 소스 항목입니다.');ids.add(f.path);total+=f.content.length;}
 if(total>12000000)throw new Error('자료는 텍스트 12 MB 이하로 준비하세요.');
 for(const c of data.chapters){if(!c||typeof c.title!=='string'||(c.diagram!==undefined&&typeof c.diagram!=='string')||!Array.isArray(c.paragraphs)||!c.paragraphs.every(x=>typeof x==='string')||!Array.isArray(c.refs)||typeof c.question!=='string'||typeof c.answer!=='string')throw new Error('해설 형식을 확인하세요.');for(const r of c.refs){const file=data.files.find(f=>f.path===r.file);if(!file||!Number.isInteger(r.line)||!Number.isInteger(r.end)||r.line<1||r.end<r.line||r.end>file.content.split('\n').length||typeof r.label!=='string')throw new Error('해설의 근거 파일/줄 범위가 맞지 않습니다.');}}
 return data;
}
export function findPrivateText(data,term){
 if(term.trim().length<2)return [];
 const needle=term.trim().toLowerCase(),results=[];
 for(const f of data.files.filter(f=>f.searchable===true)){for(const [i,line] of f.content.split('\n').entries()){if(line.toLowerCase().includes(needle)){results.push({file:f.path,line:i+1,text:line});if(results.length>=80)return results;}}}
 return results;
}
export function privateReaderPage(mode='lesson'){return `<div id="private-reader"><h3>${mode==='source'?'원본 소스 전체 보기':'실제 소스 따라가기'}</h3><nav class="source-view-tabs" aria-label="실제 소스 보기 방식"><a class="btn secondary small" href="#workflow/source" ${mode==='source'?'aria-current="page"':''}>원본 소스 전체</a><a class="btn secondary small" href="#workflow/private" ${mode!=='source'?'aria-current="page"':''}>구조도 · 한글 해설</a></nav><p>구조도에서 담당 코드를 찾고, 조건과 변수의 전달을 원문·한글 해설과 함께 따라갑니다. 저장한 자료와 마지막으로 읽던 위치가 자동으로 열립니다.</p><p data-private-message role="status">이 브라우저에 저장된 자료를 확인하고 있습니다…</p><div data-private-content></div><details class="workflow-question" data-private-settings><summary>자료 관리 · 최초 등록 / 교체</summary><p>처음 한 번 등록하면 이 브라우저에 보관합니다. 이후에는 파일을 고르지 않고 바로 공부할 수 있습니다. 회사 원문은 공개 사이트나 서버로 전송하지 않습니다.</p><label class="private-upload">학습자료 등록·교체 <input type="file" accept=".json,application/json" data-private-file></label><p class="muted">이 브라우저·프로필에 저장됩니다. 다른 브라우저나 기기로 자동 동기화되지는 않으며, 사이트 데이터 삭제·비공개 모드·저장 공간 정리 시 자료가 사라질 수 있습니다. 기존 수업 진도·작성 코드·PC 원본과는 별도입니다.</p><button class="btn secondary small" data-private-remove>이 브라우저의 소스 자료 삭제</button></details></div>`;}
const refButton=(r,i)=>`<button class="wf-source-link" data-private-ref="${i}">${esc(r.label)} · ${esc(r.file.split('/').pop())}:${r.line}–${r.end} ↗</button>`;
function fileTree(){const groups=new Map();bundle.files.forEach((f,i)=>{const group=f.path.slice(0,f.path.lastIndexOf('/'))||'파일';if(!groups.has(group))groups.set(group,[]);groups.get(group).push([f,i]);});return `<details class="workflow-question"><summary>패키지 파일 트리 · ${bundle.files.length}개 텍스트</summary>${[...groups].map(([group,items])=>`<details><summary>${esc(group)} · ${items.length}</summary><div class="workflow-links">${items.map(([f,i])=>`<button class="wf-source-link" data-private-tree="${i}">${esc(f.path.split('/').pop())}</button>`).join('')}</div></details>`).join('')}</details>`;}
function sourceHTML(){
 if(!selected)return '<p class="muted">근거 링크나 파일을 선택하면 원문이 여기에 열립니다.</p>';
 const f=bundle.files.find(f=>f.path===selected.file);if(!f)return '';
 const lines=f.content.split('\n'),start=Math.max(1,selected.line-18),end=Math.min(lines.length,Math.max(selected.end+25,start+100));
 return `<div class="wf-source-head"><b>${esc(f.path)}</b><a class="wf-source-link" href="#workflow/source">이 파일 전체 원문 열기 ↗</a><small>발췌 구간 ${start}–${end}행 / 전체 ${lines.length}행 · 정적 열람, 실행 중 표시 아님</small></div><div class="wf-code private-code" tabindex="0">${lines.slice(start-1,end).map((s,i)=>`<div ${i+start>=selected.line&&i+start<=selected.end?'class="wf-mark"':''}><small>${i+start}</small><code>${esc(s)||' '}</code></div>`).join('')}</div><form data-private-jump class="wf-controls"><label>원문 줄로 이동<input type="number" name="line" min="1" max="${lines.length}" value="${selected.line}" required></label><button class="btn secondary small">해당 줄 열기</button><button class="btn secondary small" type="button" data-private-more>다음 100줄</button></form>`;
}
export function mountPrivateReader(mode='lesson'){
 const root=document.getElementById('private-reader');if(!root)return;
 const content=root.querySelector('[data-private-content]'),message=root.querySelector('[data-private-message]');
 const remember=()=>{if(bundle)writePrivatePosition({chapter,selected}).catch(()=>{if(root.isConnected)message.textContent='읽던 위치를 저장하지 못했습니다. 자료는 현재 화면에서 계속 볼 수 있습니다.';});};
 const source=()=>{root.querySelector('[data-private-source]').innerHTML=sourceHTML();const box=root.querySelector('.private-code'),mark=box?.querySelector('.wf-mark');if(mark)box.scrollTop=mark.offsetTop-box.offsetTop-20;remember();};
 const render=()=>{
  if(!bundle){content.innerHTML='<div class="callout">이 브라우저에는 아직 실제 소스 학습자료가 등록되어 있지 않습니다. 아래 자료 관리에서 처음 한 번 등록하면 다음부터 자동으로 열립니다.</div>';return;}
  if(mode==='source'){content.innerHTML='<div data-private-full-source></div>';mountSourceBrowser(content.firstElementChild,bundle,selected,position=>{selected=position;remember();});return;}
  const c=bundle.chapters[chapter];
  content.innerHTML=`<div class="private-heading"><strong>${esc(bundle.title)}</strong><button class="btn secondary small" data-private-close>자료 닫기</button></div><p class="muted">${bundle.files.length}개 텍스트 파일 · ${bundle.chapters.length}개 근거 기반 수업 · 읽기 전용</p><div class="wf-controls"><label>수업 선택<select data-private-chapter>${bundle.chapters.map((c,i)=>`<option value="${i}" ${i===chapter?'selected':''}>${i+1}. ${esc(c.title)}</option>`).join('')}</select></label><label>전체 파일 구조<select data-private-source-select><option value="">파일 선택…</option>${bundle.files.map((f,i)=>`<option value="${i}">${esc(f.path)}</option>`).join('')}</select></label></div><div class="private-grid"><article><h3>${esc(c?.title||'원문 읽기')}</h3>${(c?.paragraphs||[]).map(p=>`<p>${esc(p)}</p>`).join('')}<h4>직접 확인할 근거</h4><div class="workflow-links">${(c?.refs||[]).map(refButton).join('')}</div>${c?`<details class="workflow-question"><summary>연습 · ${esc(c.question)}</summary><p>${esc(c.answer)}</p></details>`:''}</article><div data-private-source>${sourceHTML()}</div></div><form data-private-search class="wf-controls"><label>원본 텍스트에서 찾기<input name="term" type="search" minlength="2" maxlength="180" placeholder="변수 전체 경로 또는 호출 이름" required></label><button class="btn secondary small">찾기</button></form><p class="muted">검색은 주석을 포함한 대소문자 무시 텍스트 일치입니다. 컴파일러의 Cross Reference가 아니며 Read/Write/Define를 자동 판정하지 않습니다. 결과는 최대 80개입니다.</p><div data-private-results></div>`;
  const article=root.querySelector('.private-grid article');
  if(c?.diagram)article.insertAdjacentHTML('afterbegin',`<h4>확인한 주요 호출 구조</h4><pre class="private-diagram">${esc(c.diagram)}</pre>`);
  content.insertAdjacentHTML('beforeend',fileTree());
  const heading=content.querySelector('.private-heading');heading.querySelector('[data-private-close]').remove();
  heading.insertAdjacentHTML('beforeend','<span class="tag">이 브라우저에 저장됨</span>');
  article.insertAdjacentHTML('beforeend',`<div class="wf-toolbar"><button class="btn secondary small" data-private-prev ${chapter===0?'disabled':''}>← 이전 수업</button><span>${chapter+1} / ${bundle.chapters.length}</span><button class="btn small" data-private-next ${chapter>=bundle.chapters.length-1?'disabled':''}>다음 수업 →</button></div>`);
  source();
 };
 root.addEventListener('change',async e=>{
  const el=e.target;
  if(el.hasAttribute('data-private-file')){
   const file=el.files?.[0];if(!file)return;
   try{if(file.size>16000000)throw new Error('파일은 16 MB 이하로 준비하세요.');const next=validatePrivateBundle(JSON.parse(await file.text()));if(!root.isConnected)return;revision++;const position=restorePrivatePosition(next,null);el.disabled=true;await writePrivateStudy(next,position);bundle=next;chapter=position.chapter;selected=position.selected;if(root.isConnected){render();root.querySelector('[data-private-settings]').open=false;message.textContent='등록을 완료했습니다. 다음 방문과 새로고침에서도 자료와 읽던 위치가 자동으로 열립니다.';}}catch(error){message.textContent='자료를 등록하지 못했습니다. 기존 등록 자료는 유지됩니다. '+error.message;}finally{el.value='';el.disabled=false;}
  }else if(el.hasAttribute('data-private-chapter')){chapter=Number(el.value);selected=bundle.chapters[chapter].refs[0]||selected;render();root.querySelector('[data-private-chapter]').focus({preventScroll:true});}
  else if(el.hasAttribute('data-private-source-select')&&el.value!==''){selected={file:bundle.files[Number(el.value)].path,line:1,end:1};source();}
 });
 let results=[];
 root.addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-private-remove')){if(!confirm('이 브라우저에 저장한 실제 소스 자료와 읽던 위치를 삭제할까요? 기존 학습 진도·작성 코드·PC 원본은 유지됩니다. 다시 보려면 자료를 재등록해야 합니다.'))return;revision++;b.disabled=true;try{await removePrivateStudy();bundle=null;selected=null;chapter=0;results=[];if(root.isConnected){render();message.textContent='이 브라우저의 소스 자료를 삭제했습니다.';}}catch(error){message.textContent='자료를 삭제하지 못했습니다. '+error.message;}finally{b.disabled=false;}}
  else if(b.hasAttribute('data-private-prev')||b.hasAttribute('data-private-next')){chapter=Math.max(0,Math.min(bundle.chapters.length-1,chapter+(b.hasAttribute('data-private-next')?1:-1)));selected=bundle.chapters[chapter].refs[0]||selected;render();root.querySelector('.private-grid article').scrollIntoView({block:'start'});}
  else if(b.dataset.privateRef!==undefined){selected=bundle.chapters[chapter].refs[Number(b.dataset.privateRef)];source();}
  else if(b.dataset.privateTree!==undefined){selected={file:bundle.files[Number(b.dataset.privateTree)].path,line:1,end:1};source();root.querySelector('[data-private-source]').scrollIntoView({block:'nearest'});}
  else if(b.dataset.privateResult!==undefined){const r=results[Number(b.dataset.privateResult)];selected={file:r.file,line:r.line,end:r.line};source();root.querySelector('[data-private-source]').scrollIntoView({block:'nearest'});}
  else if(b.hasAttribute('data-private-more')){const max=bundle.files.find(f=>f.path===selected.file).content.split('\n').length;const line=Math.min(max,selected.line+100);selected={...selected,line,end:line};source();}
 });
 root.addEventListener('submit',e=>{
  if(e.target.hasAttribute('data-private-search')){e.preventDefault();const term=new FormData(e.target).get('term');results=findPrivateText(bundle,String(term));root.querySelector('[data-private-results]').innerHTML=results.length?results.map((r,i)=>`<div><button class="wf-source-link" data-private-result="${i}">${esc(r.file.split('/').pop())}:${r.line}</button><pre>${esc(r.text)}</pre></div>`).join(''):'<p>텍스트 일치 없음. 다른 별칭·구조체 전체 쓰기·외부 바인딩까지 없다는 뜻은 아닙니다.</p>';}
  else if(e.target.hasAttribute('data-private-jump')){e.preventDefault();const n=Number(new FormData(e.target).get('line'));selected={...selected,line:n,end:n};source();}
 });
 if(bundle){render();message.textContent='저장된 실제 소스와 읽던 위치를 열었습니다.';}
 else{const attempt=revision;readPrivateStudy().then(saved=>{if(!root.isConnected||revision!==attempt)return;if(saved.bundle){bundle=validatePrivateBundle(saved.bundle);const position=restorePrivatePosition(bundle,saved.position);chapter=position.chapter;selected=position.selected;render();message.textContent='저장된 실제 소스와 읽던 위치를 열었습니다.';}else{render();message.textContent='최초 등록 후에는 자동으로 열립니다.';root.querySelector('[data-private-settings]').open=true;}}).catch(error=>{if(root.isConnected){message.textContent='저장된 자료를 열지 못했습니다. '+error.message;root.querySelector('[data-private-settings]').open=true;}});}
}
