/* このSWは、古いオフライン保存係を解除し、キャッシュを消すためのものです */
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){ return Promise.all(keys.map(function(k){ return caches.delete(k); })); })
      .then(function(){ return self.registration.unregister(); })
      .then(function(){ return self.clients.matchAll(); })
      .then(function(cs){ cs.forEach(function(c){ try{ c.navigate(c.url); }catch(e){} }); })
      .catch(function(){})
  );
});
