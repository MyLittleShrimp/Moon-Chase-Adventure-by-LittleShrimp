import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('game starts with pending artwork and blocked storage, then recovers the current scene',async t=>{
 const elements=new Map(),images=[];let frame;
 class Element extends EventTarget{
  constructor(){super();this.hidden=false;this.disabled=false;this.children=[];this.style={};this.dataset={};this.classList={add(){},remove(){},toggle(){}};this.paused=true;}
  set innerHTML(value){this.html=value;for(const [,id]of value.matchAll(/id="([^"]+)"/g))elements.set('#'+id,new Element());}
  get innerHTML(){return this.html||'';}
  setAttribute(name,value){this[name]=value;}
  removeAttribute(name){delete this[name];}
  querySelectorAll(){return [];}
  prepend(){} focus(){} append(){}
  play(){this.paused=false;return Promise.resolve();}
  pause(){this.paused=true;}
  load(){}
 }
 const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 for(const [,id]of html.matchAll(/id="([^"]+)"/g))elements.set('#'+id,new Element());
 for(const key of ['#interact b','#sound span'])elements.set(key,new Element());
 elements.get('#world').getContext=()=>new Proxy({measureText:()=>({width:50})},{get:(obj,key)=>obj[key]||(()=>{})});
 const doc={hidden:false,querySelector:s=>elements.get(s)||null,querySelectorAll:()=>[],addEventListener(){},createElement:()=>new Element()};
 const mocks={document:doc,window:{addEventListener(){}},requestAnimationFrame:fn=>{frame=fn;},Image:class{constructor(){images.push(this);this.naturalWidth=0;}removeAttribute(){}}};
 for(const [name,value]of Object.entries(mocks)){
  const old=Object.getOwnPropertyDescriptor(globalThis,name);Object.defineProperty(globalThis,name,{configurable:true,writable:true,value});
  t.after(()=>{if(old)Object.defineProperty(globalThis,name,old);else delete globalThis[name];});
 }
 const storage=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
 Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw new Error('SecurityError');}});
 t.after(()=>{if(storage)Object.defineProperty(globalThis,'localStorage',storage);else delete globalThis.localStorage;});
 t.mock.timers.enable({apis:['setTimeout']});
 await import('../dist/game.js?startup-integration');
 const $=s=>elements.get(s);
 assert.equal(images.length,2);assert.equal($('#start').disabled,false,'unrelated/pending images must not lock start');
 $('#start').onclick();assert.equal($('#title-screen').hidden,true);assert.equal($('#movie-overlay').hidden,false);
 $('#movie-skip').onclick();assert.equal($('#movie-overlay').hidden,true);assert.ok($('#next-dialogue').onclick);
 frame(10);assert.equal($('#scene-loading').hidden,false,'do not let a player walk on a missing map');
 for(let round=0;round<3;round++){for(const image of images)image.onerror?.();await new Promise(resolve=>queueMicrotask(resolve));}
 frame(30);assert.equal($('#retry-scene').hidden,false);
 $('#retry-scene').onclick();const current=images.at(-1);current.naturalWidth=540;current.complete=true;current.onload();
 for(let i=0;i<4;i++)await Promise.resolve();
 frame(50);assert.equal($('#scene-loading').hidden,true);assert.equal($('#modal-backdrop').inert,false);
});
