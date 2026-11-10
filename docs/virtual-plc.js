import {motionBodies} from './motion.js';
// A deliberately bounded interpreter for educational ST/SCL sources.
// It is NOT a Siemens or Beckhoff compiler/runtime. All time is virtual.
const copy = value => structuredClone(value);
const clean = s => s.replace(/\(\*[\s\S]*?\*\)|\/\/[^\n]*/g, m=>m.replace(/[^\n]/g,' '));
const types = new Set(['BOOL','INT','DINT','REAL','TIME','TON','TON_TIME','IEC_TIMER','R_TRIG']);
const defaultValue = type => type==='BOOL'?false:['TON','TON_TIME','IEC_TIMER'].includes(type)?{kind:'TON',IN:false,PT:0,Q:false,ET:0,startedAt:null}:type==='R_TRIG'?{kind:'R_TRIG',CLK:false,Q:false,previous:false}:0;
function timeLiteral(s){const m=/^(?:T|TIME)#(\d+)(MS|S|M|H)$/i.exec(s);if(!m)throw new Error('TIME 리터럴은 T#500ms, T#2s처럼 한 단위로 입력하세요.');return Number(m[1])*({MS:1,S:1000,M:60000,H:3600000}[m[2].toUpperCase()]);}
function literal(s,type){if(s==null)return defaultValue(type);s=s.trim();if(type==='BOOL'&&/^(TRUE|FALSE)$/i.test(s))return s.toUpperCase()==='TRUE';if(type==='TIME')return timeLiteral(s);if(['INT','DINT','REAL'].includes(type)&&/^[+-]?\d+(?:\.\d+)?$/.test(s)){const n=Number(s);checkType(n,type);return n;}throw new Error(`초기값 '${s}'을 ${type}에 사용할 수 없습니다.`);}
function checkType(v,type){
  if(type==='BOOL'){if(typeof v!=='boolean')throw new Error('BOOL에는 TRUE/FALSE만 대입할 수 있습니다.');return;}
  if(['INT','DINT','REAL','TIME'].includes(type)){
    if(typeof v!=='number'||!Number.isFinite(v))throw new Error(`${type}에 유한한 숫자가 필요합니다.`);
    if(type!=='REAL'&&!Number.isInteger(v))throw new Error(`${type}에 소수를 대입할 수 없습니다. 형 변환은 이 모델에서 지원하지 않습니다.`);
    const ranges={INT:[-32768,32767],DINT:[-2147483648,2147483647],TIME:[0,2147483647]};
    if(ranges[type]&&(v<ranges[type][0]||v>ranges[type][1]))throw new Error(`${type} 범위 초과. 이 모델은 래핑하지 않고 실행을 중단합니다.`);
  }
}
function declarations(source){
  const schema={};let input=clean(source);let count=0;
  input=input.replace(/\b(VAR_INPUT|VAR_OUTPUT|VAR_TEMP|VAR)\b([\s\S]*?)\bEND_VAR\b\s*;?/gi,(full,section,body)=>{
    for(const line of body.split(';').map(s=>s.trim()).filter(Boolean)){
      const m=/^([A-Za-z_]\w*(?:\s*,\s*[A-Za-z_]\w*)*)\s*:\s*(ARRAY\s*\[\s*-?\d+\s*\.\.\s*-?\d+\s*\]\s*OF\s*\w+|\w+)\s*(?::=\s*([\s\S]+))?$/i.exec(line);
      if(!m)throw new Error(`지원하지 않는 선언: ${line}`);
      let type=m[2].toUpperCase().replace(/\s+/g,' '),lower=null,upper=null;const arr=/^ARRAY\s*\[\s*(-?\d+)\s*\.\.\s*(-?\d+)\s*\]\s*OF\s*(\w+)$/i.exec(type);
      if(arr){lower=Number(arr[1]);upper=Number(arr[2]);type=arr[3];if(upper<lower||upper-lower>=100)throw new Error('배열은 최대 100개 원소만 지원합니다.');if(!['BOOL','INT','DINT','REAL','TIME'].includes(type))throw new Error('배열 원소는 기본 자료형만 지원합니다.');}
      if(!types.has(type))throw new Error(`지원하지 않는 자료형: ${type}`);
      for(const raw of m[1].split(',')){
        const name=raw.trim(),key=name.toUpperCase();if(schema[key])throw new Error(`중복 변수 선언: ${name}`);if(++count>100)throw new Error('최대 100개 변수까지 지원합니다.');
        let value;
        if(arr){if(m[3]){const init=m[3].trim();if(!init.startsWith('[')||!init.endsWith(']'))throw new Error('배열 초기값은 [1, 2, 3] 형식입니다.');value=init.slice(1,-1).split(',').map(s=>literal(s,type));if(value.length!==upper-lower+1)throw new Error('배열 초기값 개수가 선언 범위와 다릅니다.');}else value=Array.from({length:upper-lower+1},()=>defaultValue(type));}
        else value=literal(m[3],type);
        schema[key]={name,type,section:section.toUpperCase(),lower,upper,initial:value};
      }
    }
    return full.replace(/[^\n]/g,' ');
  });
  // Only explicitly recognized source envelopes/metadata are accepted.
  input=input.replace(/^\s*(PROGRAM|FUNCTION_BLOCK)\s+(?:"[A-Za-z_]\w*"|[A-Za-z_]\w*)\s*$/gim,m=>m.replace(/[^\n]/g,' '));
  input=input.replace(/\{\s*S7_Optimized_Access\s*:=\s*'TRUE'\s*\}/gi,m=>m.replace(/[^\n]/g,' '));
  input=input.replace(/^\s*VERSION\s*:\s*\d+\.\d+\s*$/gim,m=>m.replace(/[^\n]/g,' '));
  input=input.replace(/^\s*(BEGIN|END_PROGRAM|END_FUNCTION_BLOCK)\s*;?\s*$/gim,m=>m.replace(/[^\n]/g,' '));
  if(!Object.keys(schema).length)throw new Error('VAR 또는 VAR_INPUT/VAR_OUTPUT 선언부를 먼저 작성하세요.');
  return {schema,body:input};
}
export function compilePLC(source){
  if(source.length>30000)throw new Error('교육용 소스는 30,000자까지 지원합니다.');
  const {schema,body}=declarations(source),tokens=[];let offset=0;
  while(offset<body.length){if(/\s/.test(body[offset])){offset++;continue;}
    const m=/^(?:(?:T|TIME)#\d+(?:ms|s|m|h)\b|#?[A-Za-z_]\w*|\d+(?:\.\d+)?|:=|=>|<>|<=|>=|[+*/=<>:;(),.\[\]-])/i.exec(body.slice(offset));
    if(!m)throw new Error(`${body.slice(0,offset).split('\n').length}행: 지원하지 않는 문자 '${body[offset]}'`);
    tokens.push({text:m[0].toUpperCase().replace(/^#/,''),line:body.slice(0,offset).split('\n').length});offset+=m[0].length;if(tokens.length>7000)throw new Error('토큰 수 제한을 초과했습니다.');
  }
  tokens.push({text:'EOF',line:body.split('\n').length});let pos=0,depth=0;
  const peek=()=>tokens[pos]?.text??'EOF',take=()=>tokens[pos++]?.text??'EOF',fail=s=>{throw new Error(`${tokens[pos]?.line??1}행: ${s}`);},expect=s=>{if(peek()!==s)fail(`'${s}'가 필요합니다. 현재 '${peek()}'`);take();};
  const precedence={OR:1,XOR:2,AND:3,'=':4,'<>':4,'<':5,'>':5,'<=':5,'>=':5,'+':6,'-':6,'*':7,'/':7,MOD:7};
  function ref(first=take()){
    if(!schema[first])fail(`선언되지 않은 변수: ${first}`);
    let result={op:'ref',name:first,index:null,field:null};
    if(peek()==='['){take();result.index=expr();expect(']');}
    if(peek()==='.'){take();result.field=take();if(!/^[A-Z_]\w*$/.test(result.field))fail('멤버 이름이 필요합니다.');}
    return result;
  }
  function expr(min=0){
    if(++depth>60)fail('중첩 제한을 초과했습니다.');let a,t=take();
    if(['NOT','-','+'].includes(t))a={op:'unary',kind:t,a:expr(8)};
    else if(t==='('){a=expr();expect(')');}
    else if(t==='TRUE'||t==='FALSE')a={op:'lit',value:t==='TRUE'};
    else if(/^(T|TIME)#/.test(t))a={op:'lit',value:timeLiteral(t)};
    else if(/^\d/.test(t))a={op:'lit',value:Number(t)};
    else if(['ABS','MIN','MAX'].includes(t)&&peek()==='('){take();const args=[expr()];while(peek()===','){take();args.push(expr());}expect(')');if((t==='ABS'&&args.length!==1)||(t!=='ABS'&&args.length!==2))fail('ABS는 인자 1개, MIN/MAX는 인자 2개만 지원합니다.');a={op:'fn',kind:t,args};}
    else a=ref(t);
    while(precedence[peek()]!==undefined&&precedence[peek()]>=min){const kind=take();a={op:'binary',kind,a,b:expr(precedence[kind]+1)};}
    depth--;return a;
  }
  function block(stop=[],labels=false){
    if(++depth>60)fail('중첩 제한을 초과했습니다.');const out=[];
    while(peek()!=='EOF'&&!stop.includes(peek())){
      if(labels&&/^\d+$/.test(peek())&&tokens[pos+1]?.text===':')break;
      if(peek()===';'){take();continue;}
      if(peek()==='IF'){
        take();const branches=[];let condition=expr();expect('THEN');branches.push([condition,block(['ELSIF','ELSE','END_IF'])]);
        while(peek()==='ELSIF'){take();condition=expr();expect('THEN');branches.push([condition,block(['ELSIF','ELSE','END_IF'])]);}
        let other=[];if(peek()==='ELSE'){take();other=block(['END_IF']);}expect('END_IF');expect(';');out.push({op:'if',branches,other});
      }else if(peek()==='CASE'){
        take();const selector=expr();expect('OF');const branches=[],used=new Set();
        while(!['ELSE','END_CASE','EOF'].includes(peek())){if(!/^\d+$/.test(peek()))fail('CASE는 단일 0 이상 정수 레이블을 지원합니다.');const label=Number(take());if(used.has(label))fail('CASE 레이블 중복');used.add(label);expect(':');branches.push([label,block(['ELSE','END_CASE'],true)]);}
        let other=[];if(peek()==='ELSE'){take();other=block(['END_CASE']);}expect('END_CASE');expect(';');out.push({op:'case',selector,branches,other});
      }else if(peek()==='FOR'){
        take();const target=ref();if(target.index||target.field||!['INT','DINT'].includes(schema[target.name].type))fail('FOR 제어 변수는 단일 INT/DINT여야 합니다.');expect(':=');const start=expr();expect('TO');const end=expr();let step={op:'lit',value:1};if(peek()==='BY'){take();step=expr();}expect('DO');const body=block(['END_FOR']);expect('END_FOR');expect(';');out.push({op:'for',target,start,end,step,body});
      }else{
        const target=ref();
        if(peek()==='('){take();const args={},outputs={};while(peek()!==')'){
          const name=take(),operator=take();if(Object.hasOwn(args,name)||Object.hasOwn(outputs,name))fail('중복 인자');if(operator===':=')args[name]=expr();else if(operator==='=>')outputs[name]=ref();else fail('인자에는 := 또는 =>가 필요합니다.');if(peek()!==',')break;take();
        }expect(')');expect(';');out.push({op:'call',target,args,outputs});}
        else{expect(':=');const value=expr();expect(';');out.push({op:'set',target,value});}
      }
    }depth--;return out;
  }
  const ast=block();expect('EOF');return {schema,ast,source};
}

export class VirtualPLC{
  constructor(program){this.program=program;this.values=Object.fromEntries(Object.entries(program.schema).map(([k,s])=>[k,copy(s.initial)]));this.time=0;this.scan=0;this.history=[];}
  write(name,value){const key=name.toUpperCase(),s=this.program.schema[key];if(!s)throw new Error(`변수 없음: ${name}`);if(s.section!=='VAR_INPUT')throw new Error('입력 변수만 입력 패널에서 변경할 수 있습니다.');checkType(value,s.type);this.values[key]=value;}
  step(dt=100){
    if(!Number.isInteger(dt)||dt<1||dt>10000)throw new Error('스캔 시간은 1~10000ms의 정수여야 합니다.');
    const env=copy(this.values),schema=this.program.schema;const now=this.time;let budget=10000;const usedTimers=new Set();
    for(const [k,s] of Object.entries(schema))if(s.section==='VAR_TEMP')env[k]=copy(s.initial);
    const bool=v=>{if(typeof v!=='boolean')throw new Error('조건은 BOOL이어야 합니다.');return v;},num=v=>{if(typeof v!=='number'||!Number.isFinite(v))throw new Error('유한한 숫자가 필요합니다.');return v;};
    const int=v=>{num(v);if(!Number.isInteger(v))throw new Error('정수가 필요합니다.');return v;};
    function resolve(r){const s=schema[r.name];let owner=env,key=r.name,type=s.type;
      if(r.index){if(s.lower===null)throw new Error(`${s.name}은 배열이 아닙니다.`);const index=int(evaluate(r.index));if(index<s.lower||index>s.upper)throw new Error(`${s.name}[${index}]: 배열 범위 ${s.lower}..${s.upper} 초과`);owner=env[r.name];key=index-s.lower;}
      else if(s.lower!==null&&r.field)throw new Error('배열 인덱스가 필요합니다.');
      if(r.field){const object=owner[key];if(!object||typeof object!=='object'||!Object.hasOwn(object,r.field)||!['IN','PT','Q','ET','CLK'].includes(r.field))throw new Error(`지원하지 않는 멤버: ${r.field}`);owner=object;key=r.field;type=['Q','IN','CLK'].includes(r.field)?'BOOL':'TIME';}
      return {owner,key,type,s};
    }
    function read(r){const {owner,key}=resolve(r);return owner[key];}
    function assign(r,value){const {owner,key,type,s}=resolve(r);if(s.section==='VAR_INPUT')throw new Error(`입력 ${s.name}은 코드에서 대입할 수 없도록 제한했습니다.`);if(typeof owner[key]==='object')throw new Error('배열/FB 전체 대입은 지원하지 않습니다.');if(r.field)throw new Error('FB 멤버 직접 쓰기는 지원하지 않습니다. 호출 인자를 사용하세요.');checkType(value,type);owner[key]=value;}
    function evaluate(n){
      if(n.op==='lit')return n.value;if(n.op==='ref')return read(n);
      if(n.op==='unary'){const a=evaluate(n.a);return n.kind==='NOT'?!bool(a):n.kind==='-'?-num(a):num(a);}
      if(n.op==='fn'){const args=n.args.map(a=>num(evaluate(a)));return n.kind==='ABS'?Math.abs(args[0]):n.kind==='MIN'?Math.min(...args):Math.max(...args);}
      const a=evaluate(n.a),b=evaluate(n.b);
      switch(n.kind){case 'AND':return !!(bool(a)&bool(b));case 'OR':return !!(bool(a)|bool(b));case 'XOR':return bool(a)!==bool(b);case '=':case '<>':if(typeof a!==typeof b||typeof a==='object')throw new Error('비교 자료형을 확인하세요.');return n.kind==='='?a===b:a!==b;case '<':return num(a)<num(b);case '>':return num(a)>num(b);case '<=':return num(a)<=num(b);case '>=':return num(a)>=num(b);case '+':return num(a)+num(b);case '-':return num(a)-num(b);case '*':return num(a)*num(b);case '/':if(num(b)===0)throw new Error('0으로 나눌 수 없습니다.');return num(a)/num(b);case 'MOD':if(int(b)===0)throw new Error('0으로 나눌 수 없습니다.');return int(a)%b;}
    }
    function call(n){
      const r={...n.target,field:null};const fb=read(r);if(!fb||!['TON','R_TRIG'].includes(fb.kind))throw new Error('이 가상 PLC는 TON과 R_TRIG 인스턴스 호출을 지원합니다.');
      if(n.target.field&&!(fb.kind==='TON'&&n.target.field==='TON'))throw new Error('지원하지 않는 FB 메서드입니다.');
      if(usedTimers.has(r.name))throw new Error('같은 FB 인스턴스는 한 스캔에서 한 번만 호출하도록 제한했습니다.');usedTimers.add(r.name);
      const args=Object.fromEntries(Object.entries(n.args).map(([k,v])=>[k,evaluate(v)]));
      const allowed=fb.kind==='TON'?['IN','PT']:['CLK'];if(Object.keys(args).some(k=>!allowed.includes(k)))throw new Error('FB 호출 입력 이름을 확인하세요.');
      if(fb.kind==='TON'){
        if(!Object.hasOwn(args,'IN')||!Object.hasOwn(args,'PT'))throw new Error('TON에는 IN, PT가 필요합니다.');const active=bool(args.IN),pt=int(args.PT);if(pt<0)throw new Error('PT는 0 이상이어야 합니다.');
        if(!active){fb.startedAt=null;fb.ET=0;fb.Q=false;}
        else{if(!fb.IN||fb.startedAt===null)fb.startedAt=now;fb.ET=Math.min(now-fb.startedAt,pt);fb.Q=fb.ET>=pt;}
        fb.IN=active;fb.PT=pt;
      }else{if(!Object.hasOwn(args,'CLK'))throw new Error('R_TRIG에는 CLK가 필요합니다.');fb.CLK=bool(args.CLK);fb.Q=fb.CLK&&!fb.previous;fb.previous=fb.CLK;}
      for(const [k,r] of Object.entries(n.outputs)){if(!['Q','ET'].includes(k)||!Object.hasOwn(fb,k))throw new Error('지원하지 않는 출력 인자');assign(r,fb[k]);}
    }
    function run(nodes){for(const n of nodes){if(--budget<0)throw new Error('한 스캔 연산 제한 초과: 반복문 범위를 확인하세요.');
      if(n.op==='set')assign(n.target,evaluate(n.value));
      else if(n.op==='call')call(n);
      else if(n.op==='if'){let found=false;for(const [cond,body] of n.branches)if(bool(evaluate(cond))){run(body);found=true;break;}if(!found)run(n.other);}
      else if(n.op==='case'){const v=int(evaluate(n.selector));run(n.branches.find(([label])=>label===v)?.[1]??n.other);}
      else if(n.op==='for'){
        const start=int(evaluate(n.start)),end=int(evaluate(n.end)),step=int(evaluate(n.step));if(!step)throw new Error('FOR BY는 0일 수 없습니다.');assign(n.target,start);
        while(step>0?read(n.target)<=end:read(n.target)>=end){if(--budget<0)throw new Error('반복문 연산 제한 초과');run(n.body);assign(n.target,read(n.target)+step);}
      }
    }}
    run(this.program.ast);this.values=env;this.time+=dt;this.scan++;const record={scan:this.scan,time:now,values:copy(env)};this.history.push(record);if(this.history.length>100)this.history.shift();return record;
  }
  watch(){return Object.entries(this.program.schema).map(([key,s])=>({name:s.name,type:s.lower===null?s.type:`ARRAY[${s.lower}..${s.upper}] OF ${s.type}`,section:s.section,value:this.values[key]}));}
}

export const plcSamples=[
{id:'motion',title:'07 · 코드로 로봇 움직이기',guide:'소스를 적용한 뒤 Start를 켜고 자동 실행하세요. Speed(m/s), TurnRate(rad/s), DrivePermit 출력이 아래 로봇을 움직입니다. 장애물을 놓거나 잘못된 코드를 불러와 결과를 비교하세요. 모두 교육용 수치입니다.',inputs:'Start : BOOL;\nQrValid : BOOL := TRUE;\nObstacle : BOOL;\nNearDock : BOOL;\nAtDock : BOOL;',outputs:'DrivePermit : BOOL;\nSpeed : REAL;\nTurnRate : REAL;',locals:'',body:motionBodies.normal},
{id:'variable',title:'01 · 변수에 값 넣기',guide:'먼저 적용을 누르고 1스캔씩 실행하세요. Count가 1씩 늘어납니다. 아래 1을 2로 바꾸고 다시 적용해 비교하세요.',inputs:'',outputs:'Count : INT := 0;',locals:'',body:'Count := Count + 1;'},
{id:'condition',title:'02 · 입력과 IF',guide:'Start를 켜고 실행하세요. Obstacle도 켜면 어떤 결과가 나올지 먼저 예상하세요.',inputs:'Start : BOOL;\nObstacle : BOOL;',outputs:'DrivePermit : BOOL;\nSpeed : REAL;',locals:'',body:'IF Start AND NOT Obstacle THEN\n    DrivePermit := TRUE;\n    Speed := 0.2;\nELSE\n    DrivePermit := FALSE;\n    Speed := 0.0;\nEND_IF;'},
{id:'timer',title:'03 · TON 타이머',guide:'QrValid를 켜고 100ms씩 실행하세요. 첫 TRUE 호출은 ET=0, 이후 100/200/300/400/500ms에서 Q가 바뀝니다. QrValid를 끄면 초기화됩니다.',inputs:'QrValid : BOOL;',outputs:'Stable : BOOL;\nElapsed : TIME;',locals:'QrStable : TON;',body:'QrStable(IN := QrValid, PT := T#500ms);\nStable := QrStable.Q;\nElapsed := QrStable.ET;'},
{id:'trigger',title:'04 · R_TRIG 상승 에지',guide:'Start를 켠 채 여러 스캔 실행하세요. Pulse는 첫 상승 순간에만 TRUE입니다. 껐다가 다시 켜면 Count가 한 번 더 늘어납니다.',inputs:'Start : BOOL;',outputs:'Pulse : BOOL;\nCount : INT;',locals:'StartEdge : R_TRIG;',body:'StartEdge(CLK := Start);\nPulse := StartEdge.Q;\nIF Pulse THEN\n    Count := Count + 1;\nEND_IF;'},
{id:'array',title:'05 · 배열과 FOR',guide:'배열의 세 값을 더합니다. 한 스캔에 FOR가 모두 실행됩니다. Values[2] 값을 바꾸고 Total을 확인하세요.',inputs:'',outputs:'Total : INT;',locals:'Values : ARRAY[1..3] OF INT;\ni : INT;',body:'Values[1] := 10;\nValues[2] := 20;\nValues[3] := 30;\nTotal := 0;\nFOR i := 1 TO 3 DO\n    Total := Total + Values[i];\nEND_FOR;'},
{id:'docking',title:'06 · 도킹 상태 + 시간 초과',guide:'Start를 켜면 State=1. QrValid를 켜면 State=2. DockConfirmed를 켜면 State=3(완료). State=2에서 완료 없이 가상 2초가 지나면 State=99. Fault를 유지하며, 전체 재시작은 다시 적용으로 수행합니다. 교육용 미니 시퀀스입니다.',inputs:'Start : BOOL;\nQrValid : BOOL;\nDockConfirmed : BOOL;',outputs:'State : INT;\nDrivePermit : BOOL;\nFault : BOOL;',locals:'DockTimer : TON;',body:'DockTimer(IN := State = 2, PT := T#2s);\nCASE State OF\n    0: IF Start THEN State := 1; END_IF;\n    1: IF QrValid THEN State := 2; END_IF;\n    2:\n        IF NOT QrValid OR DockTimer.Q THEN\n            State := 99;\n        ELSIF DockConfirmed THEN\n            State := 3;\n        END_IF;\n    3: (* 완료 유지 *)\n    99: (* Fault 유지 *)\nELSE\n    State := 99;\nEND_CASE;\nDrivePermit := (State = 2) AND QrValid;\nFault := State = 99;'}
];
plcSamples.push(plcSamples.shift());
export function sampleSource(sample,dialect='st'){
  const vars=[sample.inputs,sample.outputs,sample.locals].join('\n').match(/\b\w+(?=\s*:)/g)||[];
  let body=sample.body,locals=sample.locals;
  if(dialect==='scl'){body=body.replace(/\b[A-Za-z_]\w*\b/g,(word,offset,source)=>vars.includes(word)&&source[offset-1]!=='.'?'#'+word:word);locals=locals.replace(/:\s*TON\b/g,': TON_TIME');}
  const section=(name,text)=>text?`${name}\n${text.split('\n').map(l=>'    '+l).join('\n')}\nEND_VAR\n`:'';
  return `${dialect==='scl'?'FUNCTION_BLOCK "FB_Training"\n{ S7_Optimized_Access := \'TRUE\' }\nVERSION : 0.1':'FUNCTION_BLOCK FB_Training'}\n${section('VAR_INPUT',sample.inputs)}${section('VAR_OUTPUT',sample.outputs)}${section('VAR',locals)}${dialect==='scl'?'BEGIN\n':''}${body}\nEND_FUNCTION_BLOCK\n`;
}
