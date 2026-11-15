FUNCTION_BLOCK FB_Drive
VAR_INPUT
    bEnable, bMove, bAtTarget, bFault : BOOL;
END_VAR
VAR_OUTPUT
    rSpeed_mps : REAL;
END_VAR
// 아래부터 구현부
rSpeed_mps := 0.0;
IF bEnable AND bMove AND NOT bAtTarget AND NOT bFault THEN
    rSpeed_mps := 0.3;
END_IF;
// 0.3 m/s는 수업에서 정한 값. 실제 모터 제어/안전 정지 아님.
