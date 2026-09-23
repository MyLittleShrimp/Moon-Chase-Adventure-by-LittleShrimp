export const SAVE_KEY='moon-chase-save-v1';
export const STAGES=[
 {chapter:0,scene:'city',title:'扫描月光，推演追月路线',label:'城市孪生终端',x:286,y:732,action:'扫描'},
 {chapter:0,scene:'traffic',title:'移开车辆，疏通运输通道',label:'交通联动节点',x:278,y:620,action:'联动'},
 {chapter:0,scene:'water',title:'连接管网，让积水流入出口',label:'水务控制节点',x:403,y:718,action:'排水'},
 {chapter:0,scene:'entrance',title:'完成文博问答，叩开博物馆门',label:'馆门 · 文博知识问答',x:270,y:449,action:'答题'},
 {chapter:1,scene:'museum',title:'靠近吴刚，问问月亮的下落',label:'吴刚',x:179,y:596,action:'交谈'},
 {chapter:1,scene:'museum',title:'走近古画，读懂孩子的心愿',label:'残缺的《中秋团圆图》',x:284,y:480,action:'观察'},
 {chapter:2,scene:'factory',title:'推送能源箱，备齐制造原料',label:'工厂孪生仓库',x:280,y:650,action:'推演'},
 {chapter:2,scene:'assembly',title:'点亮电路，激活月光核心',label:'实体装配台',x:280,y:640,action:'装配'},
 {chapter:2,scene:'terrace',title:'穿过航路，将模块送回展馆',label:'无人机起降坪',x:280,y:645,action:'配送'},
 {chapter:3,scene:'museum',title:'设备已就位，校准画中月光',label:'月光投影模块 · 待校准',x:326,y:593,action:'校准'},
 {chapter:3,scene:'museum',title:'打开桂木灯笼，让真月归位',label:'桂木灯笼',x:238,y:588,action:'归月'}
];
export const CITY_PATH=[{x:303,y:925,r:39},{x:300,y:810,r:51},{x:282,y:704,r:61},{x:250,y:586,r:59},{x:225,y:472,r:43},{x:237,y:429,r:34},{x:303,y:404,r:26},{x:341,y:365,r:24},{x:339,y:302,r:35},{x:345,y:255,r:31}];
export const SCENES={
 city:{name:'水岸长街',unlock:0,spawn:{x:300,y:850},chest:{x:318,y:548},ingredient:'桂花',note:'长街夜风里，留着一缕桂花香。'},
 traffic:{name:'智慧交通 · 灯街路口',unlock:1,spawn:{x:273,y:850},chest:{x:121,y:432},ingredient:'莲蓉',note:'运输箱里藏着一小罐莲蓉。'},
 water:{name:'智慧水务 · 石桥泵站',unlock:2,spawn:{x:356,y:844},chest:{x:248,y:760},ingredient:'糯米粉',note:'防潮布下，是一袋细细的糯米粉。'},
 entrance:{name:'博物馆前庭',unlock:3,spawn:{x:270,y:820},chest:{x:142,y:738},ingredient:'松子仁',note:'庭院角落的小木匣里，藏着一包清香的松子仁。'},
 museum:{name:'月下博物馆',unlock:4,spawn:{x:280,y:790},chest:{x:436,y:602},ingredient:'红豆沙',note:'展柜旁边的木匣，装着暖心的红豆沙。'},
 factory:{name:'数字孪生 · 预演车间',unlock:6,spawn:{x:312,y:865},chest:{x:412,y:771},ingredient:'核桃仁',note:'工具箱旁边，还有一包核桃仁。'},
 assembly:{name:'智能制造 · 实体车间',unlock:7,spawn:{x:311,y:868},chest:{x:145,y:764},ingredient:'芝麻',note:'小木盒里的芝麻，正适合添一层香。'},
 terrace:{name:'低空配送 · 起降露台',unlock:8,spawn:{x:283,y:768},chest:{x:413,y:785},ingredient:'蜂蜜',note:'货架旁边的蜂蜜，封口还完好。'}
};
export const TREASURE_SCENES=Object.keys(SCENES).filter(k=>SCENES[k].chest);
const LEGACY_TREASURE_SCENES=TREASURE_SCENES.filter(k=>k!=='entrance');
STAGES[6].y=765;STAGES[7].y=765;STAGES[8].y=705;
const inRect=(x,y,r)=>x>=r[0]&&x<=r[2]&&y>=r[1]&&y<=r[3];
export function distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
export function segmentDistance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y;const t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return {d:Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy),t};}
export function walkable(x,y,scene,stage=10){
 if(scene==='entrance')return inRect(x,y,[120,485,420,922])||inRect(x,y,[230,435,310,510]);
 if(scene==='traffic')return [[228,270,343,925],[95,405,441,459],[199,452,339,668]].some(r=>inRect(x,y,r));
 if(scene==='water'){const approach=[[242,704,444,858],[305,845,440,940]],drained=[[245,600,400,724],[268,470,382,620],[300,280,403,490],[330,225,390,300]];return [...approach,...(stage>2?drained:[])].some(r=>inRect(x,y,r));}
 if(scene==='factory'||scene==='assembly')return [[227,733,440,917],[100,730,440,766]].some(r=>inRect(x,y,r));
 if(scene==='terrace')return inRect(x,y,[129,654,440,802]);
 if(scene==='city'){if(y<244||y>936||stage<2&&y<465||stage<3&&y<385)return false;for(let i=0;i<CITY_PATH.length-1;i++){const a=CITY_PATH[i],b=CITY_PATH[i+1],p=segmentDistance({x,y},a,b);if(p.d<a.r+(b.r-a.r)*p.t)return true;}return false;}
 if(x<101||x>469||y<456||y>907||y>689&&(x<149||x>402))return false;
 return ![{x:123,y:459,w:64,h:101},{x:203,y:460,w:55,h:114},{x:331,y:488,w:67,h:87}].some(o=>x>o.x-9&&x<o.x+o.w+9&&y>o.y-7&&y<o.y+o.h+7);
}
export function findPath(from,to,scene,stage){
 const size=12,cols=45,rows=80,cell=p=>[Math.round(p.x/size),Math.round(p.y/size)];const [sx,sy]=cell(from);let [tx,ty]=cell(to);
 const can=(x,y)=>x>=0&&x<cols&&y>=0&&y<rows&&walkable(x*size,y*size,scene,stage);
 if(!can(tx,ty)){let best=Infinity;for(let x=0;x<cols;x++)for(let y=0;y<rows;y++)if(can(x,y)){const d=Math.hypot(x*size-to.x,y*size-to.y);if(d<best){best=d;tx=x;ty=y;}}if(best>85)return [];}
 const key=(x,y)=>y*cols+x,queue=[[sx,sy]],parents=new Map([[key(sx,sy),null]]);let goal=null;
 for(let head=0;head<queue.length;head++){const [x,y]=queue[head];if(x===tx&&y===ty){goal=key(x,y);break;}for(const [dx,dy]of [[0,-1],[0,1],[-1,0],[1,0]]){const nx=x+dx,ny=y+dy,k=key(nx,ny);if(can(nx,ny)&&!parents.has(k)){parents.set(k,key(x,y));queue.push([nx,ny]);}}}
 if(goal===null)return [];const path=[];for(let k=goal;parents.get(k)!==null;k=parents.get(k))path.push({x:(k%cols)*size,y:Math.floor(k/cols)*size});return path.reverse();
}
export function advanceRoute(path,next,blocked,cols=5){if(blocked.includes(next))return path;const last=path.at(-1),dx=Math.abs(last%cols-next%cols),dy=Math.abs(Math.floor(last/cols)-Math.floor(next/cols));if(dx+dy!==1)return path;const seen=path.indexOf(next);return seen>=0?path.slice(0,seen+1):[...path,next];}
export function unlockedScenes(stage){return Object.keys(SCENES).filter(k=>SCENES[k].unlock<=stage);}
export function bonusReady(s){return s.completed===true&&TREASURE_SCENES.every(k=>s.treasures.includes(k));}
export function validSave(value){
 if(!value||![1,2].includes(value.version)||!Number.isInteger(value.stage)||value.stage<0||value.stage>10)return null;
 const stage=value.stage,scene=value.version===2&&unlockedScenes(stage).includes(value.scene)?value.scene:STAGES[stage].scene,raw=value.player;
 const player=raw&&Number.isFinite(raw.x)&&Number.isFinite(raw.y)&&walkable(raw.x,raw.y,scene,stage)?{x:raw.x,y:raw.y}:{...SCENES[scene].spawn};
 const treasures=Array.isArray(value.treasures)?[...new Set(value.treasures.filter(k=>TREASURE_SCENES.includes(k)&&SCENES[k].unlock<=stage))]:[];
 const records={};for(const [k,v]of Object.entries(value.records||{}))if(['snake','traffic','water','quiz','factory','assembly','flight','calibration'].includes(k)&&Number.isFinite(v)&&v>=0)records[k]=v;
 const completed=stage===10&&value.completed===true;
 const storyPending=({drain:3,delivery:9,painting:10})[value.storyPending]===stage?value.storyPending:null;
 // Honor already-viewed seven-ingredient rewards; never grant the new chest automatically.
 return {version:2,stage,scene,player,elapsed:Math.max(0,Math.min(Number(value.elapsed)||0,86400)),empathy:stage>=6||value.empathy===true,collectibles:Array.isArray(value.collectibles)?[...new Set(value.collectibles.filter(x=>['city','child','moon'].includes(x)))]:[],treasures,records,completed,storyPending,introPending:stage===0&&value.introPending===true,completionVideoPending:completed&&value.endingPending===true&&value.completionVideoPending===true,endingPending:completed&&value.endingPending===true,bonusSeen:completed&&LEGACY_TREASURE_SCENES.every(k=>treasures.includes(k))&&value.bonusSeen===true};
}
export function makeSave(stage,player,elapsed,empathy,collectibles,extra={}){return {version:2,stage,player:{x:player.x,y:player.y},elapsed,empathy,collectibles,...extra};}
export function flightCollision(player,obstacle){return Math.abs(player.x-obstacle.x)<obstacle.w/2+12&&Math.abs(player.y-obstacle.y)<obstacle.h/2+13;}
