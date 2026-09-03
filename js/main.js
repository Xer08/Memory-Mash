let enemyAttackTimer=null;
let runStarted=false;

function startGame(){
  runStarted=true;
  if(typeof initAudio==='function')initAudio();
  if(typeof initJuiciness==='function')initJuiciness();
  if(typeof initializeCombat==='function')initializeCombat();
  if(typeof initializeDungeon==='function')initializeDungeon();
  if(typeof createEnemy==='function')createEnemy(1);
  if(typeof initializeBoard==='function')initializeBoard(true);
  if(typeof resetState==='function')resetState();
  if(typeof setCombatMessage==='function')setCombatMessage("Memoriza las runas…");
  updateRoomDisplaySafe();
  if(typeof updateCombatUI==='function')updateCombatUI();
}

function resetRun(){
  if(typeof resetPlayer==='function')resetPlayer();
  if(typeof applyHeroStats==='function')applyHeroStats();
  if(typeof initializeDungeon==='function')initializeDungeon();
  if(typeof createEnemy==='function')createEnemy(1);
  if(typeof initializeBoard==='function')initializeBoard(true);
  if(typeof resetState==='function')resetState();
  if(typeof updateCombatUI==='function')updateCombatUI();
}

function exitToHeroSelection(){
  if(typeof resetPlayer==='function')resetPlayer();
  if(typeof resetHero==='function')resetHero();
  if(typeof initializeDungeon==='function')initializeDungeon();
  if(typeof resetState==='function')resetState();
  runStarted=false;
  document.getElementById("game-screen")?.classList.add("hidden");
  document.getElementById("hero-screen")?.classList.remove("hidden");
}

function updateRoomDisplaySafe(){
  if(typeof updateRoomDisplay==='function')updateRoomDisplay();
}

function showModal(id){
  document.querySelectorAll(".modal-overlay").forEach(m=>m.classList.add("hidden"));
  const modal=document.getElementById(id);
  if(modal)modal.classList.remove("hidden");
}
function hideModals(){document.querySelectorAll(".modal-overlay").forEach(m=>m.classList.add("hidden"));}

function wireMainEvents(){
  if(typeof initializeHeroSelection==='function')initializeHeroSelection();

  const ability=document.getElementById("hero-ability-btn");
  ability?.addEventListener("click",()=>useHeroAbility());

  document.getElementById("restart-btn")?.addEventListener("click",()=>{hideModals();resetRun();});
  document.getElementById("victory-restart-btn")?.addEventListener("click",()=>{hideModals();resetRun();});
  document.getElementById("quit-btn")?.addEventListener("click",()=>showModal("quit-modal"));
  document.getElementById("cancel-quit-btn")?.addEventListener("click",hideModals);
  document.getElementById("confirm-quit-btn")?.addEventListener("click",()=>{hideModals();exitToHeroSelection();});

  document.addEventListener("click",e=>{
    const relic=e.target.closest(".relic-card");
    if(relic && typeof chooseRelic==='function')chooseRelic(relic.dataset.relic);
  });

  // Evita zoom/scroll accidental en móvil, pero conserva el tap normal de botones.
  document.addEventListener("gesturestart",e=>e.preventDefault(),{passive:false});
  document.addEventListener("gesturechange",e=>e.preventDefault(),{passive:false});
  document.addEventListener("gestureend",e=>e.preventDefault(),{passive:false});
}

document.addEventListener("DOMContentLoaded",()=>{
  wireMainEvents();
  if("serviceWorker" in navigator){
    navigator.serviceWorker.register("./sw.js").then(reg=>{
      reg.update();
      if(reg.waiting)reg.waiting.postMessage({type:"SKIP_WAITING"});
      reg.addEventListener("updatefound",()=>{
        const worker=reg.installing;
        worker?.addEventListener("statechange",()=>{
          if(worker.state==="installed" && navigator.serviceWorker.controller){
            worker.postMessage({type:"SKIP_WAITING"});
          }
        });
      });
    }).catch(err=>console.warn("Service Worker:",err));
  }
});

Object.assign(window,{startGame,resetRun,exitToHeroSelection,showModal,hideModals});
