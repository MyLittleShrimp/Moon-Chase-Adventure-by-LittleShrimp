// Rules are independent of rendering, so solvability and input edge cases can be verified.
export const DIRS=[-1,1,-9,9];
export const SNAKE_BLOCKS=[10,11,12,14,15,16,19,25,28,30,31,32,34,37,43,46,48,49,50,52,55,61,64,65,66,68,69,70];
export const SNAKE_BEACONS=[58,40,22];
export const SNAKE_MODES={normal:{interval:.4,grace:.3},challenge:{interval:.23,grace:.18}};
export function createSnakeRun(){return {body:[72],collected:[],trail:[72],direction:1,turns:[],clock:0,graceLeft:null,running:false,dead:false,won:false};}
export function enqueueSnakeTurn(run,next){
 if(run.dead||run.won||![-1,1,-9,9].includes(next))return run;
 const reference=run.turns.at(-1)??run.direction;
 // Repeated keydown for the direction already held must not consume the buffer.
 if(next===reference||run.body.length>1&&next===-reference)return run;
 const turns=[...run.turns];
 if(turns.length<2)turns.push(next);
 else{if(next===turns[0]||run.body.length>1&&next===-turns[0])return run;turns[1]=next;}
 return {...run,turns};
}
export function advanceSnakeClock(run,dt,mode=SNAKE_MODES.normal){
 if(!run.running||run.dead||run.won)return run;
 const r={...run,turns:[...run.turns],clock:run.clock+Math.max(0,dt)};
 if(r.graceLeft!==null){
  // A new valid turn during the warning takes effect immediately, without another full tick.
  if(r.turns.length){const direction=r.turns.shift(),next=snakeStep(r,direction);if(!next.dead)return {...next,direction,clock:0,graceLeft:null};}
  r.graceLeft=Math.max(0,r.graceLeft-dt);r.dead=r.graceLeft===0;return r;
 }
 if(r.clock<mode.interval)return r;
 const direction=r.turns.shift()??r.direction,next=snakeStep(r,direction);
 if(next.dead)return {...r,direction,clock:0,graceLeft:mode.grace};
 return {...next,direction,clock:r.clock-mode.interval,graceLeft:null};
}
export function snakeStep(s,dir){const head=s.body[0],next=head+dir;if(next<0||next>=81||Math.abs(next%9-head%9)+Math.abs(Math.floor(next/9)-Math.floor(head/9))!==1||SNAKE_BLOCKS.includes(next))return {...s,dead:true};const food=SNAKE_BEACONS.includes(next)&&!s.collected.includes(next),body=s.body.slice(0,food?s.body.length:Math.max(0,s.body.length-1));if(body.includes(next))return {...s,dead:true};return {...s,body:[next,...body],collected:food?[...s.collected,next]:s.collected,trail:[...s.trail,next],won:next===8&&s.collected.length===3};}
export const TRAFFIC_BASE=[{x:4,y:2,n:2,h:true},{x:0,y:0,n:2,h:true},{x:2,y:0,n:2,h:false},{x:3,y:0,n:2,h:true},{x:5,y:0,n:2,h:false},{x:0,y:3,n:3,h:false},{x:1,y:3,n:2,h:true},{x:3,y:3,n:2,h:false},{x:4,y:3,n:3,h:false},{x:1,y:5,n:3,h:true},{x:5,y:4,n:2,h:false}];
export function slideVehicle(board,index,delta){if(!Number.isInteger(delta)||!delta||!board[index])return null;const vehicle=board[index],step=Math.sign(delta),occupied=new Set();board.forEach((v,i)=>{if(i!==index)for(let j=0;j<v.n;j++)occupied.add((v.y+(v.h?0:j))*6+v.x+(v.h?j:0));});for(let d=step;Math.abs(d)<=Math.abs(delta);d+=step){const x=vehicle.x+(vehicle.h?d:0),y=vehicle.y+(vehicle.h?0:d);for(let j=0;j<vehicle.n;j++){const xx=x+(vehicle.h?j:0),yy=y+(vehicle.h?0:j);if(xx<0||xx>=6||yy<0||yy>=6||occupied.has(yy*6+xx))return null;}}return board.map((v,i)=>i===index?{...v,x:v.x+(v.h?delta:0),y:v.y+(v.h?0:delta)}:{...v});}
export function scrambleTraffic(seed=41,steps=700){let board=TRAFFIC_BASE.map(v=>({...v}));for(let n=0;n<steps;n++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const i=seed%board.length;seed=(Math.imul(seed,1664525)+1013904223)>>>0;const b=slideVehicle(board,i,(seed>>>16)%2?1:-1);if(b)board=b;}return board;}
export function trafficSlideLimits(board,index){let min=0,max=0;while(min>-5&&slideVehicle(board,index,min-1))min--;while(max<5&&slideVehicle(board,index,max+1))max++;return {min,max};}
export const PIPE_PATH=[20,21,16,11,12,13,8,3,4];
export const ROTATE_MASK=m=>((m<<1)&15)|(m>>3);
export function pipeSolution(){const a=Array(25).fill(3);for(let i=0;i<PIPE_PATH.length;i++){const p=PIPE_PATH[i];let mask=0;for(const q of [i?PIPE_PATH[i-1]:p-1,i<PIPE_PATH.length-1?PIPE_PATH[i+1]:p+1])mask|=q===p-5?1:q===p+1?2:q===p+5?4:8;a[p]=mask;}return a;}
export function tracePipes(board){const visited=[],todo=[20],seen=new Set();let leak=false,reached=false;if(!(board[20]&8))return {won:false,visited:[],leak:20};while(todo.length){const p=todo.pop();if(seen.has(p))continue;seen.add(p);visited.push(p);for(const [bit,opposite,dx,dy]of [[1,4,0,-1],[2,8,1,0],[4,1,0,1],[8,2,-1,0]]){if(!(board[p]&bit))continue;if(p===20&&bit===8)continue;if(p===4&&bit===2){reached=true;continue;}const x=p%5+dx,y=Math.floor(p/5)+dy,q=y*5+x;if(x<0||x>=5||y<0||y>=5||!(board[q]&opposite)){leak=p;continue;}todo.push(q);}}return {won:reached&&leak===false,visited,leak};}
export const BOX_WALLS=[...Array(7).keys(),...Array.from({length:7},(_,i)=>42+i),7,13,14,20,21,27,28,34,35,41,22,26];
export const BOX_TARGETS=[9,11];
export const BOX_START={player:38,boxes:[17,24]};
export function pushBox(s,d){const n=s.player+d;if(n<0||n>=49||Math.abs(n%7-s.player%7)+Math.abs(Math.floor(n/7)-Math.floor(s.player/7))!==1||BOX_WALLS.includes(n))return null;let boxes=[...s.boxes];if(boxes.includes(n)){const q=n+d;if(BOX_WALLS.includes(q)||boxes.includes(q)||q<0||q>=49)return null;boxes[boxes.indexOf(n)]=q;}return {player:n,boxes};}
export const boxesWon=s=>BOX_TARGETS.every(p=>s.boxes.includes(p));
export function toggleCircuit(board,p){return board.map((v,i)=>Math.abs(i%4-p%4)+Math.abs(Math.floor(i/4)-Math.floor(p/4))<=1?!v:v);}
export const MIRRORS=[{x:2,y:5},{x:2,y:2},{x:5,y:2},{x:5,y:4},{x:4,y:4},{x:4,y:0},{x:1,y:0},{x:1,y:6}];
export const MIRROR_SOLUTION=['/','/','\\','/','\\','\\','/','\\'];
export function traceLight(mirrors){let x=-1,y=5,dx=1,dy=0;const path=[{x,y}],seen=new Set();for(let i=0;i<150;i++){x+=dx;y+=dy;path.push({x,y});if(x===6&&y===6)return {won:true,path};if(x<0||x>=7||y<0||y>=7||[[3,4],[6,3],[0,1]].some(([a,b])=>x===a&&y===b))break;const k=`${x},${y},${dx},${dy}`;if(seen.has(k))break;seen.add(k);const n=MIRRORS.findIndex(m=>m.x===x&&m.y===y);if(n>=0)[dx,dy]=mirrors[n]==='/'?[-dy,-dx]:[dy,dx];}return {won:false,path};}
// Alternating full-width barriers always require movement; there is no permanent safe column.
export function flightGate(index,t){const center=[67,246,112,216,70,250,140,225,78,242,105,208][index%12];return {center:center+Math.sin(t*.8+index)*10,gap:100};}

