/*
  めぐり — service worker
  目的: 一度開けば、ネットが無くても・どのサーバーが消えても、
        スマホの中でアプリが動き続けるようにする。

  方針（壊れにくさ優先）:
  - ネットがあるときは、最新を取りに行く（network-first）。だから更新も自然に反映される。
  - ネットが無いときだけ、キャッシュ（保存済み）から表示する。
  - キャッシュへの保存に失敗しても、アプリ本体は決して止めない。
*/
const CACHE = 'meguri-v2';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(() => {}));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    fetch(req)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
  );
});
