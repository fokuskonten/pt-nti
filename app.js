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
    'URL:https://pt-nti.pages.dev/',
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

  // Registrasi Service Worker PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});

// 3. Logika Asisten AI Teknik PT NTI
const aiKnowledge = [
  {
    keywords: ['milling', 'meja', 'kapasitas', 'cnc milling', 'stroke', 'hision', 'gut'],
    answer: 'Fasilitas CNC Milling 3-Axis PT NTI memiliki 2 unit utama:\n• Brand Hision: Meja kerja 1.000 × 500 mm (kapasitas beban 600 kg).\n• Brand GUT: Meja kerja 800 × 350 mm.\nKeduanya dilengkapi sumbu presisi tinggi untuk cetakan pelat besar dan komponen presisi otomotif.'
  },
  {
    keywords: ['bubut', 'turning', 'lathe', 'diameter'],
    answer: 'Mesin CNC Bubut Hision kami mampu membubut benda kerja hingga diameter swing 350 mm dan panjang maksimal 500 mm dengan hydraulic tool turret 8/12 station. Sangat presisi untuk shaft, bushing H7, dan komponen silindris.'
  },
  {
    keywords: ['material', 'baja', 'bahan', 'skd11', 's45c', 'sus', 'alumunium'],
    answer: 'Material yang kami proses secara rutin meliputi:\n• Tool Steel: SKD11 (HRC 58-60), SKD61, NAK80\n• Carbon Steel: S45C, SS400, S50C\n• Stainless Steel: SUS304, SUS316\n• Non-Ferrous: Alumunium Dural (6061/7075), Kuningan, Tembaga\n• Engineering Plastic: Polyacetal (POM/Delrin), MC Nylon.'
  },
  {
    keywords: ['toleransi', 'akurasi', 'mikron', 'presisi', 'qc'],
    answer: 'Toleransi pengerjaan kami mencapai ±0.005 mm s/d ±0.01 mm sesuai spesifikasi drawing 2D/3D Anda. Setiap part melalui tahapan quality control ketat dengan micrometer, dial gauge, dan laporan inspeksi dimensi sebelum pengiriman.'
  },
  {
    keywords: ['rfq', 'penawaran', 'harga', 'drawing', 'cad', 'pesan', 'order'],
    answer: 'Untuk pengajuan penawaran harga (RFQ), Anda dapat mengunggah rincian di menu RFQ kami atau langsung kirim file drawing (PDF/DWG/STEP) via WhatsApp PIC Nur Cahyani di +62 813-8415-1264. Penawaran harga resmi akan diterbitkan dalam 1×24 jam.'
  },
  {
    keywords: ['lokasi', 'workshop', 'alamat', 'pabrik', 'cikarang'],
    answer: 'Workshop kami berlokasi di Kampung Bugel Salam Poncol RT 02 / RW 06, Desa Hegarmukti, Kecamatan Cikarang Pusat, Kabupaten Bekasi (dekat Stadion Wibawa Mukti & Kawasan Industri GIIC/Delta Silicon).'
  },
  {
    keywords: ['klien', 'mitra', 'customer', 'gaya motor'],
    answer: 'PT NTI dipercaya oleh mitra korporat terkemuka seperti PT Gaya Motor (perakitan otomotif), PT Rekaday Multi Adiprima, PT Hashimoto Engineering, PT Haneeda Ekajaya, dan rekanan tier-1 otomotif nasional.'
  }
];

function getAiResponse(userText) {
  const lower = userText.toLowerCase();
  for (const item of aiKnowledge) {
    if (item.keywords.some(k => lower.includes(k))) {
      return item.answer;
    }
  }
  return 'Terima kasih atas pertanyaan Anda. Untuk spesifikasi teknis part khusus atau konsultasi gambar kerja (drawing), silakan hubungi langsung PIC Engineering kami Ibu Nur Cahyani via WhatsApp di +62 813-8415-1264 atau ajukan form RFQ.';
}

function askAiQuestion(question) {
  const input = document.getElementById('aiChatInput');
  if (input) {
    input.value = question;
    sendAiMessage();
  }
}

function sendAiMessage() {
  const input = document.getElementById('aiChatInput');
  const body = document.getElementById('aiChatBody');
  if (!input || !body) return;
  const msg = input.value.trim();
  if (!msg) return;

  // Append user bubble
  const userBubble = document.createElement('div');
  userBubble.className = 'chat-bubble bubble-user';
  userBubble.textContent = msg;
  body.appendChild(userBubble);
  input.value = '';
  body.scrollTop = body.scrollHeight;

  // Response AI
  setTimeout(() => {
    const aiResp = getAiResponse(msg);
    const aiBubble = document.createElement('div');
    aiBubble.className = 'chat-bubble bubble-ai';
    aiBubble.innerHTML = aiResp.replace(/\n/g, '<br>') + 
      '<div style="margin-top:8px;"><a href="https://wa.me/6281384151264?text=' + encodeURIComponent('Halo PT NTI, saya ingin konsultasi teknis: ' + msg) + '" target="_blank" class="btn-pill btn-pill-primary" style="font-size:0.75rem; padding:6px 14px;">Teruskan ke WhatsApp PIC</a></div>';
    body.appendChild(aiBubble);
    body.scrollTop = body.scrollHeight;
  }, 400);
}

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Nav Toggle Handler
  const navToggle = document.getElementById('navToggle');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  if (navToggle && mobileNavDrawer) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navToggle.classList.toggle('active');
      mobileNavDrawer.classList.toggle('active');
    });

    mobileNavDrawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        mobileNavDrawer.classList.remove('active');
      });
    });

    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !mobileNavDrawer.contains(e.target)) {
        navToggle.classList.remove('active');
        mobileNavDrawer.classList.remove('active');
      }
    });
  }

  const fab = document.getElementById('aiChatFabBtn');
  const win = document.getElementById('aiChatWindow');
  const close = document.getElementById('aiChatCloseBtn');
  const send = document.getElementById('aiSendBtn');
  const input = document.getElementById('aiChatInput');

  if (fab && win) {
    fab.addEventListener('click', () => win.classList.toggle('active'));
  }
  if (close && win) {
    close.addEventListener('click', () => win.classList.remove('active'));
  }
  if (send) {
    send.addEventListener('click', sendAiMessage);
  }
  if (input) {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendAiMessage();
    });
  }
});
