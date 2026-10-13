const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '..');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

function getNavHtml(filename) {
  let activeBeranda = filename === 'index.html' ? 'active' : '';
  let activeFasilitas = (filename === 'fasilitas.html' || filename.startsWith('layanan-')) ? 'active' : '';
  let activeProduk = (filename === 'produk.html' || filename.startsWith('produk-')) ? 'active' : '';
  let activeKlien = filename === 'pelanggan.html' ? 'active' : '';
  let activeKontak = filename === 'kontak.html' ? 'active' : '';

  return `  <header class="site-nav">
    <div class="container nav-wrapper">
      <a href="./" class="brand-link" aria-label="PT. Nurcahya Teknik Industry">
        <img src="assets/images/logo_pti.png" alt="Logo PT NTI" class="brand-logo-img">
        <div class="brand-text">
          <span class="brand-title">PT. NURCAHYA TEKNIK INDUSTRY</span>
          <span class="brand-subtitle">Precision Machining & Tooling</span>
        </div>
      </a>

      <nav class="nav-links">
        <a href="./" class="nav-item ${activeBeranda}">Beranda</a>
        <a href="fasilitas" class="nav-item ${activeFasilitas}">Fasilitas</a>
        <a href="produk" class="nav-item ${activeProduk}">Portofolio</a>
        <a href="pelanggan" class="nav-item ${activeKlien}">Klien</a>
        <a href="kontak" class="nav-item ${activeKontak}">Kontak</a>
      </nav>

      <div class="nav-actions">
        <a href="rfq" class="btn-pill btn-pill-primary btn-nav-cta" title="Minta Penawaran Harga (RFQ)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          <span class="nav-cta-text">Minta RFQ</span>
        </a>
        <button type="button" class="nav-toggle" id="navToggle" aria-label="Buka Menu Navigasi">
          <span class="nav-toggle-bar"></span>
          <span class="nav-toggle-bar"></span>
          <span class="nav-toggle-bar"></span>
        </button>
      </div>
    </div>
    <div class="mobile-nav-drawer" id="mobileNavDrawer" style="display: none;">
      <div class="container mobile-nav-inner">
        <a href="./" class="mobile-nav-item ${activeBeranda}">Beranda</a>
        <a href="fasilitas" class="mobile-nav-item ${activeFasilitas}">Fasilitas Mesin</a>
        <a href="produk" class="mobile-nav-item ${activeProduk}">Portofolio Produk</a>
        <a href="pelanggan" class="mobile-nav-item ${activeKlien}">Klien & Mitra</a>
        <a href="kontak" class="mobile-nav-item ${activeKontak}">Kontak & E-Card (.vcf)</a>
        <a href="rfq" class="mobile-nav-item mobile-nav-highlight">Minta Penawaran (RFQ) &rarr;</a>
      </div>
    </div>
  </header>`;
}

let count = 0;
for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace existing header
  const navRegex = /<header class=["']site-nav["']>[\s\S]*?<\/header>/;
  if (navRegex.test(content)) {
    const newNav = getNavHtml(file);
    content = content.replace(navRegex, newNav);
  }

  // Cache busting query version for CSS & JS
  content = content.replace(/href=["']style\.css(\?v=[\d\.]+)?["']/g, 'href="style.css?v=4.0.0"');
  content = content.replace(/src=["']app\.js(\?v=[\d\.]+)?["']/g, 'src="app.js?v=4.0.0"');

  fs.writeFileSync(filePath, content, 'utf8');
  count++;
  console.log('Updated:', file);
}

console.log('Total files updated with v4.0.0 cache bust:', count);
