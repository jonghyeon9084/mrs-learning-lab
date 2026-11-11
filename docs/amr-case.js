// Fictional interface specification. No real device addresses or company source.
export const amrInputs=`Start : BOOL;
StopRequest : BOOL;
Reset : BOOL;
Mode : INT;
TravelAngle : REAL := 45.0;
Radius : REAL := 0.6;
QrValid : BOOL := TRUE;
QrFresh : BOOL := TRUE;
LidarValid : BOOL := TRUE;
Bumper : BOOL;
SafetyStop : BOOL;
MotorFault : BOOL;
Obstacle : BOOL;
NearDock : BOOL;
AtDock : BOOL;
SteeringReady : BOOL;
KinematicFault : BOOL;
LidarFront : REAL;
LidarRear : REAL;`;
export const amrOutputs=`State : INT;
DrivePermit : BOOL;
Module1Angle : REAL;
Module2Angle : REAL;
Module1Speed : REAL;
Module2Speed : REAL;
Busy : BOOL;
Done : BOOL;
Fault : BOOL;
BlueLamp : BOOL;
FaultLamp : BOOL;`;
export const amrLocals=`StartEdge : R_TRIG;
DockTimer : TON;
RequestedSpeed : REAL;`;
export const amrBody=`(* Educational sequence: not a safety program. *)
StartEdge(CLK := Start);
DockTimer(IN := State = 20, PT := T#6S);

IF Obstacle OR NOT LidarValid OR KinematicFault OR Bumper OR SafetyStop OR MotorFault THEN
    State := 99;
ELSIF (Mode < 0) OR (Mode > 3) OR
      ((Mode = 3) AND (ABS(Radius) < 0.35)) THEN
    State := 99;
ELSIF StopRequest AND (State <> 99) THEN
    State := 0;
ELSE
    CASE State OF
        0:
            IF StartEdge.Q THEN State := 10; END_IF;
        10:
            IF (Mode = 0) AND NearDock THEN State := 20; END_IF;
        20:
            IF NOT QrValid OR NOT QrFresh OR DockTimer.Q THEN
                State := 99;
            ELSIF AtDock THEN
                State := 30;
            END_IF;
        30: (* Done remains until StopRequest. *)
        99:
            IF Reset AND NOT Start THEN State := 0; END_IF;
    ELSE
        State := 99;
    END_CASE;
END_IF;

(* Steering requests update even while traction is inhibited. *)
RequestedSpeed := 0.0;
Module1Angle := 0.0;
Module2Angle := 0.0;
IF State = 10 THEN
    CASE Mode OF
        0: RequestedSpeed := 0.5;
        1:
            Module1Angle := TravelAngle;
            Module2Angle := TravelAngle;
            RequestedSpeed := 0.3;
        2:
            Module1Angle := 90.0;
            Module2Angle := -90.0;
            RequestedSpeed := 0.12;
        3:
            (* Symmetric front/rear modules, half spacing = 0.16 m.
               Body vx = 0.3 m/s; angles below are degrees. *)
            Module1Angle := ATAN(0.16 / Radius) * 57.295779513;
            Module2Angle := -Module1Angle;
            RequestedSpeed := 0.3 * SQRT(1.0 + (0.16 / Radius) * (0.16 / Radius));
    END_CASE;
ELSIF State = 20 THEN
    RequestedSpeed := 0.15;
END_IF;
DrivePermit := ((State = 10) OR (State = 20)) AND SteeringReady;
IF DrivePermit THEN
    Module1Speed := RequestedSpeed;
    Module2Speed := RequestedSpeed;
ELSE
    Module1Speed := 0.0;
    Module2Speed := 0.0;
END_IF;
Busy := (State = 10) OR (State = 20);
Done := State = 30;
Fault := State = 99;
BlueLamp := DrivePermit;
FaultLamp := Fault;`;
export const amrSample={id:'amr-io',title:'12 · AMR HMI·I/O·조향 실습',stOnly:true,lesson:21,inputs:amrInputs,outputs:amrOutputs,locals:amrLocals,body:amrBody,guide:'소스 적용 후 HMI 시작을 누르고 자동 실행합니다. 자동 도킹 / 사선 이동 / 제자리 회전 / R턴을 정지 상태에서 선택하세요. 실제 회사 구동 구조가 아니라 전후 2개 독립 조향·구동 모듈을 가정한 교육 모델입니다. 요청·센서·출력·모터 피드백을 I/O 표와 대조하세요.'};
export const amrFiles={
 'GVL_Dock · 선언':`{attribute 'qualified_only'}
VAR_GLOBAL
    bStart : BOOL;
    bStop : BOOL;
    bReset : BOOL;
    nMode : INT;
    fTravelAngle : REAL := 45.0;
    fRadius : REAL := 0.6;
    bQrValid : BOOL;
    bQrFresh : BOOL;
    bLidarValid : BOOL;
    bBumper : BOOL;
    bSafetyStop : BOOL;
    bMotorFault : BOOL;
    bObstacle : BOOL;
    bNearDock : BOOL;
    bAtDock : BOOL;
    bSteeringReady : BOOL;
    bKinematicFault : BOOL;
    fLidarFront : REAL;
    fLidarRear : REAL;
    nState : INT;
    bDrivePermit : BOOL;
    fAngle1 : REAL;
    fAngle2 : REAL;
    fSpeed1 : REAL;
    fSpeed2 : REAL;
    bBlueLamp : BOOL;
    bFaultLamp : BOOL;
END_VAR`,
 'MAIN · 선언과 구현':`PROGRAM MAIN
VAR
    fbAmr : FB_AmrTraining;
END_VAR
(* Below goes in MAIN's implementation editor. *)
fbAmr(Start := GVL_Dock.bStart,
      StopRequest := GVL_Dock.bStop,
      Reset := GVL_Dock.bReset,
      Mode := GVL_Dock.nMode,
      TravelAngle := GVL_Dock.fTravelAngle,
      Radius := GVL_Dock.fRadius,
      QrValid := GVL_Dock.bQrValid,
      QrFresh := GVL_Dock.bQrFresh,
      LidarValid := GVL_Dock.bLidarValid,
      Bumper := GVL_Dock.bBumper,
      SafetyStop := GVL_Dock.bSafetyStop,
      MotorFault := GVL_Dock.bMotorFault,
      Obstacle := GVL_Dock.bObstacle,
      NearDock := GVL_Dock.bNearDock,
      AtDock := GVL_Dock.bAtDock,
      SteeringReady := GVL_Dock.bSteeringReady,
      KinematicFault := GVL_Dock.bKinematicFault,
      LidarFront := GVL_Dock.fLidarFront,
      LidarRear := GVL_Dock.fLidarRear);
GVL_Dock.nState := fbAmr.State;
GVL_Dock.bDrivePermit := fbAmr.DrivePermit;
GVL_Dock.fAngle1 := fbAmr.Module1Angle;
GVL_Dock.fAngle2 := fbAmr.Module2Angle;
GVL_Dock.fSpeed1 := fbAmr.Module1Speed;
GVL_Dock.fSpeed2 := fbAmr.Module2Speed;
GVL_Dock.bBlueLamp := fbAmr.BlueLamp;
GVL_Dock.bFaultLamp := fbAmr.FaultLamp;`,
 'FB_AmrTraining · 선언':`FUNCTION_BLOCK FB_AmrTraining
VAR_INPUT
${amrInputs}
END_VAR
VAR_OUTPUT
${amrOutputs}
END_VAR
VAR
${amrLocals}
END_VAR`,
 'FB_AmrTraining · 구현':amrBody
};
// id, symbol, type/unit, origin -> receiver, meaning, update/failure contract
export const ioRows=[
 ['S01','Bumper / SafetyStop','BOOL','가상 접촉·정지 상태 → 일반 시퀀스','접촉 또는 별도 안전 정지의 상태 전달을 가정','교육 입력 TRUE면 Fault. 안전 회로·안전 PLC·STO 기능 구현 아님'],
 ['M00','MotorFault','BOOL','가상 모터 진단 → 시퀀스','조향 고착 또는 구동 고착을 가정','추종 요청 중 고착 0.5s면 진단. 고착 해제 시 진단 해제, 시퀀스 Fault는 복귀 필요. 실제 기준 아님'],
 ['H01','Start / StopRequest / Reset','BOOL','가상 HMI → 시퀀스','시작·일반 정지·고장 복귀 요청','HMI 버튼은 교육기 1스캔 펄스. 실제 HMI는 요청/응답 규약 필요. 비상정지 아님'],
 ['H02','Mode','INT','가상 HMI → 시퀀스','0 도킹 / 1 평행 이동 / 2 제자리 / 3 R턴','정지 상태에서 선택. 실제 모드 번호가 아닌 예제 계약'],
 ['H03','TravelAngle / Radius','REAL · deg / m','가상 HMI → 경로 명령 계산','차체 기준 이동 방향 / 부호 있는 회전반경','교육 R 최소 절댓값 0.35m. 실제 제한값 미확인'],
 ['V01','QrValid','BOOL','카메라 수신 인터페이스 → 시퀀스','목표 QR 측정 결과가 유효하다고 가정','도킹 중 FALSE면 Fault. 실제 카메라 레지스터/좌표 미확인'],
 ['V02','QrFresh','BOOL','수신 갱신 감시 → 시퀀스','측정값이 허용 나이 안에 있다고 가정','도킹 중 FALSE면 Fault. 실제 나이 기준·통신 주기 미확인'],
 ['L01','LidarValid','BOOL','가상 LiDAR 진단 → 시퀀스','측정 채널을 신뢰할 수 있다는 교육용 상태','FALSE면 Fault. OSSD/안전 통신 신호를 재현하지 않음'],
 ['L02','LidarFront / LidarRear','REAL · m','가상 거리 계산 → 모니터','차체 앞/뒤 중심 광선의 거리. 최대 2m','매 가상 주기(기본 100ms)에 측정. 역할은 교육 배치로 실제 LiDAR 2종 역할 미확정'],
 ['L03','Obstacle','BOOL','가상 전후 감지 영역 → 시퀀스','일반 경로 장애물 상태','전후 ±30° 광선 중 거리가 0.55m 미만. 측면 전체 보호 아님. TRUE면 Fault'],
 ['P01','NearDock / AtDock','BOOL','가상 위치 판정 → 시퀀스','목표 거리 0.65m 미만 / 0.12m 이내 및 방향 오차 0.2rad 미만','실제 완료 센서가 아닌 화면 기하학. QR 유효성은 별도 입력'],
 ['M01','SteeringReady','BOOL','가상 조향 모델 → 시퀀스','두 조향각이 각각 명령의 0.5° 이내','교육 정렬 완료. 실제 서보 상태 워드·인포지션 조건 미확인'],
 ['M02','KinematicFault','BOOL','가상 운동학 검사 → 시퀀스','두 구동 모듈의 명령이 강체 운동과 불일치','속도 벡터 조건 불일치 시 이동 억제 후 다음 스캔 Fault'],
 ['M03','Module1Angle / Module2Angle','REAL · deg','시퀀스 → 가상 조향 모터','차체 기준 앞/뒤 모듈 조향 목표','명령과 실제 조향각을 구분. 교육 추종 한계 90°/s'],
 ['M04','Module1Speed / Module2Speed','REAL · m/s','시퀀스 → 가상 구동 모터','바퀴 접선 방향 선속도','RPM이나 PLC 펄스 명령 아님. 서보 인터페이스·기어비는 미설정'],
 ['M05','DrivePermit','BOOL','일반 시퀀스 → 가상 구동','학습 로직의 구동 허가','FALSE이면 교육 모델 속도 0. 실제 STO/안전 정지의 대체물 아님'],
 ['D01','BlueLamp / FaultLamp','BOOL','시퀀스 → 가상 LED','교육용 파랑=구동 허가 / 빨강=Fault','현장 파란 장치가 경고등인지 비전 조명인지는 미확정'],
 ['D02','State / Busy / Done / Fault','INT / BOOL','시퀀스 → 가상 HMI','0 대기, 10 이동, 20 도킹, 30 완료, 99 고장','상태·명령·피드백을 서로 다른 항목으로 표시']
];
export const ioCSV=()=>[['ID','Symbol','Type / Unit','Producer -> Consumer','Meaning','Update / Failure'],...ioRows].map(r=>r.map(x=>'"'+x.replaceAll('"','""')+'"').join(',')).join('\r\n');
