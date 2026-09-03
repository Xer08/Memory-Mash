let currentHeroClass=null;
let activeRelics=[];
const heroClasses={
 warrior:{name:"Guerrero",icon:"⚔️",maxHealth:115,attack:16,ability:"Fortaleza",abilityIcon:"🛡️"},
 mage:{name:"Mago",icon:"🔮",maxHealth:90,attack:18,maxMana:60,ability:"Visión Arcana",abilityIcon:"🔮",abilityCost:20},
 rogue:{name:"Pícaro",icon:"🗡️",maxHealth:100,attack:17,ability:"Golpe Sombrío",abilityIcon:"🗡️"}
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
function applyHeroStats(){const h=heroClasses[currentHeroClass];player.maxHealth=h.maxHealth;player.currentHealth=h.maxHealth;player.baseAttack=h.attack;player.mana=h.maxMana||0;player.maxMana=h.maxMana||0;activeRelics=[];window.activeRelics=activeRelics;window.currentHeroClass=currentHeroClass;document.getElementById("player-avatar").textContent=h.icon;document.getElementById("player-name").textContent=h.name;updateHeroAbilityUI()}
function resetHero(){currentHeroClass=null;activeRelics=[];window.currentHeroClass=null;window.activeRelics=activeRelics}
function canUseHeroAbility(){if(currentHeroClass==="mage")return player.mana>=heroClasses.mage.abilityCost&&getCurrentState()===GameState.PLAYER_TURN_IDLE;if(currentHeroClass==="warrior"||currentHeroClass==="rogue")return player.ultimateCharge>=100&&getCurrentState()===GameState.PLAYER_TURN_IDLE;return false}
function updateHeroAbilityUI(){const h=heroClasses[currentHeroClass||"warrior"],b=document.getElementById("hero-ability-btn");if(!b)return;document.getElementById("ability-icon").textContent=h.abilityIcon;document.getElementById("ability-label").textContent=h.ability;if(currentHeroClass==="mage"){document.getElementById("ability-cost").textContent=`${h.abilityCost} MP`}else{document.getElementById("ability-cost").textContent="100%"}}
function useHeroAbility(){
  if(!canUseHeroAbility())return;
  if(currentHeroClass==="mage"){player.mana-=20;const pool=[...document.querySelectorAll(".card:not(.flipped):not(.matched)")];pool.sort(()=>Math.random()-.5).slice(0,2).forEach(c=>c.classList.add("temporarily-revealed"));playRevealSound();hapticFeedback("ultimate");setCombatMessage("Visión Arcana revela dos runas…");setTimeout(()=>document.querySelectorAll(".temporarily-revealed").forEach(c=>c.classList.remove("temporarily-revealed")),1000)}
  if(currentHeroClass==="warrior"){player.ultimateCharge=0;addShield(35);showFloatingText("+35 escudo","shield",30,50);setCombatMessage("¡Fortaleza! El Guerrero levanta un muro.")}
  if(currentHeroClass==="rogue"){player.ultimateCharge=0;const dmg=player.baseAttack*2;dealDamageToEnemy(dmg);showFloatingText(`-${dmg}`,"damage",70,45);setCombatMessage("¡Golpe Sombrío! Daño crítico.")}
  updateCombatUI()
}
function checkRogueDodge(){if(currentHeroClass!=="rogue"||Math.random()>=.25)return false;showFloatingText("¡ESQUIVA!","dodge",50,38);hapticFeedback("dodge");setCombatMessage("El Pícaro conserva el turno.");return true}
function addRelic(key){if(!relicDefinitions[key]||activeRelics.includes(key))return;activeRelics.push(key);window.activeRelics=activeRelics;const r=relicDefinitions[key];if(r.effect==="maxHealth"){player.maxHealth+=r.value;player.currentHealth+=r.value}if(r.effect==="attackBonus")player.baseAttack+=r.value;showFloatingText(`${r.icon} ${r.name}`,"charge",50,45);updateCombatUI()}
function getRandomRelics(n=3){const pool=Object.keys(relicDefinitions).filter(k=>!activeRelics.includes(k));for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}return pool.slice(0,n)}
Object.assign(window,{currentHeroClass,heroClasses,relicDefinitions,activeRelics,initializeHeroSelection,selectHero,resetHero,canUseHeroAbility,updateHeroAbilityUI,useHeroAbility,checkRogueDodge,addRelic,getRandomRelics});
