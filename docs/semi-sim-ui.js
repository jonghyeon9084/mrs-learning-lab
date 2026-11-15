import {SemiSimulation} from './semi-sim-engine.js?v=20261116-live';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const show=v=>typeof v==='boolean'?(v?'TRUE':'FALSE'):typeof v==='number'?String(Math.round(v*100)/100):JSON.stringify(v);
let dispose=null;
export function unmountSemiSimulation(){dispose?.();dispose=null;}
export function mountSemiSimulation(root,bundle,openFull,existing){
 unmountSemiSimulation();const config=bundle.semiSimulation;
 if(!config){root.innerHTML='<p>고정 실습 자료를 준비 중입니다.</p>';return null;}
 const sim=existing||new SemiSimulation(config),sourceLines=new Map(bundle.files.map(f=>[f.path,f.content.split('\n')]));
 let timer=null,rate=4,record=null,ref=null;
 root.innerHTML=`<p class="sim-scope"><b>HMI 입력 → 주기별 코드 처리 → 가상 모터·센서</b><br>버튼이 실제로 모델 입력을 바꿉니다. 제공 소스에서 검토한 Semi-Auto Move 분기를 JavaScript로 실행하며, 원본 전체를 컴파일하는 TwinCAT은 아닙니다. HMI 바인딩·100ms 주기·준비/상부축 피드백·경로 탐색 시간·주행 물리는 교육용 가정입니다.</p><div class="ss-hmi"><div class="ss-hmi-title"><b>가상 HMI · Semi-Auto 이동</b><span data-ss-lamps></span></div><div class="ss-buttons"><button class="btn secondary" data-ss-action="semi">Semi-Auto 선택</button><button class="btn secondary" data-ss-action="active">운전 허가</button><label>목적지<select data-ss-dest><option value="0">0 · 미선택</option>${sim.nodes.map(n=>`<option value="${n.id}" ${sim.inputs.dest===n.id?'selected':''}>노드 ${n.id}</option>`).join('')}</select></label><button class="btn" data-ss-action="start">이동 시작</button><button class="btn ss-stop" data-ss-action="stop">정지</button><button class="btn secondary" data-ss-action="release">정지 해제</button></div><small>운전 허가·이동 시작은 1주기 요청입니다. 입력은 다음 주기 시작에 반영됩니다. 모드 선택과 정지는 유지형으로 가정했습니다.</small></div><div class="ss-toolbar"><button class="btn small" data-ss-action="run">Ⅱ 일시정지</button><button class="btn secondary small" data-ss-action="instruction">한 명령 실행</button><button class="btn secondary small" data-ss-action="scan">한 주기 실행</button><label>재생 속도<select data-ss-rate><option value="1">느리게</option><option value="4" selected>보통</option><option value="16">빠르게</option></select></label><button class="btn secondary small" data-ss-action="reset">실습 처음으로</button><span data-ss-clock></span></div><details class="ss-inputs"><summary>조건·고장 실험 · 실행 중에도 바꿀 수 있습니다</summary><div>${[['test','Test 조건 허용'],['ready','가상 준비 완료'],['steering','조향 피드백 정상'],['feedback','주행 위치 피드백 정상'],['axes','상부축 목표 도달'],['mapAvailable','지도 연결 정상'],['error','오류 발생'],['holdStart','시작 버튼 누름 유지']].map(([key,name])=>`<label><input type="checkbox" data-ss-input="${key}" ${sim.inputs[key]?'checked':''}>${name}</label>`).join('')}</div><p>체크는 실제 입력 조건을 바꿉니다. 조향 피드백을 끄면 목표각과 현재각이 달라져 주행 준비에서 멈춥니다. 주행 피드백을 끄면 명령과 로봇 위치가 어긋납니다. 시작 누름 유지는 경로 초기화 반복을 관찰하는 실험입니다.</p></details><div class="ss-grid"><section><div class="ss-map" data-ss-map></div><div data-ss-block class="ss-block" role="status"></div><div data-ss-explanation class="ss-explanation"></div></section><section class="ss-code-panel"><div class="wf-source-head"><b data-ss-code-title>실행 명령 ↔ 대응 원문</b><small data-ss-code-meta></small><button class="wf-source-link" data-ss-action="source">현재 근거의 전체 원문</button></div><div class="wf-code ss-code" data-ss-code tabindex="0"></div><p class="muted">청색 줄은 실행 모델에 대응하는 원문입니다. “교육 모형” 표시는 원문 FB·실제 장치를 대체한 처리이며 실제 PLC 실행을 뜻하지 않습니다.</p></section></div><div class="ss-bottom"><section><h4>현재 변수 · 같은 실행 시점의 값</h4><div class="ss-values" data-ss-values></div></section><section><h4>실행 기록 · 누르면 일시정지하고 당시 값 보기</h4><div class="ss-history" data-ss-history></div><button class="btn secondary small" data-ss-action="live">현재 상태로 돌아오기</button></section></div>`;
 const $=s=>root.querySelector(s);
 const name=k=>config.variables[k]||k;
 const map=v=>{
  const nodes=sim.nodes,minX=Math.min(...nodes.map(n=>n.x)),maxX=Math.max(...nodes.map(n=>n.x)),minY=Math.min(...nodes.map(n=>n.y)),maxY=Math.max(...nodes.map(n=>n.y));
  const scale=Math.min(430/Math.max(1000,maxX-minX),210/Math.max(1000,maxY-minY)),point=(x,y)=>[280+(x-(maxX+minX)/2)*scale,150-(y-(maxY+minY)/2)*scale];
  const [x,y]=point(v.x,v.y);
  return `<svg viewBox="0 0 560 300" role="img" aria-label="웨이포인트와 가상 로봇 위치"><defs><pattern id="ss-grid" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M25 0H0V25" fill="none" stroke="#dae6ea" stroke-width=".7"/></pattern></defs><rect width="560" height="300" fill="url(#ss-grid)"/>${sim.links.map(l=>{const a=nodes.find(n=>n.id===l.start),b=nodes.find(n=>n.id===l.end);if(!a||!b)return '';const p=point(a.x,a.y),q=point(b.x,b.y);return `<path d="M${p[0]} ${p[1]}L${q[0]} ${q[1]}" stroke="${v.dataList.includes(l.id)?'#5e96a4':'#a9bdc7'}" stroke-width="${v.dataList.includes(l.id)?6:2}"/>`;}).join('')}${nodes.map(n=>{const [nx,ny]=point(n.x,n.y);return `<circle cx="${nx}" cy="${ny}" r="14" fill="${v.destination===n.id?'#f3dca1':'#eaf2f4'}" stroke="#829ead"/><text x="${nx+26}" y="${ny-4}" fill="#294b61" font-size="15">노드 ${n.id}</text><text x="${nx+26}" y="${ny+14}" fill="#6d8492" font-size="11">${n.x}, ${n.y}</text>`;}).join('')}<g transform="translate(${x} ${y})"><rect x="-24" y="-17" width="48" height="34" rx="9" fill="${v.active?'#486e98':'#7c8a98'}" stroke="white" stroke-width="2"/><path d="M12 -5L18 0L12 5" fill="none" stroke="white" stroke-width="2"/><rect x="-21" y="-5" width="16" height="10" rx="3" fill="#22384d" transform="rotate(${-v.wheelRear} -13 0)"/><rect x="5" y="-5" width="16" height="10" rx="3" fill="#22384d" transform="rotate(${-v.wheelFront} 13 0)"/></g></svg><div class="ss-map-stats"><span>현재 노드 <b>${v.currentNode}</b></span><span>이번 링크 <b>${v.dataList[v.currentIndex-1]??'—'}</b></span><span>명령 ${show(v.speed)} / 실제 ${show(v.actualSpeed)} mm/s</span><span>X ${show(v.x)} · Y ${show(v.y)}</span></div><p>제공된 두 노드의 설정 좌표 · 가상 로봇 위치. 각도는 지도 기준, 실기 기구·안전 제어는 재현하지 않습니다.</p>`;
 };
 const paint=()=>{
  if(!root.isConnected){stop();return;}const event=record||sim.lastEvent,v=record?record.snapshot:sim.v;ref=event?config.evidence[event.code]:null;
  $('[data-ss-clock]').textContent=`${record?'기록 열람 · ':''}${v.scan}주기 · ${(v.timeMs/1000).toFixed(1)}s (가상 시간)`;
  $('[data-ss-lamps]').textContent=`모드 ${v.semi?'ON':'OFF'} · 허가 ${v.active?'ON':'OFF'} · 완료 ${v.performed}회`;
  $('[data-ss-action="semi"]').setAttribute('aria-pressed',String(sim.inputs.semi));
  $('[data-ss-action="semi"]').textContent=sim.inputs.semi?'Semi-Auto 선택됨':'Semi-Auto 선택';
  $('[data-ss-map]').innerHTML=map(v);
  const block=record?null:sim.block;$('[data-ss-block]').classList.toggle('blocked',!!block);
  $('[data-ss-block]').innerHTML=block?`<b>현재 대기·차단 위치</b><p>${esc(block.why)}</p><small>${esc(config.evidence[block.code]?.label||block.code)}</small>`:`<b>${record?'당시 상태를 보고 있습니다':v.moveStep===7?'웨이포인트로 이동 중':v.performed?'이동 완료':'코드 처리 중'}</b><p>${record?'현재 상태로 돌아오기를 누르면 실습을 이어갈 수 있습니다.':'입력 → 조건 판단 → 출력 → 다음 피드백 순서로 진행합니다.'}</p>`;
  $('[data-ss-explanation]').innerHTML=event?`<span class="tag">${event.kind==='model'?'교육 모형':event.kind==='diagnostic'?'차단 조건 진단':'검토한 원문 분기 대응'}</span><h4>${esc(event.why)}</h4><p>${Object.entries(event.reads).map(([k,val])=>`${esc(name(k))} = <b>${esc(show(val))}</b>`).join(' · ')||'조건을 통과하여 값을 씁니다.'}</p>${event.changes.map(c=>`<p class="ss-change"><code>${esc(name(c.key))}</code><br>${esc(show(c.before))} → <b>${esc(show(c.after))}</b></p>`).join('')}`:'<p>HMI에서 Semi-Auto 선택 → 운전 허가 → 이동 시작 순서로 조작하세요.</p>';
  $('[data-ss-code-title]').textContent=ref?.label||'현재 실행 명령';$('[data-ss-code-meta]').textContent=ref?`${ref.file.split('/').pop()} · ${ref.line}–${ref.end}행 · ${event.kind==='model'?'대체한 처리의 연결 근거':'실행 모델과 대응하는 구간'}`:'제공 소스의 해당 근거를 함께 표시합니다.';
  const lines=ref?sourceLines.get(ref.file):null;if(lines){const a=Math.max(1,ref.line-2),b=Math.min(lines.length,ref.end+2);$('[data-ss-code]').innerHTML=lines.slice(a-1,b).map((s,j)=>`<div class="${j+a>=ref.line&&j+a<=ref.end?'wf-mark':''}"><small>${j+a}</small><code>${esc(s)||' '}</code></div>`).join('');}else $('[data-ss-code]').innerHTML='<div><code>HMI 입력을 기다립니다.</code></div>';
  const changed=new Set(event?.changes.map(c=>c.key));$('[data-ss-values]').innerHTML=`<table><thead><tr><th>변수</th><th>현재 값</th></tr></thead><tbody>${Object.entries(config.variables).filter(([k])=>Object.hasOwn(v,k)).map(([k,label])=>`<tr class="${changed.has(k)?'ss-changed':''}"><td>${esc(label)}</td><td>${esc(show(v[k]))}</td></tr>`).join('')}</tbody></table>`;
  $('[data-ss-history]').innerHTML=sim.history.slice(-25).reverse().map((e,index)=>`<button data-ss-record="${sim.history.length-1-index}"><small>${e.scan}주기 · ${e.kind==='model'?'모형':e.kind==='diagnostic'?'진단':'코드'}</small>${esc(config.evidence[e.code]?.label||e.code)}${e.changes.length?` · ${e.changes.length}개 변경`:''}</button>`).join('');
 };
 const stop=()=>{clearInterval(timer);timer=null;$('[data-ss-action="run"]').textContent='▶ 계속 실행';};
 const run=()=>{record=null;if(timer)return;$('[data-ss-action="run"]').textContent='Ⅱ 일시정지';timer=setInterval(()=>{if(!root.isConnected){stop();return;}try{for(let n=0;n<rate;n++)sim.step();paint();}catch(e){stop();$('[data-ss-block]').textContent='모델 실행 오류: '+e.message;}},70);};
 root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.ssRecord!==undefined){stop();record=sim.history[Number(b.dataset.ssRecord)];paint();return;}const action=b.dataset.ssAction;if(!action)return;
  if(action==='run'){if(timer)stop();else run();return;}
  if(action==='source'){stop();if(ref)openFull(ref);return;}
  record=null;
  if(action==='semi')sim.input('semi',!sim.inputs.semi);
  if(action==='active')sim.input('activeRequest',true);
  if(action==='start')sim.input('startRequest',true);
  if(action==='stop')sim.input('stop',true);
  if(action==='release')sim.input('stop',false);
  if(action==='instruction'){stop();sim.step();}
  if(action==='scan'){stop();sim.scan();}
  if(action==='reset'){stop();const fresh=new SemiSimulation(config);Object.assign(sim,fresh);for(const el of root.querySelectorAll('[data-ss-input]'))el.checked=sim.inputs[el.dataset.ssInput];$('[data-ss-dest]').value=sim.inputs.dest;run();}
  paint();
 });
 root.addEventListener('change',e=>{if(e.target.dataset.ssInput)sim.input(e.target.dataset.ssInput,e.target.checked);else if(e.target.hasAttribute('data-ss-dest'))sim.input('dest',Number(e.target.value));else if(e.target.hasAttribute('data-ss-rate'))rate=Number(e.target.value);record=null;paint();});
 dispose=stop;paint();run();return sim;
}
