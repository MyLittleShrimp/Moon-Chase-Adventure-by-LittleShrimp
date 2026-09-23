import{STAGES,SCENES,CITY_PATH,distance}from './engine.js';
const palette={k:'#102034',s:'#7494a6',w:'#dce5e5',h:'#f7f2d7',b:'#082137',c:'#45e5f6',g:'#eac776',d:'#355167'};
const sprite=['.......kkkkkkkk.......','.....kkwwwwwwwwkk.....','....kwwhhhhhhhhwwk....','...kwwwwwwwwwwwwwwk...','..kswkkkkkkkkkkwwsk..','.gkskbbbbbbbbbbkskg.','.gkskbccbbccbbbkskg.','.gkskbccbbccbbbkskg.','..kskbbbbbbbbbbksk..','...kwwkkkkkkkkwwk...','....kwwwwwwwwwwk....','.....kkssddsskk.....','....kkwwwwwwwwkk....','..kkgkwwhwwhwkgkk..','.kws.kwwwwwwwwk.swk.','.kwk.kwwbccbwwk.kwk.','.kwk.kwwwwwwwwk.kwk.','.kgk..kssssssk..kgk.','..k...kkwwwwkk...k..','.....kwk..kwk......','.....kgk..kgk......','....kwwk..kwwk.....','....kkkk..kkkk.....'];
export function drawRobot(c,x,y,time=0,moving=false,back=false){const bounce=moving?Math.sin(time*16)*1.7:Math.sin(time*2)*.6;c.save();c.fillStyle='#00102275';c.beginPath();c.ellipse(x,y+2,19,6,0,0,Math.PI*2);c.fill();c.translate(Math.round(x-22),Math.round(y-47+bounce));sprite.forEach((row,iy)=>{[...row].forEach((v,ix)=>{if(palette[v]){c.fillStyle=back&&v==='c'?'#355167':palette[v];c.fillRect(ix*2,iy*2,2,2);}})});c.restore();}
export function drawDrone(c,x,y,t){c.save();c.translate(x,y);c.strokeStyle='#829fac';c.lineWidth=5;c.beginPath();c.moveTo(-25,-10);c.lineTo(25,10);c.moveTo(-25,10);c.lineTo(25,-10);c.stroke();c.fillStyle='#c2dcdf';c.fillRect(-12,-11,24,23);c.fillStyle='#263f54';c.fillRect(-8,-5,16,11);c.fillStyle='#79f3e3';c.fillRect(-5,-2,10,5);c.strokeStyle='#b9e6e699';c.lineWidth=2;for(const[a,b]of [[-25,-11],[25,-11],[-25,11],[25,11]]){c.beginPath();c.ellipse(a,b,13,3+Math.abs(Math.sin(t*60))*2,0,0,Math.PI*2);c.stroke();}c.fillStyle='#bc9757';c.fillRect(-8,15,16,12);c.fillStyle='#74e8e4';c.fillRect(-4,17,8,7);c.restore();}
export class World{
 constructor(canvas){this.ctx=canvas.getContext('2d');this.images={};this.ready=Promise.all(['city','museum','museum-installed','projection-storyboard','entrance','reward','reunion','painting','traffic','water','factory','assembly','terrace','chest','portraits','change-storyboard'].map(name=>new Promise(resolve=>{const image=new Image();image.onload=()=>resolve(true);image.onerror=()=>resolve(false);image.src=`assets/${name}.png`;this.images[name]=image;})));this.particles=Array.from({length:24},(_,i)=>({x:(i*137.7)%540,y:(i*71.9)%960,p:i*1.3}));}
 drawChest(chest,opened){
  const c=this.ctx,sheet=this.images.chest;if(!chest||!sheet.complete||!sheet.naturalWidth)return;
  // Trim transparent sprite-sheet margins at draw time. Both states share a ground anchor.
  const crop=opened?[995,156,553,633]:[250,235,533,538],scale=30/533,w=crop[2]*scale,h=crop[3]*scale;
  c.save();c.fillStyle='#02132366';c.beginPath();c.ellipse(chest.x,chest.y-2,17,5,0,0,Math.PI*2);c.fill();c.globalAlpha=.92;c.imageSmoothingEnabled=false;c.drawImage(sheet,...crop,chest.x-w/2,chest.y-h,w,h);c.restore();
 }
 draw(state,t){
  const c=this.ctx,scene=state.cinematic|| (state.ending?'reunion':state.started?state.scene:'reunion'),img=this.images[scene==='museum'&&state.stage>=9?'museum-installed':scene];c.clearRect(0,0,540,960);
  if(img?.complete&&img.naturalWidth){if(scene==='water'){const half=img.naturalWidth/2;c.drawImage(img,state.stage>2?half:0,0,half,img.naturalHeight,0,0,540,960);}else c.drawImage(img,0,0,540,960);}else{c.fillStyle='#09253c';c.fillRect(0,0,540,960);}
  if(scene==='museum'&&state.stage>=10){
   const painting=this.images['projection-storyboard'];
   if(painting?.complete&&painting.naturalWidth){c.save();c.fillStyle='#7fe9ef22';c.beginPath();c.moveTo(366,493);c.lineTo(142,368);c.lineTo(398,368);c.closePath();c.fill();c.strokeStyle='#80f5ed88';c.lineWidth=1.5;c.setLineDash([4,5]);c.beginPath();c.moveTo(366,493);c.lineTo(142,368);c.moveTo(366,493);c.lineTo(398,368);c.stroke();c.setLineDash([]);c.drawImage(painting,254,674,423,290,142,174,256,194);c.strokeStyle='#92f7ed';c.strokeRect(142,174,256,194);c.restore();}
  }
  c.save();for(const p of this.particles){c.globalAlpha=.12+Math.max(0,Math.sin(t+p.p))*.35;c.fillStyle='#fce7a6';c.fillRect((p.x+Math.sin(t*.3+p.p)*13+540)%540,(p.y-t*(2+p.p%3)+9600)%960,2,2);}c.globalAlpha=1;
  if(state.started&&!state.ending&&!state.cinematic){
   const target=STAGES[state.stage],chest=SCENES[scene].chest,opened=state.treasures.includes(scene);
   if(chest&&chest.y<=state.player.y)this.drawChest(chest,opened);
   if(state.path.length){const p=state.path.at(-1);c.fillStyle='#d3f5e580';c.beginPath();c.ellipse(p.x,p.y,8,4,0,0,Math.PI*2);c.fill();}
   const current=target.scene===scene&&!state.completed,near=current&&distance(state.player,target)<62;
   if(current){c.save();c.translate(target.x,target.y-49+Math.sin(t*3)*4);c.rotate(Math.PI/4);c.fillStyle=near?'#ffe6a5':'#deb15e';c.fillRect(-7,-7,14,14);c.fillStyle='#a68034';c.fillRect(-3,-3,6,6);c.restore();c.strokeStyle='#f1d18180';c.beginPath();c.ellipse(target.x,target.y,24,8,0,0,Math.PI*2);c.stroke();}
   drawRobot(c,state.player.x,state.player.y,t,state.moving,state.facing==='up');
   if(chest&&chest.y>state.player.y)this.drawChest(chest,opened);
   if(near){c.font='14px "Microsoft YaHei",sans-serif';const w=c.measureText(target.label).width+26,x=Math.max(8,Math.min(532-w,target.x-w/2)),y=target.y-91;c.fillStyle='#071f32ed';c.fillRect(x,y,w,28);c.fillStyle='#fff0c5';c.textAlign='center';c.fillText(target.label,x+w/2,y+19);}
  }c.restore();
 }
}
