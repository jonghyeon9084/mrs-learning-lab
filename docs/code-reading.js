export const readingSources={
 definition:['Beckhoff · Finding Declarations','https://infosys.beckhoff.com/content/1033/tc3_plc_intro/2527123595.html','Go To Definition으로 변수·POU·라이브러리 선언 탐색.'],
 references:['Beckhoff · Cross Reference List','https://infosys.beckhoff.com/content/1033/tc3_userinterface/2531080587.html','Declaration / Read / Write / Call, 동일 이름의 선언 구분 및 간접 접근 주의.'],
 hotkeys:['Beckhoff · TwinCAT 3 Hotkeys','https://infosys.beckhoff.com/content/1033/tc3_plc_intro/8116040203.html','기본 F12/Shift+F12. 사용자 설정에 따라 다를 수 있음.'],
 shading:['Beckhoff · Shading rules','https://infosys.beckhoff.com/content/1033/tc3_plc_intro/11951162891.html','같은 이름의 다른 심볼과 GVL 등 한정된 접근.']
};
export const readingLesson={id:19,title:'여러 소스에서 변수 출처 추적하기',desc:'Define·Read·Write·Call로 값의 생산자와 소비자를 찾습니다.',category:'회사 코드 읽기',minutes:40,days:'2단계',refs:['definition','references','hotkeys','shading','inout','property'],body:`
<h2>파일을 처음부터 전부 읽지 않고, 한 값을 따라가기</h2><p>예를 들어 도킹 준비 상태가 왜 FALSE인지 알아보려면 그 BOOL 한 개에서 시작합니다. <strong>어디에 선언됐는가 → 누가 쓰는가 → 어떤 조건으로 쓰는가 → 누가 읽는가 → 그 코드는 언제 호출되는가</strong> 순서로 범위를 넓힙니다. Python/C++의 심볼 정의로 이동·참조 검색 경험을 그대로 출발점으로 삼되, PLC Task와 인스턴스 경로를 추가합니다.</p>
<table><tr><th>분류</th><th>뜻</th><th>예</th></tr><tr><td>Define / Declaration</td><td>이름, 타입, 범위와 초기값을 정한 선언 위치</td><td>bReady : BOOL;</td></tr><tr><td>Read</td><td>현재 값을 조건·계산·전달에 사용</td><td>IF bReady THEN …</td></tr><tr><td>Write</td><td>저장된 값을 변경</td><td>bReady := fbTimer.Q;</td></tr><tr><td>Read + Write</td><td>한 문장에서 이전 값을 읽고 새 값 저장</td><td>nCount := nCount + 1;</td></tr><tr><td>Call</td><td>POU/인스턴스의 로직을 실행</td><td>fbTimer(IN := bStart, PT := T#2S);</td></tr></table>
<p>TwinCAT Cross Reference List에서는 Define 대신 <strong>Declaration</strong>이라는 용어를 사용합니다. 참조 목록의 Read/Write는 접근 종류이며 온라인의 Write values/Force values 명령과 다릅니다. 코드 읽기 연습에는 실행 중 변수 쓰기나 강제가 필요하지 않습니다.</p>
<h2>TwinCAT에서 확인하는 방법</h2><ol><li>변수에 커서를 놓고 <strong>Go To Definition</strong>으로 선언을 찾습니다. 기본 단축키는 F12입니다.</li><li><strong>Find All References</strong>(기본 Shift+F12)로 참조를 모읍니다.</li><li>Cross Reference List의 Access, Context, Object, Position을 보고 선언·읽기·쓰기·호출 위치를 구분합니다. 단축키는 사용자 설정에 따라 다를 수 있습니다.</li><li>같은 이름의 서로 다른 변수를 섞지 않도록 선언 기준으로 제한하거나 MAIN.fbDock 같은 한정 경로를 확인합니다.</li><li>호출자를 따라 Task의 프로그램 목록과 실행 순서까지 확인합니다. 라이브러리 타입이면 해당 라이브러리 정의/문서를 엽니다.</li></ol>
<p><a class="btn small" href="#references/request">설치 없이 변수 추적 연습 →</a></p>
<h2>교육용 세 파일을 연결하기</h2><pre><code>// GVL_Robot에서 선언
bDockRequest : BOOL;
bDockReady : BOOL;

// MAIN 구현부의 일부
fbDock(bRequest := GVL_Robot.bDockRequest,
       bQrValid := GVL_Robot.bQrValid);
GVL_Robot.bDockReady := fbDock.bReady;

// FB_Dock 구현부의 일부
fbStable(IN := bRequest AND bQrValid, PT := T#2S);
bReady := fbStable.Q;</code></pre><p>위 코드는 흐름을 뽑은 발췌이며 완전한 선언은 변수 추적 화면에서 볼 수 있습니다. 모두 교육용 작성 코드로 실제 회사 소스가 아닙니다.</p>
<ol><li><code>GVL_Robot.bDockRequest</code>: GVL에 선언되고 MAIN에서 Read됩니다. 이 예제에는 외부 요청 생산자 구현이 없습니다.</li><li><code>bRequest := …</code>: FB 호출의 이름 붙인 입력 전달입니다. 오른쪽 전역 값을 읽어 해당 FB 인스턴스 입력에 넘깁니다.</li><li><code>fbDock.bReady</code>: fbDock의 타입 FB_Dock에서 VAR_OUTPUT bReady를 찾고, 그 출력의 Write인 <code>bReady := fbStable.Q;</code>로 이동합니다.</li><li><code>fbStable</code>: FB_Dock 내부 VAR의 TON 인스턴스입니다. Q를 만든 호출과 IN 조건으로 거슬러 올라갑니다.</li><li>마지막 MAIN 대입은 FB 출력을 읽어 GVL 결과에 씁니다. 값 복사이며 두 변수가 영구 연결되는 것은 아닙니다.</li></ol>
<h2>:=의 왼쪽이면 언제나 같은 의미일까?</h2><p><code>bReady := …;</code>는 실행부 대입, 선언부 <code>bReady : BOOL := FALSE;</code>는 초기값, 호출 안 <code>IN := bStart</code>는 입력 인자 지정입니다. <code>fbTimer(..., Q =&gt; bReady);</code>는 호출 출력 연결입니다. 문맥을 보고 실제 읽기/쓰기 대상을 판단하세요.</p>
<h2>검색 결과가 전부라는 오해 피하기</h2><p>Write 위치가 없는데 값이 변하면 I/O 매핑, HMI/ADS 등 외부 쓰기, 다른 Task, 포인터/참조, VAR_IN_OUT 호출을 확인합니다. VAR_IN_OUT은 호출자의 변수를 FB 내부에서 바꿀 수 있습니다. Property 읽기에는 Get 코드가 실행될 수 있고, 컴파일된 라이브러리 내부 소스는 보이지 않을 수 있습니다. 텍스트 검색만으로 전체 데이터 흐름을 확정하지 않습니다.</p><p>여러 Writer가 있으면 ‘마지막 대입이 이긴다’는 설명은 같은 순차 실행 경로 안에서만 출발점입니다. 다른 Task나 외부 쓰기가 있으면 시각·우선순위·동기화를 추가로 확인해야 합니다.</p>
<h2>예측 문제 · 정답 포함</h2><ol><li>MAIN에서 <code>GVL_Robot.bDockReady := fbDock.bReady;</code>의 Read/Write는? <strong>Read=오른쪽 FB 출력, Write=왼쪽 GVL 변수.</strong></li><li>fbDockA와 fbDockB의 bReady는 같은 변수인가? <strong>아닙니다. 같은 타입 정의를 공유해도 인스턴스 데이터는 다릅니다.</strong></li><li>외부 입력을 한 번 읽어 로컬 변수에 복사하면 계속 최신으로 연결되나? <strong>아닙니다. 다음 대입 전까지는 복사 당시 값입니다.</strong></li><li>Read 결과만 보이는데 값이 바뀌면 버그 확정인가? <strong>아닙니다. 프로젝트 외부 생산자와 간접 쓰기 경로를 확인해야 합니다.</strong></li></ol>
<h2>회사 코드 읽기 메모 형식</h2><pre><code>심볼 전체 경로 / 선언 타입 / POU 또는 GVL
Writer 위치 / 조건 / 호출 Task와 순서
Reader 위치 / 출력·알람으로 이어지는 경로
단위·극성 / 초기값 / 호출 간 유지 / 재시작 보존
외부 연결 여부 / 확인한 근거 / 아직 모르는 점</code></pre>`};
