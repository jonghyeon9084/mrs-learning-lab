import {memberDeclaration,memberBody,memberTrace} from './twincat-examples.js';
const code = s => `<pre><code>${s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}</code></pre>`;
const table = (head,rows) => `<table><thead><tr>${head.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(x=>`<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
const tf = x => typeof x==='boolean'?(x?'TRUE':'FALSE'):x;
export const twinSources = {
 fb:['Beckhoff · TwinCAT 3 / Function block','https://infosys.beckhoff.com/content/1033/tc3_plc_intro/2530279563.html','인스턴스 선언·호출, 입력/출력 접근과 호출 사이의 상태 유지.'],
 fun:['Beckhoff · TwinCAT 3 / Function','https://infosys.beckhoff.com/content/1033/tc3_plc_intro/2530284939.html','FUN, 반환값 및 호출 중 유효한 함수 데이터. Siemens FC와 구분.'],
 program:['Beckhoff · TwinCAT 3 / Program','https://infosys.beckhoff.com/content/1033/tc3_plc_intro/2530274187.html','PRG와 태스크에서 정의하는 프로그램 호출 순서.'],
 pou:['Beckhoff · TwinCAT 3 / POU','https://infosys.beckhoff.com/content/1033/tc3_plc_intro/2530268811.html','POU의 종류와 선언부·구현부.'],
 struct:['Beckhoff · TwinCAT 3 / Structure','https://infosys.beckhoff.com/content/1033/tc3_plc_intro/2529481355.html','DUT 구조체와 점을 이용한 구성요소 접근.'],
 property:['Beckhoff · TwinCAT 3 / Property','https://infosys.beckhoff.com/content/1033/tc3_plc_intro/2530335371.html','Get/Set 접근자가 실행되는 속성. 단순 데이터 필드와 구분.'],
 inout:['Beckhoff · TwinCAT 3 / VAR_IN_OUT','https://infosys.beckhoff.com/content/1033/tc3_plc_intro/2528771211.html','참조 전달, 호출 시 인자 지정 및 외부 직접 접근 제약.'],
 gvl:['Beckhoff · TwinCAT 3 / GVL','https://infosys.beckhoff.com/content/1033/tc3_plc_intro/2530218891.html','프로젝트 전역 변수 목록.'],
 task:['Beckhoff · TwinCAT 3 / Real-time Settings','https://infosys.beckhoff.com/content/1033/tc3_system/5206499979.html','태스크 주기, 우선순위, 코어 설정. 현장 설정값을 뜻하지 않음.'],
 taskOnline:['Beckhoff · TwinCAT 3 / Task Online','https://infosys.beckhoff.com/content/1033/tc3_system/5210418059.html','CPU 실행 시간, 전체 소요 시간, 주기 초과 횟수의 구분.'],
 tof:['Beckhoff · Tc2_Standard / TOF','https://infosys.beckhoff.com/content/1033/tcplclib_tc2_standard/74405003.html','오프 지연 타이머 IN/PT/Q/ET.'],
 tp:['Beckhoff · Tc2_Standard / TP','https://infosys.beckhoff.com/content/1033/tcplclib_tc2_standard/74408075.html','정해진 시간의 펄스. IN이 내려가도 진행 중인 펄스 유지.'],
 falling:['Beckhoff · Tc2_Standard / F_TRIG','https://infosys.beckhoff.com/content/1033/tcplclib_tc2_standard/74390027.html','하강 에지 검출.'],
 firstProject:['Beckhoff · 첫 TwinCAT 3 PLC 프로젝트','https://infosys.beckhoff.com/content/1033/tc3_system/2525041803.html','GVL 및 Tc2_Standard 라이브러리를 사용하는 공식 교육 예.'],
 hmiSymbols:['Beckhoff · TwinCAT HMI / Symbols','https://infosys.beckhoff.com/content/1033/tc3_hmi_process_library/17934386571.html','HMI 심볼·경로 개념의 공식 사례. 현장 HMI 제품/연결 방식은 별도 확인.'],
 gxST:['Mitsubishi · iQ-R/iQ-F ST Programming Guide Book','https://app.mitsubishielectric.com/dl/fa/document/manual/plc/sh081483eng/sh081483engf.pdf','SH-081483ENG-F: IF/CASE/FOR, 라벨 편집, POU, 예제 적용 및 타이머 사례. 대상 CPU 미정.'],
 gxIDE:['Mitsubishi · GX Works3 Operating Manual','https://dl.mitsubishielectric.com/dl/fa/document/manual/plc/sh081215eng/sh081215engar.pdf','프로젝트·라벨·FB/FUN·언어 편집 구조. 실제 채택 CPU/버전 확인 후 해당 범위 재검토.']
};

export const fieldEvidence = `<h2>2026-11-11 현장 정보 · 사용자 관찰/설명 기준</h2>
${table(['항목','확인된 내용','미확인 / 추정'],[
 ['개발 환경','현재 TwinCAT 3, ST 사용','빌드 번호, CPU/IPC 모델, 라이브러리 버전, Task 설정'],
 ['향후 환경','GX Works3 전환 가능성을 들음','전환 확정 여부·일정·PLC 모델·적용 범위. 전환 확정으로 해석하지 않음'],
 ['BECKHOFF HMI','로봇 본체에 상태·조작 화면','Control Panel / Panel PC 구분, PLC 런타임이 실행되는 실제 장치'],
 ['QR 카메라','QR 인식으로 정밀 도킹','ID만 전달하는지, 상대 좌표/자세 포함인지, 주행 중 QR 활용 범위'],
 ['LiDAR 2종','서로 다른 2종, 하나는 전방 아래로 기울어져 설치','안전/주행 역할은 추정. 기울기만으로 단차 검출용이라고 단정 불가'],
 ['하단 고무 범퍼','외곽을 길게 둘러싼 고무 구조','접촉 감지 장치로 추정. 센서/배선/안전 인증 확인 필요'],
 ['파란색 램프','파란 빛을 내는 장치 관찰','경고등 또는 비전 보조 조명 가능성'],
 ['DMS-SB2-E70','현장에서 기록한 모델명 문자열','정식 품번·제조사·기능 미확인. 비슷한 품번의 제품으로 치환하지 않음']
])}<p>위 표는 회사 설계 검증 결과가 아닌 사용자 관찰 기록입니다. Siemens TIA Portal이 현재 주력이라는 기존 가정은 철회했습니다. BECKHOFF 화면의 로고만으로 화면 자체가 PLC라고 판단하지 않습니다.</p><div class="callout warning">안전 입력과 정지는 일반 PLC 코드와 별도의 안전 제어기·회로·인증된 통신 구조를 사용할 수 있습니다. 이 사이트의 인터록과 정지 예제는 실제 로봇 안전 기능을 대신하지 않습니다.</div>`;

export const structureBody = `<h2>POU부터 찾기</h2><p>POU(Program Organization Unit)는 프로그램 구성 단위입니다. TwinCAT 프로젝트에서 PROGRAM(PRG), FUNCTION_BLOCK(FB), FUNCTION(FUN)을 구분합니다. <strong>FC는 Siemens에서 쓰는 명칭이며 TwinCAT의 선언 키워드가 아닙니다.</strong></p>
${table(['종류','선언 / 호출','상태와 읽는 관점'],[
 ['PROGRAM','PROGRAM MAIN / Task의 프로그램 호출 목록','주기 실행 진입점. 프로그램 변수는 호출 사이 유지. 이름만 MAIN이라고 자동 실행되는 것은 아님'],
 ['FUNCTION_BLOCK','fbTimer : TON; → fbTimer(IN := bStart, PT := T#2S);','타입을 선언해 인스턴스별 상태를 보유. 출력과 내부 변수가 다음 호출까지 유지'],
 ['FUNCTION','FUNCTION F_Permit : BOOL → bPermit := F_Permit(bStart, bBlocked);','반환값을 식에서 사용. 일반 함수 로컬 데이터는 호출마다 다시 초기화. FB 인스턴스처럼 타이머 기억을 넣는 곳이 아님']
])}<p>FUNCTION의 반환값은 함수 이름에 대입합니다. 추가 VAR_OUTPUT 및 VAR_IN_OUT을 쓰는 인터페이스도 있으므로, 반환값이 하나라는 사실만으로 외부 데이터 변경 여부를 판단하지 않습니다. 표준 계산 예제에서는 전역 데이터 의존을 피합니다.</p>
<h2>선언부와 구현부는 별도 편집 영역</h2><p>아래는 서로 다른 POU에 넣는 읽기용 예제입니다. 웹 실행기는 사용자 정의 함수/FB 간 호출을 지원하지 않으며, 실제 TwinCAT 컴파일은 미실시입니다.</p>
<h3>FUNCTION F_Permit의 선언부</h3>${code('FUNCTION F_Permit : BOOL\nVAR_INPUT\n    bStart : BOOL;\n    bBlocked : BOOL;\nEND_VAR')}<h3>구현부</h3>${code('F_Permit := bStart AND NOT bBlocked;')}
<h2>FB의 내부 기억을 추적하기</h2><p>가상 QR 확인을 연속 3회 받는 교육 설계입니다. 시간 기준이 아닌 호출 횟수 기준이며 현장 도킹 완료 조건이 아닙니다.</p>
<h3>FUNCTION_BLOCK FB_QrConfirm의 선언부</h3>${code('FUNCTION_BLOCK FB_QrConfirm\nVAR_INPUT\n    bValid : BOOL;\nEND_VAR\nVAR_OUTPUT\n    bStable : BOOL;\nEND_VAR\nVAR\n    nConsecutive : INT;\nEND_VAR')}<h3>구현부</h3>${code('IF NOT bValid THEN\n    nConsecutive := 0;\nELSIF nConsecutive < 3 THEN\n    nConsecutive := nConsecutive + 1;\nEND_IF;\nbStable := nConsecutive >= 3;')}
<p>MAIN의 VAR에 <code>fbQr : FB_QrConfirm;</code>, <code>bQrValid : BOOL;</code>, <code>bDockReady : BOOL;</code>를 선언하고 구현부에서 아래처럼 호출합니다.</p>${code('fbQr(bValid := bQrValid);\nbDockReady := fbQr.bStable;')}
${table(['호출','bValid','호출 후 내부 nConsecutive','출력 bStable'],[[1,'FALSE',0,'FALSE'],[2,'TRUE',1,'FALSE'],[3,'TRUE',2,'FALSE'],[4,'TRUE',3,'TRUE'],[5,'FALSE',0,'FALSE']])}
<p><strong>연습:</strong> 두 인스턴스 fbQrA/fbQrB 중 A만 세 번 호출하면 B도 완료될까요? <strong>정답:</strong> 아닙니다. 인스턴스의 상태는 독립적입니다. nConsecutive는 FB 내부 VAR이며 외부 인터페이스로 노출한 bStable과 구분합니다.</p>
<h2>Python/C++에서 넘어올 때</h2><p>FB 타입은 클래스, 인스턴스는 객체와 비교할 수 있습니다. 하지만 <code>fbQr(...)</code>는 객체 생성이 아니라 이미 선언된 인스턴스의 본문 실행입니다. PLC Task가 MAIN을 반복 호출하고 MAIN이 FB를 호출합니다. C++에서도 오래 살아 있는 객체는 상태를 유지하므로, ‘C++는 항상 초기화, PLC는 항상 유지’라는 구분은 틀립니다. 객체 수명과 호출 위치를 비교해야 합니다.</p>
<details><summary>이전 Siemens 비교 자료 · 학습 기록 보존</summary><p>Siemens의 OB/FB/FC/DB는 별도 프로젝트 구조입니다. FC는 별도 인스턴스 DB가 없지만 외부 데이터 접근 가능성은 별도로 추적해야 합니다. 기존 복습 q7은 이 비교 자료의 기록으로 남깁니다. 현재 TwinCAT 실무 코드 해석의 기본 구조는 PRG/FB/FUN/GVL입니다.</p></details>`;

export const scanBody = `<h2>Task → PROGRAM → FB 호출</h2><p>ROS2의 executor가 콜백을 실행하듯, TwinCAT에서도 실행 주체와 호출 관계를 찾아야 합니다. Task의 주기·우선순위·프로그램 호출 순서가 출발점입니다. ROS2 메시지가 도착할 때만 호출되는 콜백과, 일정 주기로 현재 입력을 샘플링하는 PLC 로직은 동일하지 않습니다.</p><p>예를 들어 100ms마다 MAIN이 실행되고 그 안에서 fbTimer를 한 번 호출한다고 <strong>학습용으로 가정</strong>합니다. 100ms는 회사 설정값이 아닙니다. I/O 갱신, 버스 주기와 태스크의 관계는 실제 매핑/설정으로 확인해야 하므로 모든 PLC에 단일 입력→코드→출력 순서를 강요하지 않습니다.</p>
<h2>선언 초기화와 반복 대입은 다르다</h2>${code('(* PROGRAM 또는 FB의 일반 VAR에 선언 *)\nVAR\n    nCount : INT := 0;\nEND_VAR\n\n(* 구현부: 호출마다 실행 *)\nnCount := nCount + 1;')}
<p>일반 PROGRAM/FB의 VAR는 다음 호출에도 값을 보유합니다. 따라서 1→2→3이 됩니다. 구현부 첫 줄에 <code>nCount := 0;</code>를 추가하면 매번 1입니다. FUNCTION의 로컬 변수, VAR_TEMP, RETAIN/PERSISTENT는 별도 규칙을 확인해야 합니다. <strong>호출 간 유지와 전원 차단 후 보존은 다른 요구</strong>입니다.</p>
<h2>호출 순서도 결과를 바꾼다</h2><p>FB 출력 읽기를 호출보다 먼저 배치하면 이전 호출의 값을 읽습니다. 에지 FB를 건너뛰면 Q와 내부 기억도 이번 입력으로 갱신되지 않습니다. 매 주기 한 번 호출하고 결과를 뒤에서 사용하는 패턴으로 시작하세요. 모든 FB가 무조건 같은 주기에 호출되어야 한다는 법칙은 아니며 라이브러리의 사용 규약을 확인합니다.</p><p><a class="text-link" href="#virtual/call-order">호출 전후·누락 실험 →</a> · <a class="text-link" href="#lesson/14">TON/R_TRIG 주기별 표 →</a></p>
<h2>FOR는 주기를 나누지 않는다</h2><p>FOR 1..100은 이번 호출 안에서 반복합니다. 다음 100주기에 나누어 실행하는 것이 아닙니다. 긴 루프는 Task 실행 시간을 늘립니다. Task Online의 CPU 시간, 전체 소요 시간, Exceed counter는 설정 주기와 다른 측정치입니다. 현장에서는 읽기 권한 범위에서 실제 설정과 기록을 확인하세요.</p><h2>복습</h2><p><strong>문제:</strong> 100ms Task에서 매 호출 1을 더해 10이 되면 정확한 벽시계 1초인가요? <strong>정답:</strong> 시작 시각·첫 호출·실행 누락·지터의 전제 없이는 단정할 수 없습니다. 카운터와 경과 시간 측정은 구분합니다. TON은 sleep이 아니며 다음 문장은 같은 호출에서 계속 실행됩니다.</p>`;

export const twinLessons = [
 {id:14,title:'.Q에서 FB 호출까지',desc:'타입 → 인스턴스 → 호출 → 멤버 → 다음 주기의 순서로 읽습니다.',category:'회사 코드 읽기',minutes:40,days:'2단계',refs:['fb','ton','edge','falling','struct','property','firstProject'],body:`
<h2>.Q는 타입을 보고 해석한다</h2><p><code>fbTimer.Q</code>는 fbTimer 인스턴스의 Q 멤버 접근입니다. <strong>Q라는 글자 자체가 ‘타이머 완료’를 뜻하지 않습니다.</strong> 선언에서 자료형을 찾고 그 타입의 정의·라이브러리를 읽으세요.</p>
${table(['표현','타입의 예','호출 후 Q의 의미'],[['fbTimer.Q','TON','IN이 유지되어 PT에 도달했는지'],['fbRisingEdge.Q','R_TRIG','이번 호출에서 CLK의 상승 에지를 검출했는지'],['fbFallingEdge.Q','F_TRIG','이번 호출에서 CLK의 하강 에지를 검출했는지']])}
<h2>사용자가 제시한 예제 · TwinCAT 3</h2><p>교육용 MAIN의 선언부와 ST 구현부입니다. Library Manager에서 <strong>Tc2_Standard</strong> 참조를 확인합니다. 라이브러리 이름에 Tc2가 있어도 이 문서의 대상은 TwinCAT 3입니다. 타입 이름 충돌과 실제 설치 버전은 현장 프로젝트에서 확인합니다. 아래 listing은 완성 프로젝트 파일이 아니며 TwinCAT 컴파일 미실시입니다.</p><h3>선언부</h3>${code(memberDeclaration)}<h3>구현부</h3>${code(memberBody)}
${table(['선언/표현','읽는 방법'],[['fbTimer : TON;','TON은 FB 타입, fbTimer는 그 타입의 상태를 담는 인스턴스'],['fbEdge : R_TRIG;','독립적인 상승 에지 검출 인스턴스'],['bStart : BOOL;','입력 조건으로 사용하는 MAIN의 로컬 BOOL. 실제 물리 입력 매핑은 없음'],['bReady : BOOL;','이번 호출 뒤 TON.Q를 복사하는 로컬 BOOL'],['IN := bStart','FB의 입력 IN에 현재 bStart 값을 전달'],['PT := T#2S','설정 시간 2초. 코드 실행을 2초 정지시키지 않음'],['fbTimer.ET / fbTimer.Q','경과 시간 TIME / 출력 BOOL. fbEdge에는 ET가 없음'],['fbEdge.CLK','에지 검출 대상 BOOL. CPU 클록 주파수 설정이 아님']])}
<p>선언은 매 스캔 객체를 새로 만드는 Python의 <code>timer = Timer()</code>와 다릅니다. 보존되는 객체를 준비하고 매 주기 <code>timer.update(input)</code> 후 <code>timer.q</code>를 읽는 방식에 더 가깝습니다. 단, PLC의 타입·메모리·스케줄러 규칙까지 Python/C++와 같다는 뜻은 아닙니다.</p>
<h2>한 스캔 안에서 벌어지는 일</h2><ol><li>현재 bStart로 fbTimer를 호출해 TON 상태·Q·ET를 갱신합니다.</li><li>같은 입력으로 fbEdge를 호출해 이전 CLK와 비교합니다.</li><li>갱신된 fbTimer.Q를 bReady에 복사합니다.</li><li>fbEdge.Q가 TRUE일 때만 IF 본문을 실행합니다. 제시된 원본의 본문은 주석만 있어 추가 동작은 없습니다.</li></ol><p>두 인스턴스는 따로 기억합니다. 같은 bStart라도 Q의 의미와 지속 시간이 다릅니다. 이 실습에서는 두 FB를 매 주기 한 번 호출하여 입력 해제와 에지를 계속 관측합니다. 호출을 생략해도 내부 상태가 알아서 초기화된다고 가정하지 마세요.</p>
<h2>100ms 가상 주기 · 호출 뒤 값</h2><p>초기 BOOL=FALSE, PT=2000ms 고정. #1은 FALSE, #2부터 TRUE, #23에서 FALSE, #24에서 TRUE입니다. nStarts는 웹 변형에서 상승 에지 횟수를 세는 추가 변수입니다. 표는 교육 모델의 예상값이며 실제 장치 타이밍 측정값이 아닙니다. #4~20은 생략했습니다.</p>
${table(['호출','시각 ms','bStart','TON.ET ms','TON.Q','R_TRIG.Q','bReady','nStarts'],memberTrace.map(r=>r.map(tf)))}
<p><a class="btn small" href="#virtual/members">.Q 실습 열기 →</a> 웹에서는 bStart를 VAR_INPUT으로, 관찰 결과를 VAR_OUTPUT으로 옮긴 FB_Training 변형을 사용합니다. 원본 MAIN의 bStart를 실제 장비에서 강제하는 실습이 아닙니다.</p>
<h2>점(.)의 세 가지 읽기</h2>${table(['종류','예시 · 교육용 이름','실제로 일어나는 일'],[['구조체 멤버','stPose.fX','STRUCT에 정의한 데이터 필드 읽기'],['FB 출력','fbTimer.Q','마지막 FB 실행으로 저장된 출력 읽기. 이것만으로 FB 본문을 호출하지 않음'],['Property','fbAxis.ActualPosition','해당 이름이 PROPERTY라면 읽을 때 Get, 쓸 때 Set 접근자가 실행될 수 있음. 정의 확인 필수']])}<p>Property는 TwinCAT의 객체지향 확장입니다. 이름이 ActualPosition이라는 이유만으로 Property라고 확정할 수 없습니다. 선언으로 이동해 VAR_OUTPUT인지 PROPERTY인지 확인하세요. <code>GVL_Robot.bRequest</code>의 점은 전역 목록을 한정하는 표기입니다. <code>fbRobot.stStatus.bReady</code> 같은 연속 점도 왼쪽부터 매 단계의 타입을 추적합니다. 웹 실행기는 STRUCT/Property/GVL 실행은 지원하지 않습니다.</p>
<h2>예측 문제와 정답</h2><ol><li>Start를 켠 첫 호출에 어느 Q가 TRUE인가? <strong>정답: R_TRIG.Q. TON.Q는 아직 FALSE.</strong></li><li>bReady 대입을 fbTimer 호출 앞으로 옮기면? <strong>정답: 이전 호출의 TON.Q를 읽으므로 관측이 한 호출 늦어질 수 있음.</strong></li><li>에지 발생 뒤 fbEdge 호출을 건너뛰면 Q가 자동으로 FALSE인가? <strong>정답: 아니며 이전 Q가 남을 수 있음.</strong></li><li>fbTimerA와 fbTimerB를 각각 TON으로 선언하면 시간도 공유하나? <strong>정답: 별도 인스턴스이므로 공유하지 않음.</strong></li></ol><p><a class="text-link" href="#virtual/call-order">정답을 호출 순서 실험으로 확인 →</a></p>`},
 {id:15,title:'타이머 3종과 에지 2종 비교',desc:'동일한 입력에도 Q가 달라지는 이유를 주기별로 실험합니다.',category:'회사 코드 읽기',minutes:40,days:'2단계',refs:['ton','tof','tp','edge','falling'],body:`
<h2>Tc2_Standard의 다섯 FB</h2>${table(['FB','입력','출력','용도/주의'],[['TON','IN:BOOL, PT:TIME','Q:BOOL, ET:TIME','ON 지연. IN=FALSE 호출 시 Q=FALSE, ET=0'],['TOF','IN:BOOL, PT:TIME','Q:BOOL, ET:TIME','OFF 지연. IN=TRUE면 Q=TRUE/ET=0, 하강 후 PT까지 Q 유지'],['TP','IN:BOOL, PT:TIME','Q:BOOL, ET:TIME','상승으로 펄스 시작. 진행 중 IN 하강으로 펄스를 취소하지 않음'],['R_TRIG','CLK:BOOL','Q:BOOL','FALSE→TRUE를 검출한 호출의 출력'],['F_TRIG','CLK:BOOL','Q:BOOL','TRUE→FALSE를 검출한 호출의 출력']])}
<p>IN/PT는 타이머의 입력, Q/ET는 출력입니다. CLK는 에지 검출 입력입니다. 모든 FB가 이 다섯 멤버를 갖지는 않습니다. 예를 들어 R_TRIG에는 PT와 ET가 없습니다. 모든 Q를 ‘완료’라고 번역하면 TP나 에지 FB를 잘못 읽습니다.</p>
<h2>타이머 비교 실험</h2><p>아래는 100ms 주기·PT=500ms 고정·초기 IN/Q=FALSE라는 교육 모델입니다. t=100ms에서 TRUE, t=200ms에서 FALSE로 내리고 유지합니다. 각 셀은 Q / ET(ms), 호출 후 값입니다. 이 시간은 현장 설정값이 아닙니다.</p>
${table(['t ms','IN','TON Q/ET','TOF Q/ET','TP Q/ET'],[[0,'FALSE','F / 0','F / 0','F / 0'],[100,'TRUE','F / 0','T / 0','T / 0'],[200,'FALSE','F / 0','T / 0','T / 100'],[300,'FALSE','F / 0','T / 100','T / 200'],[400,'FALSE','F / 0','T / 200','T / 300'],[500,'FALSE','F / 0','T / 300','T / 400'],[600,'FALSE','F / 0','T / 400','F / 0'],[700,'FALSE','F / 0','F / 500','F / 0']])}
<p><a class="btn small" href="#virtual/timer-modes">타이머 세 개 동시에 실행 →</a></p><p><strong>문제:</strong> IN이 꺼졌는데 TP.Q가 TRUE인 것은 고장인가? <strong>정답:</strong> 시작된 펄스의 PT가 아직 지나지 않았다면 정상 규칙입니다. TOF를 안전 정지의 지연 수단으로 사용하는 예제가 아닙니다.</p>
<h2>에지 비교와 샘플링</h2>${table(['호출','CLK','R_TRIG.Q','F_TRIG.Q'],[[1,'FALSE','FALSE','FALSE'],[2,'TRUE','TRUE','FALSE'],[3,'TRUE','FALSE','FALSE'],[4,'FALSE','FALSE','TRUE'],[5,'FALSE','FALSE','FALSE']])}<p><a class="btn small" href="#virtual/edges">상승·하강 에지 비교 →</a> <strong>문제:</strong> TRUE가 두 번 관측되어도 상승 횟수는? <strong>정답: 1회.</strong> 에지 FB는 마지막 호출에서 기억한 상태와 비교합니다. 두 호출 사이에 신호가 올라갔다 내려와 둘 다 FALSE로 관측되면 펄스를 놓칠 수 있습니다.</p><p>‘한 주기 펄스’는 같은 인스턴스를 매 주기 호출한다는 전제입니다. 시작/리셋 직후의 첫 입력, PT의 동적 변경, 재시작·라이브러리 버전별 경계 동작은 별도 확인 대상입니다. 웹은 이전 CLK=FALSE로 초기화하고 PT를 진행 중에 바꾸는 동작을 지원하지 않습니다. 실제 제품 내부 구현의 검증이 아닙니다.</p>`},
 {id:16,title:'VAR 구분과 GVL 읽기',desc:'입력·출력·참조·내부 상태와 전역 데이터의 소유자를 찾습니다.',category:'회사 코드 읽기',minutes:30,days:'2단계',refs:['inout','gvl','fb','fun','struct'],body:`
<h2>같은 변수 선언처럼 보여도 계약이 다르다</h2>${table(['구역','읽는 관점','교육용 예'],[['VAR_INPUT','호출자가 전달하는 값. 일반 값 전달 인터페이스','bRequest : BOOL;'],['VAR_OUTPUT','FB가 외부에 내보내는 결과','bBusy : BOOL;'],['VAR_IN_OUT','호출자의 실제 변수를 참조해 읽고 씀. 일반 값 복사가 아님','nTotal : DINT;'],['VAR','해당 POU의 로컬 데이터. FB/PROGRAM에서는 상태를 담을 수 있음','nState : INT;'],['VAR_GLOBAL (GVL)','PLC 프로젝트에서 공유하는 변수 목록','bStartRequest : BOOL;']])}
<h2>VAR_IN_OUT은 C++ 참조 인자와 비교</h2><p>아래 교육용 FB는 호출자의 누적 값을 변경합니다. 동일 변수에 여러 곳이 쓰면 순서 문제가 생기므로 소유자를 정해야 합니다. 실제 회사 인터페이스가 아닙니다.</p><h3>FB_AddOne 선언부</h3>${code('FUNCTION_BLOCK FB_AddOne\nVAR_IN_OUT\n    nValue : DINT;\nEND_VAR')}<h3>구현부</h3>${code('nValue := nValue + 1;')}<p>MAIN에 <code>fbAdd : FB_AddOne;</code>, <code>nTotal : DINT;</code>를 선언한 후 <code>fbAdd(nValue := nTotal);</code>로 호출합니다. nTotal 초기값 0에서 두 번 호출하면 1→2입니다. 타입을 맞추고 호출마다 실제 변수를 전달합니다. <code>fbAdd.nValue</code>를 외부에서 직접 읽는 일반 출력처럼 취급하지 않습니다.</p>
<h2>GVL은 프로그램의 실행 주체가 아니다</h2><p>GVL_Robot이라는 GVL의 선언 예:</p>${code("{attribute 'qualified_only'}\nVAR_GLOBAL\n    bStartRequest : BOOL;\n    bReady : BOOL;\nEND_VAR")}<p>실행부에서 <code>GVL_Robot.bReady := bLocalReady;</code>처럼 접근합니다. bLocalReady는 해당 POU에 선언한 BOOL이라고 가정합니다. GVL은 데이터 목록이고 로직은 이를 읽고 쓰는 POU에서 실행합니다. qualified_only는 GVL 이름을 붙여 접근하도록 요구합니다.</p>
<h2>현장 코드 읽기 연습과 정답</h2><p><strong>문제:</strong> HMI가 요청을 썼는데 다음 주기에 사라집니다. GVL이 전역이므로 유지되어야 하지 않나요? <strong>정답:</strong> 전역은 접근 범위일 뿐입니다. PLC 코드나 다른 쓰기 주체가 다시 대입했는지 찾아야 합니다. 참조 검색에서 쓰기 위치, 호출 Task, 실행 순서를 확인하세요.</p><p>이 페이지의 사용자 정의 FB·GVL·VAR_IN_OUT 예제는 공식 문서와 대조한 읽기 자료입니다. 웹 실행기에서는 실행하지 않으며 TwinCAT 컴파일·다운로드 미실시입니다.</p>`},
 {id:17,title:'HMI 요청과 PLC 상태 연결',desc:'요청·허가·명령·피드백을 분리하여 도킹 화면을 읽습니다.',category:'모바일로봇 실무',minutes:30,days:'3단계',refs:['hmiSymbols','gvl','edge','laser'],body:`
<h2>화면 버튼과 실제 동작은 다른 단계</h2><p>관찰된 BECKHOFF 화면은 상태와 조작을 표시합니다. 이것이 PLC 런타임을 내장한 Panel PC인지, 외부 제어기에 연결된 Control Panel인지는 미확인입니다. HMI 제품/버전과 PLC 연결 경로도 확인해야 합니다.</p><p>TwinCAT HMI에서는 PLC 변수 등을 심볼로 연결하는 구성이 가능합니다. 이 일반 사례가 회사가 사용하는 제품·ADS 매핑을 증명하지는 않습니다. 웹 실습의 체크박스 역시 실제 HMI 통신을 재현하지 않습니다.</p>
${table(['단계','교육용 이름','확인할 내용'],[['HMI 요청','bDockRequest','버튼 누름/유지/해제 규칙, 통신 단절 시 처리'],['PLC 판단','bPermit / nState','운전 모드, QR 유효성·신선도, 일반 인터록'],['명령','fSpeedCommand','명령을 쓰는 마지막 위치, 단위와 부호'],['피드백','bDockConfirmed','어느 장치가 갱신하는가, 갱신 나이'],['표시','bBusy / bDone / nAlarmId','PLC 결과와 화면 심볼의 연결, 표시 갱신 주기']])}
<h2>QR 도킹 미션</h2><p>기존 <a href="#virtual/docking">도킹 CASE 예제</a>에서 Start→State=1, QrValid→State=2, DockConfirmed→State=3을 관찰합니다. State=2에서 완료가 오지 않으면 TON.Q로 State=99가 됩니다. 타이머는 CASE 앞에서 이전 State를 보고 호출되므로 State=2에 진입한 다음 호출부터 시간 측정이 시작됩니다.</p><p><strong>문제:</strong> 화면 요청=TRUE, PLC 허가=FALSE인데 로봇이 안 움직입니다. 바로 모터 오류인가? <strong>정답:</strong> 요청 수신→인터록→상태→명령→피드백 순서로 근거를 확인해야 합니다. 안전 입력과 안전 정지는 별도 구조일 수 있으므로 학습용 일반 로직으로 우회하거나 대체하지 않습니다.</p><p>ROS2에서 목표 요청, action 진행 상태, cmd_vel, odometry를 구분한 경험과 연결하세요. PLC의 데이터 구조·Task 주기·HMI 업데이트는 ROS2와 별도로 설정됩니다.</p>`},
 {id:18,title:'GX Works3 전환 가능성에 대비하기',desc:'공통 ST와 환경 의존 요소를 나누어 이식 검토표를 만듭니다.',category:'전환 대비 · 미확정',minutes:35,days:'4단계',refs:['gxST','gxIDE','fb','property'],body:`
<div class="callout">2026-11-11 사용자 전달 정보: GX Works3로 전환할 가능성이 있습니다. 일정·CPU·적용 범위는 미확인입니다. 현재 우선순위는 TwinCAT 3 ST → 모바일로봇 실무 → GX Works3 대비입니다.</div>
<h2>비슷한 문법과 다른 프로젝트 규칙</h2>${table(['항목','TwinCAT 3','GX Works3 대비'],[['기본 ST','대입 :=, IF/ELSIF, CASE, FOR','공통 제어 구문을 먼저 비교. 자료형·지원 명령은 CPU 설명서 확인'],['변수 선언','POU 선언부 VAR 계열, GVL, DUT','Global/Local Label 편집기와 구조체 정의 확인. VAR 선언부 전체를 붙여 넣는 이식을 가정하지 않음'],['실행 구성','PLC Task의 PRG 호출과 FB 인스턴스','프로그램 실행 유형·순서·스캔 설정을 대상 CPU 문서로 재매핑'],['FB/라이브러리','Tc2_Standard 및 프로젝트 라이브러리','지원 FB·인자·타입·유지 동작을 대조. 같은 이름이 같은 구현을 보장하지 않음'],['점과 확장 기능','FB 출력·STRUCT·Property Get/Set','Property/Method 확장의 그대로 이식 가능성을 가정하지 않음'],['Ladder 연계','호출 위치와 실행 순서 확인','LD/FBD/ST 워크시트·FB/FUN 호출 경로와 실행 조건을 확인']])}
<p>공식 iQ-R/iQ-F ST 가이드의 타이머 예에는 OUT_T와 타이머 라벨의 .S/.N 접근도 등장합니다. 이것을 TwinCAT TON.Q와 문자 치환으로 바꿀 수 있다고 판단하면 안 됩니다. CPU 모델이 정해지면 타이머 단위·설정값·라이브러리·초기화를 먼저 확인합니다.</p>
<h2>공통 실행부만 비교하는 연습</h2>${code('IF bRequest AND NOT bBlocked THEN\n    bPermit := TRUE;\nELSE\n    bPermit := FALSE;\nEND_IF;')}<p>BOOL 변수 세 개를 각 환경의 방식으로 선언한다는 전제의 교육용 실행부입니다. <strong>문제:</strong> TRUE/FALSE 네 조합의 bPermit은? <strong>정답:</strong> (FALSE,FALSE)=FALSE, (FALSE,TRUE)=FALSE, (TRUE,FALSE)=TRUE, (TRUE,TRUE)=FALSE. 브라우저의 주행 허가 과제에서 같은 논리를 연습할 수 있으나 GX Works3 컴파일을 검증한 것은 아닙니다.</p>
<h2>이식 검토 과제</h2><ol><li>Task/프로그램 순서와 단위를 표로 남깁니다.</li><li>입출력 및 상태 변수의 타입·범위·초기값·재시작 보존을 대응시킵니다.</li><li>타이머/에지의 입력 시퀀스와 호출 후 결과 표를 두 환경에서 비교할 시험으로 준비합니다.</li><li>Ladder에서 호출되는 FB가 조건부로 실행되는지 확인합니다. 호출이 생략되면 이전 출력이 남을 수 있습니다.</li><li>I/O·통신·모션·안전 라이브러리는 별도 설계/검증 대상으로 분리합니다.</li></ol><p><strong>정답 기준:</strong> 같은 소스 문자열이 아니라 같은 요구 조건·호출 순서·시험 결과가 대응되어야 합니다. 아직 전환용 실제 프로젝트나 제품 검증 결과는 없습니다.</p>`}
];

export const twinQuizzes = [
 {id:'tc-hmi',lesson:17,q:'BECKHOFF 로고의 조작 화면에서 확인할 수 있는 범위는?',options:['화면 자체가 PLC임이 확정된다','화면이 상태와 조작을 표시한다. 실제 런타임 장치와 연결은 따로 확인한다','안전 정지가 일반 ST로만 구현된다'],answer:1,why:'Control Panel과 Panel PC, HMI와 PLC 런타임의 역할을 분리하고 모델·구성을 확인합니다.'},
 {id:'tc-references',lesson:19,q:'GVL_Robot.bReady := fbDock.bReady;에서 Read와 Write는?',options:['왼쪽을 읽고 오른쪽에 쓴다','양쪽 모두 선언이다','오른쪽 FB 출력을 읽고 왼쪽 GVL 변수에 쓴다'],answer:2,why:'실행부 대입은 오른쪽 값을 평가하고 왼쪽에 복사합니다. FB 호출 또는 영구적인 변수 연결은 아닙니다.'},
 {id:'tc-q',lesson:14,q:'fbSomething.Q의 의미를 확정하려면 무엇을 먼저 확인할까요?',options:['Q는 언제나 타이머 완료다','fbSomething의 선언 타입과 그 타입의 Q 정의','이름에 Timer가 들어가는지만 확인한다'],answer:1,why:'점은 멤버 접근입니다. TON, R_TRIG, F_TRIG 및 사용자 FB는 Q를 서로 다르게 정의할 수 있습니다.'},
 {id:'tc-call',lesson:14,q:'fbTimer : TON; 선언 뒤 fbTimer.Q만 읽었습니다. 이것으로 TON 본문을 호출했나요?',options:['아니요. fbTimer(IN := ..., PT := ...); 호출과 출력 읽기는 별개입니다','네. 점을 읽으면 어떤 FB든 실행됩니다','Q를 읽으면 2초 동안 기다립니다'],answer:0,why:'일반 FB 출력 읽기는 저장된 값을 읽습니다. Property Get이 실행되는 경우와 구분합니다.'},
 {id:'tc-tof',lesson:15,q:'PT=500ms, TP가 펄스를 시작한 후 100ms에서 IN이 꺼졌습니다. Q는?',options:['반드시 바로 FALSE','진행 중 펄스 시간이 끝날 때까지 TRUE','항상 TRUE로 고정'],answer:1,why:'TP는 시작한 펄스의 시간을 유지합니다. TON의 리셋 규칙과 혼동하지 마세요.'},
 {id:'tc-inout',lesson:16,q:'VAR_IN_OUT의 의미는?',options:['출력 전용 복사본','호출자의 실제 변수에 대한 참조 전달','전원 차단에도 자동 보존되는 변수'],answer:1,why:'호출 시 타입이 맞는 실제 변수를 전달하고 읽기/쓰기에 사용할 수 있습니다. 보존 정책과는 별개입니다.'},
 {id:'tc-fun',lesson:7,q:'TwinCAT에서 상태를 가진 타이머 인스턴스에 맞는 구성은?',options:['FUNCTION 로컬 변수를 매번 새로 사용','FUNCTION_BLOCK 타입으로 인스턴스를 선언하고 반복 호출','FC라는 TwinCAT 키워드로 선언'],answer:1,why:'TwinCAT은 FUN/FB/PRG를 구분합니다. FB는 인스턴스별 상태를 유지합니다.'},
 {id:'tc-gx',lesson:18,q:'현재 GX Works3에 관해 확인된 범위는?',options:['전체 전환 일정과 CPU 확정','전환 가능성만 들었으며 일정·모델·범위는 미확인','현재 회사 주력은 Siemens로 확정'],answer:1,why:'2026-11-11 사용자 업데이트 기준으로 현재 환경은 TwinCAT 3이며 GX Works3 전환은 가능성입니다.'}
];
