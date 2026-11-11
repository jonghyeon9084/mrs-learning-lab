// Original educational examples. Reviewed against Tc2_Standard documentation;
// executed only in this site's virtual model, not compiled by TwinCAT XAE.
export const memberDeclaration = `PROGRAM MAIN
VAR
    fbTimer : TON;
    fbEdge  : R_TRIG;
    bStart  : BOOL;
    bReady  : BOOL;
END_VAR`;
export const memberBody = `fbTimer(
    IN := bStart,
    PT := T#2S
);

fbEdge(CLK := bStart);

bReady := fbTimer.Q;

IF fbEdge.Q THEN
    // Rising edge detected
END_IF;`;

// t is the call's virtual timestamp, not wall-clock time. 100 ms assumed.
export const memberTrace = [
 [1,0,false,0,false,false,false,0],
 [2,100,true,0,false,true,false,1],
 [3,200,true,100,false,false,false,1],
 [21,2000,true,1900,false,false,false,1],
 [22,2100,true,2000,true,false,true,1],
 [23,2200,false,0,false,false,false,1],
 [24,2300,true,0,false,true,false,2]
];

export const twinSamples = [
 {id:'members',title:'08 · .Q와 FB 인스턴스',stOnly:true,lesson:14,
 guide:'bStart=FALSE로 1스캔 → TRUE로 1스캔. fbEdge.Q만 TRUE입니다. TRUE를 유지하여 10스캔을 두 번 더 누르면 fbTimer.ET=2000ms, bReady=TRUE입니다. FALSE로 1스캔 실행하면 TON은 초기화됩니다. 수업의 MAIN 예제를 입력 조작과 기록을 위해 FB 인터페이스로 옮긴 교육용 변형입니다.',
 inputs:'bStart : BOOL;',outputs:'bReady : BOOL;\nbPulse : BOOL;\ntElapsed : TIME;\nnStarts : INT;',locals:'fbTimer : TON;\nfbEdge : R_TRIG;',
 body:`fbTimer(IN := bStart, PT := T#2S);
fbEdge(CLK := bStart);
bReady := fbTimer.Q;
bPulse := fbEdge.Q;
tElapsed := fbTimer.ET;
IF fbEdge.Q THEN
    nStarts := nStarts + 1;
END_IF;`},
 {id:'timer-modes',title:'09 · TON / TOF / TP 비교',stOnly:true,lesson:15,
 guide:'bSignal=FALSE로 1스캔, TRUE로 1스캔, 다시 FALSE로 1스캔 후 계속 실행하세요. PT=500ms로 고정합니다. TON은 바로 리셋, TOF는 하강 후 500ms 지연, TP는 시작한 펄스를 유지합니다. 시간·초기 조건은 수업의 표와 비교하세요.',
 inputs:'bSignal : BOOL;',outputs:'bOn : BOOL;\nbOff : BOOL;\nbPulse : BOOL;\ntOn : TIME;\ntOff : TIME;\ntPulse : TIME;',locals:'fbOn : TON;\nfbOff : TOF;\nfbPulse : TP;',
 body:`fbOn(IN := bSignal, PT := T#500ms);
fbOff(IN := bSignal, PT := T#500ms);
fbPulse(IN := bSignal, PT := T#500ms);
bOn := fbOn.Q;
bOff := fbOff.Q;
bPulse := fbPulse.Q;
tOn := fbOn.ET;
tOff := fbOff.ET;
tPulse := fbPulse.ET;`},
 {id:'edges',title:'10 · 상승 / 하강 에지',stOnly:true,lesson:15,
 guide:'bSignal을 FALSE → TRUE → TRUE → FALSE → FALSE로, 매번 1스캔 실행하세요. Rise는 두 번째, Fall은 네 번째 호출에서만 TRUE입니다. 입력 변화가 두 호출 사이에 끝나면 검출하지 못할 수 있습니다.',
 inputs:'bSignal : BOOL;',outputs:'bRise : BOOL;\nbFall : BOOL;\nnRises : INT;\nnFalls : INT;',locals:'fbRisingEdge : R_TRIG;\nfbFallingEdge : F_TRIG;',
 body:`fbRisingEdge(CLK := bSignal);
fbFallingEdge(CLK := bSignal);
bRise := fbRisingEdge.Q;
bFall := fbFallingEdge.Q;
IF bRise THEN nRises := nRises + 1; END_IF;
IF bFall THEN nFalls := nFalls + 1; END_IF;`},
 {id:'call-order',title:'11 · 호출 전후와 호출 누락',stOnly:true,lesson:14,
 guide:'bStart=TRUE, bCall=TRUE로 1스캔: bBefore=FALSE, bAfter=TRUE. bCall만 FALSE로 바꾸고 1스캔: 호출을 건너뛰어 Q가 TRUE로 남습니다. bCall을 다시 TRUE로 바꿔 실행하면 Q=FALSE. 호출하지 않아도 에지 Q가 자동으로 사라진다는 오해를 확인하는 고의 오류 예제입니다.',
 inputs:'bStart : BOOL;\nbCall : BOOL := TRUE;',outputs:'bBefore : BOOL;\nbAfter : BOOL;',locals:'fbEdge : R_TRIG;',
 body:`bBefore := fbEdge.Q;
IF bCall THEN
    fbEdge(CLK := bStart);
END_IF;
bAfter := fbEdge.Q;`}
];
