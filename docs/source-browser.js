const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function sourceLineStarts(text){const starts=[0];for(let i=0;i<text.length;i++)if(text[i]==='\n')starts.push(i+1);return starts;}
export function sourceMatchOffsets(text,term){if(!term)return [];const haystack=text.toLowerCase(),needle=term.toLowerCase(),offsets=[];let at=0;while((at=haystack.indexOf(needle,at))!==-1){offsets.push(at);at+=needle.length;}return offsets;}
export function sourceLineAt(starts,offset){let lo=0,hi=starts.length-1;while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(starts[mid]<=offset)lo=mid;else hi=mid-1;}return lo+1;}
function groupName(path){if(path.includes('/original/'))return '원본 합본';if(path.includes('/modules/'))return path.split('/modules/')[1].split('/')[0]+' · POU별 분리본';return '보충 자료';}
export function mountSourceBrowser(root,data,selection,onPosition){
 let selected=selection,file=data.files.find(f=>f.path===selected?.file)||data.files.find(f=>f.searchable)||data.files[0];
 let starts=[],matches=[],matchIndex=-1,searchTerm='',displayText='',timer;
 root.innerHTML=`<p>왼쪽에서 파일을 선택하세요. <b>원본 합본</b>은 제공된 소스 텍스트 전체이고, <b>POU별 분리본</b>은 탐색 편의를 위해 나눈 파일입니다. 코드 내용을 줄이거나 학습 예제로 바꿔 표시하지 않습니다.</p><div class="source-workspace"><aside class="source-files"><label>파일 이름 찾기<input type="search" data-source-filter placeholder="MAIN, Drive, DUT…"></label><div data-source-tree></div></aside><section class="source-document"><div class="wf-source-head"><b data-source-title></b><small data-source-info></small></div><form class="source-tools" data-source-find><label>현재 파일 내용 찾기<input name="term" type="search" maxlength="180" placeholder="변수명 또는 코드"></label><button class="btn secondary small">찾기</button><button type="button" class="btn secondary small" data-source-find-next>다음 일치</button><span data-source-match role="status"></span></form><form class="source-tools" data-source-line-form><label>줄 번호<input name="line" type="number" min="1" required></label><button class="btn secondary small">이동</button><button type="button" class="btn secondary small" data-source-first>처음</button><button type="button" class="btn secondary small" data-source-last>끝</button><button type="button" class="btn secondary small" data-source-copy>전체 코드 복사</button></form><div class="source-editor"><pre data-source-gutter aria-hidden="true"></pre><textarea data-source-text aria-label="원본 소스 전체 코드" readonly wrap="off" spellcheck="false"></textarea></div><p class="muted" data-source-position role="status"></p><p class="muted">읽기 전용 원문 텍스트입니다. 주석·비활성 코드도 원문대로 포함됩니다. 화면의 줄 위치는 실행 중인 줄을 뜻하지 않습니다. 코드를 선택해 복사하거나 끝까지 스크롤할 수 있습니다.</p></section></div>`;
 const $=s=>root.querySelector(s),editor=$('[data-source-text]'),gutter=$('[data-source-gutter]');
 const tree=()=>{
  const term=$('[data-source-filter]').value.toLowerCase(),groups=new Map();
  data.files.forEach((f,i)=>{if(!f.path.toLowerCase().includes(term))return;const name=groupName(f.path);if(!groups.has(name))groups.set(name,[]);groups.get(name).push([f,i]);});
  const list=[...groups].sort(([a],[b])=>(a==='원본 합본'?-1:b==='원본 합본'?1:a.localeCompare(b)));
  $('[data-source-tree]').innerHTML=list.length?list.map(([name,items])=>`<details ${term||name==='원본 합본'||items.some(([f])=>f.path===file.path)?'open':''}><summary>${esc(name)} <small>${items.length}</small></summary>${items.map(([f,i])=>`<button type="button" data-source-file="${i}" ${f.path===file.path?'aria-current="true"':''} title="${esc(f.path)}">${esc(f.path.split('/').pop())}</button>`).join('')}</details>`).join(''):'<p>일치하는 파일이 없습니다.</p>';
 };
 const remember=line=>{selected={file:file.path,line,end:line};onPosition(selected);};
 const move=(line,end=line)=>{
  clearTimeout(timer);line=Math.max(1,Math.min(starts.length,line));end=Math.max(line,Math.min(starts.length,end));
  editor.focus({preventScroll:true});editor.setSelectionRange(starts[line-1],end<starts.length?starts[end]-1:displayText.length);
  editor.scrollTop=Math.max(0,(line-4)*22);gutter.scrollTop=editor.scrollTop;
  $('[name="line"]').value=line;$('[data-source-position]').textContent=`${line}행 / 전체 ${starts.length}행 · 파일 전체가 열려 있습니다.`;remember(line);
 };
 const load=(next,at=1,end=at)=>{
  clearTimeout(timer);file=next;displayText=file.content.replace(/\r\n?/g,'\n');starts=sourceLineStarts(displayText);matches=[];matchIndex=-1;searchTerm='';
  editor.value=file.content; // Full text, never a 100-line excerpt or innerHTML.
  gutter.textContent=starts.map((_,i)=>i+1).join('\n');
  $('[data-source-title]').textContent=file.path;$('[data-source-info]').textContent=`${groupName(file.path)} · 전체 ${starts.length}행 · ${file.content.length.toLocaleString()}자 · 생략 없음`;
  $('[name="line"]').max=starts.length;$('[name="term"]').value='';$('[data-source-match]').textContent='';tree();move(at,end);
 };
 const showMatch=()=>{
  if(!matches.length){$('[data-source-match]').textContent='일치 없음';return;}
  const start=matches[matchIndex],line=sourceLineAt(starts,start);move(line);editor.setSelectionRange(start,start+searchTerm.length);
  $('[data-source-match]').textContent=`${matchIndex+1} / ${matches.length} · ${line}행`;
 };
 root.addEventListener('input',e=>{if(e.target.hasAttribute('data-source-filter'))tree();});
 editor.addEventListener('scroll',()=>{
  gutter.scrollTop=editor.scrollTop;
  const line=Math.max(1,Math.min(starts.length,Math.floor(Math.max(0,editor.scrollTop-12)/22)+1));
  $('[data-source-position]').textContent=`화면 시작 ${line}행 / 전체 ${starts.length}행 · 파일 전체가 열려 있습니다.`;
  clearTimeout(timer);timer=setTimeout(()=>{if(root.isConnected)remember(line);},250);
 });
 root.addEventListener('submit',e=>{
  if(e.target.hasAttribute('data-source-find')){e.preventDefault();searchTerm=$('[name="term"]').value;matches=sourceMatchOffsets(displayText,searchTerm);matchIndex=0;showMatch();}
  else if(e.target.hasAttribute('data-source-line-form')){e.preventDefault();move(Number($('[name="line"]').value));}
 });
 root.addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.sourceFile!==undefined)load(data.files[Number(b.dataset.sourceFile)]);
  else if(b.hasAttribute('data-source-first'))move(1);
  else if(b.hasAttribute('data-source-last'))move(starts.length);
  else if(b.hasAttribute('data-source-find-next')){if(searchTerm!==$('[name="term"]').value){searchTerm=$('[name="term"]').value;matches=sourceMatchOffsets(displayText,searchTerm);matchIndex=-1;}if(matches.length){matchIndex=(matchIndex+1)%matches.length;showMatch();}else $('[data-source-match]').textContent='일치 없음';}
  else if(b.hasAttribute('data-source-copy')){try{await navigator.clipboard.writeText(file.content);$('[data-source-match]').textContent='파일 전체 코드를 복사했습니다.';}catch{editor.focus({preventScroll:true});editor.select();$('[data-source-match]').textContent='전체 코드를 선택했습니다. Ctrl+C로 복사하세요.';}}
 });
 load(file,selected?.file===file.path?selected.line:1,selected?.file===file.path?selected.end:1);
}
