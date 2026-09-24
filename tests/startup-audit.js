// Development server only: faults are confined to the separate localhost QA origin.
export function startupFault(req,res,path){
 const mode=/(?:^|;\s*)moonQaFault=([^;]*)/.exec(req.headers.cookie||'')?.[1];
 if(mode==='images'&&/^\/assets\/(web\/)?city\.(png|webp)$/.test(path)||mode==='module'&&path==='/game.js'){
  res.writeHead(503,{'Content-Type':'text/plain','Cache-Control':'no-store'}).end('Deliberate QA failure');return true;
 }
 return false;
}
export function startupPage(html,mode){
 const fault=['images','storage','module'].includes(mode)?mode:'';
 const script=`<script>document.cookie='moonQaFault=${fault}; path=/; SameSite=Lax';${fault==='storage'?"Object.defineProperty(window,'localStorage',{configurable:true,get(){throw new Error('QA: storage is blocked');}});":''}</script>`;
 const controls=`<nav style="position:fixed;top:0;left:0;right:0;z-index:99;background:#081522;padding:5px;text-align:center;font-size:12px"><a href="/?startup=normal">正常加载</a> · <a href="/?startup=images">图片失败</a> · <a href="/?startup=storage">存储受限</a> · <a href="/?startup=module">脚本失败</a> <button id="qa-recover" style="font-size:12px">恢复网络</button></nav><script>document.getElementById('qa-recover').onclick=function(){document.cookie='moonQaFault=; path=/; SameSite=Lax';history.replaceState(null,'','/');this.textContent='网络已恢复';};</script>`;
 return html.replace('<script src="boot.js" defer></script>',script+'<script src="boot.js" defer></script>'+controls);
}
