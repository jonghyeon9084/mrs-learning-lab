# MRS Lab

현재 확인된 BECKHOFF TwinCAT 3 ST를 중심으로, PLC 실행 구조·여러 소스의 참조 추적·모바일로봇 제어를 배우는 기존 개인 학습 웹사이트입니다. GX Works3는 전환 가능성에 대비하는 별도 자료입니다. (현장 정보: 2026-11-11 / 학습 도구 보완: 2026-11-12)

- 사이트: https://jonghyeon9084.github.io/mrs-learning-lab/
- 정적 웹사이트이므로 학습자는 프로그램 설치 없이 브라우저에서 사용할 수 있습니다.
- 회사 소스·배선·미확인 제품 모델을 재현한 프로젝트가 아닙니다.

## 처음 시작하기

1. BECKHOFF 카테고리에서 변수/자료형 → IF/CASE/FOR로 ST 표기를 익힙니다.
2. POU → FB 인스턴스와 `.Q` → TON/TOF/TP·R_TRIG/F_TRIG → Task/GVL을 읽습니다.
3. 변수 출처 추적 화면에서 Declaration(Define)·Read·Write·Call을 세 파일에 걸쳐 확인합니다.
4. 모바일로봇 공통 카테고리에서 상태 머신·센서·QR 도킹·HMI·알람을 실습합니다.
5. Mitsubishi 카테고리는 GX Works3 전환 대비용이며 일정/CPU/범위는 미확인입니다.

Python/C++/ROS2/Nav2 경험을 기준으로 PLC 고유의 호출 방식·상태 수명·데이터 흐름을 설명합니다. 기존 완전 기초 2개 수업은 선택 복습으로 유지했습니다. Siemens 카테고리는 이전 비교 자료와 SCL 초안 접근을 보존합니다.

## 구성

| 영역 | 내용 |
| --- | --- |
| 21개 수업 | TwinCAT ST 기초 2, 회사 코드 해석 7, 로봇 실무 9, GX 대비 1, 선택 복습 2 |
| 코드 연습장 | 조건, 속도 선택, 에지, 상태, 출력 잔류 버그 5개 채점 과제 |
| 가상 PLC | 12개 예제 (기존 7개 ST/SCL, TwinCAT 집중 4개, AMR 통합 1개), 가상 스캔, 변수·타이머 모니터 |
| 코드 연동 이동 | 직접 쓴 Speed/TurnRate/DrivePermit으로 이동·회전. 충돌·목표 지나침·역방향·회전 오류 시각화 |
| AMR 통합 시뮬레이터 | 가상 전후 독립 조향·구동 2모듈, 직진/사선/제자리/R턴, HMI·LiDAR 광선·QR 상태·모터 피드백·LED·충돌·고장 주입 |
| 한국어 해석 | 8개 서술형 문제, 단일 문장부터 GVL/MAIN/FB 다중 소스, 모범 해석·주기 표·답안 저장 |
| 가상 I/O 테이블 | 18행 인터페이스 계약, 생산자/소비자·단위·진단, CSV 다운로드 |
| 복습 | 해설이 있는 26개 문제 |
| 변수 출처 추적 | 교육용 GVL/MAIN/FB 파일, 심볼 선택, Define/Read/Write/Call 필터와 해당 줄 이동 |
| 현장 노트 | 미확인 장비/환경 체크리스트, 로컬 메모, 진도·코드 백업/가져오기, 선택 항목 초기화 |

## 검증 범위

가상 PLC는 이 프로젝트가 작성한 제한된 교육 실행기입니다. Siemens TIA Portal, S7-PLCSIM, Beckhoff TwinCAT 또는 실제 PLC 런타임이 아닙니다. 웹사이트의 구문 분석 성공과 시험 통과는 제조사 컴파일·실기·안전 검증을 의미하지 않습니다.

- 지원: VAR/VAR_INPUT/VAR_OUTPUT/VAR_TEMP, BOOL/INT/DINT/REAL/TIME, 1차원 배열, IF/CASE/FOR, 산술·논리, ABS/MIN/MAX/ATAN/SQRT, TON/TOF/TP, R_TRIG/F_TRIG, IN/PT/Q/ET/CLK 멤버. 이전 SCL의 TON_TIME/IEC_TIMER.TON도 유지.
- 가상 PLC는 한 개 FB 인스턴스를 반복 실행합니다. 사용자 정의 FB/FUNCTION 간 호출, VAR_IN_OUT, STRUCT, Property, GVL 및 제조사 전용 프로젝트·I/O·다중 태스크는 지원하지 않습니다.
- 시간은 가상 스캔 시각입니다. 100ms 주기의 첫 TRUE에서 TON ET=0, 다음 호출부터 100ms씩 증가합니다. 실제 PLC의 비동기 내부 타이머 처리와 같다고 가정하지 않습니다.
- REAL은 JavaScript Number입니다. 실제 32비트 REAL 정밀도·반올림은 재현하지 않습니다. 나눗셈은 실수 나눗셈으로 단순화합니다.
- INT/DINT 범위 초과는 오류로 중단합니다. TIME은 음수 미지원, 최대 2,147,483,647ms입니다.
- TOF/TP는 고정 PT의 호출 시각 모델입니다. 진행 중 PT 변경은 명시적으로 거부합니다. 에지의 이전 CLK는 FALSE로 초기화합니다. 호출 누락 시 이전 출력이 남는 실험을 제공합니다.
- VAR_TEMP는 교육기에서 매 스캔 초기화합니다. 실제 제품별 Temp 규칙과 다를 수 있습니다.
- 정지·Fault·DrivePermit은 일반 로직 모델입니다. 안전 회로·안전 PLC 기능을 대체하지 않습니다.

수업마다 공식 문서 링크, 적용 범위, 검토일을 표시했습니다. 상태 번호·속도·시간·조건은 교육용 가정입니다. 현재 TwinCAT 3 사용은 사용자 확인 정보입니다. HMI/센서의 관찰 사실과 역할 추정은 구분하며, 실제 CPU·장치 모델과 제어 분담은 미확인입니다.

## 개발 환경

런타임 의존성 설치는 필요하지 않습니다. Node.js로 검증하고 Python으로 로컬 정적 서버를 열 수 있습니다.

```powershell
node --test tests/*.test.mjs
python -m http.server 4173 --bind 127.0.0.1 --directory docs
```

브라우저: http://127.0.0.1:4173/

GitHub Pages의 게시 원본은 `main` 브랜치의 `/docs`입니다. `docs/.nojekyll`로 별도 사이트 생성기 없이 서비스합니다.

| 파일 | 역할 |
| --- | --- |
| `docs/foundations.js` | 완전 기초 3개 수업 |
| `docs/content.js` | 기존 수업, 브랜드 분류, 안정적인 수업 ID와 학습 순서 |
| `docs/twincat-content.js` / `docs/twincat-examples.js` | TwinCAT 수업·현장 관찰·주기 표·4개 새 실습 |
| `docs/code-reading.js` / `docs/references.js` | 여러 소스의 심볼 추적 수업과 대화형 코드 지도 |
| `docs/interpret.js` / `docs/amr-learning.js` | 한국어 해석 문제·수업, I/O 표 페이지와 조향 이론 |
| `docs/amr-case.js` | 가상 I/O 계약, 공통 ST 본문과 다중 파일 예제 |
| `docs/amr-world.js` / `docs/amr-ui.js` | 모듈 운동학·센서 기하·고장 주입, HMI·궤적·명령/피드백 표시 |
| `docs/records.js` | 선택한 범위만 초기화하는 순수 데이터 처리 |
| `docs/virtual-plc.js` | 전체 소스 파서·가상 PLC 실행기 |
| `docs/virtual-ui.js` | 소스 편집·적용·스캔·모니터 |
| `docs/engine.js` | 짧은 채점 과제 실행기와 로봇 상태 모델 |
| `docs/app.js` | 수업, 진도, 채점, 현장 노트 |
| `docs/style.css` | 반응형 학습 도구 레이아웃 |
| `tests/` | 정상/오류/경계/상태 유지 검증 |

## 데이터와 라이선스

학습 진도·메모는 이 사이트를 연 브라우저의 localStorage에 저장됩니다. 계정 로그인이나 서버 동기화는 없습니다. 저장 키 `mrs-lab-v1`과 `mrs-plc-drafts`, 기존 수업 ID 1~13 및 과제/복습 ID를 그대로 유지합니다. 표시 순서만 변경하며 기존 완료를 취소하지 않습니다. 재검토가 필요한 수업을 다시 읽어도 기존 답변은 자동 삭제하지 않습니다.

현재 백업 JSON은 가상 PLC 초안(`plcDrafts`)과 한국어 해석 답안(`translationDrafts`)도 포함합니다. 예전 version 1 백업도 가져올 수 있으며 그 파일에 없는 가상 PLC 초안을 지우지 않습니다. 같은 브라우저라도 `localhost`, `127.0.0.1`, 포트가 다른 주소와 공개 GitHub Pages는 서로 다른 저장 영역입니다.

현장 체크리스트 → **이 브라우저 기록 초기화**에서 기본으로 수업 완료·복습 답변·과제 통과만 초기화합니다. 코드/한국어 해석 답안/메모/현장 체크는 별도로 선택해야 지워집니다. 마지막 확인란과 실행 버튼이 있으며 취소할 수 있습니다. 다른 사이트의 localStorage를 지우거나 다른 브라우저 기록을 초기화하지 않습니다. 기능 추가 자체로 기존 기록을 변경하지 않습니다.

Monaco Editor 0.52.2를 `docs/vendor/monaco`에 포함했습니다. 해당 라이선스와 고지는 그 폴더에 있습니다. `scripts/fetch-editor.py`는 npm 공식 패키지의 SHA-512 무결성을 확인하고 같은 버전을 가져옵니다. Google Fonts는 외부에서 선택적으로 로드되며 실패하면 시스템 글꼴을 사용합니다.

## AMR 모델과 검증 기록 (2026-11-12)

- 가상 전후 모듈 간격 0.32m, 바퀴 반지름 0.06m, 조향 속도 90°/s. 기본 원호 반경 0.6m. 현장 치수/성능이 아닙니다.
- 동일 방향/동일 속도는 평행 이동, 앞뒤 반대 조향은 위치에 맞는 회전 벡터를 구성합니다. 차체 yaw, 조향각, 구동 누적각을 구분합니다.
- 명령은 PLC 출력, 움직임은 출력 적용 후의 기하 모델, 센서/진단은 다음 스캔 입력입니다. 정렬 중 구동을 억제하며, 양 모듈의 구름 조건이 불일치하면 명시적으로 진단합니다.
- 전후 각 5개의 LiDAR 광선과 QR 유효성/신선도, 위치 기반 완료를 모델링합니다. 영상 인식·SLAM/Nav2·네트워크 패킷·실제 드라이브·마찰/질량/제동거리·안전 런타임은 재현하지 않습니다.
- 실제 GVL/MAIN/FB 파일 구조는 읽기 자료입니다. 브라우저는 동일 FB 본문 한 인스턴스에 가상 입출력을 연결합니다. 실제 회사 소스와 실장 I/O 주소는 포함하지 않습니다.
- 자동 시험: 정상 도킹, R턴의 반경/각속도, 사선/제자리 운동, 센서 장애·접촉·모터 고착·고장 유지와 복귀, 타이머/에지 경계, 데이터 보존. TwinCAT/GX Works3 컴파일은 수행하지 않았습니다.

검증 결과: `node --test tests/*.test.mjs` 111/111 통과, JavaScript 구문 검사와 `git diff --check` 통과. 브라우저에서 R턴·LiDAR 고장/복귀·한국어 답안 저장 및 기본 초기화 후 보존·390px 반응형 화면을 확인했습니다. 이전 단순 로봇 모델과 기존 ST/SCL 과제도 회귀 시험에 포함됩니다.
