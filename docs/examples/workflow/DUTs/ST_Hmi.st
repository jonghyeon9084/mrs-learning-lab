TYPE ST_Hmi :
STRUCT
    bStart : BOOL;
    bReset : BOOL;
    bSemi : BOOL;
    nJob : INT := 2; // 1: 이동, 2: 상차, 3: 하차
END_STRUCT
END_TYPE
