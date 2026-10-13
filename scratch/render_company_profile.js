const fs = require('fs');
const path = require('path');
const playwrightPath = path.resolve(__dirname, '../../../Server-Fokuskonten/node_modules/playwright');
const pdfLibPath = path.resolve(__dirname, '../../../Server-Fokuskonten/node_modules/pdf-lib');
const { chromium } = require(playwrightPath);
const { PDFDocument } = require(pdfLibPath);

async function main() {
  console.log('=== MEMULAI RENDER COMPANY PROFILE PT NTI 2026 ===');

  const htmlPath = path.resolve(__dirname, 'company_profile_print.html');
  const targetPdfPath = path.resolve(__dirname, '../assets/docs/CP_PT_NTI.pdf');
  const imagesDir = path.resolve(__dirname, '../assets/images');

  if (!fs.existsSync(htmlPath)) {
    throw new Error(`File HTML tidak ditemukan: ${htmlPath}`);
  }

  // 1. Validasi Faktual Dokumen HTML
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  // Cek kata terlarang 'rekayasa'
  const rekayasaMatch = htmlContent.match(/\brekayasa\b/i);
  if (rekayasaMatch) {
    throw new Error("Pelanggaran aturan: Ditemukan kata 'rekayasa' di dalam dokumen HTML!");
  }
  console.log("[VALIDASI] Bebas dari kata 'rekayasa': LULUS");

  // Cek warna terlarang (hijau)
  const forbiddenColors = ['#00ff', '#10b981', '#059669', '#16a34a', '#22c55e', '#15803d', 'green', 'emerald'];
  for (const col of forbiddenColors) {
    if (htmlContent.toLowerCase().includes(col)) {
      throw new Error(`Pelanggaran aturan: Ditemukan warna terlarang (${col}) di dalam styling!`);
    }
  }
  console.log('[VALIDASI] Tema 2 warna (Biru & Putih), bebas warna hijau: LULUS');

  // Cek keberadaan 14 citra nyata
  const requiredImages = [
    'logo_pti.png',
    'cnc_milling_gut_3axis.jpg',
    'cnc_bubut_hision.jpg',
    'milling_manual.jpg',
    'machining_precision_1.jpg',
    'machining_precision_2.jpg',
    'machining_precision_3.jpg',
    'produk_dies_stamping_1.jpg',
    'produk_dies_cavity_2.jpg',
    'jig_inspection_fixture_1.jpg',
    'jig_inspection_fixture_2.jpg',
    'fabrikasi_rak_blue.jpg',
    'fabrikasi_rak_meja_susun.jpg',
    'fabrikasi_trolley_material.jpg'
  ];

  for (const imgName of requiredImages) {
    const fullImgPath = path.join(imagesDir, imgName);
    if (!fs.existsSync(fullImgPath)) {
      throw new Error(`Citra wajib tidak ditemukan di disk: ${imgName}`);
    }
  }
  console.log(`[VALIDASI] Seluruh ${requiredImages.length} citra nyata terverifikasi ada: LULUS`);

  // Pastikan folder target ada
  const targetDir = path.dirname(targetPdfPath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 2. Launch Playwright Chromium
  console.log('[PLAYWRIGHT] Meluncurkan Chromium headless...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--font-render-hinting=medium']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2
  });

  const page = await context.newPage();

  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
  console.log(`[PLAYWRIGHT] Membuka URL: ${fileUrl}`);

  await page.goto(fileUrl, {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  // Tunggu sejenak agar rendering font dan layout sepenuhnya stabil
  await page.waitForTimeout(1000);

  console.log('[PLAYWRIGHT] Menghasilkan berkas PDF A4 Landscape...');
  await page.pdf({
    path: targetPdfPath,
    format: 'A4',
    landscape: true,
    preferCSSPageSize: true,
    printBackground: true,
    margin: {
      top: '0mm',
      bottom: '0mm',
      left: '0mm',
      right: '0mm'
    }
  });

  await browser.close();
  console.log('[PLAYWRIGHT] Proses render selesai. Browser ditutup.');

  // 3. Verifikasi Fisik Hasil Render dengan pdf-lib
  console.log('[VERIFIKASI FISIK] Memeriksa berkas PDF hasil render...');
  const pdfBytes = fs.readFileSync(targetPdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pageCount = pdfDoc.getPageCount();
  const fileStats = fs.statSync(targetPdfPath);

  console.log(`Path Output: ${targetPdfPath}`);
  console.log(`Ukuran Berkas: ${(fileStats.size / 1024).toFixed(2)} KB (${fileStats.size} bytes)`);
  console.log(`Jumlah Halaman: ${pageCount} halaman`);

  for (let i = 0; i < pageCount; i++) {
    const p = pdfDoc.getPage(i);
    const size = p.getSize();
    console.log(`  - Halaman ${i + 1}: ${size.width.toFixed(2)} pt × ${size.height.toFixed(2)} pt`);
  }

  if (pageCount !== 8) {
    throw new Error(`GAGAL: Diharapkan tepat 8 halaman, tetapi dihasilkan ${pageCount} halaman!`);
  }

  console.log('=== SEMUA TAHAP SUKSES TERVERIFIKASI (8 HALAMAN PAS) ===');
  process.exit(0);
}

main().catch(err => {
  console.error('[ERROR]', err);
  process.exit(1);
});
