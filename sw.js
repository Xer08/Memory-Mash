const CACHE_NAME="rune-clash-v3";
const ASSETS=[
 "./","./index.html","./manifest.json",
 "./css/theme.css","./css/board.css","./css/effects.css",
 "./js/state.js","./js/juiciness.js","./js/combat.js","./js/hero.js","./js/board.js","./js/dungeon.js","./js/main.js",
 "./icon-192.png","./icon-512.png"
];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  const url=new URL(event.request.url);if(url.origin!==location.origin)return;
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
    if(response&&response.ok){const clone=response.clone();caches.open(CACHE_NAME).then(c=>c.put(event.request,clone))}
    return response
  }).catch(()=>event.request.mode==="navigate"?caches.match("./index.html"):new Response("Offline",{status:503}))))
});
self.addEventListener("message",event=>{if(event.data?.type==="SKIP_WAITING")self.skipWaiting()});
