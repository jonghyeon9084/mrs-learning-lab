LearningCell — 가상 학습용 TwinCAT 3 ST 소스 구성
작성: 2026-11-16

회사 제어 소스가 아닙니다. 완성된 TwinCAT 프로젝트(.tsproj/.plcproj)나
장비에 다운로드할 패키지가 아닙니다. TwinCAT 컴파일/실기 검증은 미실시입니다.
ST의 선언과 조건, 호출, 값 전달을 읽기 위한 텍스트 소스 8개입니다.

파일 구조
  DUTs/ST_Hmi.st       화면 요청의 모양
  DUTs/ST_Input.st     입력 피드백의 모양
  DUTs/ST_Command.st   작업 요청 출력의 모양
  DUTs/ST_Output.st    최종 명령/상태 출력의 모양
  GVLs/GVL_Cell.st     전역변수 선언
  POUs/PRG_Learn.st    주기 실행, 입력 전달, 출력 복사
  POUs/FB_Job.st       작업 상태와 이동/상하차 요청
  POUs/FB_Drive.st     일반 속도 명령 결정

TwinCAT 편집기에 대응시키는 법
  타입마다 별도 DUT(STRUCT), GVL_Cell 전역변수 목록, PRG_Learn PROGRAM,
  FB_Job과 FB_Drive FUNCTION_BLOCK을 만듭니다.
  POU 파일은 선언부와 구현부를 함께 표시한 학습용 텍스트입니다.
  '// 아래부터 구현부' 주석부터는 구현부 편집 영역에 해당합니다.
  Library Manager의 Tc2_Standard를 통해 R_TRIG를 사용합니다.
  수업에서는 한 PlcTask에 PRG_Learn을 등록하고 100 ms마다 1회 호출한다고 가정합니다.
  입력은 각 주기 시작에 고정하여 비교합니다. 실제 HMI/I/O 갱신 시점은 구현에 따릅니다.

입력과 출력
  HMI는 stHmi, 센서는 stInput에 대응하지만 실제 바인딩/주소는 없습니다.
  bPermit은 일반 논리 허가이며 인증된 안전 신호라고 정의하지 않았습니다.
  bTargetValid는 외부 경로/목표 유효성 검사 결과를 가정한 입력입니다.
  nJob=1 이동만, 2 이동 후 상차, 3 이동 후 하차입니다.
  시작 수락 순간 nJobRequest를 FB 내부 nJob에 저장합니다.
  FB_Job.nStep: 0 대기, 10 목표 검사, 20 이동, 30 상하차, 40 완료, 900 고장.
  명령 출력은 매 호출 FALSE로 초기화하고 선택 분기에서만 TRUE로 만듭니다.
  nStep을 바꿔도 같은 CASE의 다른 분기를 즉시 실행하지 않습니다.
  완료/고장 상태에서는 Reset 후 새 Start 에지로 재시작합니다.
  Reset과 Start 에지가 동시에 오면 둘 다 수락하지 않습니다.

범위
  브라우저는 고정된 ST 예제와 대응하는 JavaScript 설명 모델을 계산합니다.
  범용 ST 실행기가 아니며, 표시한 ST를 TwinCAT으로 컴파일한 결과가 아닙니다.
  물리 로봇, 경로 생성, 가감속, QR 계산, 모터 버스, 타임아웃, 센서 진단,
  안전 회로는 구현하지 않았습니다. 실제 로봇 운전/안전 제어에 적용하지 않습니다.

읽는 순서
  PRG_Learn 호출 순서 → DUT/GVL 선언 → fbJob 호출 인자 → FB_Job 상태 분기
  → stCmd 출력 → fbDrive 입력 → FB_Drive → 전역 출력 → 피드백 경계.

사이트: https://jonghyeon9084.github.io/mrs-learning-lab/#workflow
공식 문서:
  FB: https://infosys.beckhoff.com/content/1033/tc3_plc_intro/2530279563.html
  STRUCT: https://infosys.beckhoff.com/content/1033/tc3_plc_intro/2529481355.html
  R_TRIG: https://infosys.beckhoff.com/content/1033/tcplclib_tc2_standard/74391563.html
  CASE: https://infosys.beckhoff.com/content/1033/tc3_plc_intro/2528286347.html
