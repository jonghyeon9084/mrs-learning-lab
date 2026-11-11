// Trace descriptions are derived from executed AST events, not guessed device intent.
export const traceValue=v=>typeof v==='boolean'?String(v).toUpperCase():typeof v==='number'?(Number.isInteger(v)?String(v):Number(v.toPrecision(7)).toString()):JSON.stringify(v);
export function flattenValues(env,schema){const out={};for(const [key,s] of Object.entries(schema)){const v=env[key];if(Array.isArray(v))v.forEach((x,i)=>out[s.name+'['+(i+s.lower)+']']=x);else if(v&&typeof v==='object'){for(const field of ['IN','PT','ET','Q','CLK'])if(Object.hasOwn(v,field))out[s.name+'.'+field]=v[field];}else out[s.name]=v;}return out;}
export function changedValues(before,after){return Object.fromEntries(Object.entries(after).filter(([k,v])=>!Object.is(before[k],v)).map(([k,v])=>[k,{before:before[k],after:v}]));}
export function expressionText(n,schema){if(n.op==='lit')return traceValue(n.value);if(n.op==='ref')return (schema[n.name]?.name||n.name)+(n.index?'['+expressionText(n.index,schema)+']':'')+(n.field?'.'+n.field:'');if(n.op==='unary')return n.kind+' '+expressionText(n.a,schema);if(n.op==='binary')return '('+expressionText(n.a,schema)+' '+n.kind+' '+expressionText(n.b,schema)+')';if(n.op==='fn')return n.kind+'('+n.args.map(a=>expressionText(a,schema)).join(', ')+')';return '?';}
const meanings={TON:'IN이 TRUE로 유지된 시간을 갱신합니다. 지연 시간이 찼을 때 Q가 TRUE가 됩니다.',TOF:'IN이 FALSE로 바뀐 뒤의 지연을 갱신합니다. 지연이 끝날 때 Q가 FALSE가 됩니다.',TP:'상승 전이로 시작한 정해진 길이의 펄스를 갱신합니다.',R_TRIG:'이번 CLK와 이전 호출의 CLK를 비교합니다. FALSE → TRUE인 호출에서만 Q가 TRUE입니다.',F_TRIG:'이번 CLK와 이전 호출의 CLK를 비교합니다. TRUE → FALSE인 호출에서만 Q가 TRUE입니다.'};
const koreanExpr=s=>s.replace(/\bAND\b/g,'그리고').replace(/\bOR\b/g,'또는').replace(/\bNOT\b/g,'부정').replace(/<>/g,'≠');
export function traceExplanation(e){const d=e.detail||{};switch(e.kind){
 case 'set':return d.expression+'을 계산하여 '+d.target+'에 저장합니다. '+(Object.keys(e.changes).length?'아래에 실제로 달라진 값을 표시합니다.':'대입은 실행했지만 값은 이전과 같습니다.');
 case 'if':return koreanExpr(d.expression)+' 조건을 판단한 결과는 '+traceValue(d.result)+'입니다. '+(d.result?'이 조건의 본문을 실행합니다. 뒤의 ELSIF/ELSE는 건너뜁니다.':'이 본문을 건너뛰고 다음 조건이나 ELSE를 확인합니다. 없으면 IF 다음으로 진행합니다.');
 case 'case':return d.expression+'의 현재 값 '+d.value+'로 '+(d.matched?d.value+' 분기':'ELSE(없으면 빈 분기)')+'를 선택합니다. 이 CASE 안에서 상태가 바뀌어도 다른 분기로 곧바로 이동하지 않습니다.';
 case 'call':return d.target+'는 '+d.type+' 인스턴스입니다. 입력을 전달하고 지금 호출합니다. '+(meanings[d.type]||'출력과 내부 상태를 갱신합니다.')+' 호출 직후의 멤버 변화를 확인하세요.';
 case 'for-init':return d.target+'를 '+d.start+'로 시작하고, 끝값 '+d.end+', 증분 '+d.step+'을 정합니다. 반복은 같은 스캔 안에서 진행합니다.';
 case 'for-test':return '반복 변수 '+d.value+'와 끝값 '+d.end+'를 비교한 결과가 '+traceValue(d.result)+'이므로 '+(d.result?'반복 본문을 실행합니다.':'반복문을 빠져나갑니다.');
 case 'for-next':return '반복 본문이 끝나 제어 변수에 '+d.step+'을 더합니다. 같은 스캔에서 반복 조건을 다시 검사합니다.';
 case 'temp':return '교육 실행기가 스캔 시작 시 VAR_TEMP를 선언 초기값으로 되돌렸습니다. 소스의 실행 문장이 아닌 모델의 초기화 단계입니다.';
 default:return '실행한 값을 확인하세요.';
}}
export function motionReason(world,values,kind){if(!world)return '이 예제에는 로봇 이동 모델이 없습니다. 코드의 계산 결과를 변수와 비교하세요.';
 const v=values,lines=[];
 if(kind==='amr-io'){
  lines.push('출력 DrivePermit='+traceValue(v.DRIVEPERMIT)+', 모듈 속도 명령='+traceValue(v.MODULE1SPEED)+' / '+traceValue(v.MODULE2SPEED)+'m/s, 조향 명령='+traceValue(v.MODULE1ANGLE)+' / '+traceValue(v.MODULE2ANGLE)+'°를 적용했습니다.');
  if(world.collided)lines.push('기하학적 접촉 때문에 실제 이동은 멈췄습니다. PLC의 출력 명령이 남아 있는지는 별도로 확인하세요.');
  else if(world.kinematicFault)lines.push('두 바퀴 속도 벡터가 하나의 차체 운동과 맞지 않아 모델이 이동을 억제했습니다.');
  else if(!world.sensors().SteeringReady)lines.push('실제 조향각이 아직 목표각에 도달하지 않아 모델이 구동을 기다립니다.');
  else if(world.driveJam)lines.push('구동 고착 주입으로 바퀴 피드백 속도가 0입니다. 명령 속도와 다릅니다.');
  else if(!v.DRIVEPERMIT)lines.push('구동 허가가 FALSE여서 접선 구동 속도를 적용하지 않았습니다. 그 값을 쓴 문장과 앞의 조건을 추적하세요.');
  else {const {vx,vy,w}=world.velocity;lines.push('출력 적용 후 차체 속도 vx='+traceValue(vx)+', vy='+traceValue(vy)+'m/s, 회전 속도='+traceValue(w)+'rad/s입니다.');
   if(Math.hypot(vx,vy)<1e-6&&Math.abs(w)>1e-6)lines.push('평행 이동 성분은 없고 회전 성분이 있어 제자리에서 방향을 바꿉니다.');
   else if(Math.abs(w)<1e-6&&Math.hypot(vx,vy)>1e-6)lines.push('회전 성분이 0이므로 차체 방향을 유지하며 '+(Math.abs(vy)>1e-6?'평행·사선':'직선')+' 이동합니다.');
   else if(Math.abs(w)>1e-6)lines.push('이동과 회전 성분이 함께 있어 곡선 궤적을 그립니다. 현재 차체 중심 궤적의 반경 크기는 약 '+traceValue(Math.hypot(vx,vy)/Math.abs(w))+'m입니다.');
   else lines.push('계산된 속도가 모두 0이어서 이동하지 않습니다.');
  }
 }else {lines.push('DrivePermit='+traceValue(v.DRIVEPERMIT)+', Speed='+traceValue(v.SPEED)+'m/s, TurnRate='+traceValue(v.TURNRATE)+'rad/s를 이동 모델에 전달했습니다.');lines.push(world.collided?'장애물 또는 경계 접촉으로 모델의 이동이 멈췄습니다.':!v.DRIVEPERMIT?'구동 허가가 없어 움직이지 않습니다.':'실제 모델 속도='+traceValue(world.velocity)+'m/s, 회전='+traceValue(world.turnRate)+'rad/s입니다.');}
 return lines.join(' ');
}
