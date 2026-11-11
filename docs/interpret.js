import {amrFiles,amrBody,ioRows} from './amr-case.js';
import {memberDeclaration as memberMainDeclaration,memberBody as memberMainImplementation} from './twincat-examples.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const readingFrame='1. 선언·타입·범위·단위:\n2. 언제 / 어떤 순서로 실행되는가:\n3. 읽는 값과 출처:\n4. 조건과 계산을 한국어로:\n5. 쓰는 값 / 유지되는 값 / 호출의 영향:\n6. 이번 호출 → 다음 호출 예측:\n7. 코드로 확인한 사실 / 추정 / 추가 확인:';
export const translations=[
 {id:'assignment',title:'01 · 대입문을 값의 흐름으로 읽기',level:'한 문장',files:{'MAIN · 발췌':`VAR
    nCount : DINT := 0;
    bEnable : BOOL;
END_VAR
(* Implementation *)
IF bEnable THEN
    nCount := nCount + 1;
END_IF;`},question:'nCount := nCount + 1을 읽어보세요. bEnable이 TRUE → TRUE → FALSE일 때, 매 호출 후 nCount는 얼마인가요?',answer:'“현재 nCount를 읽어 1을 더한 결과를 같은 nCount에 저장한다.” 왼쪽은 Write, 오른쪽은 Read입니다. MAIN의 상태 유지 변수라는 전제에서 결과는 1 → 2 → 2입니다. FALSE 분기에는 대입이 없으므로 0으로 돌아가지 않습니다. 선언의 := 0은 초기값이며 매 스캔 실행하는 대입이 아닙니다. 장시간 누적 시 DINT 범위를 고려해야 합니다. bEnable 생산자는 이 발췌만으로 알 수 없습니다.',trace:[['1','TRUE','0','1'],['2','TRUE','1','2'],['3','FALSE','2','2']]},
 {id:'condition',title:'02 · 조건·우선순위·부정을 풀어 읽기',level:'입출력',files:{'FB_Permit · 구현 발췌':`(* Inputs: Request, Obstacle, DataValid : BOOL
   Output: DrivePermit : BOOL *)
DrivePermit := Request AND NOT Obstacle AND DataValid;`},question:'Request=TRUE, Obstacle=FALSE, DataValid=FALSE라면? “장애물이 없으면 주행한다”라는 번역에 무엇이 빠졌나요?',answer:'“요청이 있고, 장애물 상태가 거짓이며, 데이터가 유효할 때에만 구동 허가를 참으로 쓴다. 하나라도 만족하지 않으면 거짓을 쓴다.” 결과 FALSE. 단순히 장애물이 없다는 조건만으로 주행을 결정하지 않습니다. DrivePermit은 허가 값이며 실제 모터 회전 증거가 아닙니다. 변수 이름만으로 신호 극성이나 인증된 안전 상태를 단정하지 않고 입력 명세를 확인합니다.'},
 {id:'members',title:'03 · .Q를 타입과 호출에 연결하기',level:'타이머 · 에지',files:{'MAIN · 선언':memberMainDeclaration,'MAIN · 구현':memberMainImplementation},question:'fbTimer.Q와 fbEdge.Q를 각각 한국어로 읽으세요. bStart를 켠 뒤 계속 유지하면 두 값은 언제 달라질까요?',answer:'fbTimer는 TON 타입으로 만든 인스턴스입니다. “이번 호출에서 bStart를 IN으로, 2초를 PT로 전달하여 TON을 갱신한다. 갱신 후 그 인스턴스의 Q 출력을 읽어 bReady에 복사한다.” fbEdge는 R_TRIG입니다. “bStart의 이번 CLK와 이전 호출 CLK를 비교하고 상승 전이를 검출한 호출에서만 Q를 참으로 한다.” 처음 TRUE가 된 호출에는 Timer.Q=FALSE, Edge.Q=TRUE. TRUE를 유지한 다음 호출에는 둘 다 FALSE. 가상 100ms 주기에서 첫 TRUE로부터 2초가 지난 호출에는 Timer.Q=TRUE, Edge.Q=FALSE. .Q만 보고 타이머 완료라고 번역하지 않습니다.',link:'#virtual/members'},
 {id:'case',title:'04 · CASE 뒤의 코드까지 읽기',level:'실행 순서',files:{'FB_Sequence · 구현 발췌':`(* State : INT is retained between calls.
   Start : BOOL; Move : BOOL; initial State = 0 *)
CASE State OF
    0: IF Start THEN State := 10; END_IF;
    10: State := 20;
END_CASE;
Move := State = 10;`},question:'Start가 계속 TRUE일 때 첫 두 호출에서 State와 Move는? “10 분기로 이동해 20이 된다”라는 해석이 맞나요?',answer:'첫 호출은 진입 시 State=0이므로 0 분기만 실행하고 State를 10으로 씁니다. 같은 CASE에서 10 분기를 이어 실행하지 않습니다. 그 뒤 대입은 이미 바뀐 State=10을 읽으므로 Move=TRUE입니다. 두 번째 호출은 10 분기에서 State=20, 이후 Move=FALSE입니다. “다음 스캔에 출력이 바뀐다”라고 일괄 번역하면 틀립니다. 다음 문장은 같은 호출에서도 새 값을 읽습니다.',trace:[['1','Start TRUE','State 0','State 10 / Move TRUE'],['2','Start TRUE','State 10','State 20 / Move FALSE']]},
 {id:'loop',title:'05 · 반복문과 스캔을 구분하기',level:'배열 · FOR',files:{'MAIN · 발췌':`VAR
    aHealthy : ARRAY[1..3] OF BOOL;
    nFaults : INT;
    i : INT;
END_VAR
(* Implementation *)
nFaults := 0;
FOR i := 1 TO 3 DO
    IF NOT aHealthy[i] THEN
        nFaults := nFaults + 1;
    END_IF;
END_FOR;`},question:'aHealthy=[TRUE,FALSE,FALSE]라면? 3스캔에 걸쳐 하나씩 검사하나요? 맨 앞의 nFaults := 0을 빼면 무엇이 달라지나요?',answer:'“이번 호출의 고장 수를 0으로 시작한다. i=1부터 3까지 같은 호출 안에서 배열을 읽고 거짓인 원소마다 수를 1씩 늘린다.” 결과 2입니다. FOR는 스캔을 세 번 기다리지 않습니다. 앞의 초기화를 빼면 호출 간 유지되는 nFaults에 누적되어 같은 입력을 다음 호출에도 세면 4가 됩니다. 반복 횟수와 최악 실행 시간이 Task 주기에 적합한지도 확인합니다.'},
 {id:'multiple',title:'06 · HMI에서 모터까지 네 소스 연결하기',level:'실무 형태 · 다중 파일',files:amrFiles,question:'HMI 시작 요청과 R턴 명령의 흐름을 GVL → MAIN 호출 인자 → FB 입력 → 계산 → FB 출력 → MAIN의 GVL 대입 순서로 번역하세요. Declare/Read/Write/Call을 표시하세요.',answer:'GVL_Dock에서 bStart와 fRadius 등을 선언합니다(Define). MAIN은 GVL 값을 읽어(Read) fbAmr 인스턴스 입력에 전달하고 호출합니다(Call). FB 내부 StartEdge가 상승 전이를 검출하면 State=0에서 10으로 씁니다(Write). Mode=3이면 Radius를 읽어 앞뒤 모듈 각도와 속도를 계산합니다. DrivePermit과 Module1Speed 등은 FB 출력이며 MAIN은 호출이 끝난 뒤 이를 읽어 GVL에 복사합니다. HMI 및 실제 서보의 통신·I/O 매핑은 이 네 파일에 없으므로 “이 주소로 실제 모터에 전송된다”까지는 확정할 수 없습니다. GVL의 QrValid/LidarValid 기본값은 FALSE이며 실제 생산자가 갱신해야 합니다. 브라우저 예제에서는 명시한 가상 입력이 이를 대신합니다.',link:'#virtual/amr-io'},
 {id:'priority',title:'07 · 알람 우선순위와 재시작 읽기',level:'복잡한 제어 흐름',files:{'FB_AmrTraining · 전체 구현':amrBody},question:'State=20에서 QR 실패와 AtDock=TRUE가 동시에 들어오면? 고장 원인 해제만으로 재출발하나요? 정지 요청과 장애물이 동시에 들어오면?',answer:'도킹 분기는 QR 무효/오래됨/시간초과를 먼저 검사하므로 완료 위치여도 State=99입니다. 외부 공통 고장 조건은 CASE보다 우선하므로 정지와 장애물이 동시이면 99입니다. 원인 해제만으로 99를 벗어나지 않으며 Reset=TRUE와 Start=FALSE에서 0으로 복귀합니다. 그 뒤 새 Start 상승 전이가 필요합니다. 타이머는 CASE 앞에서 호출하므로 10→20으로 바뀐 호출의 타이머 IN은 아직 FALSE이고 다음 호출에서 시간 측정이 시작됩니다. 도킹 중 QR 실패가 발생하면 그 호출 뒤 출력 계산은 변경된 State=99를 읽어 구동 출력을 0으로 씁니다.',link:'#virtual/amr-io'},
 {id:'unknown',title:'08 · 근거가 없는 부분은 번역을 멈추기',level:'일반화 · 다른 언어에도 적용',files:{'설명용 발췌':`bReady := fbDevice.Ready;
fbAdjust(Value := stAxis.Target);
IF bReady THEN
    stAxis.Command := stAxis.Target;
END_IF;`},question:'Ready가 출력인지 Property인지, Value가 VAR_INPUT인지 VAR_IN_OUT인지 선언이 없습니다. 확실한 내용과 추가 확인을 나누어 한국어로 쓰세요.',answer:'확실한 문장: “fbDevice의 Ready 접근 결과를 bReady에 저장한다. fbAdjust를 이름 붙인 인자 Value와 함께 호출한다. 그 뒤 bReady가 참이면 stAxis.Target을 읽어 stAxis.Command에 쓴다.” 미확인: Ready의 접근이 단순 출력 읽기인지 Get 실행인지, Value가 복사 입력인지 참조로 원본을 바꾸는 인자인지, stAxis가 실제 STRUCT인지 다른 접근 가능한 타입인지, 단위와 외부 매핑. 선언/라이브러리 정의를 확인해야 합니다. Python의 obj.value도 property일 수 있고 C++ 호출도 참조 인자를 변경할 수 있습니다. 보편적인 것은 이 확인 절차이며 모든 언어의 문법과 실행 의미가 같다는 뜻은 아닙니다.'}
];
export function interpretPage(id,drafts={}){const item=translations.find(x=>x.id===id)||translations[0];return `<div class="eyebrow">READ → EXPLAIN → TRACE</div><h1>코드를 한국어로 읽기</h1><p class="page-lead">기호를 단어로 바꾼 뒤, 실행 순서와 값의 흐름을 한 문장씩 설명합니다.</p><div class="interpret-tabs">${translations.map(x=>`<a class="${x.id===item.id?'active':''}" href="#interpret/${x.id}">${x.title}</a>`).join('')}</div><section class="panel lesson-body"><h2>${item.title}</h2><p><span class="tag">${item.level}</span></p><div class="callout">공통 읽기 틀: 선언 → 실행 시점 → 읽기 → 조건·계산 → 쓰기·호출 영향 → 다음 호출. 코드의 사실과 의도를 분리하세요. <a href="#lesson/20">읽기 방법 수업</a></div>${Object.entries(item.files).map(([name,code],i)=>`<details class="source-fold" ${i===0?'open':''}><summary>${esc(name)}</summary><pre><code>${esc(code)}</code></pre></details>`).join('')}<h3>번역 과제</h3><p>${item.question}</p><label for="translation-answer">나의 한국어 해석 · 이 브라우저에 자동 저장</label><textarea id="translation-answer" data-translation="${item.id}" class="notes-area translation-answer" placeholder="${esc(readingFrame)}">${esc(drafts[item.id]||'')}</textarea><p class="muted">자동 정오 판정을 하지 않습니다. 의미가 같은 표현도 여러 가지이므로 해설의 사실·순서·미확인 항목과 대조하세요.</p><details class="translation-solution"><summary>모범 해석 · 스스로 비교하기</summary><p>${item.answer}</p>${item.trace?`<table><thead><tr><th>호출</th><th>입력</th><th>시작 값</th><th>종료 값</th></tr></thead><tbody>${item.trace.map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table>`:''}<ul><li>읽는 값과 쓰는 값을 구분했는가?</li><li>호출하지 않거나 대입하지 않을 때의 상태를 설명했는가?</li><li>자료형·단위·부작용·외부 생산자를 확인했는가?</li><li>알 수 없는 장치 동작을 상상해 확정하지 않았는가?</li></ul></details>${item.link?`<p><a class="btn small" href="${item.link}">관련 실행 실습 →</a></p>`:''}</section>`;}
export function ioPage(){return `<div class="eyebrow">FICTIONAL AMR / INTERFACE CONTRACT</div><h1>가상 I/O 테이블</h1><p class="page-lead">신호 이름만 외우지 않고 생산자·소비자·자료형·단위·갱신·실패 조건을 함께 읽습니다.</p><div class="toolbar"><a class="btn" href="#virtual/amr-io">HMI·조향 시뮬레이션</a><a class="btn secondary" href="#interpret/multiple">여러 소스 한국어 해석</a><button class="btn secondary" data-action="io-csv">I/O 표 CSV 내려받기</button></div><section class="panel lesson-body"><p><strong>모두 학습용 가상 인터페이스입니다.</strong> 현장의 I/O 주소·EtherCAT 구성·서보 타입·카메라 레지스터를 확인하지 않았으므로 임의 주소를 실제처럼 적지 않습니다. 실제 프로젝트에서 확인하는 항목을 표 형식으로 연습합니다. 현장 고무 범퍼·파란 장치·LiDAR의 역할은 별도 확인 대상입니다.</p><div class="table-scroll"><table><thead><tr><th>ID</th><th>심볼</th><th>타입·단위</th><th>생산자 → 소비자</th><th>의미</th><th>갱신·이상 규칙</th></tr></thead><tbody>${ioRows.map(r=>`<tr>${r.map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><h2>실제 I/O 목록으로 바꿀 때 채울 열</h2><p>장치 품번, 채널/주소 또는 심볼 매핑, 신호 방향, 정상 극성, 범위/스케일, 좌표계, 갱신 주기, 타임아웃, 유효성/진단, 초기·통신 단절 값, 알람과 복귀 조건, 도면/매뉴얼 근거, 검토 버전과 담당자입니다. BOOL 하나라도 생산자가 HMI인지 I/O 이미지인지 다른 FB인지 확인합니다.</p><h2>전달 경로</h2><p>가상 HMI·센서 → FB 입력 → 시퀀스·인터록 → 각도/속도/LED 출력 → 가상 모터·기하 모델 → 다음 스캔 피드백. 실제 프로젝트의 여러 파일 구조는 해석 과제에서 보고, 브라우저 실행은 그 FB 한 인스턴스를 가상 어댑터가 호출합니다. 실제 전체 TwinCAT 프로젝트 실행은 아닙니다.</p><p>안전 입력은 일반 PLC에서 상태를 모니터하더라도 별도 안전 PLC·회로·드라이브가 정지 기능을 수행할 수 있습니다. 이 테이블의 일반 BOOL과 DrivePermit만으로 실제 안전 기능을 구현했다고 판단하지 않습니다.</p></section>`;}
