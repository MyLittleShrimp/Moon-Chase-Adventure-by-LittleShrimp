// Keep recovery visible even when a module download fails or browser initialization throws.
const startupStatus=document.getElementById('startup-status');
const reloadGame=document.getElementById('reload-game');
reloadGame.onclick=event=>{event.preventDefault();location.reload();};
const slowStart=setTimeout(()=>{
 startupStatus.textContent='载入较慢，请检查网络，或点击重新加载。';
 reloadGame.hidden=false;
},10000);
import('./game.js').then(()=>{
 clearTimeout(slowStart);
 startupStatus.textContent='耳机准备好了吗？夜色里有新的故事。';
 reloadGame.hidden=true;
}).catch(error=>{
 clearTimeout(slowStart);
 startupStatus.textContent='游戏暂时未能载入，请重试；也可在系统浏览器中打开。';
 reloadGame.hidden=false;
 console.error('Game startup failed',error);
});
