FUNCTION_BLOCK FB_Job
VAR_INPUT
    bStart, bReset, bEnable : BOOL;
    nJobRequest : INT;
    bTargetValid, bAtTarget, bLoadDone, bUnloadDone : BOOL;
END_VAR
VAR_OUTPUT
    stCmd : ST_Command;
    nStep : INT := 0;
    bDone, bFault : BOOL;
END_VAR
VAR
    nJob : INT; // 수락한 작업 번호. 이 인스턴스 내부에 유지.
END_VAR
// 아래부터 구현부
stCmd.bMove := FALSE;
stCmd.bLoad := FALSE;
stCmd.bUnload := FALSE;
bDone := FALSE;
IF bReset AND NOT bStart THEN
    nStep := 0;
    bFault := FALSE;
END_IF;
IF NOT bEnable THEN
    IF (nStep <> 0) AND (nStep <> 40) THEN
        nStep := 900;
        bFault := TRUE;
    END_IF;
ELSE
    CASE nStep OF
    0:
        IF bStart AND NOT bReset THEN
            nJob := nJobRequest;
            nStep := 10;
        END_IF;
    10:
        IF bTargetValid AND (nJob >= 1) AND (nJob <= 3) THEN
            nStep := 20;
        ELSE
            nStep := 900;
            bFault := TRUE;
        END_IF;
    20:
        IF bAtTarget THEN
            IF nJob = 1 THEN
                nStep := 40;
            ELSE
                nStep := 30;
            END_IF;
        ELSE
            stCmd.bMove := TRUE;
        END_IF;
    30:
        IF nJob = 2 THEN
            IF bLoadDone THEN
                nStep := 40;
            ELSE
                stCmd.bLoad := TRUE;
            END_IF;
        ELSIF nJob = 3 THEN
            IF bUnloadDone THEN
                nStep := 40;
            ELSE
                stCmd.bUnload := TRUE;
            END_IF;
        ELSE
            nStep := 900;
            bFault := TRUE;
        END_IF;
    40:
        bDone := TRUE;
    900:
        bFault := TRUE;
    ELSE
        nStep := 900;
        bFault := TRUE;
    END_CASE;
END_IF;
