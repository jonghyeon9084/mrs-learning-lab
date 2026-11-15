PROGRAM PRG_Learn
VAR
    fbStart : R_TRIG;
    fbReset : R_TRIG;
    fbJob : FB_Job;
    fbDrive : FB_Drive;
    bEnable : BOOL;
END_VAR
// 아래부터 구현부. 한 Task에서 매 주기 한 번 호출한다고 가정.
fbStart(CLK := GVL_Cell.stHmi.bStart);
fbReset(CLK := GVL_Cell.stHmi.bReset);
bEnable := GVL_Cell.stHmi.bSemi
    AND GVL_Cell.stInput.bPermit
    AND GVL_Cell.stInput.bDriveReady
    AND NOT GVL_Cell.stInput.bObstacle;
fbJob(
    bStart := fbStart.Q,
    bReset := fbReset.Q,
    bEnable := bEnable,
    nJobRequest := GVL_Cell.stHmi.nJob,
    bTargetValid := GVL_Cell.stInput.bTargetValid,
    bAtTarget := GVL_Cell.stInput.bAtTarget,
    bLoadDone := GVL_Cell.stInput.bLoadDone,
    bUnloadDone := GVL_Cell.stInput.bUnloadDone
);
fbDrive(
    bEnable := bEnable,
    bMove := fbJob.stCmd.bMove,
    bAtTarget := GVL_Cell.stInput.bAtTarget,
    bFault := fbJob.bFault
);
GVL_Cell.stOutput.rSpeed_mps := fbDrive.rSpeed_mps;
GVL_Cell.stOutput.bLoad := bEnable AND fbJob.stCmd.bLoad;
GVL_Cell.stOutput.bUnload := bEnable AND fbJob.stCmd.bUnload;
GVL_Cell.stOutput.bDone := fbJob.bDone;
GVL_Cell.stOutput.bFault := fbJob.bFault;
