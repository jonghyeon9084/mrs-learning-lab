// Beginner lessons introduce terms before relying on programming experience.
export const foundations=[
{id:1,title:'프로그램은 무엇을 하는 걸까?',desc:'컴퓨터, 프로그램, 입력과 출력을 처음부터 구분합니다.',category:'완전 기초',minutes:15,days:'START 01',refs:['st','elements'],body:`
<h2>아직 코드를 몰라도 괜찮습니다</h2><p>이 수업은 프로그래밍 경험을 전제로 하지 않습니다. 먼저 <strong>프로그램은 컴퓨터가 수행할 작업을 표현한 것</strong>이라고 생각하세요. 코드는 사람이 그 작업을 적는 표현입니다. 현재 학습 언어는 TwinCAT 3의 ST입니다. 이 수업은 필요할 때 읽는 선택 복습입니다.</p>
<h2>입력 → 계산 → 출력</h2><p>다음은 실제 기계가 아닌 작은 연습 상황입니다. 화면에 시작 버튼이 있고, 버튼을 누르면 화면의 표시등을 켭니다. 버튼을 눌렀는지가 <strong>입력</strong>, 켤지 판단하는 과정이 <strong>처리</strong>, 표시등을 켜라는 결과가 <strong>출력</strong>입니다.</p><table><tr><th>단계</th><th>예시</th><th>지금 기억할 말</th></tr><tr><td>입력</td><td>Start가 켜져 있는가?</td><td>프로그램이 읽는 값</td></tr><tr><td>처리</td><td>Start 값을 Lamp에 넣는다.</td><td>코드가 정한 동작</td></tr><tr><td>출력</td><td>Lamp 값이 참이 된다.</td><td>프로그램이 만든 결과</td></tr></table>
<h2>한 줄을 읽어 봅시다</h2><pre><code>Lamp := Start;</code></pre><p>왼쪽의 Lamp는 결과를 저장할 이름입니다. 오른쪽의 Start는 읽어 올 값의 이름입니다. 가운데 <code>:=</code>는 ‘오른쪽 값을 왼쪽에 넣는다’입니다. 마지막 <code>;</code>는 문장의 끝을 나타냅니다. 이 한 줄이 실제 전등을 직접 연결하는 것은 아닙니다. 물리 출력 연결은 별도 설정이 필요합니다.</p>
<h2>실행한다는 뜻</h2><p>코드를 작성한 것과 실행한 것은 다릅니다. 이 사이트에서는 ‘소스 적용’으로 교육 실행기가 코드를 읽게 하고, ‘1스캔’으로 한 번 실행합니다. 실제 PLC가 반복 호출하는 방식은 나중 수업에서 배웁니다.</p>
<h2>첫 연습 · 키보드로 숫자 하나 바꾸기</h2><ol><li><a class="text-link" href="#virtual/variable">가상 PLC의 ‘변수에 값 넣기’ 예제를 여세요.</a></li><li>아직 코드는 바꾸지 않고 ‘소스 적용’을 누릅니다.</li><li>‘1스캔’을 세 번 누르고 Count 값을 적습니다.</li><li><code>Count := Count + 1;</code>의 마지막 1을 2로 바꿉니다.</li><li>다시 적용한 뒤 세 번 실행합니다. 앞의 결과와 비교하세요.</li></ol><p><strong>예상 결과:</strong> 첫 실험은 1, 2, 3입니다. 두 번째는 초기화 후 2, 4, 6입니다. 원리를 다 몰라도 ‘코드 변경 → 적용 → 실행 → 관찰’의 순서를 익히면 됩니다.</p>`},
{id:2,title:'신호, 숫자, 참과 거짓',desc:'TRUE/FALSE와 단위를 먼저 읽는 연습을 합니다.',category:'완전 기초',minutes:20,days:'START 02',refs:['types','st','pnp'],body:`
<h2>프로그램이 읽는 신호</h2><p>화면의 체크박스처럼 두 상태로 표현하는 값을 먼저 다룹니다. <code>TRUE</code>는 참, <code>FALSE</code>는 거짓입니다. 장애물 감지 신호를 ‘TRUE=장애물 있음’으로 정의했다면 TRUE는 좋은 상태라는 뜻이 아닙니다. 의미는 신호의 정의로 결정합니다.</p>
<div class="callout">코드의 TRUE/FALSE와 센서 단자의 전압을 바로 동일시하지 않습니다. 실제 전압과 정상/이상 의미는 회로·입력 모듈·신호 정의를 확인해야 합니다.</div>
<h2>AND, OR, NOT을 일상 문장으로</h2><p><code>A AND B</code>는 A와 B가 모두 참일 때 참입니다. <code>A OR B</code>는 둘 중 하나 이상 참일 때 참입니다. <code>NOT A</code>는 A의 참·거짓을 뒤집습니다.</p><table><tr><th>A</th><th>B</th><th>A AND B</th><th>A OR B</th></tr><tr><td>FALSE</td><td>FALSE</td><td>FALSE</td><td>FALSE</td></tr><tr><td>FALSE</td><td>TRUE</td><td>FALSE</td><td>TRUE</td></tr><tr><td>TRUE</td><td>FALSE</td><td>FALSE</td><td>TRUE</td></tr><tr><td>TRUE</td><td>TRUE</td><td>TRUE</td><td>TRUE</td></tr></table>
<h2>숫자는 단위와 함께 읽습니다</h2><p>‘속도가 100이다’만으로는 뜻이 부족합니다. mm/s인지 m/s인지 알아야 합니다. 1m는 1000mm이고, 1s는 1000ms입니다. 이 사이트의 <code>T#500ms</code>는 500밀리초, 즉 0.5초를 나타내는 시간 리터럴입니다. 실제 주행 속도 설정을 권하는 숫자가 아닙니다.</p>
<h2>직접 예측하기</h2><pre><code>DrivePermit := Start AND NOT Obstacle;</code></pre><p>Start=TRUE, Obstacle=FALSE이면 NOT Obstacle은 TRUE입니다. 따라서 TRUE AND TRUE가 되어 DrivePermit은 TRUE입니다. 장애물이 생겨 Obstacle=TRUE가 되면 NOT Obstacle은 FALSE, 결과는 FALSE입니다.</p><p><strong>연습:</strong> 종이에 네 가지 입력 조합을 쓰고 결과를 예측하세요. 다음으로 <a class="text-link" href="#virtual/condition">가상 PLC의 입력과 IF 예제</a>에서 체크박스를 바꾸며 확인합니다. 체크박스를 바꾼 뒤 실행해야 값이 바뀐다는 점을 관찰하세요.</p>`},
{id:3,title:'TwinCAT 변수·자료형·초기값',desc:'Python/C++의 변수와 비교하고 PLC 선언·초기화·대입을 구분합니다.',category:'완전 기초',minutes:25,days:'START 03',refs:['st','types','operators'],body:`
<h2>Python/C++에서 TwinCAT ST로</h2><p>이미 아는 변수 개념에 ST의 자료형과 저장 수명을 연결합니다. Python의 동적 타입과 달리 선언한 타입을 따르며, PROGRAM/FB의 일반 VAR는 호출 사이에 유지됩니다. C++의 자동 지역 변수와 오래 살아 있는 객체 멤버의 차이를 떠올려 보세요.</p><h2>변수와 자료형 확인</h2><p><code>Count</code>라는 이름으로 현재 횟수를 저장한다고 생각해 보세요. 변수는 저장할 값을 구분하기 위한 이름과 자료형을 가집니다. 자료형은 어떤 종류의 값을 다룰지를 나타냅니다.</p><table><tr><th>자료형</th><th>뜻</th><th>학습 예</th></tr><tr><td>BOOL</td><td>참 또는 거짓</td><td>Start = FALSE</td></tr><tr><td>INT</td><td>정수</td><td>Count = 3</td></tr><tr><td>REAL</td><td>부동소수 수</td><td>Speed = 0.2</td></tr><tr><td>TIME</td><td>시간 값</td><td>WaitTime = T#500ms</td></tr></table><p>여기서는 BOOL, INT, REAL만 먼저 익혀도 됩니다. INT의 범위와 REAL의 정밀도에는 한계가 있습니다. 실제 변환과 계산 규칙은 대상 환경 문서로 확인합니다.</p>
<h2>선언과 실행부를 구분합니다</h2><pre><code>VAR
    Count : INT := 0;
END_VAR

Count := Count + 1;</code></pre><p>VAR부터 END_VAR까지는 변수 선언부입니다. <code>Count : INT</code>는 ‘Count라는 정수 변수’를, 선언의 <code>:= 0</code>은 초기값을 나타냅니다. 아래의 대입 문장은 실행될 때 현재 Count를 읽어 1을 더하고 다시 Count에 저장합니다. 이 사이트에서는 소스를 다시 적용할 때 초기값으로 시작합니다.</p>
<h2>수학의 등식처럼 읽지 않기</h2><p><code>Count := Count + 1;</code>은 모순된 수학 등식이 아닙니다. ‘지금 Count를 읽기 → 1 더하기 → 새 Count 쓰기’라는 작업 순서입니다. <code>Count = 3</code>은 Count가 3과 같은지 비교하는 식입니다. 대입과 비교를 구분하세요.</p><table><tr><th>실행 전</th><th>계산</th><th>실행 후</th></tr><tr><td>Count=0</td><td>0+1</td><td>Count=1</td></tr><tr><td>Count=1</td><td>1+1</td><td>Count=2</td></tr></table>
<h2>자주 나오는 오류를 일부러 만나기</h2><ol><li>Count를 선언했는데 실행부에 Cout라고 쓰면 서로 다른 이름입니다.</li><li>문장 끝의 세미콜론을 지우고 교육 실행기의 오류를 확인합니다.</li><li>Count의 자료형을 BOOL로 바꿔 숫자 계산과 맞지 않는 이유를 설명합니다.</li></ol><p><strong>완료 기준:</strong> 선언, 초기값, 현재 값, 대입, 비교라는 다섯 단어를 자기 말로 설명할 수 있습니다.</p>`}
];
export const foundationQuizzes=[
{id:'f1',lesson:1,q:'Lamp := Start;는 무엇을 뜻하나요?',options:['Lamp와 Start의 값을 서로 바꾼다','Start의 값을 읽어 Lamp에 넣는다','실제 전등 배선이 자동으로 완성된다'],answer:1,why:':= 오른쪽을 읽고 왼쪽에 저장합니다. 코드 작성과 실제 하드웨어 연결은 별개입니다.'},
{id:'f2',lesson:2,q:'TRUE인 신호는 항상 정상 상태를 뜻하나요?',options:['그렇다','아니다. 신호의 정의에 따라 장애물 있음 등을 뜻할 수 있다','BOOL에는 TRUE가 없다'],answer:1,why:'TRUE/FALSE는 값이며 실제 의미는 신호 명세에 따라 정해집니다.'},
{id:'f3',lesson:3,q:'Count가 2일 때 Count := Count + 1;을 한 번 실행하면?',options:['1','2','3'],answer:2,why:'현재 값 2를 읽고 1을 더한 뒤 결과 3을 Count에 대입합니다.'}
];
