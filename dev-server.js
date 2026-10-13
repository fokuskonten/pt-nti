const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3030;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.vcf': 'text/vcard; charset=utf-8'
};

// Live reload clients
const sseClients = new Set();
let reloadTimeout = null;

// Watch files for live reload (filter out internal/scratch folders)
fs.watch(ROOT_DIR, { recursive: true }, (eventType, filename) => {
  if (!filename) return;
  const normalized = filename.replace(/\\/g, '/');
  if (
    normalized.startsWith('.git') ||
    normalized.startsWith('.wrangler') ||
    normalized.startsWith('scratch') ||
    normalized.startsWith('node_modules') ||
    normalized.startsWith('_ARSIP_SEMENTARA')
  ) {
    return;
  }

  if (normalized.endsWith('.html') || normalized.endsWith('.css') || normalized.endsWith('.js') || normalized.endsWith('.json')) {
    if (reloadTimeout) clearTimeout(reloadTimeout);
    reloadTimeout = setTimeout(() => {
      console.log(`[LIVE-RELOAD] File changed: ${normalized}. Triggering reload...`);
      for (const res of sseClients) {
        try {
          res.write('data: reload\n\n');
        } catch (e) {}
      }
    }, 250);
  }
});

const LIVE_RELOAD_SCRIPT = `
<!-- DEV LIVE RELOAD SCRIPT -->
<script>
  (function() {
    // Unregister Service Worker on dev server to prevent caching and stream locking
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(regs) {
        for (var i = 0; i < regs.length; i++) { regs[i].unregister(); }
      });
    }

    // Connect SSE ONLY after page load completes to avoid infinite tab spinner
    window.addEventListener('load', function() {
      setTimeout(function() {
        try {
          var es = new EventSource('/__livereload');
          es.onmessage = function(e) {
            if (e.data === 'reload') {
              console.log('[DEV] File changed. Reloading page...');
              window.location.reload();
            }
          };
          es.onerror = function() {};
        } catch (err) {}
      }, 600);
    });
  })();
</script>
`;

const server = http.createServer((req, res) => {
  if (req.url === '/__livereload') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    res.write(': connected\n\n');
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return;
  }

  // Parse URL
  let parsedUrl = req.url.split('?')[0];
  if (parsedUrl.startsWith('/pt-nti')) {
    parsedUrl = parsedUrl.slice('/pt-nti'.length);
  }
  if (!parsedUrl || parsedUrl === '/') {
    parsedUrl = '/index.html';
  }

  let filePath = path.join(ROOT_DIR, parsedUrl);

  // Check direct file or fallback
  let fileToServe = null;
  if (fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      fileToServe = filePath;
    } else if (stat.isDirectory()) {
      const indexInDir = path.join(filePath, 'index.html');
      if (fs.existsSync(indexInDir)) {
        fileToServe = indexInDir;
      }
    }
  }

  if (!fileToServe && fs.existsSync(filePath + '.html')) {
    fileToServe = filePath + '.html';
  }

  if (!fileToServe) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found - PT. Nurcahya Teknik Industry');
    return;
  }

  filePath = fileToServe;
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  try {
    let content = fs.readFileSync(filePath);
    if (ext === '.html') {
      let str = content.toString('utf8');
      str = str.replace('</body>', LIVE_RELOAD_SCRIPT + '</body>');
      content = Buffer.from(str, 'utf8');
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    res.end(content);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('500 Server Error: ' + err.message);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('========================================================');
  console.log(` PT. NURCAHYA TEKNIK INDUSTRY - DEV SERVER ACTIVE`);
  console.log(` Local:   http://localhost:${PORT}`);
  console.log(` Network: http://127.0.0.1:${PORT}`);
  console.log(` Live Reload: ENABLED (Auto-reloads on file changes)`);
  console.log('========================================================');
});
