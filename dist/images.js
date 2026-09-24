export const SCENE_IMAGES=['city','museum','museum-installed','projection-storyboard','entrance','reward','reunion','painting','traffic','water','factory','assembly','terrace','chest'];

// Request only the visible scene. Every attempt settles, including a stalled connection.
export class SceneImages {
 constructor({createImage=()=>new Image(),timeoutMs=8000}={}){this.createImage=createImage;this.timeoutMs=timeoutMs;this.entries=new Map();}
 load(name,{retry=false}={}){
  if(!SCENE_IMAGES.includes(name))return Promise.resolve(false);
  const previous=this.entries.get(name);
  if(previous&&(!retry||previous.status!=='failed'))return previous.promise;
  const entry={status:'loading',image:null,promise:null};this.entries.set(name,entry);
  entry.promise=this.request(`assets/web/${name}.webp`).then(image=>image||this.request(`assets/${name}.png`)).then(image=>{
   entry.image=image;entry.status=image?'ready':'failed';return !!image;
  });
  return entry.promise;
 }
 request(src){
  return new Promise(resolve=>{
   let image,timer,settled=false;
   const finish=ok=>{if(settled)return;settled=true;clearTimeout(timer);if(image){image.onload=image.onerror=null;if(!ok)image.removeAttribute?.('src');}resolve(ok?image:null);};
   try{image=this.createImage();image.decoding='async';image.onload=()=>finish(image.naturalWidth>0);image.onerror=()=>finish(false);timer=setTimeout(()=>finish(false),this.timeoutMs);image.src=src;}
   catch{finish(false);}
  });
 }
 status(name){this.load(name);return this.entries.get(name)?.status||'failed';}
 get(name){this.load(name);return this.entries.get(name)?.image||null;}
}
