// Educational ST statement subset. No eval, hardware access or PLC runtime.
export function compile(source) {
  if (source.length > 12000) throw new Error('교육용 실행기는 코드 12,000자까지 지원합니다.');
  const text = source.replace(/\(\*[\s\S]*?\*\)|\/\/[^\n]*/g, s => s.replace(/[^\n]/g, ' '));
  const tokens = []; let p = 0;
  while (p < text.length) {
    if (/\s/.test(text[p])) {p++;continue;}
    const match = /^(?:#[A-Za-z_][A-Za-z_0-9]*|[A-Za-z_][A-Za-z_0-9]*|\d+(?:\.\d+)?|:=|<>|<=|>=|[+*/=<>:;(),-])/.exec(text.slice(p));
    if (!match) throw new Error(`${text.slice(0,p).split('\n').length}행: 지원하지 않는 문자 '${text[p]}'. 선언부·FB 호출·배열은 이 실행기의 지원 범위가 아닙니다.`);
    tokens.push({v:match[0].toUpperCase().replace(/^#/,''),line:text.slice(0,p).split('\n').length}); p += match[0].length;
    if(tokens.length>4000)throw new Error('교육용 토큰 수 제한을 초과했습니다.');
  }
  tokens.push({v:'<EOF>',line:text.split('\n').length}); let at=0,depth=0;
  const peek=()=>tokens[at].v;
  const take=()=>tokens[at++].v;
  const fail=m=>{throw new Error(`${tokens[at]?.line??1}행: ${m}`);};
  const expect=v=>{if(peek()!==v)fail(`'${v}'가 필요합니다. 현재: '${peek()}'`);take();};
  const prec={OR:1,XOR:2,AND:3,'=':4,'<>':4,'<':5,'>':5,'<=':5,'>=':5,'+':6,'-':6,'*':7,'/':7,MOD:7};
  function expression(min=0){
    if(++depth>60)fail('중첩 깊이 제한을 초과했습니다.');
    let a, t=take();
    if(t==='NOT'||t==='-'||t==='+')a={op:'unary',kind:t,a:expression(8)};
    else if(t==='('){a=expression();expect(')');}
    else if(t==='TRUE'||t==='FALSE')a={op:'literal',value:t==='TRUE'};
    else if(/^\d/.test(t))a={op:'literal',value:Number(t)};
    else if(/^[A-Z_]\w*$/.test(t)&&!['THEN','ELSE','END_IF','END_CASE'].includes(t))a={op:'name',name:t};
    else fail(`올바른 식이 필요합니다. '${t}'를 확인하세요.`);
    while(prec[peek()]!==undefined&&prec[peek()]>=min){const kind=take();a={op:'binary',kind,a,b:expression(prec[kind]+1)};}
    depth--; return a;
  }
  function block(stops=[],caseLabels=false){
    if(++depth>60)fail('중첩 깊이 제한을 초과했습니다.');
    const result=[];
    while(!stops.includes(peek())&&peek()!=='<EOF>'){
      if(caseLabels&&/^\d+$/.test(peek())&&tokens[at+1]?.v===':')break;
      if(peek()===';'){take();continue;}
      if(peek()==='IF'){
        take();const branches=[];let cond=expression();expect('THEN');branches.push([cond,block(['ELSIF','ELSE','END_IF'])]);
        while(peek()==='ELSIF'){take();cond=expression();expect('THEN');branches.push([cond,block(['ELSIF','ELSE','END_IF'])]);}
        let other=[];if(peek()==='ELSE'){take();other=block(['END_IF']);}expect('END_IF');expect(';');result.push({op:'if',branches,other});
      }else if(peek()==='CASE'){
        take();const value=expression();expect('OF');const branches=[];const labels=new Set();
        while(peek()!=='ELSE'&&peek()!=='END_CASE'&&peek()!=='<EOF>'){
          if(!/^\d+$/.test(peek()))fail('CASE는 단일 0 이상의 정수 레이블만 지원합니다.');
          const label=Number(take());if(labels.has(label))fail('CASE 레이블이 중복되었습니다.');labels.add(label);expect(':');branches.push([label,block(['ELSE','END_CASE'],true)]);
        }
        let other=[];if(peek()==='ELSE'){take();other=block(['END_CASE']);}expect('END_CASE');expect(';');result.push({op:'case',value,branches,other});
      }else{
        if(!/^[A-Z_]\w*$/.test(peek()))fail('변수 대입 또는 IF/CASE가 필요합니다.');
        const name=take();expect(':=');const value=expression();expect(';');result.push({op:'set',name,value});
      }
    }
    depth--;return result;
  }
  const ast=block();expect('<EOF>');return ast;
}

export function execute(ast, values, readOnly=[]) {
  const env=Object.fromEntries(Object.entries(values).map(([k,v])=>[k.toUpperCase(),v]));
  const locked=new Set(readOnly.map(k=>k.toUpperCase()));
  const bool=v=>{if(typeof v!=='boolean')throw new Error('BOOL 조건에는 TRUE/FALSE가 필요합니다.');return v;};
  const num=v=>{if(typeof v!=='number'||!Number.isFinite(v))throw new Error('숫자 연산에는 유한한 숫자가 필요합니다.');return v;};
  const get=k=>{if(!Object.hasOwn(env,k))throw new Error(`선언되지 않은 변수: ${k}`);return env[k];};
  function expr(n){
    if(n.op==='literal')return n.value;
    if(n.op==='name')return get(n.name);
    if(n.op==='unary'){const a=expr(n.a);return n.kind==='NOT'?!bool(a):n.kind==='-'?-num(a):num(a);}
    const a=expr(n.a),b=expr(n.b);
    switch(n.kind){
      case 'AND':return bool(a)&bool(b)?true:false;case 'OR':return bool(a)|bool(b)?true:false;case 'XOR':return bool(a)!==bool(b);
      case '=':case '<>':if(typeof a!==typeof b)throw new Error('비교하는 자료형이 다릅니다.');return n.kind==='='?a===b:a!==b;
      case '<':return num(a)<num(b);case '>':return num(a)>num(b);case '<=':return num(a)<=num(b);case '>=':return num(a)>=num(b);
      case '+':return num(a)+num(b);case '-':return num(a)-num(b);case '*':return num(a)*num(b);
      case '/':if(num(b)===0)throw new Error('0으로 나눌 수 없습니다.');return num(a)/num(b);
      case 'MOD':if(!Number.isInteger(num(a))||!Number.isInteger(num(b))||b===0)throw new Error('MOD에는 정수와 0이 아닌 나누는 수가 필요합니다.');return a%b;
    }
  }
  function run(nodes){for(const n of nodes){
    if(n.op==='set'){
      const previous=get(n.name);if(locked.has(n.name))throw new Error(`입력 ${n.name}은 입력 패널에서 변경하세요.`);
      const v=expr(n.value);if(typeof v!==typeof previous)throw new Error(`${n.name}: 자료형이 맞지 않습니다.`);
      if(typeof v==='number'&&!Number.isFinite(v))throw new Error('계산 결과가 유한한 숫자가 아닙니다.');env[n.name]=v;
    }else if(n.op==='if'){
      let picked=false;for(const [condition,body] of n.branches){if(bool(expr(condition))){run(body);picked=true;break;}}if(!picked)run(n.other);
    }else{const value=num(expr(n.value));if(!Number.isInteger(value))throw new Error('CASE 선택값은 정수여야 합니다.');run(n.branches.find(([label])=>label===value)?.[1]??n.other);}
  }}
  run(ast);return Object.fromEntries(Object.keys(values).map(k=>[k,env[k.toUpperCase()]]));
}

export function grade(exercise, code){
  const ast=compile(code);let values={...exercise.inputs,...exercise.vars};
  return exercise.tests.map((test,index)=>{
    if(!exercise.sequence)values={...exercise.inputs,...exercise.vars};
    values=execute(ast,{...values,...test.input},Object.keys(exercise.inputs));
    const pass=Object.entries(test.expected).every(([k,v])=>typeof v==='number'?Math.abs(values[k]-v)<1e-9:values[k]===v);
    return {index:index+1,pass,input:test.input,expected:test.expected,actual:Object.fromEntries(Object.keys(test.expected).map(k=>[k,values[k]]))};
  });
}

export const ROBOT_DEFAULTS={enable:true,start:false,reset:false,obstacle:false,safetyOk:true,commOk:true,qrValid:true,qrFresh:true,dockConfirmed:false};
export function newRobot(){return {state:'Idle',scan:0,prevStart:false,moveTicks:0,dockTicks:0,stable:0,alarm:'NONE',command:0};}
export function tickRobot(old, overrides={}){
  const i={...ROBOT_DEFAULTS,...overrides},r={...old,scan:old.scan+1,prevStart:i.start,command:0};
  const pulse=i.start&&!old.prevStart;
  const fault = alarm=>{r.state='Fault';r.alarm=alarm;r.stable=0;};
  const globalCause=!i.safetyOk?'PERMIT_LOST':i.obstacle?'OBSTACLE':!i.commOk?'COMM_LOST':null;
  if(old.state==='Fault'){
    if(i.reset&&!i.start&&!globalCause&&i.qrValid&&i.qrFresh){Object.assign(r,newRobot(),{scan:r.scan,prevStart:i.start});}
  }else if(globalCause)fault(globalCause);
  else if(!i.enable){Object.assign(r,newRobot(),{scan:r.scan,prevStart:i.start});}
  else{
    switch(old.state){
      case 'Idle':r.state='Ready';break;
      case 'Ready':if(pulse){r.state='Moving';r.moveTicks=0;}break;
      case 'Moving':r.moveTicks++;if(r.moveTicks>=20){r.state='Docking';r.dockTicks=0;r.stable=0;}break;
      case 'Docking':
        r.dockTicks++;
        if(!i.qrValid)fault('QR_INVALID');
        else if(!i.qrFresh)fault('QR_STALE');
        else if(r.dockTicks>=50)fault('DOCK_TIMEOUT');
        else{r.stable=i.dockConfirmed?r.stable+1:0;if(r.stable>=3)r.state='Done';}
        break;
      case 'Done':if(i.reset&&!i.start)Object.assign(r,newRobot(),{scan:r.scan,prevStart:i.start});break;
      default:fault('INVALID_STATE');
    }
  }
  // Also guard the first scan that enters Docking.
  if(r.state==='Docking'&&!i.qrValid)fault('QR_INVALID');
  else if(r.state==='Docking'&&!i.qrFresh)fault('QR_STALE');
  r.command=r.state==='Moving'?0.3:r.state==='Docking'?0.1:0;
  return r;
}

export function dialectCode(code,dialect){return dialect==='scl'?code.replace(/\b(Start|Obstacle|DrivePermit|Enable|DockRequest|Speed|StartPulse|PrevStart|State)\b/g,'#$1'):code.replace(/#(?=[A-Za-z_])/g,'');}
export function sourceFile(exercise,code,dialect){
  const type=(name,value)=>typeof value==='boolean'?'BOOL':name==='Speed'?'REAL':'INT';
  const declarations=entries=>entries.map(([k,v])=>`    ${k} : ${type(k,v)};`).join('\n');
  if(dialect==='scl')return `// Educational external source template. Not compiled in TIA Portal.\nFUNCTION_BLOCK "FB_Practice"\n{ S7_Optimized_Access := 'TRUE' }\nVERSION : 0.1\nVAR_INPUT\n${declarations(Object.entries(exercise.inputs))}\nEND_VAR\nVAR_OUTPUT\n${declarations(Object.entries(exercise.vars).filter(([k])=>k!=='PrevStart'))}\nEND_VAR\n${'PrevStart' in exercise.vars?'VAR\n    PrevStart : BOOL;\nEND_VAR\n':''}BEGIN\n${dialectCode(code,'scl')}\nEND_FUNCTION_BLOCK\n`;
  return `(* Educational declaration/body reference. Not a complete TwinCAT project. *)\nPROGRAM MAIN\nVAR\n${declarations(Object.entries({...exercise.inputs,...exercise.vars}))}\nEND_VAR\n\n${dialectCode(code,'st')}\n`;
}
