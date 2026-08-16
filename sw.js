const CACHE='movie-quiz-master-stage-v25-ui-bubble-intro';
const ASSET_RE=/\/assets\/(avatars|exterior-v6-9\/production|avatar-onboarding-v15\/production|ticket-login\/production|loading)\//;
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(k=>k.startsWith('movie-quiz-')&&k!==CACHE).map(k=>caches.delete(k)));
  await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin||!ASSET_RE.test(url.pathname))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const cached=await cache.match(req);
    const network=fetch(req).then(res=>{
      if(res.ok)cache.put(req,res.clone()).catch(()=>{});
      return res;
    }).catch(()=>null);
    if(cached){network.catch(()=>{});return cached;}
    return (await network)||Response.error();
  })());
});
