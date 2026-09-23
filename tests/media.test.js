import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {MusicQueue,GameAudio,MUSIC,SOUND_NAMES} from '../dist/audio.js';
import {MoviePlayer,MOVIES} from '../dist/movies.js';
import {validSave,makeSave,TREASURE_SCENES} from '../dist/engine.js';
import {serveStatic} from '../static-server.js';

test('main theme opens once, then complete shuffled rounds without boundary duplicates',()=>{
  let seed=1;const q=new MusicQueue(()=>((seed=seed*48271%2147483647)/2147483647));
  assert.equal(q.next(),'main-theme');let previous;
  const rounds=[];
  for(let i=0;i<30;i++){
    const round=Array.from({length:4},()=>q.next());
    assert.deepEqual([...round].sort(),MUSIC.slice(1));
    assert.notEqual(previous,round[0]);previous=round.at(-1);rounds.push(round.join());
  }
  assert.ok(new Set(rounds).size>5);q.reset();assert.equal(q.next(),'main-theme');
});

class Media extends EventTarget {
  constructor(){super();this.paused=true;this.currentTime=0;this.src='';this.plays=0;}
  play(){this.paused=false;this.plays++;return Promise.resolve();}
  pause(){this.paused=true;}
  load(){this.currentTime=0;this.paused=true;}
  removeAttribute(name){if(name==='src')this.src='';}
}
const noStorage={getItem:()=>null,setItem(){}};

test('one music element pauses/resumes at the same point; mute persists; ended advances',()=>{
  const music=new Media(),prefs=[];
  const audio=new GameAudio({music,storage:{getItem:()=>null,setItem:(...args)=>prefs.push(args)},contextFactory:()=>{throw Error('No audio in node');}});
  audio.start();assert.match(music.src,/main-theme/);assert.equal(music.paused,false);
  music.currentTime=42;audio.block('pause',true);audio.block('movie',true);audio.block('pause',false);
  assert.equal(music.paused,true);audio.block('movie',false);assert.equal(music.currentTime,42);assert.equal(music.paused,false);
  audio.toggle();assert.equal(music.paused,true);assert.equal(prefs.at(-1)[1],'off');audio.toggle();assert.equal(music.paused,false);
  music.dispatchEvent(new Event('ended'));assert.match(music.src,/soundtrack-[1-4]/);
  audio.block('title',true);assert.equal(music.paused,true);
});

test('missing tracks stop retrying after a bounded pass and gameplay remains available',()=>{
  const music=new Media(),notices=[];const audio=new GameAudio({music,storage:noStorage,contextFactory:()=>{throw Error();},onChange:(...args)=>notices.push(args)});
  audio.start();for(let i=0;i<MUSIC.length;i++)music.dispatchEvent(new Event('error'));
  assert.equal(music.plays,MUSIC.length);assert.equal(notices.length,1);
});

test('late decoded effects are discarded after leaving a puzzle or pausing',async()=>{
  let decode,plays=0;const music=new Media();const audio=new GameAudio({music,storage:noStorage});
  audio.blocks.clear();audio.context={};audio.buffer=()=>new Promise(r=>decode=r);audio.playBuffer=()=>plays++;
  const pending=audio.effect('chest_open');audio.block('pause',true);decode({});await pending;assert.equal(plays,0);
});

test('video skip, ended and a stale play promise only complete once',async()=>{
  let rejectPlay;const video=new Media();video.play=()=>new Promise((_,reject)=>rejectPlay=reject);
  const overlay={hidden:true,addEventListener(){}},status={},play={},skip={focus(){}},events=[];
  const movie=new MoviePlayer({overlay,video,status,play,skip,title:{},onActive:v=>events.push(v),onPause(){}});
  let count=0;movie.show('intro',()=>count++);assert.equal(movie.active,true);
  movie.finish();video.dispatchEvent(new Event('ended'));rejectPlay(new Error('interrupted'));await Promise.resolve();
  assert.equal(count,1);assert.equal(movie.active,false);assert.equal(overlay.hidden,true);assert.deepEqual(events,[true,false]);assert.equal(video.src,'');
});

test('video progress survives refresh without granting early completion or replaying old movies',()=>{
  const pending=validSave(makeSave(10,{x:238,y:613},200,true,['moon'],{completed:true,endingPending:true,completionVideoPending:true,treasures:TREASURE_SCENES}));
  assert.equal(pending.completionVideoPending,true);assert.equal(pending.endingPending,true);assert.equal(pending.treasures.length,8);
  assert.equal(validSave({...pending,stage:0}).completionVideoPending,false);
  assert.equal(validSave({...pending,endingPending:false}).completionVideoPending,false);
  assert.equal(validSave({version:2,stage:0,introPending:true}).introPending,true);
  assert.equal(validSave({version:2,stage:1,introPending:true}).introPending,false);
  assert.equal(validSave({version:2,stage:10,completed:true}).completionVideoPending,false);
});

test('pausing before video play resolves does not turn pause into an autoplay error',async()=>{
  let rejectPlay;const video=new Media();video.play=()=>new Promise((_,reject)=>rejectPlay=reject);
  const status={},play={};const movie=new MoviePlayer({overlay:{addEventListener(){}},video,status,play,skip:{focus(){}},title:{},onActive(){},onPause(){}});
  movie.show('intro',()=>{});movie.pause();rejectPlay(new Error('AbortError'));await Promise.resolve();
  assert.equal(play.textContent,'继续播放');assert.equal(status.textContent,'动画已暂停');movie.finish();
});

test('leaving flight while its loop decodes cannot start a ghost loop',async()=>{
  let decode,plays=0;const audio=new GameAudio({music:new Media(),storage:noStorage});
  audio.blocks.clear();audio.context={};audio.buffer=()=>new Promise(r=>decode=r);audio.playBuffer=()=>{plays++;return{stop(){}};};
  audio.setLoop('drone_hover_loop');audio.setLoop(null);decode({});await Promise.resolve();await Promise.resolve();
  assert.equal(plays,0);assert.equal(audio.loopName,null);
});

test('first-frame cover stays through loading and only leaves when a frame is presented',()=>{
  const video=new Media(),poster={hidden:true},callbacks=[],cancelled=[];
  video.requestVideoFrameCallback=cb=>{callbacks.push(cb);return callbacks.length;};
  video.cancelVideoFrameCallback=id=>cancelled.push(id);
  const movie=new MoviePlayer({overlay:{addEventListener(){}},video,poster,status:{},play:{},skip:{focus(){}},title:{},onActive(){},onPause(){}});
  movie.show('intro',()=>{});assert.equal(poster.src,MOVIES.intro.poster);assert.equal(video.poster,poster.src);assert.equal(poster.hidden,false);
  video.dispatchEvent(new Event('playing'));assert.equal(poster.hidden,false);
  movie.finish();assert.deepEqual(cancelled,[1]);movie.show('completion',()=>{});
  callbacks[0]();assert.equal(poster.hidden,false,'a skipped movie must not hide the next cover');
  callbacks[1]();assert.equal(poster.hidden,true);movie.finish();
});

test('both movies have lightweight stills and streamable MP4 metadata before video data',()=>{
  for(const movie of Object.values(MOVIES)){
    const poster=fs.readFileSync(new URL('../dist/'+movie.poster,import.meta.url));
    assert.equal(poster.toString('ascii',8,12),'WEBP');assert.ok(poster.length<200000);
    const b=fs.readFileSync(new URL('../dist/'+movie.src,import.meta.url)),atoms=[];
    for(let i=0;i+8<=b.length;){const size=b.readUInt32BE(i);assert.ok(size>=8&&i+size<=b.length);atoms.push(b.toString('ascii',i+4,i+8));i+=size;}
    assert.ok(atoms.includes('moov')&&atoms.includes('mdat'));assert.ok(atoms.indexOf('moov')<atoms.indexOf('mdat'));
    assert.ok(b.length<2*1024*1024,'five-second web videos must stay within the loading budget');
  }
});

test('all named media exist, WAV files are valid and local video supports seek ranges and HEAD',async t=>{
  for(const n of MUSIC)assert.ok(fs.statSync(new URL(`../dist/assets/audio/bgm/${n}.mp3`,import.meta.url)).size>100000);
  for(const n of SOUND_NAMES){const b=fs.readFileSync(new URL(`../dist/assets/audio/sfx/sfx_${n}.wav`,import.meta.url));assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WAVE');}
  const root=resolve(fileURLToPath(new URL('../dist/',import.meta.url)));
  const server=http.createServer((req,res)=>serveStatic(req,res,root));await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>server.close());
  const url=`http://127.0.0.1:${server.address().port}/${MOVIES.intro.src}`;
  const head=await fetch(url,{method:'HEAD'});assert.equal(head.status,200);assert.equal(head.headers.get('content-type'),'video/mp4');
  const size=Number(head.headers.get('content-length'));assert.ok(size>100000);
  const partial=await fetch(url,{headers:{Range:'bytes=0-99'}});assert.equal(partial.status,206);assert.equal((await partial.arrayBuffer()).byteLength,100);assert.equal(partial.headers.get('content-range'),`bytes 0-99/${size}`);
  const suffix=await fetch(url,{headers:{Range:'bytes=-16'}});assert.equal(suffix.status,206);assert.equal((await suffix.arrayBuffer()).byteLength,16);
  const invalid=await fetch(url,{headers:{Range:`bytes=${size}-`}});assert.equal(invalid.status,416);
});
