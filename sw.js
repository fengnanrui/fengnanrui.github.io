/**
 * Service Worker for Jekyll博客
 * 启用离线功能和更快的页面加载
 * 
 * 适用于GitHub Pages部署
 */

// 缓存版本，每次更新内容时需更改
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `nanru-blog-${CACHE_VERSION}`;

// 需要缓存的核心资源
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/404.html',
  '/css/modern.css',
  '/js/modern.js',
  '/js/animations.js',
  '/favicon.ico'
];

// 安装服务工作线程
self.addEventListener('install', event => {
  // 预缓存核心资源
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting()) // 立即激活
  );
  
  console.log(`[Service Worker] 已安装缓存: ${CACHE_NAME}`);
});

// 激活服务工作线程
self.addEventListener('activate', event => {
  // 清理旧版本缓存
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName.startsWith('nanru-blog-') && cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
  
  console.log('[Service Worker] 已激活，旧缓存已清理');
});

// 拦截网络请求
self.addEventListener('fetch', event => {
  // 排除管理员面板等不应缓存的请求
  if (event.request.url.includes('/admin') || event.request.url.includes('/sw.js')) {
    return;
  }
  
  // 处理导航请求 (HTML页面)
  if (event.request.mode === 'navigate' || 
     (event.request.method === 'GET' && 
      event.request.headers.get('accept').includes('text/html'))) {
    
    event.respondWith(
      fetch(event.request).catch(() => {
        // 如果网络请求失败，提供离线页面
        return caches.match('/404.html');
      })
    );
    return;
  }
  
  // 针对GitHub Pages的静态资源使用缓存优先策略
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // 命中缓存则直接返回
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // 没有命中则从网络获取
      return fetch(event.request)
        .then(response => {
          // 如果响应无效，直接返回
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // 缓存新响应
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        })
        .catch(() => {
          // 如果请求是图片，返回默认图片
          if (event.request.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
            return caches.match('/assets/images/placeholder.svg');
          }
          
          return new Response('网络连接失败', {
            status: 408,
            headers: new Headers({ 'Content-Type': 'text/plain' })
          });
        });
    })
  );
});

// 定期清理旧缓存
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// 离线页面注册
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/404.html');
      })
    );
  }
});
