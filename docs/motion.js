// Educational planar kinematics and collision geometry, not real robot dynamics.
export const MOTION_CONFIG={width:3.2,height:2,radius:0.10,dockX:2.65,dockY:1,obstacleX:1.6,obstacleY:1,obstacleRadius:0.18};
const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
export class MotionWorld{
  constructor(){this.x=0.3;this.y=1;this.angle=0;this.time=0;this.obstacle=false;this.collided=false;this.status='대기';this.events=[];this.trail=[{x:this.x,y:this.y}];this.lastEvent='';this.velocity=0;this.turnRate=0;}
  sensors(){const c=MOTION_CONFIG;const distance=Math.hypot(c.dockX-this.x,c.dockY-this.y);const dx=c.obstacleX-this.x,dy=c.obstacleY-this.y;const forward=dx*Math.cos(this.angle)+dy*Math.sin(this.angle),lateral=Math.abs(-dx*Math.sin(this.angle)+dy*Math.cos(this.angle));return {Obstacle:this.obstacle&&forward>=0&&forward<c.obstacleRadius+c.radius+0.45&&lateral<c.obstacleRadius+c.radius+0.08,NearDock:distance<0.65,AtDock:distance<=0.12&&Math.abs(wrap(this.angle))<0.2};}
  blocked(x,y){const c=MOTION_CONFIG;return x<c.radius||x>c.width-c.radius||y<c.radius||y>c.height-c.radius||(this.obstacle&&Math.hypot(x-c.obstacleX,y-c.obstacleY)<c.radius+c.obstacleRadius);}
  step({DrivePermit=false,Speed=0,TurnRate=0},dt=100){
    if(typeof DrivePermit!=='boolean'||!Number.isFinite(Speed)||!Number.isFinite(TurnRate))throw new Error('운동 모델에는 DrivePermit BOOL, Speed/TurnRate 숫자가 필요합니다.');
    if(Math.abs(Speed)>2||Math.abs(TurnRate)>6)throw new Error('교육 운동 모델 범위: |Speed| ≤ 2m/s, |TurnRate| ≤ 6rad/s. 실제 허용 속도가 아닙니다.');
    const sensorBefore=this.sensors();const v=DrivePermit?Speed:0,w=DrivePermit?TurnRate:0;this.velocity=v;this.turnRate=w;this.collided=false;
    const seconds=dt/1000,parts=Math.max(1,Math.ceil(Math.max(Math.abs(v)*seconds/0.008,Math.abs(w)*seconds/0.03)));
    for(let i=0;i<parts;i++){
      const step=seconds/parts,theta=this.angle+w*step;
      const nx=this.x+(Math.abs(w)>1e-9?v/w*(Math.sin(theta)-Math.sin(this.angle)):v*step*Math.cos(this.angle));
      const ny=this.y+(Math.abs(w)>1e-9?-v/w*(Math.cos(theta)-Math.cos(this.angle)):v*step*Math.sin(this.angle));
      if(this.blocked(nx,ny)){this.collided=true;this.velocity=0;break;}
      this.x=nx;this.y=ny;this.angle=wrap(theta);
    }
    this.time+=dt;this.trail.push({x:this.x,y:this.y});if(this.trail.length>400)this.trail.shift();
    const at=this.sensors().AtDock;
    let message='';
    if(this.collided){this.status='충돌';message='장애물 또는 경계에 접촉했습니다. 이동은 접촉 지점에서 멈추지만 코드의 주행 명령은 별도로 확인하세요.';}
    else if(this.x>MOTION_CONFIG.dockX+0.2){this.status='목표 지나침';message='정지 목표를 지나쳤습니다. AtDock 조건과 정지 명령을 확인하세요.';}
    else if(v<0){this.status='반대 방향';message='음수 속도로 목표 반대쪽을 향해 이동하고 있습니다.';}
    else if(sensorBefore.Obstacle&&v>0){this.status='장애물 무시';message='Obstacle이 TRUE인데 양의 이동 명령을 유지하고 있습니다.';}
    else if(Math.abs(w)>1){this.status='큰 회전 명령';message='회전 명령의 크기·단위를 확인하세요. 이 모델에서는 목표 경로를 벗어날 수 있습니다.';}
    else if(at&&v===0){this.status='도킹 위치 정지';}
    else if(at&&v!==0){this.status='목표 통과 중';}
    else this.status=v===0?'정지':'이동 중';
    if(message&&message!==this.lastEvent){this.events.push({time:this.time,x:this.x,y:this.y,message,status:this.status});if(this.events.length>30)this.events.shift();}
    this.lastEvent=message;return this;
  }
}

export const motionBodies={
 normal:`TurnRate := 0.0;\nIF NOT Start OR Obstacle OR AtDock THEN\n    DrivePermit := FALSE;\n    Speed := 0.0;\nELSIF NearDock THEN\n    DrivePermit := QrValid;\n    IF QrValid THEN Speed := 0.15; ELSE Speed := 0.0; END_IF;\nELSE\n    DrivePermit := TRUE;\n    Speed := 0.5;\nEND_IF;`,
 obstacle:`(* 의도적으로 잘못된 코드: Obstacle 조건 누락 *)\nTurnRate := 0.0;\nDrivePermit := Start AND NOT AtDock;\nIF DrivePermit THEN Speed := 0.5; ELSE Speed := 0.0; END_IF;`,
 overshoot:`(* 의도적으로 잘못된 코드: 목표 정지 조건 누락 *)\nTurnRate := 0.0;\nDrivePermit := Start;\nIF Start THEN Speed := 0.5; ELSE Speed := 0.0; END_IF;`,
 reverse:`(* 의도적으로 잘못된 코드: 속도 부호 반대 *)\nTurnRate := 0.0;\nDrivePermit := Start;\nIF Start THEN Speed := -0.3; ELSE Speed := 0.0; END_IF;`,
 turn:`(* 의도적으로 잘못된 코드: 큰 회전 명령 *)\nDrivePermit := Start;\nIF Start THEN Speed := 0.4; TurnRate := 2.5;\nELSE Speed := 0.0; TurnRate := 0.0; END_IF;`
};
