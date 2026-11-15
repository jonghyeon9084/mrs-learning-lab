// Fixed educational example, not company code or a TwinCAT runtime.
// The JS walkthrough below models the displayed ST; it does not compile ST.
export const flowSources = {
 types: {name:'DUTs · 타입별로 별도 DUT 생성',code:`TYPE ST_Hmi :
STRUCT
    bStart : BOOL;
    bReset : BOOL;
    bSemi : BOOL;
    nJob : INT := 2; // 1: 이동, 2: 상차, 3: 하차
END_STRUCT
END_TYPE

TYPE ST_Input :
STRUCT
    bPermit : BOOL;
    bDriveReady : BOOL;
    bObstacle : BOOL;
    bTargetValid : BOOL;
    bAtTarget : BOOL;
    bLoadDone : BOOL;
    bUnloadDone : BOOL;
END_STRUCT
END_TYPE

TYPE ST_Command :
STRUCT
    bMove : BOOL;
    bLoad : BOOL;
    bUnload : BOOL;
END_STRUCT
END_TYPE

TYPE ST_Output :
STRUCT
    rSpeed_mps : REAL;
    bLoad : BOOL;
    bUnload : BOOL;
    bDone : BOOL;
    bFault : BOOL;
END_STRUCT
END_TYPE`},
 gvl:{name:'GVL_Cell · 전역변수',code:`{attribute 'qualified_only'}
VAR_GLOBAL
    stHmi : ST_Hmi;
    stInput : ST_Input;
    stOutput : ST_Output;
END_VAR
// 교육 모델이 HMI와 센서 입력을 공급합니다.
// 실제 I/O 주소, ADS 연결, 안전 회로는 정의하지 않습니다.`},
 main:{name:'PRG_Learn · 주기 호출 프로그램',code:`PROGRAM PRG_Learn
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
GVL_Cell.stOutput.bFault := fbJob.bFault;`},
 job:{name:'FB_Job · 작업 상태 머신',code:`FUNCTION_BLOCK FB_Job
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
END_IF;`},
 drive:{name:'FB_Drive · 일반 속도 명령',code:`FUNCTION_BLOCK FB_Drive
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
// 0.3 m/s는 수업에서 정한 값. 실제 모터 제어/안전 정지 아님.`}
};
export function sourceSpan(file,first,last=first){
 const lines=flowSources[file].code.split('\n');
 const start=lines.findIndex(s=>s.trim()===first.trim());
 const end=lines.findIndex((s,i)=>i>=start&&s.trim()===last.trim());
 if(start<0||end<start)throw new Error('추적 구간을 찾을 수 없음: '+file+' '+first);
 return {file,line:start+1,endLine:/^\d+:$/.test(last.trim())&&end>start?end:end+1};
}
const healthy={start:false,reset:false,semi:true,permit:true,ready:true,obstacle:false,target:true,arrived:false,loaded:false,unloaded:false,job:2};
export const flowScenarios=[
 {id:'load',name:'정상 · 이동 후 상차',why:'시작을 수락한 주기와 이동 명령이 나오는 주기, 도착과 상차 명령의 주기를 구분합니다.',steps:[{}, {start:true}, {start:false}, {}, {arrived:true}, {}, {loaded:true}, {}]},
 {id:'unload',name:'정상 · 이동 후 하차',why:'같은 FB 코드를 사용해도 수락한 작업 번호 nJob=3이면 다른 출력을 씁니다.',steps:[{job:3}, {start:true}, {start:false}, {}, {arrived:true}, {}, {unloaded:true}, {}]},
 {id:'held',name:'막힘 · 허가 전부터 버튼을 누름',why:'Start가 TRUE인 것과 시작 에지가 TRUE인 것은 다릅니다. 허가가 뒤늦게 와도 새 에지가 없으면 시작하지 않습니다.',steps:[{permit:false}, {start:true}, {permit:true}, {}, {start:false}, {start:true}, {start:false}, {}]},
 {id:'obstacle',name:'중단 · 이동 중 장애물',why:'허가를 잃으면 작업은 900에 남습니다. 장애물을 치우는 것만으로 자동 재출발하지 않습니다.',steps:[{}, {start:true}, {start:false}, {}, {obstacle:true}, {obstacle:false}, {reset:true}, {reset:false,start:true}, {start:false}, {}]},
 {id:'invalid',name:'거부 · 목표가 유효하지 않음',why:'시작 수락 이후에도 목표 검사에서 거부될 수 있습니다. nStep=10은 이동 중이라는 뜻이 아닙니다.',steps:[{target:false}, {start:true}, {start:false}, {}, {target:true}, {reset:true}, {reset:false,start:true}, {start:false}, {}]},
 {id:'snapshot',name:'값 전달 · 작업 중 HMI 번호 변경',why:'수락한 nJob을 유지하므로 HMI 번호를 3으로 바꿔도 현재 상차 작업은 하차로 변하지 않습니다.',steps:[{}, {start:true}, {start:false,job:3}, {}, {arrived:true}, {}, {loaded:true}, {}]}
];
const inputNames={start:'stHmi.bStart',reset:'stHmi.bReset',semi:'stHmi.bSemi',job:'stHmi.nJob',permit:'stInput.bPermit',ready:'stInput.bDriveReady',obstacle:'stInput.bObstacle',target:'stInput.bTargetValid',arrived:'stInput.bAtTarget',loaded:'stInput.bLoadDone',unloaded:'stInput.bUnloadDone'};
export const showValue=v=>typeof v==='boolean'?(v?'TRUE':'FALSE'):String(v);
export function runFlowScenario(id){
 const scenario=flowScenarios.find(s=>s.id===id)||flowScenarios[0];
 let input={...healthy},previousStart=false,previousReset=false;
 const v={'fbStart.Q':false,'fbReset.Q':false,bEnable:false,'fbJob.nStep':0,'fbJob.nJob':0,'fbJob.bFault':false,'fbJob.bDone':false,'fbJob.stCmd.bMove':false,'fbJob.stCmd.bLoad':false,'fbJob.stCmd.bUnload':false,'fbDrive.rSpeed_mps':0,'GVL_Cell.stOutput.rSpeed_mps':0,'GVL_Cell.stOutput.bLoad':false,'GVL_Cell.stOutput.bUnload':false,'GVL_Cell.stOutput.bDone':false,'GVL_Cell.stOutput.bFault':false};
 const scans=[];
 scenario.steps.forEach((patch,index)=>{
  const before={...v};input={...input,...patch};const events=[];
  const emit=(file,first,last,title,why,reads,write={})=>{
   const changes=Object.entries(write).map(([name,after])=>({name,before:v[name],after}));Object.assign(v,write);
   events.push({...sourceSpan(file,first,last),title,why,reads,changes,values:{...v}});
  };
  const edge=input.start&&!previousStart,reset=input.reset&&!previousReset;
  emit('main','fbStart(CLK := GVL_Cell.stHmi.bStart);','fbReset(CLK := GVL_Cell.stHmi.bReset);','① 화면값을 에지로 바꾸기','R_TRIG 호출 결과 Q는 이번 호출에서 FALSE→TRUE 변화를 검출했는지입니다. 버튼 TRUE를 계속 유지하는 것과 구분하세요.',{'GVL_Cell.stHmi.bStart':input.start,'이전 호출의 CLK':previousStart,'GVL_Cell.stHmi.bReset':input.reset},{'fbStart.Q':edge,'fbReset.Q':reset});
  previousStart=input.start;previousReset=input.reset;
  const enable=input.semi&&input.permit&&input.ready&&!input.obstacle;
  emit('main','bEnable := GVL_Cell.stHmi.bSemi','AND NOT GVL_Cell.stInput.bObstacle;','② 운전 조건 평가','AND로 묶인 네 항목이 모두 만족돼야 bEnable이 TRUE입니다. bStart는 이 식에 포함되지 않습니다.',{'bSemi':input.semi,'bPermit':input.permit,'bDriveReady':input.ready,'NOT bObstacle':!input.obstacle},{bEnable:enable});
  emit('main','fbJob(','bUnloadDone := GVL_Cell.stInput.bUnloadDone','③ 호출 경계를 넘어 입력 전달','왼쪽 bStart는 FB_Job의 VAR_INPUT, 오른쪽 fbStart.Q는 PRG_Learn에 있는 에지 인스턴스의 출력입니다. 호출 시 값을 넘기며, 같은 이름이라고 같은 메모리는 아닙니다.',{'fbStart.Q → fbJob.bStart':edge,'bEnable → fbJob.bEnable':enable,'stHmi.nJob → nJobRequest':input.job});
  emit('job','stCmd.bMove := FALSE;','bDone := FALSE;','④ 이번 호출의 명령을 먼저 해제','nStep과 nJob은 초기화하지 않습니다. 명령만 FALSE로 지운 뒤 선택된 분기에서 필요한 명령을 다시 씁니다. 이 대입들이 없으면 이전 TRUE가 남을 수 있습니다.',{'이전 nStep':v['fbJob.nStep']},{'fbJob.stCmd.bMove':false,'fbJob.stCmd.bLoad':false,'fbJob.stCmd.bUnload':false,'fbJob.bDone':false});
  emit('job','IF bReset AND NOT bStart THEN','END_IF;','⑤ 복귀 조건 확인',reset&&!edge?'복귀 에지가 있고 시작 에지가 없으므로 대기 상태로 돌아갑니다.':'복귀 조건이 거짓이므로 nStep과 bFault는 이 구간에서 바뀌지 않습니다.',{bReset:reset,'NOT bStart':!edge},reset&&!edge?{'fbJob.nStep':0,'fbJob.bFault':false}:{});
  const step=v['fbJob.nStep'];
  if(!enable){
   const trip=step!==0&&step!==40;
   emit('job','IF NOT bEnable THEN','ELSE','⑥ 허가 없음 · CASE 진입 안 함',trip?'작업 중 허가를 잃어 nStep=900, Fault=TRUE로 바꿉니다. 이번 호출의 명령은 FALSE입니다.':'대기/완료 상태여서 새 고장은 만들지 않지만 CASE를 실행하지 않습니다. 시작 에지는 저장되지 않고 지나갑니다.',{'NOT bEnable':true,'nStep <> 0':step!==0,'nStep <> 40':step!==40},trip?{'fbJob.nStep':900,'fbJob.bFault':true}:{});
  }else if(step===0){
   emit('job','0:','10:','⑥ CASE 0 · 시작 수락',edge&&!reset?'작업 번호를 내부 nJob에 복사하고 nStep=10으로 바꿉니다. 같은 CASE의 10번 분기로 즉시 이동하지 않습니다.':'시작 에지가 없거나 Reset도 눌려 있어 대기합니다. bEnable만 TRUE라고 시작하지 않습니다.',{bStart:edge,'NOT bReset':!reset,nJobRequest:input.job},edge&&!reset?{'fbJob.nJob':input.job,'fbJob.nStep':10}:{});
  }else if(step===10){
   const valid=input.target&&v['fbJob.nJob']>=1&&v['fbJob.nJob']<=3;
   emit('job','10:','20:','⑥ CASE 10 · 목표와 작업 검사',valid?'목표 유효와 작업 번호 범위를 확인해 nStep=20을 준비합니다. Move 명령은 아직 FALSE입니다.':'목표 또는 작업 번호가 유효하지 않아 고장 상태로 갑니다. 실제 경로 계산 알고리즘은 이 예제에 없습니다.',{bTargetValid:input.target,'nJob >= 1':v['fbJob.nJob']>=1,'nJob <= 3':v['fbJob.nJob']<=3},valid?{'fbJob.nStep':20}:{'fbJob.nStep':900,'fbJob.bFault':true});
  }else if(step===20){
   emit('job','20:','30:','⑥ CASE 20 · 이동 또는 도착 처리',input.arrived?'도착 피드백이 TRUE라 이동 명령은 FALSE로 유지됩니다. 이동 전용은 40, 상하차 작업은 30을 준비합니다.':'도착 피드백이 아직 FALSE라 stCmd.bMove를 TRUE로 씁니다. 실제 속도 명령은 다음 FB_Drive가 결정합니다.',{bAtTarget:input.arrived,'nJob = 1':v['fbJob.nJob']===1},input.arrived?{'fbJob.nStep':v['fbJob.nJob']===1?40:30}:{'fbJob.stCmd.bMove':true});
  }else if(step===30){
   const job=v['fbJob.nJob'],done=job===2?input.loaded:input.unloaded;
   emit('job','30:','40:','⑥ CASE 30 · 상차 / 하차 분기',job===2||job===3?(done?'해당 완료 피드백이 TRUE여서 명령을 내리지 않고 nStep=40으로 바꿉니다. bDone은 다음 호출에서 TRUE가 됩니다.':'수락한 nJob에 해당하는 명령만 TRUE로 씁니다. 현재 HMI 작업 번호가 아니라 내부에 저장한 nJob을 읽습니다.'):'허용하지 않은 작업 번호이므로 고장 상태로 갑니다.',{'내부 nJob':job,bLoadDone:input.loaded,bUnloadDone:input.unloaded},job!==2&&job!==3?{'fbJob.nStep':900,'fbJob.bFault':true}:done?{'fbJob.nStep':40}:{[job===2?'fbJob.stCmd.bLoad':'fbJob.stCmd.bUnload']:true});
  }else{
   emit('job',step===40?'40:':'900:',step===40?'bDone := TRUE;':'bFault := TRUE;','⑥ CASE '+step,step===40?'이번 호출에서 완료 출력을 TRUE로 씁니다. 재시작하려면 이 예제에서는 Reset 후 새 Start 에지가 필요합니다.':'Fault 상태를 유지합니다. 입력 정상화만으로 상태가 0으로 돌아가는 대입은 없습니다.',{nStep:step},step===40?{'fbJob.bDone':true}:{'fbJob.bFault':true});
  }
  emit('main','fbDrive(','bFault := fbJob.bFault','⑦ FB에서 돌아와 다음 FB 호출','fbJob 호출이 끝난 뒤 출력을 읽으므로 이번 호출에서 계산한 Move와 Fault가 전달됩니다. 호출보다 먼저 읽었다면 이전 호출 결과를 읽을 수 있습니다.',{'fbJob.stCmd.bMove → bMove':v['fbJob.stCmd.bMove'],'fbJob.bFault → bFault':v['fbJob.bFault'],'bEnable':enable});
  const moving=enable&&v['fbJob.stCmd.bMove']&&!input.arrived&&!v['fbJob.bFault'];
  emit('drive','rSpeed_mps := 0.0;','END_IF;','⑧ 최종 속도 조건 평가',moving?'네 조건을 만족해 교육용 속도 명령 0.3 m/s를 씁니다. 실제 속도를 측정한 값이 아닙니다.':'한 조건 이상이 거짓이므로 기본값 0.0을 유지합니다. 앞 단계의 Move 요청과 최종 구동 명령을 구분하세요.',{bEnable:enable,bMove:v['fbJob.stCmd.bMove'],'NOT bAtTarget':!input.arrived,'NOT bFault':!v['fbJob.bFault']},{'fbDrive.rSpeed_mps':moving?0.3:0});
  emit('main','GVL_Cell.stOutput.rSpeed_mps := fbDrive.rSpeed_mps;','GVL_Cell.stOutput.bFault := fbJob.bFault;','⑨ 전역 출력으로 복사 · 이번 주기 종료','출력 변수에 명령을 쓴 것까지 확인했습니다. 실제 통신/드라이브 전달과 물리 동작은 별도 확인 대상입니다. 다음 주기에는 입력을 다시 읽고, 같은 FB 인스턴스의 상태를 이어갑니다.',{'fbDrive.rSpeed_mps':v['fbDrive.rSpeed_mps'],'bEnable':enable},{'GVL_Cell.stOutput.rSpeed_mps':v['fbDrive.rSpeed_mps'],'GVL_Cell.stOutput.bLoad':enable&&v['fbJob.stCmd.bLoad'],'GVL_Cell.stOutput.bUnload':enable&&v['fbJob.stCmd.bUnload'],'GVL_Cell.stOutput.bDone':v['fbJob.bDone'],'GVL_Cell.stOutput.bFault':v['fbJob.bFault']});
  scans.push({number:index+1,input:Object.fromEntries(Object.entries(input).map(([k,x])=>['GVL_Cell.'+inputNames[k],x])),before,events,after:{...v}});
 });
 return scans;
}
