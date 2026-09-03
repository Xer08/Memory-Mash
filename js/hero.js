let currentHeroClass=null;
let activeRelics=[];
const heroClasses={
  warrior:{name:"Guerrero",icon:"⚔️",maxHealth:140,attack:22,ability:"Golpe Crítico",abilityIcon:"⚡",criticalMultiplier:2.5,
    description:"El más resistente y poderoso. Al llegar al 100% de Carga, su próxima Espada es un golpe crítico x2.5 y consume la carga."},
  mage:{name:"Mago",icon:"🔮",maxHealth:90,attack:18,maxMana:60,ability:"Impacto Glacial",abilityIcon:"❄️",abilityCost:20,abilityDamage:24,
    description:"Controla el campo. Gasta 20 MP para dañar al enemigo y congelarlo: pierde su próximo turno."},
  rogue:{name:"Pícaro",icon:"🗡️",maxHealth:100,attack:17,ability:"Asalto Triple",abilityIcon:"🗡️",abilityCost:100,
    description:"Golpea tres veces seguidas. Pasiva: 20% de repetir el turno después de encontrar una pareja incorrecta."}
};
const relicDefinitions={
 fireRing:{name:"Anillo de Fuego",description:"+5 daño extra con Espadas.",icon:"🔥",effect:"swordDamage",value:5},
 spiritShield:{name:"Escudo Espiritual",description:"+4 Escudo al encontrar esta runa.",icon:"🛡️",effect:"shieldBonus",value:4},
 lifeGem:{name:"Gema de Vida",description:"+6 curación extra con Pociones.",icon:"💎",effect:"healBonus",value:6},
 trapDisarm:{name:"Desarmador de Trampas",description:"Reduce 40% el daño de Trampas.",icon:"🔧",effect:"trapReduction",value:.4},
 chargeAmulet:{name:"Amuleto de Carga",description:"+10% carga con runas Ultimate.",icon:"⚡",effect:"chargeBonus",value:10},
 vitalityTome:{name:"Tomo de Vitalidad",description:"+20 vida máxima y recupera esa vida.",icon:"📖",effect:"maxHealth",value:20},
 battleCharm:{name:"Talismán de Batalla",description:"+3 ataque base permanente.",icon:"🗡️",effect:"attackBonus",value:3}
};
function initializeHeroSelection(){document.querySelectorAll(".hero-card").forEach(c=>c.addEventListener("click",()=>selectHero(c.dataset.hero)))}
function selectHero(hero){if(!heroClasses[hero])return;currentHeroClass=hero;window.currentHeroClass=currentHeroClass;applyHeroStats();document.getElementById("hero-screen").classList.add("hidden");document.getElementById("game-screen").classList.remove("hidden");startGame()}
function applyHeroStats(){
 const h=heroClasses[currentHeroClass];
 Object.assign(player,{maxHealth:h.maxHealth,currentHealth:h.maxHealth,shield:0,baseAttack:h.attack,ultimateCharge:0,maxUltimateCharge:100,mana:h.maxMana||0,maxMana:h.maxMana||0});
 if(typeof enemyFrozenTurns!=="undefined")enemyFrozenTurns=0;
 activeRelics=[];window.activeRelics=activeRelics;window.currentHeroClass=currentHeroClass;
 const avatar=document.getElementById("player-avatar"),name=document.getElementById("player-name");
 if(avatar)avatar.textContent=h.icon;if(name)name.textContent=h.name;
 updateHeroAbilityUI();updateCombatUI();
}
function resetHero(){currentHeroClass=null;activeRelics=[];window.currentHeroClass=null;window.activeRelics=activeRelics}
function canUseHeroAbility(){
 const playerTurn=getCurrentState()===GameState.PLAYER_TURN_IDLE;
 if(!playerTurn)return false;
 if(currentHeroClass==="mage")return player.mana>=heroClasses.mage.abilityCost;
 if(currentHeroClass==="warrior"||currentHeroClass==="rogue")return player.ultimateCharge>=100;
 return false
}
function updateHeroAbilityUI(){
 const h=heroClasses[currentHeroClass||"warrior"],b=document.getElementById("hero-ability-btn");if(!b)return;
 document.getElementById("ability-icon").textContent=h.abilityIcon;document.getElementById("ability-label").textContent=h.ability;
 document.getElementById("ability-cost").textContent=currentHeroClass==="mage"?`${h.abilityCost} MP`:"100%";
}
function useHeroAbility(){
 if(!canUseHeroAbility())return;
 if(currentHeroClass==="mage"){
   player.mana-=heroClasses.mage.abilityCost;
   const dmg=heroClasses.mage.abilityDamage;
   dealDamageToEnemy(dmg);
   enemyFrozenTurns=1;
   showFloatingText(`-${dmg} ❄️`,"damage",70,45);
   showFloatingText("CONGELADO","charge",70,35);
   playRevealSound();hapticFeedback("ultimate");
   setCombatMessage("❄️ Impacto Glacial: el enemigo pierde su próximo turno.");
   updateCombatUI();
   if(enemy.currentHealth<=0)checkCombatEnd();
   return;
 }
 if(currentHeroClass==="warrior"){
   player.ultimateCharge=0;
   const dmg=Math.round((player.baseAttack+runeEffects.sword.damage)*heroClasses.warrior.criticalMultiplier);
   dealDamageToEnemy(dmg);
   showFloatingText(`⚡ CRÍTICO -${dmg}`,"damage",70,45);
   hapticFeedback("ultimate");
   setCombatMessage(`⚡ ¡Golpe Crítico! ${dmg} de daño.`);
   updateCombatUI();
   if(enemy.currentHealth<=0)checkCombatEnd();
   return;
 }
 if(currentHeroClass==="rogue"){
   player.ultimateCharge=0;
   const dmg=player.baseAttack;
   let hits=0;
   const hit=()=>{
     if(enemy.currentHealth<=0){updateCombatUI();return}
     hits++;dealDamageToEnemy(dmg);showFloatingText(`-${dmg}`,"damage",70,40);
     if(hits<3 && enemy.currentHealth>0){setTimeout(hit,140)}
     else {setCombatMessage(`🗡️ ¡Asalto Triple! ${hits} golpes consecutivos.`);updateCombatUI();if(enemy.currentHealth<=0)checkCombatEnd()}
   };
   hit();
 }
}
function checkRogueDodge(){
 if(currentHeroClass!=="rogue"||Math.random()>=.20)return false;
 showFloatingText("¡OTRO TURNO!","dodge",50,38);hapticFeedback("dodge");setCombatMessage("🗡️ ¡Pasiva del Pícaro! Repite el turno.");return true
}
function addRelic(key){if(!relicDefinitions[key]||activeRelics.includes(key))return;activeRelics.push(key);window.activeRelics=activeRelics;const r=relicDefinitions[key];if(r.effect==="maxHealth"){player.maxHealth+=r.value;player.currentHealth+=r.value}if(r.effect==="attackBonus")player.baseAttack+=r.value;showFloatingText(`${r.icon} ${r.name}`,"charge",50,45);updateCombatUI()}
function getRandomRelics(n=3){const pool=Object.keys(relicDefinitions).filter(k=>!activeRelics.includes(k));for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}return pool.slice(0,n)}
Object.assign(window,{currentHeroClass,heroClasses,relicDefinitions,activeRelics,initializeHeroSelection,selectHero,resetHero,canUseHeroAbility,updateHeroAbilityUI,useHeroAbility,checkRogueDodge,addRelic,getRandomRelics});
