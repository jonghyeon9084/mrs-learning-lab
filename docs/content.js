import {foundations,foundationQuizzes} from './foundations.js';
// All company-specific equipment and architecture are deliberately left unasserted.
// Technical references reviewed 2026-11-10. Examples are original teaching scenarios.
export const sources = {
 st: ['Beckhoff · Structured Text 문법', 'https://infosys.beckhoff.com/content/1033/tcplccontrol/925248523.html', '공통 구문 참고. 이 문서는 TwinCAT PLC Control 문서이며 TwinCAT 3 프로젝트 검증을 의미하지 않음.'],
 scl: ['Siemens · S7-1200 V20 / SCL', 'https://docs.tia.siemens.cloud/r/simatic_s7_1200_manual_collection_enus_20/programming-concepts/programming-language/scl', 'S7-1200 V20 문서 범위. 실제 회사 버전과 일치 여부 미확인.'],
 scan: ['Siemens · S7-1200 V20 / RUN 스캔 처리', 'https://docs.tia.siemens.cloud/r/simatic_s7_1200_manual_collection_enus_20/plc-concepts/execution-of-the-user-program/processing-the-scan-cycle-in-run-mode', '기본 자동 I/O 갱신 및 인터럽트 설명. 모든 PLC에 같은 순서를 적용하지 않음.'],
 blocks: ['Siemens · S7-1200/1500 Programming Guideline V1.6', 'https://cache.industry.siemens.com/dl/files/040/90885040/att_970576/v1/81318674_Programming_guideline_DOC_v16_en.pdf', 'OB, FC, FB, DB의 구분과 구조화 참고.'],
 elements: ['Beckhoff · TwinCAT 3 기본 PLC 요소', 'https://infosys.beckhoff.com/content/1033/tc3_plc_intro/7647314827.html', 'Program, Function, FB, 구조체, 열거형, GVL 구분.'],
 ton: ['Beckhoff · Tc2_Standard / TON', 'https://infosys.beckhoff.com/content/1033/tcplclib_tc2_standard/74406539.html', 'IN, PT, Q, ET 동작. 브라우저에는 이 라이브러리가 탑재되어 있지 않음.'],
 edge: ['Beckhoff · Tc2_Standard / R_TRIG', 'https://infosys.beckhoff.com/content/1033/tcplclib_tc2_standard/74391563.html', '상승 에지의 Q와 인스턴스 상태.'],
 types: ['Beckhoff · 자료형 비교', 'https://infosys.beckhoff.com/content/1033/tcsystemmanager/1086283147.html', 'PLC 자료형과 프로그래밍 언어 자료형 대응.'],
 operators: ['Beckhoff · TwinCAT 3 연산자', 'https://infosys.beckhoff.com/content/1033/tc3_plc_intro/2528853899.html', '연산과 형 변환, 범위 초과 결과의 플랫폼 의존성.'],
 laser: ['SICK · S300 Safety Laser Scanner 사용 설명서', 'https://www.sick.com/media/docs/3/13/613/operating_instructions_s300_safety_laser_scanner_en_im0017613.pdf', '보호 필드·경고 필드·시운전 관련 개념의 제품 사례. 현장 센서가 S300이라는 뜻이 아님.'],
 pose: ['OpenCV 4.10 · Perspective-n-Point', 'https://docs.opencv.org/4.10.0/d5/d1f/calib3d_solvePnP.html', '3D–2D 대응과 카메라 파라미터로 자세 추정. 회사 QR 구현을 설명하는 자료가 아님.'],
 pnp: ['Schneider Electric · PNP/NPN 센서 출력', 'https://www.se.com/uk/en/faqs/FA142566/', '3선식 센서의 출력 방식과 NO/NC 구분. 실제 배선은 개별 제품 설명서 필요.'],
 profinet: ['PI · PROFINET Technology Description', 'https://www.profinet.com/profinet-explained/technology-description', 'Ethernet 기반 산업 통신 개념.'],
 ethercat: ['EtherCAT Technology Group · 기술 설명', 'https://www.ethercat.org/en/technology.html', 'EtherCAT 프레임 처리 원리. 현장 채택 여부 미확인.'],
 git: ['GitHub Docs · About Git', 'https://docs.github.com/en/get-started/using-git/about-git', '변경 이력, 저장소, 협업 개념.'],
 pages: ['GitHub Docs · GitHub Pages 사이트 만들기', 'https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site', '정적 사이트와 저장소 게시 설정.']
};

export const lessons = [
{id:1,title:'로봇 제어의 큰 그림',desc:'센서에서 구동까지, 신호가 흐르는 길을 그립니다.',category:'시작하기',minutes:25,days:'DAY 01',refs:['elements','blocks','laser'],body:`
<h2>먼저, 무엇이 무엇을 결정하는가</h2><p>로봇을 하나의 프로그램으로 보지 말고 <strong>측정 → 판단 → 명령 → 결과 확인</strong>으로 나누어 읽어 봅시다. 센서는 관측값을 만들고, 제어 로직은 입력과 현재 상태를 이용해 다음 동작을 결정합니다. 구동 명령을 보냈다는 사실과 실제로 움직였다는 사실은 구분해야 합니다.</p>
<div class="callout">이 수업의 로봇은 학습용 가상 시스템입니다. 회사의 PLC 모델, 제어 분담, 배선, 센서 역할은 아직 확인되지 않았습니다.</div>
<h2>처음 만나는 용어</h2><table><tr><th>용어</th><th>읽는 관점</th></tr><tr><td>PLC</td><td>입력과 프로그램을 바탕으로 제어 로직을 실행하는 제어기. 어떤 기능을 맡는지는 프로젝트에서 확인합니다.</td></tr><tr><td>HMI</td><td>사람이 상태를 보고 명령을 요청하는 인터페이스. 표시된 버튼 상태가 물리 출력 상태와 같은지 확인이 필요합니다.</td></tr><tr><td>IPC / 주행 제어기</td><td>제어 시스템을 구성할 수 있는 컴퓨터·장치. 비전·주행·통신 기능의 실제 배치는 미확인입니다.</td></tr><tr><td>입력 / 출력</td><td>누구를 기준으로 읽는지 명시합니다. 카메라의 출력은 수신 제어기 관점에서는 입력입니다.</td></tr><tr><td>인터록</td><td>정해진 조건이 만족되어야 동작을 허용하는 논리. 일반 프로그램의 인터록과 인증된 안전 기능은 같지 않습니다.</td></tr></table>
<h2>이미 Python·ROS2를 알고 있다면 · 선택 읽기</h2><p>ROS2에서 메시지를 받고 상태를 판단한 뒤 명령을 내보냈던 흐름을 떠올리면 됩니다. 다만 PLC의 호출 주기와 I/O 갱신은 구성에 따라 정해지므로, ROS2 콜백과 똑같은 실행 모델이라고 생각하면 안 됩니다. 이 사이트에서는 ‘한 스캔 실행’을 눌러 호출 경계를 직접 구분합니다.</p>
<h2>처음 코드 받을 때의 읽기 순서</h2><ol><li>장치 구성과 프로그램 진입점을 찾습니다.</li><li>입력 태그가 어디서 갱신되는지 찾습니다.</li><li>상태 변수와 상태 전이 조건을 찾습니다.</li><li>출력 명령을 쓰는 모든 위치를 찾습니다.</li><li>명령에 대한 실제 피드백과 오류 기록을 찾습니다.</li></ol>
<h2>현장형 연습</h2><p><strong>“HMI에서 주행 버튼을 눌렀는데 움직이지 않는다.”</strong> 버튼 요청, 운전 모드, 허가 조건, 상태 전이, 출력 명령, 구동기 응답을 각각 확인할 항목으로 적으세요. 어느 한 단계도 확인하지 않은 상태에서 모터 고장이라고 결론 내리지 않습니다.</p><p><strong>완료 기준:</strong> 입력·상태·명령·피드백을 서로 다른 항목으로 설명할 수 있습니다.</p>`},
{id:2,title:'ST 문법의 첫 문장',desc:'변수, 자료형, 대입, IF와 CASE를 읽고 씁니다.',category:'문법 기초',minutes:40,days:'DAY 02–03',refs:['st','scl','types','operators'],body:`
<h2>ST와 SCL</h2><p>ST는 Structured Text입니다. Siemens의 SCL은 ST 기반의 텍스트 언어입니다. 공통 문법을 익히되 선언부, 라이브러리 호출, 주소 표기까지 제조사 사이에서 완전히 같다고 가정하지 않습니다.</p>
<table><tr><th>의도</th><th>ST</th><th>Python / C++</th></tr><tr><td>대입</td><td><code>Speed := 0.2;</code></td><td><code>speed = 0.2</code></td></tr><tr><td>같음 / 다름</td><td><code>= / &lt;&gt;</code></td><td><code>== / !=</code></td></tr><tr><td>논리 연산</td><td><code>AND OR NOT</code></td><td><code>and or not</code> / <code>&amp;&amp; || !</code></td></tr><tr><td>조건 분기</td><td><code>IF … THEN … ELSIF … ELSE … END_IF;</code></td><td>if / elif / else 또는 if / else if</td></tr><tr><td>참·거짓</td><td><code>TRUE / FALSE</code></td><td>True / False 또는 true / false</td></tr></table>
<h2>변수는 의미와 단위를 함께</h2><pre><code>(* 교육용 선언 예: TwinCAT 스타일 *)
VAR
    Start : BOOL := FALSE;
    Count : INT := 0;
    Speed : REAL := 0.0;  (* 이 예제의 단위: m/s *)
END_VAR</code></pre><p><code>BOOL</code>은 참·거짓, <code>INT</code>는 정수, <code>REAL</code>은 부동소수 값을 나타냅니다. Python 정수와 달리 PLC 정수는 자료형의 범위를 고려해야 합니다. 계산 결과의 범위 초과와 변환 결과는 대상 런타임 문서에서 확인하세요.</p><p>TIA Portal에서는 블록 인터페이스에 Input/Output/Static/Temp 등을 선언합니다. 로컬 변수의 <code>#</code> 표기나 외부 소스 구조는 이 사이트의 공통 예제와 다릅니다. 아래 코드는 실행부 학습 예이며, 실제 PLC 컴파일 검증은 수행하지 않았습니다.</p>
<h2>매 스캔 결과를 결정하는 IF</h2><pre><code>IF Start AND NOT Obstacle THEN
    DrivePermit := TRUE;
    Speed := 0.2;
ELSE
    DrivePermit := FALSE;
    Speed := 0.0;
END_IF;</code></pre><p><strong>0.2는 학습용 임의 값</strong>입니다. 실제 속도 설정값이 아닙니다. 괄호로 조건을 명확히 하고 각 문장의 세미콜론을 확인하세요. <code>:=</code>와 <code>=</code>를 바꾸면 의도가 달라집니다.</p>
<h2>CASE, FOR, 배열</h2><pre><code>CASE State OF
    0: Status := 10;
    1: Status := 20;
ELSE
    Status := 99;
END_CASE;

(* 가상 PLC의 배열과 FOR 예제에서 실행할 수 있습니다. *)
(* 선언 예: Values : ARRAY[1..3] OF INT; i : INT; Total : INT; *)
Total := 0;
FOR i := 1 TO 3 DO
    Total := Total + Values[i];
END_FOR;</code></pre><p>이 FOR는 한 번의 호출 안에서 반복됩니다. ‘한 스캔에 한 항목씩’이 아닙니다. 인덱스 범위와 실행 시간도 함께 검토합니다.</p>
<h2>바로 실습하기</h2><p>ST 연습장에서 ‘주행 허가’를 선택하세요. Start와 Obstacle의 네 조합을 실행한 뒤 결과를 예측값과 비교합니다. ELSE를 지웠을 때 이전 출력이 남는 이유는 다음 수업에서 다룹니다.</p>`},
{id:3,title:'스캔, 기억, 에지와 타이머',desc:'한 번 실행과 반복 실행의 차이를 이해합니다.',category:'PLC 실행',minutes:40,days:'DAY 04',refs:['scan','edge','ton'],body:`
<h2>코드를 언제 다시 실행하는가</h2><p>PLC의 주기 프로그램은 반복 실행됩니다. 다만 ‘모든 PLC가 입력→코드→출력의 한 가지 순서’라고 외우면 부정확합니다. Siemens S7-1200 V20의 기본 자동 갱신 설명은 <strong>출력 이미지 반영 → 입력 이미지 갱신 → 사용자 프로그램 실행</strong> 순서이며 인터럽트와 통신 처리도 있습니다. 직접 I/O 접근과 다른 태스크 구성은 별도로 봐야 합니다.</p>
<div class="callout">브라우저 모델은 입력 스냅샷 → 로직 → 결과 표시로 단순화했습니다. 화면의 한 스캔은 실제 PLC의 I/O 타이밍 재현이 아닙니다.</div>
<h2>변수를 대입하지 않으면?</h2><pre><code>IF Start THEN
    DrivePermit := TRUE;
END_IF;</code></pre><p>DrivePermit이 호출 사이에 값을 유지하는 저장 영역에 있다면, 다음 호출에서 Start가 FALSE가 되어도 위 코드는 DrivePermit을 FALSE로 쓰지 않습니다. ‘IF 조건이 거짓이니 출력도 거짓’이라는 추측은 틀립니다. Temp, Static, 전역, Retain의 수명은 서로 다르며, 호출 간 유지와 전원 재시작 후 보존도 별개의 개념입니다.</p>
<h2>상승 에지: 눌림 상태와 누른 순간</h2><pre><code>(* PrevStart는 호출 사이에 유지되는 BOOL, 초기 FALSE 가정 *)
StartPulse := Start AND NOT PrevStart;
PrevStart := Start;</code></pre><table><tr><th>호출</th><th>Start</th><th>호출 전 PrevStart</th><th>StartPulse</th></tr><tr><td>1</td><td>FALSE</td><td>FALSE</td><td>FALSE</td></tr><tr><td>2</td><td>TRUE</td><td>FALSE</td><td>TRUE</td></tr><tr><td>3</td><td>TRUE</td><td>TRUE</td><td>FALSE</td></tr><tr><td>4</td><td>FALSE</td><td>TRUE</td><td>FALSE</td></tr></table><p>PrevStart를 먼저 대입하면 에지를 놓칩니다. Beckhoff의 <code>R_TRIG</code>는 이런 상승 에지 검출을 제공하는 FB입니다. 인스턴스와 호출 주기를 함께 확인합니다.</p>
<h2>TON은 기다리느라 코드를 멈추지 않습니다</h2><pre><code>(* TwinCAT Tc2_Standard 읽기용 예시 *)
(* 선언: QrStable : TON; Stable : BOOL; QrValid : BOOL; *)
QrStable(IN := QrValid, PT := T#500ms);
Stable := QrStable.Q;</code></pre><p>TON의 IN이 FALSE이면 Q는 FALSE, ET는 0으로 리셋됩니다. IN이 TRUE로 유지되어 PT에 도달하면 Q가 TRUE가 됩니다. Python의 sleep처럼 실행을 중단하는 함수가 아닙니다. 이 예의 500ms는 교육용 조건입니다. 가상 PLC 실습실에서 TON을 실행할 수 있습니다. 가상 시간을 사용하며 실제 PLC 내부 시간 처리까지 재현하지는 않습니다.</p>
<h2>현장형 질문</h2><p>버튼을 길게 누를 때 명령이 여러 번 발생한다면, 레벨 조건을 썼는지 에지를 썼는지 확인합니다. 타이머가 예상과 다르면 IN, PT, ET, Q와 호출 조건을 함께 기록하세요.</p>`},
{id:4,title:'프로그램 구조: OB · FB · FC · DB',desc:'진입점, 함수, 상태 저장소를 구분합니다.',category:'코드 구조',minutes:30,days:'DAY 05',refs:['blocks','elements'],body:`
<h2>Siemens 프로젝트에서 찾을 네 가지</h2><table><tr><th>이름</th><th>역할</th><th>읽을 때 확인할 점</th></tr><tr><td>OB</td><td>운영체제의 이벤트에 따라 실행되는 Organization Block</td><td>주기 실행인지, 시작 이벤트인지, 인터럽트인지</td></tr><tr><td>FC</td><td>별도 인스턴스 DB가 없는 Function</td><td>입출력과 전역/외부 데이터 사용 여부</td></tr><tr><td>FB</td><td>인스턴스 데이터를 사용하는 Function Block</td><td>호출별 인스턴스, Static 데이터와 상태</td></tr><tr><td>DB</td><td>데이터 저장 블록</td><td>전역 DB인지 FB 인스턴스 DB인지</td></tr></table><p>FC에 인스턴스 DB가 없다는 뜻은 “FC는 외부 상태를 절대 바꾸지 않는다”는 뜻이 아닙니다. 코드가 어떤 데이터를 읽고 쓰는지는 별도로 추적해야 합니다.</p>
<h2>C++ 객체와 비교하기</h2><p>FB 인스턴스를 상태를 가진 객체와 비교하면 이해하기 쉽습니다. 같은 FB 정의로 도킹 장치 A와 B를 관리할 때 두 인스턴스의 상태가 구분됩니다. 다만 생성·호출·메모리 규칙은 C++와 같지 않습니다. TwinCAT에서는 Program, Function, FB, GVL 등 프로젝트 요소를 해당 환경의 방식으로 읽습니다.</p>
<h2>설계 연습: 기능을 나눠 보기</h2><pre><code>(* 설계 메모. 실제 제조사 호출 구문이 아님. *)
입력 매핑 → 카메라 데이터 유효성 판단
         → 도킹 시퀀스 상태 갱신
         → 구동 명령 생성
         → HMI 상태와 알람 데이터 갱신</code></pre><p>가상의 도킹 FB를 만든다면 Input에는 Request, Cancel, QrValid, PositionError를, Output에는 Busy, Done, Error를, 내부 상태에는 State와 타이머 인스턴스를 두는 설계를 연습할 수 있습니다. 이는 이 사이트의 설계 예일 뿐 회사의 표준 인터페이스가 아닙니다.</p>
<h2>실무 코드 읽기 미션</h2><ol><li>주기 실행 OB에서 호출 관계를 한 단계씩 따라갑니다.</li><li>도킹 FB의 인스턴스 데이터가 어디에 있는지 찾습니다.</li><li>상태 변수를 쓰는 모든 참조를 찾습니다.</li><li>초기화와 재시작 시 데이터 정책을 문서로 확인합니다.</li></ol><p><strong>완료 기준:</strong> “이 값은 어디에 저장되며, 누가 언제 바꾸는가?”에 답할 수 있습니다.</p>`},
{id:5,title:'CASE로 만드는 상태 머신',desc:'대기부터 도킹 완료·고장까지 전이를 설계합니다.',category:'제어 로직',minutes:40,days:'DAY 06',refs:['st','edge'],body:`
<h2>동작을 상태와 전이로 분리하기</h2><p>아래 상태는 이 사이트에서 정한 교육용 설계입니다. 실제 회사의 시퀀스 이름이나 상태 번호가 아닙니다.</p><table><tr><th>상태</th><th>진입 이후의 역할</th><th>다음 전이</th></tr><tr><td>Idle</td><td>대기, 속도 명령 0</td><td>Enable → Ready</td></tr><tr><td>Ready</td><td>새 Start 에지 대기</td><td>StartPulse → Moving</td></tr><tr><td>Moving</td><td>가상 경로 진행</td><td>경로 끝 → Docking</td></tr><tr><td>Docking</td><td>유효한 QR 조건에서 접근</td><td>도킹 확인 → Done / 시간 초과 → Fault</td></tr><tr><td>Done</td><td>명령 0, 완료 유지</td><td>Reset 및 Start 해제 → Idle</td></tr><tr><td>Fault</td><td>명령 0, 오류 유지</td><td>원인 해제 + Reset 및 Start 해제 → Idle</td></tr></table>
<h2>IF 두 개와 CASE 하나는 다릅니다</h2><pre><code>CASE State OF
    0:
        IF Enable THEN State := 1; END_IF;
    1:
        IF StartPulse THEN State := 2; END_IF;
ELSE
    State := 0;
END_CASE;</code></pre><p>이 CASE는 진입 시의 State에 해당하는 분기를 선택합니다. State를 바꿨다고 같은 CASE의 다른 분기를 이어서 실행하지 않습니다. 반면 뒤에 별도 IF가 있으면 바뀐 값을 읽을 수 있습니다. 한 호출에서 여러 전이가 발생할 수 있는지 확인하세요.</p>
<h2>조건의 우선순위를 먼저 정하기</h2><p>시뮬레이터에서는 운전 허가 상실, 장애물, 통신 이상을 일반 시퀀스보다 먼저 평가합니다. Docking에서는 QR 유효성과 데이터 신선도를 확인합니다. 오류를 지웠다는 이유만으로 자동 재출발하지 않고, Ready에서 새 Start가 필요하도록 정했습니다. 이것은 학습용 복귀 정책이며 실제 장비 정책은 승인된 설계와 대조해야 합니다.</p>
<div class="callout warning">이 사이트의 Stop/Fault/DrivePermit은 일반 소프트웨어 학습 모델입니다. 비상정지 회로, 안전 PLC 또는 인증된 안전 기능의 구현·검증을 대신하지 않습니다.</div>
<h2>실무형 과제</h2><p>시뮬레이터에서 주행 중 장애물을 넣으세요. 장애물을 없애기만 했을 때, Reset을 눌렀을 때, Start를 다시 눌렀을 때의 상태를 각각 기록합니다. “출력 0”과 “실제 정지 확인”은 실제 장비에서 별도 검증 대상이라는 점도 설명해 보세요.</p>`},
{id:6,title:'센서: 값보다 먼저 유효성',desc:'QR, LiDAR와 피드백을 문서로 확인하는 법.',category:'센서 이해',minutes:35,days:'DAY 07',refs:['laser','pose'],body:`
<h2>센서를 읽는 네 가지 질문</h2><p><strong>무엇을 측정하는가? 어떤 형식으로 내보내는가? 언제 갱신되는가? 실패를 어떻게 알리는가?</strong> 모델명과 설명서 없이 장착 모양만으로 답을 확정하지 않습니다.</p>
<table><tr><th>대상</th><th>자료에서 확인할 내용</th></tr><tr><td>QR 카메라</td><td>ID만 전달하는지, 상대 위치·방향도 전달하는지. 좌표계, 단위, 유효 플래그, 갱신 시각.</td></tr><tr><td>LiDAR</td><td>정확한 모델, 스캔 평면, 측정 데이터, 진단/안전 출력, 사용 목적.</td></tr><tr><td>엔코더</td><td>위치·증분 등 출력 의미, 해상도, 방향, 단위 환산, 피드백 연결 대상.</td></tr><tr><td>IMU</td><td>제공되는 채널, 축 방향, 단위, 보정 상태, 갱신 주기.</td></tr><tr><td>범퍼·근접센서</td><td>실제 센서 유무, 출력 방식, 배선, 정상/작동 상태, 진단 신호.</td></tr><tr><td>표시등·광통신 장치</td><td>정확한 품번과 역할, 입력/출력, 상태 표시 의미.</td></tr></table>
<h2>QR을 읽었다는 것과 자세를 안다는 것</h2><p>마커의 문자열을 해독하는 것과 마커에 대한 상대 자세를 추정하는 것은 구분해야 합니다. OpenCV의 PnP 예에서는 알려진 3D 점, 대응 이미지 점, 카메라 내부 파라미터와 왜곡 계수를 이용합니다. 이미 ArUco를 다뤘다면 좌표계와 단위 변환의 중요성을 연결해 볼 수 있습니다. 회사 카메라가 PnP나 OpenCV를 쓴다는 의미는 아닙니다.</p>
<h2>LiDAR 두 개의 역할은 외형으로 확정하지 않기</h2><p>SICK S300 문서는 보호 필드와 경고 필드를 구분합니다. 하지만 이것을 모델 미확인 센서에 그대로 적용하면 안 됩니다. 기울어진 설치도 실제 스캔 평면과 데이터 사용처를 확인해야 설명할 수 있습니다. ‘주행용 하나 + 안전용 하나’는 확인 전에는 가설입니다.</p>
<h2>실무형 데이터 판단</h2><pre><code>(* 교육용 논리. Fresh는 별도 데이터 갱신 검사 결과라고 가정 *)
Usable := QrValid AND Fresh AND IdMatches;</code></pre><p>숫자가 그럴듯해도 갱신이 멈춘 값일 수 있습니다. 시뮬레이터의 ‘QR 최신 데이터’를 끄고 도킹 출력을 관찰하세요. 실제 허용 데이터 나이, 통신 타임아웃과 재시도 정책은 설계 문서에서 확인합니다.</p>`},
{id:7,title:'I/O와 통신을 구분해서 읽기',desc:'DI/DO, PNP/NPN, Ethernet과 산업 통신.',category:'전장 & 통신',minutes:35,days:'DAY 08',refs:['pnp','profinet','ethercat'],body:`
<h2>신호 의미와 전기적 연결은 다릅니다</h2><p>DI/DO는 제어기 기준의 디지털 입력/출력입니다. 코드에서 TRUE라고 읽는 신호가 실제로 ‘정상’을 뜻하는지 ‘이상’을 뜻하는지는 신호 정의와 배선에 달려 있습니다. 이름만 보고 극성을 바꾸지 말고 I/O 목록을 확인하세요.</p>
<h2>PNP/NPN과 NO/NC</h2><p>3선식 트랜지스터 출력 센서에서 PNP는 부하에 전류를 공급하는 쪽, NPN은 부하의 전류를 0V 쪽으로 흘려주는 쪽으로 구분합니다. NO/NC는 비작동 상태에서의 출력 동작 구분입니다. <strong>PNP=N/O, NPN=N/C는 아닙니다.</strong> 단자 전압, 공통단, 입력 모듈 호환성, 실제 배선은 각각의 제품 설명서로 확인해야 합니다.</p>
<h2>같은 케이블처럼 보여도 같은 프로토콜은 아닙니다</h2><table><tr><th>이름</th><th>이 수업에서 구분할 점</th></tr><tr><td>Ethernet</td><td>아래 PROFINET·EtherCAT 같은 기술과 같은 수준의 단일 응용 프로토콜로 취급하지 않습니다.</td></tr><tr><td>PROFINET</td><td>Ethernet 기반 산업 통신. 장치 구성과 교환 데이터 정의를 확인합니다.</td></tr><tr><td>EtherCAT</td><td>노드가 지나가는 프레임에서 자신의 데이터를 읽고 쓰는 방식의 산업 통신 기술.</td></tr><tr><td>TCP/IP, CAN</td><td>현장 사용 여부와 상위 데이터 형식을 확인할 학습 항목. 이 과정은 개별 패킷·배선·종단 설정을 제공하지 않습니다.</td></tr></table><p>커넥터 모양으로 프로토콜을 결정하거나, 통신 연결 성공만으로 공정 데이터가 정상이라고 결론 내리지 않습니다.</p>
<h2>실무형 I/O 명세 작성 연습</h2><pre><code>Signal: QrValid
Producer: Vision controller (가상)
Consumer: Sequence controller (가상)
Type: BOOL
TRUE meaning: 최신 프레임의 목표 검출 결과가 유효함 (교육용 정의)
Update / Timeout: 실제 사양 확인 필요
Failure action: 교육 모델은 Docking 중 Fault</code></pre><p>통신 고장 실습에서는 Connected뿐 아니라 값의 갱신, 순번, 데이터 의미를 분리해서 생각하세요. 회사 프로토콜과 주소는 아직 미확인입니다.</p>`},
{id:8,title:'정밀 도킹 시퀀스 읽기',desc:'유효성, 좌표, 완료 조건과 타임아웃.',category:'실무 시퀀스',minutes:45,days:'DAY 09–10',refs:['pose','ton','edge'],body:`
<h2>정밀 도킹을 작은 조건으로 나누기</h2><p>이 실습은 ‘접근 → 목표 확인 → 도킹 구간 → 완료 확인’의 교육용 시퀀스입니다. 실제 제어 게인, 속도 제한, 허용 오차와 안전 필드는 다루지 않습니다. 현장에서 사용하는 알고리즘과 수치는 제공되지 않았습니다.</p>
<h2>좌표의 의미부터 맞추기</h2><p>카메라 좌표의 x와 로봇 좌표의 x가 같은 방향이라고 가정하지 마세요. PnP의 출력은 객체 좌표에서 카메라 좌표로의 변환을 나타냅니다. 로봇 제어에 쓰려면 실제 좌표계 정의와 카메라 장착 변환을 확인해야 합니다. 단위, 부호, 각도 표현, 기준 시각을 기록합니다.</p>
<h2>완료는 하나의 숫자만 보고 정하지 않기</h2><pre><code>(* 읽기용 논리 예시: 제조사별 함수·자료형 확인 필요 *)
WithinTolerance :=
    (ABS(ErrorX) &lt;= TolX) AND
    (ABS(ErrorY) &lt;= TolY) AND
    (ABS(ErrorYaw) &lt;= TolYaw);

(* 유효성, 연속 유지, 기계적 완료 확인은 별도 설계 항목 *)</code></pre><p>여기서 TolX/Y/Yaw는 교육용 기호이며 실제 허용 오차를 제시하지 않습니다. QR ID가 맞아도 자세 값이 오래되었거나 좌표 부호가 반대라면 제어에 사용할 수 있는지 재검토해야 합니다.</p>
<h2>시뮬레이터의 명시적 가정</h2><ol><li>가상 시간 한 스캔은 100ms입니다. 실제 PLC 주기가 아닙니다.</li><li>20회 Moving 스캔 뒤 Docking으로 이동합니다. 거리는 모델링하지 않습니다.</li><li>Docking에서 QR Valid/Fresh가 모두 필요합니다.</li><li>DockConfirmed가 연속 3회 TRUE이면 Done입니다. 첫 TRUE 호출을 1회로 셉니다.</li><li>Docking 50회에서 미완료면 Timeout입니다. 경계에서는 Timeout을 우선합니다.</li></ol><p>이는 알고리즘의 물리 성능이 아니라 상태와 고장 처리를 실험하는 모델입니다.</p>
<h2>통신 핸드셰이크 설계 과제</h2><p>가상의 Request/Busy/Done/Error를 종이에 그려보세요. Request가 유지될 때 중복 동작을 막는 법, Done을 언제 지우는지, 통신 중단 시 어떤 상태가 되는지를 정합니다. 실제 장비의 핸드셰이크 규격을 안다고 가정하지 마세요.</p>`},
{id:9,title:'알람에서 원인까지 추적하기',desc:'현상·증거·가설을 나누고 재현 조건을 기록합니다.',category:'실무 진단',minutes:35,days:'DAY 11–12',refs:['scan','laser','blocks'],body:`
<h2>“안 된다”를 재현 가능한 기록으로</h2><p>이 수업의 절차는 학습을 위한 진단 기록 방법입니다. 실제 작업은 회사의 승인된 점검·안전 절차를 따릅니다. 원인을 찾기 위해 운전 중 신호를 강제하거나 안전 입력을 우회하는 과제는 제공하지 않습니다.</p>
<table><tr><th>항목</th><th>좋은 기록의 예 · 가상 상황</th></tr><tr><td>발생 조건</td><td>Docking 진입 직후 QrFresh를 FALSE로 변경</td></tr><tr><td>관측</td><td>다음 스캔에 Fault, 명령 0, QR_STALE 기록</td></tr><tr><td>가설</td><td>카메라 데이터 갱신이 멈췄을 수 있음</td></tr><tr><td>필요 증거</td><td>송신 시각/수신 시각, 순번, 연결 상태, 상대 장치 진단</td></tr><tr><td>복귀 조건</td><td>모델에서는 원인 해제 후 Reset, 이어서 새 Start</td></tr></table>
<h2>코드 추적 순서</h2><ol><li>최초 알람과 뒤따른 알람을 구분합니다.</li><li>알람 직전 상태와 전이 조건을 찾습니다.</li><li>조건을 구성한 입력의 값·유효성·시각을 기록합니다.</li><li>같은 출력 변수를 뒤에서 다시 쓰는 코드가 있는지 찾습니다.</li><li>해결 후 정상 동작뿐 아니라 같은 고장의 재현 시험을 확인합니다.</li></ol>
<h2>이 사이트에서 재현할 다섯 가지</h2><p>주행 중 장애물, 통신 끊김, 도킹 중 QR 미검출, 오래된 QR 데이터, 도킹 완료 신호 미도착을 각각 실험하세요. 상태·알람·명령값이 어떻게 달라지는지 비교합니다. ‘통신 이상’ 알람만으로 케이블 불량을 확정할 수 없다는 점을 설명해 보세요.</p>
<h2>현장 보고 연습</h2><pre><code>현상: 어떤 동작에서 무엇이 일어났는가
재현: 시작 상태 / 변경한 입력 / 발생한 스캔
증거: 상태, 알람, 명령, 피드백, 시간
가설: 아직 확인하지 못한 원인 후보
다음 확인: 읽기 전용으로 확인할 로그 또는 문서
결과: 확인된 사실만 기록</code></pre><p>HMI의 알람 문구와 코드의 알람 ID 연결을 확인하세요. 화면에 이상이 없어 보인다는 것과 제어기 내부 조건이 정상이라는 것은 같지 않을 수 있습니다.</p>`},
{id:10,title:'실무처럼 변경하고 검토하기',desc:'작은 변경, Git 이력, 검증과 인수인계.',category:'업무 적응',minutes:35,days:'DAY 13–14',refs:['git','pages','scl','elements'],body:`
<h2>Git은 변경의 이유를 남기는 도구</h2><p>이 학습 사이트의 코드는 GitHub 저장소에서 관리합니다. 브랜치를 만들고 작은 변경을 커밋한 다음 diff를 읽어 의도와 결과를 확인하세요. PLC 프로젝트의 실제 버전 관리 방식은 파일 형식, IDE 및 회사 절차에 따라 별도 확인해야 합니다. ST 텍스트만 있다고 전체 PLC 프로젝트를 재현할 수 있는 것은 아닙니다.</p>
<h2>학습 저장소에서만 실행하는 연습</h2><pre><code>git clone https://github.com/jonghyeon9084/mrs-learning-lab.git
cd mrs-learning-lab
git switch -c codex/practice-start-interlock
node --test tests/*.test.mjs
git diff
git status</code></pre><p>의도한 파일만 stage한 뒤 커밋합니다. 실제 장비와 연결되는 프로젝트에 이 명령이나 예제를 그대로 적용하는 실습은 아닙니다.</p>
<h2>PR 설명은 동작으로 쓰기</h2><pre><code>변경 목적: Start를 계속 누를 때 명령이 반복되지 않도록 한다.
변경 내용: Ready에서 상승 에지만 소비한다.
검증: FALSE → TRUE → TRUE에서 펄스가 한 번만 발생한다.
추가 확인: 원인 해제만으로 자동 재출발하지 않는다.
한계: 브라우저 모델 검증. 실제 PLC 컴파일·실기 시험 미실시.</code></pre>
<h2>회사 환경 확인 후 이어갈 단계</h2><ol><li>정확한 CPU/IPC 모델과 개발 도구 버전을 확인합니다.</li><li>승인된 교육 프로젝트, 라이브러리, 장치 구성을 확보합니다.</li><li>실행 진입점, I/O 태그, 상태 머신을 읽기 전용으로 매핑합니다.</li><li>회사에서 정한 교육/시뮬레이션 환경에서 컴파일을 확인합니다.</li><li>실기 시운전은 담당자의 승인된 절차와 검증 기준에 따라 진행합니다.</li></ol>
<h2>기초 과정 학습 완료 기준</h2><p>ST의 IF/CASE를 읽고, 호출 사이의 상태 유지를 설명하고, 센서 값과 유효성을 구분하고, 상태 전이와 알람의 근거를 추적할 수 있어야 합니다. 이 과정 수료는 실제 장비의 설계·안전 검증 역량을 인증하지 않습니다.</p>`}
];

export const quizzes = [
{id:'q1',lesson:1,q:'HMI에서 주행 요청이 TRUE입니다. 확실하게 말할 수 있는 것은?',options:['모터가 실제로 회전하고 있다','비상정지 기능이 정상이다','주행 요청이 표시되었다. 실제 출력·피드백은 따로 확인한다'],answer:2,why:'요청, 로직의 허가, 명령, 실제 피드백은 서로 다른 확인 항목입니다.'},
{id:'q2',lesson:2,q:'ST에서 값을 대입하는 연산자는?',options:['=','==',':='],answer:2,why:':=는 대입, =는 같음 비교입니다. Python/C++의 = 대입과 구분하세요.'},
{id:'q3',lesson:2,q:'Start=TRUE, Obstacle=TRUE일 때 Start AND NOT Obstacle의 결과는?',options:['TRUE','FALSE','이전 값을 유지한다'],answer:1,why:'NOT TRUE는 FALSE이고 TRUE AND FALSE는 FALSE입니다. 조건식의 계산과 변수의 상태 유지는 구분합니다.'},
{id:'q4',lesson:3,q:'상태 유지 변수에 IF Start THEN DrivePermit := TRUE; END_IF;만 실행합니다. Start가 TRUE였다가 FALSE가 되면?',options:['DrivePermit이 자동으로 FALSE가 된다','DrivePermit은 이전 TRUE를 유지할 수 있다','항상 컴파일 오류다'],answer:1,why:'거짓 분기에서 대입이 없습니다. 변수가 호출 사이에 유지된다는 문제의 전제에서 이전 값이 남습니다.'},
{id:'q5',lesson:3,q:'PrevStart 초기값 FALSE, Start가 FALSE → TRUE → TRUE → FALSE입니다. 상승 에지 횟수는?',options:['0번','1번','2번'],answer:1,why:'FALSE에서 TRUE가 되는 두 번째 호출에서만 펄스가 TRUE입니다. 이전 값을 갱신하기 전에 비교해야 합니다.'},
{id:'q6',lesson:3,q:'Beckhoff TON에서 IN이 FALSE가 되면?',options:['ET가 그대로 멈춘다','Q는 FALSE, ET는 0으로 리셋된다','프로그램이 PT만큼 정지한다'],answer:1,why:'Tc2_Standard TON의 문서상 동작입니다. TON은 sleep처럼 사용자 코드를 멈추는 함수가 아닙니다.'},
{id:'q7',lesson:4,q:'Siemens FC에 대한 정확한 설명은?',options:['인스턴스 DB가 없지만 외부 데이터를 읽거나 쓸 수 있다','모든 데이터가 전원 차단 후 보존된다','외부 상태를 절대 변경할 수 없다'],answer:0,why:'FC에 인스턴스 DB가 없다는 것과 부작용이 없는 순수 함수라는 것은 다릅니다.'},
{id:'q8',lesson:5,q:'CASE State OF의 0 분기에서 State := 1;을 실행하면 같은 CASE의 1 분기도 바로 실행될까요?',options:['항상 실행한다','같은 CASE에서 다음 분기를 연이어 실행하지 않는다','다음 분기로 가려면 FOR가 필수다'],answer:1,why:'선택된 CASE 분기만 실행합니다. 뒤에 별도 IF 문이 있다면 그 IF는 변경된 값을 읽을 수 있습니다.'},
{id:'q9',lesson:6,q:'기울어진 LiDAR의 역할을 확정하는 데 필요한 것은?',options:['장착 각도만 보면 된다','제조사 색상만 보면 된다','정확한 모델, 스캔 평면과 실제 데이터 사용처'],answer:2,why:'외형만으로 주행용·안전용·단차 검출용 등을 확정할 수 없습니다.'},
{id:'q10',lesson:7,q:'3선식 센서에서 PNP와 NO/NC의 관계로 맞는 설명은?',options:['PNP이면 항상 NO다','서로 다른 구분이므로 PNP도 NO 또는 NC일 수 있다','NPN만 NC를 지원한다'],answer:1,why:'PNP/NPN은 출력 전류 방식, NO/NC는 비작동 상태의 출력 동작 구분입니다. 실제 배선은 개별 제품 설명서를 확인합니다.'},
{id:'q11',lesson:8,q:'QR 위치 값은 정상 범위지만 갱신 시각이 오래되었습니다. 올바른 판단은?',options:['숫자가 정상 범위이므로 바로 도킹한다','신선도·유효성 조건을 확인하고 실제 설계의 실패 정책을 적용한다','항상 카메라 하드웨어 고장이다'],answer:1,why:'오래된 값과 유효한 최신 측정값을 구분해야 합니다. 원인도 데이터 갱신·수신·연결 등으로 나눠 확인합니다.'},
{id:'q12',lesson:9,q:'알람 직후 기록으로 가장 유용한 것은?',options:['“가끔 안 됨”','근거 없이 “센서 고장 확정”','발생 상태, 입력값, 시간, 최초 알람, 명령·피드백'],answer:2,why:'재현 조건과 관측 증거를 남겨야 가설을 검증할 수 있습니다.'},
{id:'q13',lesson:10,q:'브라우저 실습이 통과했습니다. 무엇이 검증되었나요?',options:['실제 PLC에서 컴파일과 실기 안전 검증까지 완료','사이트에 구현된 교육 모델의 해당 시나리오','모든 제조사의 ST 문법 호환성'],answer:1,why:'모델 시험은 실제 PLC 컴파일·타이밍·I/O·안전 검증과 다릅니다. 검증 범위를 명시해야 합니다.'}
];

export const exercises = [
{id:'permit',name:'01 · 주행 허가',goal:'Start가 TRUE이고 Obstacle이 FALSE일 때만 DrivePermit을 TRUE로 만드세요.',code:'(* TODO: 시작과 장애물 조건을 완성하세요. *)\nDrivePermit := FALSE;',solution:'DrivePermit := Start AND NOT Obstacle;',inputs:{Start:false,Obstacle:false},vars:{DrivePermit:false},tests:[{input:{Start:false,Obstacle:false},expected:{DrivePermit:false}},{input:{Start:true,Obstacle:false},expected:{DrivePermit:true}},{input:{Start:true,Obstacle:true},expected:{DrivePermit:false}},{input:{Start:false,Obstacle:true},expected:{DrivePermit:false}}]},
{id:'speed',name:'02 · 속도 선택',goal:'Enable이 FALSE면 0.0, Enable이 TRUE이고 DockRequest가 TRUE면 0.1, 그 외에는 0.3을 Speed에 쓰세요. 모두 교육용 임의 값입니다.',code:'IF Enable THEN\n    Speed := 0.3;\nELSE\n    Speed := 0.0;\nEND_IF;',solution:'IF NOT Enable THEN\n    Speed := 0.0;\nELSIF DockRequest THEN\n    Speed := 0.1;\nELSE\n    Speed := 0.3;\nEND_IF;',inputs:{Enable:false,DockRequest:false},vars:{Speed:0},tests:[{input:{Enable:false,DockRequest:false},expected:{Speed:0}},{input:{Enable:false,DockRequest:true},expected:{Speed:0}},{input:{Enable:true,DockRequest:true},expected:{Speed:0.1}},{input:{Enable:true,DockRequest:false},expected:{Speed:0.3}}]},
{id:'edge',name:'03 · 상승 에지',goal:'StartPulse를 상승 에지에서만 TRUE로 만드세요. 마지막에 PrevStart를 갱신하세요. 이전 상태는 스캔 사이에 유지됩니다.',code:'(* TODO: 현재 값과 이전 값을 비교하세요. *)\nStartPulse := FALSE;\nPrevStart := Start;',solution:'StartPulse := Start AND NOT PrevStart;\nPrevStart := Start;',inputs:{Start:false},vars:{StartPulse:false,PrevStart:false},tests:[{input:{Start:false},expected:{StartPulse:false}},{input:{Start:true},expected:{StartPulse:true}},{input:{Start:true},expected:{StartPulse:false}},{input:{Start:false},expected:{StartPulse:false}},{input:{Start:true},expected:{StartPulse:true}}],sequence:true},
{id:'state',name:'04 · 상태 전이',goal:'State=0에서 Enable이면 1, State=1에서 Start이면 2, State=2에서 DockRequest이면 3. 그 외는 유지하세요. 매 호출에서 한 분기만 실행하세요.',code:'CASE State OF\n    0:\n        IF Enable THEN State := 1; END_IF;\n    1:\n        (* TODO *)\n    2:\n        (* TODO *)\nEND_CASE;',solution:'CASE State OF\n    0: IF Enable THEN State := 1; END_IF;\n    1: IF Start THEN State := 2; END_IF;\n    2: IF DockRequest THEN State := 3; END_IF;\nEND_CASE;',inputs:{Enable:false,Start:false,DockRequest:false},vars:{State:0},tests:[{input:{Enable:false,Start:true,DockRequest:true},expected:{State:0}},{input:{Enable:true,Start:true,DockRequest:true},expected:{State:1}},{input:{Enable:true,Start:false,DockRequest:true},expected:{State:1}},{input:{Enable:true,Start:true,DockRequest:true},expected:{State:2}},{input:{Enable:true,Start:true,DockRequest:false},expected:{State:2}},{input:{Enable:true,Start:true,DockRequest:true},expected:{State:3}}],sequence:true},
{id:'latch',name:'05 · 출력 잔류 버그',goal:'Start가 꺼지거나 Obstacle이 켜지면 DrivePermit이 반드시 FALSE가 되도록 고치세요. 이전 출력이 남는 버그입니다.',code:'IF Start AND NOT Obstacle THEN\n    DrivePermit := TRUE;\nEND_IF;',solution:'IF Start AND NOT Obstacle THEN\n    DrivePermit := TRUE;\nELSE\n    DrivePermit := FALSE;\nEND_IF;',inputs:{Start:false,Obstacle:false},vars:{DrivePermit:false},tests:[{input:{Start:true,Obstacle:false},expected:{DrivePermit:true}},{input:{Start:false,Obstacle:false},expected:{DrivePermit:false}},{input:{Start:true,Obstacle:false},expected:{DrivePermit:true}},{input:{Start:true,Obstacle:true},expected:{DrivePermit:false}}],sequence:true}
];

export const fieldChecks = [
 ['controller','PLC/IPC의 제조사·정확한 모델','장비 라벨과 프로젝트 장치 구성을 대조합니다. 화면 로고만으로 판단하지 않습니다.'],
 ['ide','개발 도구와 버전','TIA Portal / TwinCAT / 기타. 설치된 버전과 프로젝트 요구 버전을 확인합니다.'],
 ['architecture','제어 분담과 통신 구성','주행·비전·시퀀스·안전 제어의 담당 장치 및 데이터 경로를 확인합니다.'],
 ['lidar','각 LiDAR의 모델과 사용처','안전/측정 역할, 기울어진 스캔 평면, 출력 데이터와 연결을 문서로 확인합니다.'],
 ['camera','QR 데이터 명세','ID만인지 자세 포함인지, 좌표계·단위·품질·갱신 시각을 확인합니다.'],
 ['bumper','범퍼·하부 고무의 실제 기능','접촉 센서인지 보호 구조물인지, 배선과 신호·진단을 확인합니다.'],
 ['lamp','램프·광통신 장치 품번','표시등인지 비전 조명인지, 광통신 장치인지 정확한 라벨과 설명서로 확인합니다.'],
 ['hmi','HMI 모델과 연결 대상','Panel PC / Control Panel 여부와 실제 제어 프로그램 실행 장치를 확인합니다.'],
 ['signals','I/O 목록과 알람 정의','정상값, 이상값, 유효성, 수신·송신 주기, 단위와 주소를 확인합니다.'],
 ['workflow','교육 환경과 작업 절차','승인된 백업·버전 관리·시뮬레이션·시운전 절차를 확인합니다.']
];

// Keep the foundational progression ahead of the original technical modules.
lessons.forEach(l=>{l.id+=3;l.days='MODULE '+String(l.id).padStart(2,'0');});
quizzes.forEach(q=>{q.lesson+=3;});
lessons.unshift(...foundations);
quizzes.unshift(...foundationQuizzes);
