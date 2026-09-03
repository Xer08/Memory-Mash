let currentTurn=1;
function startGame(){
  initializeDungeon();createEnemy(1);initializeBoard();resetState();currentTurn=1;updateTurnDisplay();setCombatMessage("Encuentra una pareja de runas.");updateCombatUI()
}
function updateTurnDisplay(){const el=document.getElementById("turn-number");if(el)el.textContent=currentTurn}
function incrementTurn(){currentTurn++;updateTurnDisplay()}
function resetRun(){
  hideModals();resetPlayer();applyHeroStats();initializeDungeon();createEnemy(1);initializeBoard();resetState();currentTurn=1;updateTurnDisplay();setCombatMessage("Nueva partida. Encuentra una pareja.");updateCombatUI()
}
function setupMainEvents(){
  initializeHeroSelection();
  document.getElementById("hero-ability-btn").addEventListener("click",useHeroAbility);
  document.getElementById("restart-btn").addEventListener("click",resetRun);
  document.getElementById("victory-restart-btn").addEventListener("click",resetRun);
  document.getElementById("quit-btn").addEventListener("click",()=>showModal("confirm-modal"));
  document.getElementById("cancel-quit").addEventListener("click",hideModals);
  document.getElementById("confirm-quit").addEventListener("click",()=>{hideModals();document.getElementById("game-screen").classList.add("hidden");document.getElementById("hero-screen").classList.remove("hidden");resetHero()});
  document.addEventListener("cardMatch",()=>incrementTurn());
  document.addEventListener("stateChange",e=>{if(e.detail.state===GameState.GAME_OVER||e.detail.state===GameState.VICTORY)boardLocked=true});
}
function preventMobileGestures(){
  document.addEventListener("contextmenu",e=>{if(e.target.closest("#board"))e.preventDefault()});
  document.addEventListener("touchmove",e=>{if(e.target.closest("#board"))e.preventDefault()},{passive:false});
  document.addEventListener("gesturestart",e=>e.preventDefault());
  document.addEventListener("dblclick",e=>e.preventDefault());
}
function registerServiceWorker(){
  if(!("serviceWorker"in navigator))return;
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").then(r=>{r.update();console.log("SW listo",r.scope)}).catch(console.warn))
}
document.addEventListener("DOMContentLoaded",()=>{initJuiciness();setupMainEvents();preventMobileGestures();registerServiceWorker()});
Object.assign(window,{startGame,resetRun,updateTurnDisplay,incrementTurn});
