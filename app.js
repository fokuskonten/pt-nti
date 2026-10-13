/* PT. Nurcahya Teknik Industry - Client App Logic */

// 1. Download vCard .vcf secara dinamis
function downloadVCard() {
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'N:Cahyani;Nur;;;',
    'FN:Nur Cahyani',
    'ORG:PT. Nurcahya Teknik Industry',
    'TITLE:Marketing & Technical Operations',
    'TEL;TYPE=WORK,VOICE:+6281384151264',
    'TEL;TYPE=CELL,VOICE:+6281384151264',
    'EMAIL;TYPE=PREF,INTERNET:Nur.nurcahyani@outlook.co.id',
    'EMAIL;TYPE=WORK,INTERNET:Nur.nurcahya92@outlook.com',
    'ADR;TYPE=WORK:;;Bugel salam poncol RT 02 Rw 06 desa hegarmukti;Cikarang Pusat;Bekasi;Jawa Barat;Indonesia',
    'URL:https://pt-nurcahya-teknik-industry.pages.dev/',
    'NOTE:Precision Machining CNC, Stamping Dies, Jig Inspection & Fabrikasi Industri Cikarang',
    'END:VCARD'
  ].join('\r\n');

  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Nur_Cahyani_PT_NTI.vcf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 2. Event Handler untuk Form RFQ
document.addEventListener('DOMContentLoaded', () => {
  const vcardBtn = document.getElementById('btnDownloadVCard');
  if (vcardBtn) {
    vcardBtn.addEventListener('click', downloadVCard);
  }

  const rfqForm = document.getElementById('rfqFormMain');
  if (rfqForm) {
    rfqForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('rfqName')?.value.trim() || '-';
      const company = document.getElementById('rfqCompany')?.value.trim() || '-';
      const phone = document.getElementById('rfqPhone')?.value.trim() || '-';
      const service = document.getElementById('rfqService')?.value || '-';
      const material = document.getElementById('rfqMaterial')?.value.trim() || '-';
      const qty = document.getElementById('rfqQty')?.value.trim() || '-';
      const notes = document.getElementById('rfqNotes')?.value.trim() || '-';

      const text = [
        '*PERMINTAAN PENAWARAN HARGA (RFQ)*',
        '*PT. NURCAHYA TEKNIK INDUSTRY*',
        '',
        '*DATA PERUSAHAAN / PEMESAN:*',
        '• Nama PIC: ' + name,
        '• Perusahaan: ' + company,
        '• Kontak: ' + phone,
        '',
        '*SPESIFIKASI PEKERJAAN:*',
        '• Kategori Layanan: ' + service,
        '• Jenis Material: ' + material,
        '• Estimasi Volume: ' + qty,
        '',
        '*CATATAN & TOLERANSI GAMBAR KERJA:*',
        notes,
        '',
        '_Gambar kerja teknis 2D/3D akan kami lampirkan pada percakapan ini._',
        'Mohon konfirmasi dan estimasi penawaran harga. Terima kasih.'
      ].join('\n');

      const waUrl = 'https://wa.me/6281384151264?text=' + encodeURIComponent(text);
      window.open(waUrl, '_blank');
    });
  }

  // Registrasi Service Worker PWA hanya pada produksi (bukan localhost) agar tidak mengunci cache saat dev
  if ('serviceWorker' in navigator && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});

// 3. Mobile Nav & Interactive Handlers
document.addEventListener('DOMContentLoaded', () => {
  // Mobile Nav Toggle Handler
  const navToggle = document.getElementById('navToggle');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  if (navToggle && mobileNavDrawer) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = navToggle.classList.toggle('active');
      mobileNavDrawer.classList.toggle('active', isOpen);
      mobileNavDrawer.style.display = isOpen ? 'block' : 'none';
    });

    mobileNavDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        mobileNavDrawer.classList.remove('active');
        mobileNavDrawer.style.display = 'none';
      });
    });

    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !mobileNavDrawer.contains(e.target)) {
        navToggle.classList.remove('active');
        mobileNavDrawer.classList.remove('active');
        mobileNavDrawer.style.display = 'none';
      }
    });
  }

  // 4. FAQ Accordion Handler
  document.querySelectorAll('.faq-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.faq-item');
      if (item) {
        item.classList.toggle('active');
      }
    });
  });
});
