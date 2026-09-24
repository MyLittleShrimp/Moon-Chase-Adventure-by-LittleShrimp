import{createSnakeRun,enqueueSnakeTurn,advanceSnakeClock,SNAKE_MODES,SNAKE_BLOCKS,SNAKE_BEACONS,scrambleTraffic,slideVehicle,trafficSlideLimits,pipeSolution,ROTATE_MASK,tracePipes,BOX_START,BOX_WALLS,BOX_TARGETS,pushBox,boxesWon,toggleCircuit,MIRRORS,traceLight,flightGate}from './rules.js';
import{drawDrone}from './world.js';
import{QUIZ_BANK,QUIZ_PASS_COUNT,QUIZ_ROUND_SIZE,createQuizRun,answerQuiz,nextQuizQuestion}from './quiz.js';
export function createPuzzles(api){
 const{$,open,close,header,setTick,setKeys,sound,loop}=api;
 const dirKey={ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right',ArrowUp:'up',w:'up',ArrowDown:'down',s:'down'};
 function frame(k,t,instructions,body){open(`${header(k,t,instructions)}${body}<div class="puzzle-status" id="pstatus" role="status"></div><div class="puzzle-toolbar"><button class="secondary-button" id="reset-puzzle">重试本关</button><button class="secondary-button" id="leave-puzzle">返回场景</button></div>`);$('#leave-puzzle').onclick=close;sound('task_start');}
 function status(t){$('#pstatus').textContent=t;}
 function win(id,score,next,message){setTick(null);setKeys(null);loop(null);sound(({assembly:'core_powerup',calibration:'projector_on',flight:'drone_land'})[id]||'puzzle_success');const r=document.createElement('div');r.className='puzzle-result';r.innerHTML=`<strong>挑战完成</strong><p>${message}</p><button class="gold-button" id="complete-puzzle">${api.isReplay()?'保存成绩 · 返回场景':'继续冒险'} →</button>`;$('#modal').append(r);$('#complete-puzzle').onclick=()=>api.complete(id,score,next,message);$('#modal').querySelectorAll('.board button,.vehicle,#undo,#test-flow,#test-light,.dpad button').forEach(b=>b.disabled=true);$('#complete-puzzle').focus();}
 function dpad(move,ignoreRepeat=false){
  const pad=$('#dpad'),toolbar=$('#modal .puzzle-toolbar'),controls=document.createElement('div'),actions=document.createElement('div');
  controls.className='puzzle-controls';actions.className='puzzle-actions';
  if($('#undo'))actions.append($('#undo'));
  actions.append(...toolbar.children);controls.append(actions,pad);toolbar.replaceWith(controls);
  pad.setAttribute('role','group');pad.setAttribute('aria-label','方向控制');
  pad.innerHTML='<button data-dir="up" aria-label="向上">↑</button><button data-dir="left" aria-label="向左">←</button><button data-dir="down" aria-label="向下">↓</button><button data-dir="right" aria-label="向右">→</button>';
  pad.querySelectorAll('button').forEach(b=>{
   b.onpointerdown=e=>{if(!e.isPrimary||e.button!==0||b.disabled)return;e.preventDefault();b.setPointerCapture(e.pointerId);b.classList.add('pressed');move(b.dataset.dir);};
   b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>b.classList.remove('pressed');
   // Pointer input is handled on press; keyboard and assistive clicks still work once.
   b.onclick=e=>{if(e.detail===0)move(b.dataset.dir);};
  });
  setKeys((k,repeat)=>{if(dirKey[k]&&!(ignoreRepeat&&repeat))move(dirKey[k]);});
 }
 let lastQuizIds=[];
 function quiz(){
  frame('博物馆前庭 / 文博知识','以学识，叩开馆门',`题库共 ${QUIZ_BANK.length} 题，每轮随机抽 ${QUIZ_ROUND_SIZE} 题。答对 ${QUIZ_PASS_COUNT} 题即可通关，无需连续答对，也没有倒计时。`,'<section class="quiz-card" id="quiz-card" aria-label="文博知识问答"></section>');
  let run=createQuizRun(lastQuizIds);lastQuizIds=run.questions.map(q=>q.id);
  function render(){
   const q=run.questions[run.index],answered=run.selected!==null,right=run.selected===q.answer;
   $('#quiz-card').innerHTML=`<div class="quiz-meta"><span>${q.category} · 第 ${run.index+1} / ${QUIZ_ROUND_SIZE} 题</span><strong>答对 ${run.correct} / ${QUIZ_PASS_COUNT}</strong></div><h3 id="quiz-question" tabindex="-1">${q.prompt}</h3><div class="quiz-choices">${q.choices.map((text,i)=>`<button class="quiz-option ${answered&&i===q.answer?'correct':''} ${answered&&i===run.selected&&!right?'incorrect':''}" data-option="${i}" ${answered?'disabled':''}><span>${'ABCD'[i]}</span><b>${text}</b>${answered&&i===q.answer?'<small>✓ 正确</small>':answered&&i===run.selected?'<small>× 所选</small>':''}</button>`).join('')}</div>${answered?`<div class="quiz-explanation" role="status"><strong>${right?'答对了':'这一题再记住一点'}</strong><p>${q.explanation}</p><a href="${q.source.url}" target="_blank" rel="noopener noreferrer">资料：${q.source.title} ↗</a></div>${!run.finished?'<button class="gold-button" id="next-question">下一题 →</button>':''}`:''}`;
   $('#quiz-card').querySelectorAll('[data-option]').forEach(b=>b.onclick=()=>{const next=answerQuiz(run,+b.dataset.option);if(next===run)return;run=next;sound(run.selected===q.answer?'quiz_correct':'quiz_wrong');render();if(run.won){status(api.isReplay()?'本轮已通过，可以保存成绩。':'已达到通关条件，可以进入馆内。');win('quiz',run.attempts-run.correct,4,`答对 ${run.correct} 题，馆门已开启。共答 ${run.attempts} 题，答错 ${run.attempts-run.correct} 题。`);if(!api.isReplay())$('#complete-puzzle').textContent='进入月下博物馆 →';}else if(run.finished){status(`本轮答对 ${run.correct} / ${QUIZ_ROUND_SIZE} 题，尚未达到 ${QUIZ_PASS_COUNT} 题。可以换一组继续挑战。`);$('#reset-puzzle').focus();}else $('#next-question').focus();});
   if($('#next-question'))$('#next-question').onclick=()=>{run=nextQuizQuestion(run);render();$('#quiz-question').focus();$('#modal').scrollTop=0;};
   if(!run.finished)status(answered?'读完讲解，再进入下一题。':'选择一个答案；答题期间可以暂停。');
  }
  $('#reset-puzzle').textContent='换一组题 · 重试';$('#reset-puzzle').onclick=quiz;render();
 }
 function snake(fast=false){
  frame('城市孪生 / 障碍贪吃蛇','把走过的路，变成航线','方向键 / WASD 或下方方向键转弯。经过三个信标，再抵达右上角出口。可以提前输入连续转弯；撞到障碍前会短暂停住，此时转向仍能避开。','<div class="mode-select"><button id="normal-snake">舒缓航速</button><button id="fast-snake">挑战航速</button></div><div id="snake-grid" class="board snake-board"></div><button class="gold-button" id="launch-snake">开始行进</button><div id="dpad" class="dpad"></div>');
  let s=createSnakeRun(),done=false,paused=false;const mode=fast?SNAKE_MODES.challenge:SNAKE_MODES.normal;
  const pause=document.createElement('button');pause.id='pause-snake';pause.className='secondary-button';pause.type='button';$('#leave-puzzle').before(pause);
  const board=$('#snake-grid');board.innerHTML=Array.from({length:81},(_,i)=>`<span class="tile ${SNAKE_BLOCKS.includes(i)?'wall':''}"></span>`).join('');
  const arrows={'-1':'←','1':'→','-9':'↑','9':'↓'};
  function render(){
   [...board.children].forEach((el,i)=>{el.classList.toggle('snake-body',s.body.includes(i));el.classList.toggle('snake-head',s.body[0]===i);el.classList.toggle('trail',s.trail.includes(i)&&!s.body.includes(i));el.textContent=s.body[0]===i?arrows[s.turns[0]??s.direction]:i===8?'出':SNAKE_BEACONS.includes(i)&&!s.collected.includes(i)?'◇':'';});
   board.classList.toggle('collision-warning',s.graceLeft!==null&&!s.dead&&!paused);
   pause.textContent=paused?'继续游戏':'暂停游戏';pause.disabled=(!s.running&&!paused)||s.dead||s.won;
   $('#dpad').querySelectorAll('button').forEach(b=>{b.disabled=paused||s.dead||s.won;if(b.disabled)b.classList.remove('pressed');});
   const progress=`${fast?'挑战':'舒缓'} · 信标 ${s.collected.length}/3 · 航线 ${s.trail.length-1} 格`;
   status(paused?`已暂停 · 信标 ${s.collected.length}/3 · 航线 ${s.trail.length-1} 格`:s.graceLeft!==null&&!s.dead?'前方有障碍 · 现在转向还能避开':`${progress}${s.turns.length?' · 已接收 '+s.turns.map(d=>arrows[d]).join(' '):''}`);
  }
  dpad(d=>{if(done||paused)return;s=enqueueSnakeTurn(s,{left:-1,right:1,up:-9,down:9}[d]);render();},true);
  // Preserve the partial movement tick, collision grace and buffered turns across a pause.
  pause.onclick=()=>{if(pause.disabled||done)return;paused=!paused;s={...s,running:!paused};render();};
  $('#launch-snake').onclick=()=>{$('#modal').querySelector('p').hidden=true;$('#modal').querySelector('.mode-select').hidden=true;$('#launch-snake').hidden=true;$('#modal').scrollTop=$('#modal').scrollHeight;s={...s,running:true};render();};$('#normal-snake').onclick=()=>snake(false);$('#fast-snake').onclick=()=>snake(true);$(fast?'#fast-snake':'#normal-snake').classList.add('selected');$('#reset-puzzle').onclick=()=>snake(fast);render();
  setTick(dt=>{if(!s.running||done)return;const before=s;s=advanceSnakeClock(s,dt,mode);if(s.graceLeft!==null&&before.graceLeft===null)sound('collision_warning');if(s.collected.length>before.collected.length)sound('snake_beacon');render();if(s.dead){done=true;board.classList.remove('collision-warning');status('没来得及避开。可以提前转向，或在障碍前的停顿中补救。');sound('soft_failure');return;}if(s.won){done=true;win('snake',s.trail.length-1,1,`已将 ${s.trail.length-1} 格轨迹保存为城市航线。`);}});
 }

 function traffic(){
  frame('智慧交通 / 车阵华容道','给月光运输车让路','按住车辆，沿车身箭头拖动；也可选中后用方向键移动。让金色月光车沿当前这一行向右驶出。','<div class="traffic-layout"><div id="traffic-board" class="traffic-board" aria-label="六乘六车阵，出口在第三行右侧"></div><div class="traffic-exit" aria-label="第三行向右出口"><span>出<br>口</span><b aria-hidden="true">→</b></div></div><div class="dpad" id="dpad"></div><button class="secondary-button" id="undo">撤回一步</button>');
  let board=scrambleTraffic(127),selected=0,moves=0,history=[],done=false,drag=null;
  const el=$('#traffic-board');
  el.innerHTML=board.map((v,i)=>`<button class="vehicle ${i===0?'cargo':''}" aria-label="${i===0?'月光运输车':'车辆 '+i}，${v.h?'横向':'纵向'}，可拖动" data-car="${i}">${i===0?'月光':String.fromCharCode(64+i)}<small>${v.h?'↔':'↕'}</small></button>`).join('');
  function render(){
   board.forEach((v,i)=>{const b=el.children[i];Object.assign(b.style,{left:`${v.x/6*100}%`,top:`${v.y/6*100}%`,width:`${(v.h?v.n:1)/6*100}%`,height:`${(v.h?1:v.n)/6*100}%`});b.classList.toggle('selected',i===selected);b.setAttribute('aria-pressed',String(i===selected));});
   status(`移动 ${moves} 格 · 挑战目标 ≤ 24 格`);$('#undo').disabled=!history.length||done;
  }
  function move(delta){
   if(done||!delta)return;const next=slideVehicle(board,selected,delta);
   if(!next){status('前方被挡住了，先移开其他车辆。');return;}
   history.push({board,moves});board=next;moves+=Math.abs(delta);sound('vehicle_slide');render();
   if(board[0].x===4){done=true;win('traffic',moves,2,`车阵已疏通，共移动 ${moves} 格。`);}
  }
  function preview(e){
   if(!drag||e.pointerId!==drag.id)return;
   const offset=drag.horizontal?e.clientX-drag.x:e.clientY-drag.y;
   drag.moved ||= Math.abs(offset)>5;
   drag.offset=drag.moved?Math.max(drag.min*drag.cell,Math.min(drag.max*drag.cell,offset)):0;
   drag.button.style.transform=`translate${drag.horizontal?'X':'Y'}(${drag.offset}px)`;
  }
  function finish(e,cancelled=false){
   if(!drag||e.pointerId!==drag.id)return;if(!cancelled)preview(e);
   const current=drag;drag=null;current.button.style.transform='';current.button.classList.remove('dragging');
   if(current.button.hasPointerCapture(current.id))current.button.releasePointerCapture(current.id);
   if(cancelled||done)return;
   const delta=Math.sign(current.offset)*Math.round(Math.abs(current.offset)/current.cell);
   if(delta)move(delta);else if(current.moved&&current.min===0&&current.max===0)status('这辆车暂时被挡住了，先移开其他车辆。');
  }
  el.querySelectorAll('button').forEach(b=>{
   b.onpointerdown=e=>{
    if(done||drag||!e.isPrimary||e.button!==0)return;e.preventDefault();selected=+b.dataset.car;render();
    drag={id:e.pointerId,button:b,x:e.clientX,y:e.clientY,horizontal:board[selected].h,cell:el.clientWidth/6,...trafficSlideLimits(board,selected),offset:0,moved:false};
    b.setPointerCapture(e.pointerId);b.classList.add('dragging');
   };
   b.onpointermove=preview;b.onpointerup=e=>finish(e);b.onpointercancel=b.onlostpointercapture=e=>finish(e,true);
   b.onclick=()=>{if(!done&&!drag){selected=+b.dataset.car;render();}};
  });
  dpad(d=>{if(done||drag)return;const v=board[selected];if(v.h!==['left','right'].includes(d)){status('这辆车只能沿自身方向移动。');return;}move(d==='left'||d==='up'?-1:1);});
  $('#undo').onclick=()=>{if(done||drag||!history.length)return;({board,moves}=history.pop());render();};$('#reset-puzzle').onclick=traffic;render();
 }
 function water(){
  frame('智慧水务 / 管网接通','让水流找到出口','点击管件顺时针旋转。连接左下方入口与右上方出口，连通的水路不能漏水；多余管件可以留在外面。','<div class="board-labels"><span>左下：进水 →</span><span>右上：出水 →</span></div><div id="pipe-board" class="board pipe-board"></div><button class="gold-button" id="test-flow">试水</button>');
  let board=pipeSolution().map((m,i)=>{for(let r=0;r<(i*7+2)%4;r++)m=ROTATE_MASK(m);return m;}),moves=0,done=false,wet=[];
  const glyph={3:'└',5:'│',6:'┌',9:'┘',10:'─',12:'┐'};
  function render(){const el=$('#pipe-board');el.innerHTML=board.map((m,i)=>`<button class="tile pipe ${wet.includes(i)?'wet':''} ${i===20||i===4?'endpoint':''}" data-pipe="${i}" aria-label="管件 ${i+1}，${glyph[m]}">${glyph[m]}</button>`).join('');el.querySelectorAll('button').forEach(b=>b.onclick=()=>{if(done)return;const i=+b.dataset.pipe;board[i]=ROTATE_MASK(board[i]);sound('mechanism_click');moves++;wet=[];render();});status(`旋转 ${moves} 次 · 点击试水检查连接`);}
  $('#test-flow').onclick=()=>{if(done)return;const r=tracePipes(board);wet=r.visited;render();if(r.won){done=true;win('water',moves,3,`石桥通路恢复。共旋转 ${moves} 次。`);}else status(r.leak===false?'水路还没有连到出口。':`第 ${Number(r.leak)+1} 个管件连接中断，请检查接口。`);};$('#reset-puzzle').onclick=water;render();
 }
 function factory(){
  frame('工厂孪生 / 能源推箱','先想好退路，再推动','把两个能源箱推到金色底座上。只能推，不能拉；推入死角时可以撤回。方向键 / WASD 或下方按钮移动。','<div id="box-board" class="board box-board"></div><div class="dpad" id="dpad"></div><button class="secondary-button" id="undo">撤回一步</button>');
  let s={player:BOX_START.player,boxes:[...BOX_START.boxes]},moves=0,history=[],done=false;
  function render(){$('#box-board').innerHTML=Array.from({length:49},(_,i)=>`<span class="tile ${BOX_WALLS.includes(i)?'wall':''} ${BOX_TARGETS.includes(i)?'target':''} ${s.boxes.includes(i)?'crate':''} ${s.player===i?'robot-cell':''}">${s.player===i?'●':s.boxes.includes(i)?'▣':BOX_TARGETS.includes(i)?'◇':''}</span>`).join('');status(`移动 ${moves} 步 · 就位 ${BOX_TARGETS.filter(p=>s.boxes.includes(p)).length}/2 · 目标 ≤ 16 步`);$('#undo').disabled=!history.length||done;}
  dpad(d=>{if(done)return;const next=pushBox(s,{up:-7,down:7,left:-1,right:1}[d]);if(!next){sound('collision_warning',.35);return;}const pushed=next.boxes.some((p,i)=>p!==s.boxes[i]);if(pushed)sound(next.boxes.some(p=>BOX_TARGETS.includes(p)&&!s.boxes.includes(p))?'box_on_target':'box_push');history.push(s);s=next;moves++;render();if(boxesWon(s)){done=true;win('factory',moves,7,`能源已就位，共移动 ${moves} 步。`);}});
  $('#undo').onclick=()=>{if(done||!history.length)return;s=history.pop();moves--;render();};$('#reset-puzzle').onclick=factory;render();
 }
 function assembly(){
  frame('智能制造 / 联动电路','点亮整片月光核心','点击节点，会同时切换自身与上下左右节点的亮灭。让全部 16 个节点亮起，即可完成装配。','<div id="circuit-board" class="board circuit-board"></div><button class="secondary-button" id="undo">撤回一步</button>');
  let board=Array(16).fill(true);for(const i of [0,2,5,6,11,15])board=toggleCircuit(board,i);let history=[],moves=0,done=false;
  function render(){const el=$('#circuit-board');el.innerHTML=board.map((v,i)=>`<button class="tile circuit ${v?'lit':''}" data-node="${i}" aria-label="节点 ${i+1}，${v?'已亮':'熄灭'}">${v?'●':'○'}</button>`).join('');el.querySelectorAll('button').forEach(b=>b.onclick=()=>{if(done)return;history.push(board);board=toggleCircuit(board,+b.dataset.node);sound('mechanism_click');moves++;render();if(board.every(Boolean)){done=true;win('assembly',moves,8,`核心已激活，共切换 ${moves} 次。`);}});status(`点亮 ${board.filter(Boolean).length}/16 · 切换 ${moves} 次 · 目标 ≤ 6 次`);$('#undo').disabled=!history.length||done;}
  $('#undo').onclick=()=>{if(done||!history.length)return;board=history.pop();moves--;render();};$('#reset-puzzle').onclick=assembly;render();
 }
 function flight(){
  frame('低空配送 / 穿越航道','把月光平稳送到展馆','拖动飞行区域或按左右键，穿过青色缺口。缺口左右交替，停在同一列无法通关。共 12 道挡板，碰撞三次需重试。','<canvas id="flight-canvas" class="mini-canvas" width="320" height="400" aria-label="无人机飞行区，按左右键或拖动控制"></canvas><button class="gold-button" id="launch-flight">起飞</button><div class="flight-controls"><button id="fly-left" aria-label="无人机向左">←</button><button id="fly-right" aria-label="无人机向右">→</button></div>');
  const canvas=$('#flight-canvas'),c=canvas.getContext('2d');let x=160,time=0,life=3,spawn=0,clock=0,gates=[],passed=0,hit=0,active=false,done=false,held=0;
  function setX(e){const r=canvas.getBoundingClientRect();x=Math.max(18,Math.min(302,(e.clientX-r.left)/r.width*320));}
  canvas.onpointerdown=e=>{canvas.setPointerCapture(e.pointerId);setX(e);};canvas.onpointermove=e=>{if(canvas.hasPointerCapture(e.pointerId))setX(e);};
  for(const[id,v]of [['#fly-left',-1],['#fly-right',1]]){$(id).onpointerdown=e=>{e.currentTarget.setPointerCapture(e.pointerId);held=v;};$(id).onpointerup=$(id).onpointercancel=$(id).onlostpointercapture=()=>held=0;}
  $('#launch-flight').onclick=()=>{$('#modal').querySelector('p').hidden=true;$('#launch-flight').hidden=true;$('#modal').scrollTop=0;active=true;sound('drone_takeoff');loop('drone_hover_loop');$('#launch-flight').disabled=true;$('#launch-flight').textContent='配送进行中';};$('#reset-puzzle').onclick=flight;
  function draw(){c.fillStyle='#071d30';c.fillRect(0,0,320,400);c.strokeStyle='#244456';for(let y=(time*80)%40;y<400;y+=40){c.beginPath();c.moveTo(0,y);c.lineTo(320,y);c.stroke();}for(const g of gates){const gap=flightGate(g.id,time),left=gap.center-gap.gap/2,right=gap.center+gap.gap/2;c.fillStyle=g.hit?'#96504f':'#566775';c.fillRect(0,g.y,left,22);c.fillRect(right,g.y,320-right,22);c.fillStyle='#73e6d6';c.fillRect(left-3,g.y,3,22);c.fillRect(right,g.y,3,22);}if(hit<=0||Math.floor(hit*8)%2===0)drawDrone(c,x,335,time);c.fillStyle='#f9df9c';c.font='14px sans-serif';c.fillText(`护盾 ${life} / 3`,12,23);c.fillText(`航道 ${passed} / 12`,214,23);}
  status('看清前方缺口，提前变换航线。');draw();setTick(dt=>{if(active&&!done){time+=dt;clock+=dt;hit=Math.max(0,hit-dt);const k=api.keys,move=held+(k.has('ArrowRight')||k.has('d')?1:0)-(k.has('ArrowLeft')||k.has('a')?1:0);if(move)x=Math.max(18,Math.min(302,x+Math.sign(move)*245*dt));if(clock>1.6&&spawn<12){clock=0;gates.push({id:spawn++,y:-24,hit:false,counted:false});}for(const g of gates){g.y+=(120+g.id*2.5)*dt;const gap=flightGate(g.id,time);if(!g.hit&&g.y<350&&g.y+22>320&&(x-17<gap.center-gap.gap/2||x+17>gap.center+gap.gap/2)&&hit<=0){life--;g.hit=true;hit=.9;sound('drone_hit');if(life<=0){done=true;loop(null);sound('soft_failure');status('护盾耗尽。重试本关，留意下一道缺口。');}}if(!g.counted&&g.y>354){passed++;g.counted=true;}}gates=gates.filter(g=>g.y<430);if(passed===12&&!done){done=true;win('flight',3-life,9,`模块送达，剩余 ${life} 层护盾。挑战无伤配送！`);}}draw();});
 }
 function calibration(){
  frame('月光投影 / 反射镜光路','让一束光，走进画里','点击镜片切换 ／ 与 ＼。让左侧光源经过镜片，最终到达右下角月亮；灰色方块会挡住光线。','<div id="mirror-board" class="mirror-board"><svg id="light-svg" viewBox="0 0 7 7" aria-hidden="true"></svg><div id="mirror-grid" class="board mirror-grid"></div></div><button class="gold-button" id="test-light">确认光路</button>');
  let mirrors=Array(8).fill('/'),moves=0,done=false;
  function render(){const r=traceLight(mirrors);$('#light-svg').innerHTML=`<polyline points="${r.path.map(p=>`${p.x+.5},${p.y+.5}`).join(' ')}" fill="none" stroke="#ffdc84" stroke-width=".075"/>`;$('#mirror-grid').innerHTML=Array.from({length:49},(_,i)=>{const x=i%7,y=Math.floor(i/7),m=MIRRORS.findIndex(p=>p.x===x&&p.y===y),wall=[[3,4],[6,3],[0,1]].some(([a,b])=>a===x&&b===y);return m>=0?`<button class="tile mirror" data-mirror="${m}" aria-label="反射镜 ${m+1}，${mirrors[m]}">${mirrors[m]}</button>`:`<span class="tile ${wall?'wall':''}">${i===35?'→':i===48?'☾':''}</span>`;}).join('');$('#mirror-grid').querySelectorAll('button').forEach(b=>b.onclick=()=>{if(done)return;const i=+b.dataset.mirror;mirrors[i]=mirrors[i]==='/'?'\\':'/';sound('mechanism_click');moves++;render();});status(`已调整 ${moves} 次 · ${r.won?'光线已到达月亮，可以确认。':'沿光线寻找下一个转折点。'}`);}
  $('#test-light').onclick=()=>{if(done)return;if(traceLight(mirrors).won){done=true;win('calibration',moves,10,`画中月光已点亮，共调整 ${moves} 次。`);}else status('光线还未到达右下方月亮，请继续调整。');};$('#reset-puzzle').onclick=calibration;render();
 }
 return {snake,traffic,water,quiz,factory,assembly,flight,calibration};
}
