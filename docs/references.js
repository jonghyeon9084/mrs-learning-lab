// Fixed teaching project, not a parser or a copy of company source.
export const referenceFiles = {
 'GVL_Robot': `{attribute 'qualified_only'}
VAR_GLOBAL
    bDockRequest : BOOL;
    bQrValid : BOOL;
    bDockReady : BOOL;
END_VAR`,
 'MAIN': `PROGRAM MAIN
VAR
    fbDock : FB_Dock;
END_VAR

fbDock(
    bRequest := GVL_Robot.bDockRequest,
    bQrValid := GVL_Robot.bQrValid
);
GVL_Robot.bDockReady := fbDock.bReady;`,
 'FB_Dock': `FUNCTION_BLOCK FB_Dock
VAR_INPUT
    bRequest : BOOL;
    bQrValid : BOOL;
END_VAR
VAR_OUTPUT
    bReady : BOOL;
END_VAR
VAR
    fbStable : TON;
    nCalls : DINT;
END_VAR

nCalls := nCalls + 1;
fbStable(IN := bRequest AND bQrValid, PT := T#2S);
bReady := fbStable.Q;`
};
export const referenceSymbols = [
 {id:'request',name:'GVL_Robot.bDockRequest',type:'BOOL · GVL',note:'선언은 GVL, 값의 소비는 MAIN입니다. 이 교육 예제에는 HMI/I/O 생산자 소스가 없습니다. Write 결과가 없다고 값이 바뀔 수 없다고 결론 내리지 말고 외부 심볼 연결을 확인합니다.',refs:[['GVL_Robot',3,'Define','bDockRequest'],['MAIN',7,'Read','GVL_Robot.bDockRequest']]},
 {id:'input',name:'MAIN.fbDock.bRequest',type:'BOOL · FB VAR_INPUT',note:'FB_Dock의 입력 정의를 MAIN.fbDock 인스턴스가 사용합니다. MAIN의 호출 인자 :=는 입력 전달입니다. 외부 변수 GVL_Robot.bDockRequest를 읽어 이 인스턴스의 입력으로 넘깁니다. 이 표의 Write는 데이터 전달 의미의 교육용 분류이며 IDE의 표시 형식과 동일하다고 보장하지 않습니다.',refs:[['FB_Dock',3,'Define','bRequest'],['MAIN',7,'Write','bRequest'],['FB_Dock',15,'Read','bRequest']]},
 {id:'instance',name:'MAIN.fbDock',type:'FB_Dock · FB 인스턴스',note:'인스턴스 선언에서 타입 FB_Dock으로 이동합니다. fbDock(...)는 생성이 아니라 본문 호출입니다. Task → MAIN → fbDock → fbStable 순서로 따라갑니다.',refs:[['MAIN',3,'Define','fbDock'],['MAIN',6,'Call','fbDock'],['MAIN',10,'Read','fbDock.bReady']]},
 {id:'type',name:'FB_Dock',type:'FUNCTION_BLOCK · 타입',note:'이 파일은 타입 정의입니다. 온라인에서 상태를 볼 때는 MAIN.fbDock처럼 어떤 인스턴스인지도 확인해야 합니다.',refs:[['FB_Dock',1,'Define','FB_Dock'],['MAIN',3,'Type use','FB_Dock']]},
 {id:'timer',name:'MAIN.fbDock.fbStable',type:'TON · FB 내부 인스턴스',note:'fbStable은 FB_Dock의 VAR에 선언된 TON입니다. 호출은 FB_Dock 본문에서 일어납니다. 내부 변수는 외부 호출 인터페이스와 구분하고, 라이브러리 타입 정의에서 IN/PT/ET/Q를 확인합니다.',refs:[['FB_Dock',10,'Define','fbStable'],['FB_Dock',15,'Call','fbStable'],['FB_Dock',16,'Read','fbStable.Q']]},
 {id:'output',name:'MAIN.fbDock.bReady',type:'BOOL · FB VAR_OUTPUT',note:'bReady는 FB_Dock가 쓰고 MAIN이 읽습니다. MAIN의 대입은 복사이며 지속적인 연결이 아닙니다. 뒤에서 FB가 또 호출된다면 이미 복사한 GVL 값이 자동 갱신되는 것은 아닙니다.',refs:[['FB_Dock',7,'Define','bReady'],['FB_Dock',16,'Write','bReady'],['MAIN',10,'Read','fbDock.bReady']]},
 {id:'ready',name:'GVL_Robot.bDockReady',type:'BOOL · GVL',note:'이 예제의 소스 내 Writer는 MAIN 한 곳입니다. 실제 프로젝트에서는 모든 Writer와 호출 순서를 확인해야 합니다. HMI가 표시할지는 별도 심볼 매핑의 문제입니다.',refs:[['GVL_Robot',5,'Define','bDockReady'],['MAIN',10,'Write','GVL_Robot.bDockReady']]},
 {id:'counter',name:'MAIN.fbDock.nCalls',type:'DINT · FB 내부 VAR',note:'nCalls := nCalls + 1은 이전 nCalls를 읽고(Read) 결과를 쓰는(Write) 한 문장입니다. 이 교육 예제는 단기 관찰용이며 장시간 실행 시 DINT 범위 정책을 따로 설계해야 합니다.',refs:[['FB_Dock',11,'Define','nCalls'],['FB_Dock',14,'Read + Write','nCalls']]}
];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let symbolId='request',filter='all',fileId='GVL_Robot',lineNumber=3;
export function referencesPage(id){
 if(referenceSymbols.some(s=>s.id===id)){symbolId=id;filter='all';[fileId,lineNumber]=referenceSymbols.find(s=>s.id===id).refs[0];}
 const symbol=referenceSymbols.find(s=>s.id===symbolId);
 const refs=symbol.refs.filter(r=>filter==='all'||r[2].includes(filter));
 return `<div class="heading-row"><div><div class="eyebrow">BECKHOFF / CODE READING</div><h1>변수 출처 따라가기</h1><p class="page-lead">Define → Write → Read → Call을 여러 파일에서 연결합니다.</p></div><a class="btn secondary small" href="#lesson/19">읽는 순서와 해설 →</a></div><section id="reference-reader"><div class="callout">직접 만든 작은 교육용 코드 지도입니다. 회사 소스, TwinCAT의 실제 검색 결과 또는 임의 파일 분석기가 아닙니다. Task가 100ms마다 MAIN을 호출한다고 가정하며, Tc2_Standard의 TON을 참조합니다. 실제 컴파일·I/O 매핑은 미검증입니다.</div><div class="toolbar"><label for="reference-symbol">추적할 심볼</label><select id="reference-symbol">${referenceSymbols.map(s=>`<option value="${s.id}" ${s.id===symbolId?'selected':''}>${s.name}</option>`).join('')}</select><label for="reference-access">참조 종류</label><select id="reference-access">${['all','Define','Read','Write','Call'].map(a=>`<option value="${a}" ${filter===a?'selected':''}>${a==='all'?'전체':a}</option>`).join('')}</select></div><div class="panel"><h2>${esc(symbol.name)}</h2><p class="muted">${esc(symbol.type)}</p><p>${esc(symbol.note)}</p><p>Define은 이 교육 화면의 이름입니다. TwinCAT Cross Reference List의 공식 접근 종류는 <strong>Declaration / Read / Write / Call</strong>입니다.</p></div><div class="lab-grid"><section class="panel"><h3>참조 위치</h3><div class="reference-links">${refs.length?refs.map(([file,line,access,token])=>`<button class="reference-link" data-ref-file="${file}" data-ref-line="${line}"><span class="tag">${access}</span><strong>${file} : ${line}</strong><code>${esc(token)}</code></button>`).join(''):'<p>해당 종류의 소스 내 참조가 없습니다. 외부 연결이 없다는 증명은 아닙니다.</p>'}</div></section><section class="panel"><div class="toolbar" aria-label="예제 파일">${Object.keys(referenceFiles).map(file=>`<button class="btn ${file===fileId?'':'secondary'} small" data-ref-file="${file}" data-ref-line="0">${file}</button>`).join('')}</div><p class="muted">${fileId} · 선언부와 구현부를 이어 표시한 읽기용 listing</p><pre class="reference-source">${referenceFiles[fileId].split('\n').map((line,i)=>`<span class="reference-line ${i+1===lineNumber?'selected':''}"><small>${i+1}</small><code>${esc(line)||' '}</code></span>`).join('')}</pre></section></div><div class="callout">흐름: GVL_Robot.bDockRequest → MAIN 호출 인자 → fbDock.bRequest → fbStable.IN → fbStable.Q → fbDock.bReady → GVL_Robot.bDockReady. 입력 전달은 값을 복사하며, VAR_IN_OUT의 참조 전달과 다릅니다.</div></section>`;
}
export function mountReferences(){
 const root=document.querySelector('#reference-reader');if(!root)return;
 const repaint=()=>{document.querySelector('#main').innerHTML=referencesPage();mountReferences();};
 root.addEventListener('change',e=>{if(e.target.id==='reference-symbol'){symbolId=e.target.value;filter='all';[fileId,lineNumber]=referenceSymbols.find(s=>s.id===symbolId).refs[0];repaint();}if(e.target.id==='reference-access'){filter=e.target.value;repaint();}});
 root.addEventListener('click',e=>{const b=e.target.closest('[data-ref-file]');if(b){fileId=b.dataset.refFile;lineNumber=Number(b.dataset.refLine);repaint();}});
}
