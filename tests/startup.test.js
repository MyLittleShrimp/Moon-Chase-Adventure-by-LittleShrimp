import test from 'node:test';
import assert from 'node:assert/strict';
import {SceneImages} from '../dist/images.js';
import {World} from '../dist/world.js';
import {GameAudio} from '../dist/audio.js';

function imageFactory(behavior){
 const requested=[];
 return {requested,createImage(){return {naturalWidth:0,removeAttribute(){},set src(src){requested.push(src);queueMicrotask(()=>{const result=behavior(src);if(result==='ready'){this.naturalWidth=540;this.onload?.();}else if(result==='error')this.onerror?.();});}};}};
}
test('startup requests only the title and first scene, and deduplicates pending images',async t=>{
 const factory=imageFactory(()=> 'ready'),previous=globalThis.Image;globalThis.Image=function(){return factory.createImage();};t.after(()=>{if(previous)globalThis.Image=previous;else delete globalThis.Image;});
 const world=new World({getContext:()=>({})});
 await world.ready;
 assert.deepEqual(factory.requested,['assets/web/reunion.webp','assets/web/city.webp']);
 assert.equal(world.sceneStatus({started:true,scene:'city',stage:0}),'ready');
 assert.equal(world.assets.get('museum'),null);const first=world.assets.load('museum');assert.equal(first,world.assets.load('museum'));
 assert.equal(await first,true);assert.equal(factory.requested.length,3);
});
test('WebP errors fall back to PNG without preventing other scenes from loading',async()=>{
 const factory=imageFactory(src=>src==='assets/web/water.webp'?'error':'ready');const assets=new SceneImages(factory);
 assert.deepEqual(await Promise.all([assets.load('water'),assets.load('city')]),[true,true]);
 assert.ok(factory.requested.includes('assets/water.png'));assert.equal(assets.status('water'),'ready');
});
test('stalled image requests time out, settle, and can be explicitly retried',async()=>{
 let works=false;const factory=imageFactory(()=>works?'ready':'stall');const assets=new SceneImages({...factory,timeoutMs:5});
 assert.equal(await assets.load('city'),false);assert.equal(assets.status('city'),'failed');assert.equal(factory.requested.length,2);
 await assets.load('city');assert.equal(factory.requested.length,2,'rendering must not start a retry loop');
 works=true;assert.equal(await assets.load('city',{retry:true}),true);assert.equal(assets.status('city'),'ready');
});
test('late image callbacks cannot replace a successful fallback',async()=>{
 const images=[];const assets=new SceneImages({timeoutMs:5,createImage:()=>{const image={naturalWidth:540,removeAttribute(){},set src(src){if(src.endsWith('.png'))queueMicrotask(()=>this.onload?.());}};images.push(image);return image;}});
 const pending=assets.load('city'),late=images[0].onload;
 assert.equal(await pending,true);late();assert.equal(assets.get('city'),images[1]);
});
test('a restricted localStorage getter cannot prevent audio or game initialization',t=>{
 const previous=Object.getOwnPropertyDescriptor(globalThis,'localStorage');
 Object.defineProperty(globalThis,'localStorage',{configurable:true,get(){throw new Error('SecurityError');}});
 t.after(()=>{if(previous)Object.defineProperty(globalThis,'localStorage',previous);else delete globalThis.localStorage;});
 const audio=new GameAudio({music:{addEventListener(){},pause(){}},contextFactory:()=>{throw new Error('Audio unavailable');}});
 assert.equal(audio.storage,null);assert.doesNotThrow(()=>audio.toggle());
});
