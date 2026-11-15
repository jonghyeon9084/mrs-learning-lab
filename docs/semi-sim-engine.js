// Executable teaching model. Selected PLC decisions are reproduced; the plant,
// HMI binding, readiness, path-search timing and drive dynamics are assumptions.
// No ST evaluation, network, hardware connection or arbitrary code execution.
export function routeBetween(nodes,links,start,end,available=true){
 if(!available||!nodes.some(n=>n.id===start)||!nodes.some(n=>n.id===end))return null;
 const cost=new Map([[start,0]]),previous=new Map(),pending=new Set(nodes.map(n=>n.id));
 while(pending.size){let at=null;for(const n of pending)if(cost.has(n)&&(at===null||cost.get(n)<cost.get(at)))at=n;if(at===null)break;pending.delete(at);if(at===end)break;
  // The source's search examines slots 1..9 and stops at the first empty slot.
  for(let slot=1;slot<=9;slot++){const link=links.find(l=>l.id===at*10+slot);if(!link)break;if(!pending.has(link.end))continue;const c=cost.get(at)+link.distance;if(c<(cost.get(link.end)??Infinity)){cost.set(link.end,c);previous.set(link.end,at);}}
 }
 if(!cost.has(end))return null;const path=[end];while(path[0]!==start){const n=previous.get(path[0]);if(n===undefined||path.length>nodes.length)return null;path.unshift(n);}return path;
}
const clone=v=>JSON.parse(JSON.stringify(v));
const angleDelta=(target,current)=>((target-current+540)%360)-180;
export class SemiSimulation{
 constructor(config){
  this.config=config;this.nodes=clone(config.nodes);this.links=clone(config.links);this.dt=100;
  const first=this.nodes[0];if(!first)throw new Error('실습 노드가 없습니다.');
  this.inputs={semi:false,test:true,activeRequest:false,startRequest:false,holdStart:false,stop:false,error:false,ready:true,steering:true,feedback:true,axes:true,mapAvailable:true,dest:this.nodes[1]?.id??first.id};
  this.v={semi:false,active:false,activeSw:false,startSw:false,test:true,stop:false,error:0,mainStep:0,readyStep:0,moveActive:false,moveStep:0,renew:false,pathComplete:false,commandStart:false,pathError:false,conversionError:false,commandType:0,destination:0,currentNode:first.id,currentIndex:1,dataList:[],path:[],conversionNodes:[],performed:0,x:first.x,y:first.y,wheelFront:0,wheelRear:0,targetAngle:0,targetX:first.x,targetY:first.y,speed:0,actualSpeed:0,timerIn:false,timerET:0,timerQ:false,scan:0,timeMs:0};
  this.pendingPath=false;this.lastActive=false;this.lastMoveActive=false;this.modeFall=false;this.block=null;this.requestFault=null;this.events=[];this.history=[];this.iterator=null;this.lastEvent=null;
 }
 input(key,value){if(!Object.hasOwn(this.inputs,key))throw new Error('알 수 없는 HMI 입력');if(key==='dest'){if(!Number.isInteger(value))throw new Error('노드 번호 오류');}else if(typeof value!=='boolean')throw new Error('BOOL 입력 오류');this.inputs[key]=value;}
 snapshot(){return clone(this.v);}
 event(code,why,reads={},writes={},kind='source'){
  const changes=[];for(const [key,value] of Object.entries(writes)){const before=clone(this.v[key]??null);this.v[key]=clone(value);if(JSON.stringify(before)!==JSON.stringify(value))changes.push({key,before,after:clone(value)});}
  const event={code,why,reads:clone(reads),changes,kind,scan:this.v.scan,snapshot:this.snapshot()};this.lastEvent=event;this.events.push(event);if(this.events.length>120)this.events.shift();this.history.push(event);if(this.history.length>160)this.history.shift();return event;
 }
 blocked(code,why,reads){this.block={code,why,reads:clone(reads)};}
 *cycle(){
  const v=this.v,i={...this.inputs};this.inputs.activeRequest=false;this.inputs.startRequest=false;this.events=[];this.block=this.requestFault;v.scan++;v.timeMs+=this.dt;
  yield this.event('hmi','HMI 버튼/가상 센서의 현재 값을 이번 100ms 교육 주기의 입력으로 읽습니다.',{}, {activeSw:i.activeRequest,startSw:i.startRequest||i.holdStart,test:i.test,stop:i.stop,error:i.error?1:0},'model');
  const semi=i.semi&&i.test,previousSemi=v.semi;
  yield this.event('modeCheck','Semi-Auto 선택 요청과 Test 조건을 AND로 검사합니다.',{semiRequest:i.semi,test:i.test,result:semi});
  yield this.event(semi?'modeWrite':'modeClear',semi?'Semi-Auto 모드 결과를 TRUE로 씁니다.':'이 교육 시나리오에서 Semi-Auto 결과는 FALSE입니다. Auto/Manual/Pendant 운전은 모델 범위 밖입니다.',{}, {semi});
  if(!semi)this.blocked('modeCheck',i.semi?'Test 조건이 FALSE라 Semi-Auto 분기에 들어가지 못했습니다.':'HMI의 Semi-Auto 선택 버튼을 눌러 모드를 요청하세요.',{semiRequest:i.semi,test:i.test});
  const permit=semi&&!this.modeFall&&(v.activeSw||v.active)&&!i.stop&&!i.error;
  yield this.event('activeCheck','모드·모드 하강 펄스·요청 또는 기존 Active·정지·오류 조건을 검사합니다. Reset_CAN은 이 모델에서 FALSE로 고정합니다.',{semi,modeFall:this.modeFall,activeRequest:v.activeSw,previousActive:v.active,stop:i.stop,error:i.error,result:permit});
  yield this.event(permit?'activeWrite':'activeClear',permit?'운전 허가를 유지하고 허가 요청을 소비합니다.':'운전 허가를 FALSE로 씁니다.',{},permit?{active:true,activeSw:false}:{active:false});
  this.modeFall=previousSemi&&!semi;
  if(semi&&!permit)this.blocked('activeCheck',i.stop?'정지 요청이 켜져 있습니다. 정지 해제 후 운전 허가를 다시 요청하세요.':i.error?'오류 조건이 켜져 있어 Active가 해제됐습니다.':this.modeFall?'모드 전환 조건을 확인하세요.':'운전 허가 버튼을 눌러 Active를 요청하세요.',{stop:i.stop,error:i.error,activeRequest:i.activeRequest,active:v.active});
  // Auto_Main consumes the previous cycle's Semi_Auto_Part output FIRST.
  yield this.event('consume','Auto_Main이 뒤쪽 Semi_Auto_Part가 지난 주기에 만든 시작 비트를 읽습니다.',{commandStart:v.commandStart});
  if(v.commandStart){
   const path=v.conversionNodes,chosen=[];let valid=path.length>0&&path[0]===v.currentNode;
   for(const id of path){const n=this.nodes.find(n=>n.id===id);if(!n||!n.x||!n.y||!n.type)valid=false;}
   for(let n=1;n<path.length;n++){const l=this.links.find(l=>l.id>path[n-1]*10&&l.id<=path[n-1]*10+9&&l.end===path[n]);if(!l)valid=false;else chosen.push(l.id);}
   yield this.event('conversion','노드 목록의 데이터와 인접 링크를 검사하여 링크 번호 목록으로 변환합니다. 이 모델은 Move 종류 3만 처리합니다.',{nodes:path,valid}, {conversionError:!valid});
   if(valid)yield this.event('register','변환 완료 결과를 이번 명령의 종류·목적지·링크 목록으로 복사합니다.',{}, {commandType:3,destination:path.at(-1),dataList:chosen});
   else {this.blocked('conversion','노드 좌표·종류 또는 인접 링크 검사를 통과하지 못했습니다.',{path});this.requestFault=this.block;}
  }
  yield this.event('moveClear','Auto_Main은 하위 작업의 Active를 기본 FALSE로 놓고 이번 CASE에서 다시 정합니다.',{}, {moveActive:false});
  if(v.active&&!this.lastActive)yield this.event('mainActivate','Semi-Auto 운전 허가의 상승을 감지하여 명령 정리 단계 100으로 갑니다.',{}, {mainStep:100});
  if(!v.active)yield this.event('mainInactive','Active가 없으면 메인 단계를 0으로 돌리고 수행 횟수를 지웁니다.',{}, {mainStep:0,performed:0});
  this.lastActive=v.active;
  const branch=v.mainStep;
  yield this.event('mainCase','현재 Step 값으로 CASE의 분기 하나를 선택합니다. 분기 안에서 Step을 바꿔도 새 CASE 분기를 즉시 실행하지 않습니다.',{branch});
  if(branch===100){yield this.event('mainClear','이전 명령을 지우고 경로 목록의 순서를 1로 초기화합니다.',{}, {commandType:0,destination:0,dataList:[],currentIndex:1});if(v.active)yield this.event('mainReadySelect','첫 작업이면 준비 단계 1, 수행 이력이 있으면 대기 단계 2를 선택합니다.',{performed:v.performed},{mainStep:v.performed===0?1:2});}
  else if(branch===1){yield this.event('readyCheck','준비 완료 상태 99인지 확인합니다.',{readyStep:v.readyStep});if(v.readyStep===99)yield this.event('readyDone','준비가 끝났으므로 명령 대기 단계 2로 갑니다.',{}, {mainStep:2});else this.blocked('readyCheck','준비 완료 피드백이 아직 99가 아닙니다. 가상 준비 완료 입력을 확인하세요.',{readyStep:v.readyStep});}
  else if(branch===2){yield this.event('commandCheck','등록된 Move 종류 3과 0이 아닌 목적지를 확인합니다.',{commandType:v.commandType,destination:v.destination});if(v.commandType===3&&v.destination!==0)yield this.event('dispatch','메인 Step을 3으로 바꿉니다. 이동 Active는 다음 CASE 평가에서 켜집니다.',{}, {mainStep:3});}
  else if(branch===3){if(v.commandType===3)yield this.event('moveEnable','Move 명령이므로 이동 작업의 Active를 TRUE로 씁니다.',{}, {moveActive:true});if(v.moveStep===99)yield this.event('mainComplete','이동 작업의 완료 99를 읽어 메인 Step도 99로 바꿉니다.',{}, {mainStep:99});}
  else if(branch===99)yield this.event('count','완료 횟수를 늘리고 다음 평가에서 명령을 정리하도록 100으로 갑니다.',{}, {performed:v.performed+1,mainStep:100});
  yield this.event('readyModel','Auto_Ready의 장치별 처리 대신 가상 준비 완료 입력으로 Ready.Step을 공급합니다.',{readyInput:i.ready},{readyStep:i.ready?99:0},'model');
  if(!v.moveActive){yield this.event('moveReset','가상 이동 담당자가 비활성 상태로 돌아갑니다. 속도 출력도 0으로 만듭니다.',{}, {moveStep:0,speed:0},'model');}
  else if(!this.lastMoveActive){yield this.event('moveInit','이동을 시작합니다. 차체 방향 정렬·도킹 분기는 단순화하고 조향 준비 단계로 진입합니다.',{}, {moveStep:v.currentNode===v.destination?99:5},'model');}
  this.lastMoveActive=v.moveActive;
  let link=this.links.find(l=>l.id===v.dataList[v.currentIndex-1]);let target=this.nodes.find(n=>n.id===link?.end);
  if(v.moveStep===5&&target){
   const angle=(Math.atan2(target.y-v.y,target.x-v.x)*180/Math.PI+360)%360;
   yield this.event('steerModel','현재 경로의 끝 노드 좌표로 가상 바퀴 목표각을 계산합니다. 실제 FB의 오프셋·각도계·기구 계산을 대체한 지도 기준 각도입니다.',{link:link.id,end:link.end},{targetX:target.x,targetY:target.y,targetAngle:angle,speed:0},'model');
   const aligned=Math.abs(angleDelta(v.targetAngle,v.wheelFront))<1&&Math.abs(angleDelta(v.targetAngle,v.wheelRear))<1&&i.axes;
   yield this.event('steerCheck','앞·뒤 바퀴의 목표-현재각 오차와 상부축 조건을 확인합니다.',{frontError:angleDelta(v.targetAngle,v.wheelFront),rearError:angleDelta(v.targetAngle,v.wheelRear),axes:i.axes,result:aligned});
   if(aligned)yield this.event('steerDone','조향 조건이 충족되어 Step을 7로 씁니다. 아래 독립 IF Step=7도 이번 호출에서 실행될 수 있습니다.',{}, {moveStep:7});
   else this.blocked('steerCheck',!i.axes?'상부축 목표 도달 입력이 FALSE입니다.':!i.steering?'조향 피드백을 끈 상태라 바퀴 현재각이 목표를 따라가지 못합니다.':'바퀴를 목표각으로 돌리는 중입니다. 오차가 1° 미만이 될 때까지 기다립니다.',{frontError:angleDelta(v.targetAngle,v.wheelFront),rearError:angleDelta(v.targetAngle,v.wheelRear)});
  }
  if(v.moveStep===7&&target){
   yield this.event('driveModel','현재 링크의 속도 설정을 mm/s로 바꾸어 가상 주행 출력에 적용합니다. 실제 주행 FB·가감속·드라이브 통신을 대체한 등속 모델입니다.',{link:link.id,speed_mpm:link.speed},{targetX:target.x,targetY:target.y,speed:link.speed*1000/60},'model');
   const error=Math.hypot(v.targetX-v.x,v.targetY-v.y),timerIn=error<5,et=timerIn?(v.timerIn?Math.min(500,v.timerET+this.dt):0):0;
   yield this.event('arrivalTimer','직선 링크의 위치 오차가 5mm 미만인 상태를 TON 500ms 조건으로 확인합니다. 첫 TRUE 호출의 ET는 0입니다.',{positionError:error},{timerIn,timerET:et,timerQ:timerIn&&et>=500});
   yield this.event('arrivalCheck','타이머 Q와 상부축 도달 조건을 함께 검사합니다. 6개 축 피드백은 이 모델의 한 입력으로 묶었습니다.',{Q:v.timerQ,axes:i.axes});
   if(v.timerQ&&i.axes)yield this.event('arrivalDone','도착 조건이 성립하여 현재 링크 완료 단계 9로 갑니다.',{}, {moveStep:9,speed:0});
   else if(!i.feedback)this.blocked('arrivalCheck','주행 명령은 있지만 가상 위치 피드백이 갱신되지 않습니다. 목표와 실제 위치 차이가 남아 도착 판정을 통과하지 못합니다.',{speed:v.speed,positionError:error});
   else if(!i.axes)this.blocked('arrivalCheck','위치가 맞아도 상부축 도달 조건이 FALSE라 완료되지 않습니다.',{Q:v.timerQ,axes:i.axes});
  }
  if(v.moveStep===9&&link){yield this.event('advance','지금 링크의 끝 노드를 Current_Node에 쓰고 경로 목록의 순서를 증가시킵니다.',{endNode:link.end},{currentNode:link.end,currentIndex:v.currentIndex+1});yield this.event('destination','현재 노드와 최종 목적지를 비교합니다. 다르면 다음 링크를 준비합니다.',{current:v.currentNode,destination:v.destination},{moveStep:v.currentNode===v.destination?99:5});}
  // Semi_Auto_Part is later in MAIN: clear then produce output for next cycle.
  yield this.event('semiClear','Semi_Auto_Part의 요청·경로 완료 출력을 먼저 초기화합니다. Auto_Main은 이미 그 이전 값을 읽었습니다.',{}, {commandStart:false,renew:false,pathComplete:false,pathError:false});
  if(v.semi&&v.mainStep===2){
   yield this.event('requestCheck','Semi-Auto이고 메인 Step=2일 때 시작 요청을 확인합니다. 이 HMI의 작업 종류는 Move 3으로 고정입니다.',{start:v.startSw,dest:i.dest,mainStep:v.mainStep});
   if(v.startSw){yield this.event('requestClear','새 요청으로 변환 입력을 비웁니다.',{}, {conversionNodes:[]});if(i.dest!==0)yield this.event('renew','목적지가 0이 아니므로 경로 계산 초기화를 요청합니다.',{}, {renew:true});else this.blocked('requestCheck','목적지 번호가 0이라 이동 경로 초기화 요청을 만들지 못합니다.',{dest:i.dest});}
   if(v.renew){this.requestFault=null;this.block=null;this.pendingPath=true;this.pathStart=v.currentNode;this.pathEnd=i.dest;yield this.event('pathInit','경로 탐색을 초기화합니다. 이번 호출은 Renew=TRUE라 계속 탐색 조건에 들어가지 않습니다.',{start:this.pathStart,end:this.pathEnd});if(i.holdStart)this.blocked('pathGate','시작 누름 유지를 켜면 Renew가 매 주기 TRUE가 됩니다. Renew=FALSE가 필요한 탐색 구간이 막힙니다.',{renew:true});}
   else if(this.pendingPath){
    const path=routeBetween(this.nodes,this.links,this.pathStart,this.pathEnd,i.mapAvailable);this.pendingPath=false;
    yield this.event('pathModel','가상 지도에서 연결 비용으로 경로를 찾습니다. 원본 FB의 여러 호출에 걸친 탐색 시간은 한 완료 호출로 단순화했습니다.',{start:this.pathStart,end:this.pathEnd,mapAvailable:i.mapAvailable},{path:path||[],pathComplete:!!path,pathError:!path},'model');
    if(path)yield this.event('pathPublish','계산한 노드 경로와 시작 비트를 다음 Auto_Main이 읽을 변환 입력에 기록합니다.',{path},{conversionNodes:path,commandStart:true});
    else {this.blocked('pathModel','목적지까지 연결되는 경로가 없습니다. 지도 연결 입력을 복구하고 이동 시작을 다시 누르세요.',{start:this.pathStart,end:this.pathEnd});this.requestFault=this.block;}
   }
   else if(!v.commandType&&!v.commandStart&&!this.block)this.blocked('requestCheck',v.performed?'이동을 완료하고 다음 요청을 기다립니다. 반대 목적지를 선택해 다시 시작할 수 있습니다.':'명령 대기 상태입니다. 목적지를 선택하고 이동 시작 버튼을 누르세요.',{mainStep:v.mainStep,start:v.startSw,dest:i.dest});
  }else if(v.startSw)this.blocked('requestCheck','시작 요청이 들어왔지만 Semi-Auto와 Main.Step=2 조건이 맞지 않아 접수되지 않았습니다. 조건이 맞은 뒤 다시 눌러야 합니다.',{semi:v.semi,mainStep:v.mainStep});
  // Plant responds only to computed output. Changing the display cannot move it.
  const turn=(a)=>{const d=angleDelta(v.targetAngle,a);return (a+Math.sign(d)*Math.min(Math.abs(d),120*this.dt/1000)+360)%360;};
  const remaining=Math.hypot(v.targetX-v.x,v.targetY-v.y),distance=v.active&&v.moveStep===7&&i.feedback?Math.min(remaining,v.speed*this.dt/1000):0;
  yield this.event('plant','가상 모터가 출력에 반응하고 다음 주기에서 읽을 위치·조향 피드백을 갱신합니다. 물리 센서 측정이 아닙니다.',{commandSpeed:v.speed,feedbackEnabled:i.feedback},{x:remaining?v.x+(v.targetX-v.x)*distance/remaining:v.x,y:remaining?v.y+(v.targetY-v.y)*distance/remaining:v.y,wheelFront:i.steering?turn(v.wheelFront):v.wheelFront,wheelRear:i.steering?turn(v.wheelRear):v.wheelRear,actualSpeed:distance*1000/this.dt},'model');
  if(this.block)yield this.event(this.block.code,this.block.why,this.block.reads,{},'diagnostic');
 }
 step(){if(!this.iterator)this.iterator=this.cycle();let next=this.iterator.next();if(next.done){this.iterator=this.cycle();next=this.iterator.next();}return next.value;}
 scan(){const n=this.v.scan;if(!this.iterator)this.iterator=this.cycle();let out;for(let guard=0;guard<200;guard++){const next=this.iterator.next();if(next.done){this.iterator=null;return out;}out=next.value;}throw new Error('주기 실행 한도 초과');}
}
