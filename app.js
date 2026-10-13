/**
 * PT. NURCAHYA TEKNIK INDUSTRY - Enterprise Client Application Logic
 * PWA Offline Handling, Interactive Catalog Filter, vCard Generator & WhatsApp RFQ Engine
 * Pure Vanilla JavaScript | Zero External Dependencies
 */

document.addEventListener('DOMContentLoaded', () => {
  initServiceWorker();
  initNavigation();
  initCatalogFilter();
  initRfqModal();
  initLightboxModal();
  initVCardGenerator();
  initScrollEffects();
  checkUrlParams();
});

/* ==========================================================================
   1. PWA Service Worker Registration & Offline Support
   ========================================================================== */
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered successfully:', registration.scope);
        })
        .catch((error) => {
          console.warn('[PWA] Service Worker registration failed:', error);
        });
    });
  }

  // Monitor network status
  window.addEventListener('online', () => {
    showToast('Koneksi terhubung kembali (Online)');
  });

  window.addEventListener('offline', () => {
    showToast('Mode Offline aktif - Akses katalog tetap tersedia melalui cache PWA');
  });
}

/* ==========================================================================
   2. Sticky Navigation & Mobile Menu Drawer
   ========================================================================== */
function initNavigation() {
  const header = document.querySelector('.site-header');
  const menuToggle = document.getElementById('menuToggleBtn');
  const mobileDrawer = document.getElementById('mobileNavDrawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  // Sticky header background transition
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile menu toggle
  if (menuToggle && mobileDrawer) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.contains('open');
      if (isOpen) {
        mobileDrawer.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      } else {
        mobileDrawer.classList.add('open');
        menuToggle.setAttribute('aria-expanded', 'true');
      }
    });

    // Close mobile drawer when link clicked
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileDrawer.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
}

/* ==========================================================================
   3. Interactive Catalog Filter (No Page Reload)
   ========================================================================== */
function initCatalogFilter() {
  const filterButtons = document.querySelectorAll('.filter-tab-btn');
  const catalogCards = document.querySelectorAll('.portfolio-card');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const selectedCategory = button.getAttribute('data-filter');

      // Update active tab button style
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Filter catalog items with transition
      catalogCards.forEach(card => {
        const itemCategory = card.getAttribute('data-category');
        if (selectedCategory === 'all' || itemCategory === selectedCategory) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

/* ==========================================================================
   4. RFQ Modal & Form Engine (WhatsApp Message Builder)
   ========================================================================== */
const WHATSAPP_TARGET_NUMBER = '6281384151264';

function initRfqModal() {
  const rfqModal = document.getElementById('rfqModal');
  const rfqForm = document.getElementById('rfqForm');
  const openButtons = document.querySelectorAll('[data-action="open-rfq"]');
  const closeButtons = document.querySelectorAll('[data-action="close-rfq"]');

  // Open modal triggers
  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const presetJob = btn.getAttribute('data-preset-job');
      if (presetJob) {
        const jobSelect = document.getElementById('rfqJobType');
        if (jobSelect) jobSelect.value = presetJob;
      }
      openModal(rfqModal);
    });
  });

  // Close modal triggers
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(rfqModal);
    });
  });

  // Backdrop click to close
  if (rfqModal) {
    rfqModal.addEventListener('click', (e) => {
      if (e.target === rfqModal) {
        closeModal(rfqModal);
      }
    });
  }

  // Handle Form Submission -> WhatsApp
  if (rfqForm) {
    rfqForm.addEventListener('submit', (e) => {
      e.preventDefault();
      submitRfqToWhatsApp();
    });
  }
}

function submitRfqToWhatsApp() {
  const name = document.getElementById('rfqName').value.trim();
  const company = document.getElementById('rfqCompany').value.trim();
  const contact = document.getElementById('rfqContact').value.trim();
  const jobType = document.getElementById('rfqJobType').value;
  const material = document.getElementById('rfqMaterial').value.trim() || 'Sesuai Rekomendasi / Gambar';
  const tolerance = document.getElementById('rfqTolerance').value || 'Standard Presisi';
  const quantity = document.getElementById('rfqQuantity').value.trim() || '1 Set/Pcs';
  const leadTime = document.getElementById('rfqLeadTime').value.trim() || 'Standar Normal';
  const details = document.getElementById('rfqDetails').value.trim();

  if (!name || !company || !contact) {
    showToast('Mohon lengkapi Nama, Perusahaan, dan Nomor Kontak');
    return;
  }

  const message = buildWhatsAppMessage({
    name,
    company,
    contact,
    jobType,
    material,
    tolerance,
    quantity,
    leadTime,
    details
  });

  const whatsappUrl = `https://wa.me/${WHATSAPP_TARGET_NUMBER}?text=${encodeURIComponent(message)}`;

  // Close modal and open WhatsApp in new tab
  const rfqModal = document.getElementById('rfqModal');
  closeModal(rfqModal);
  showToast('Membuka WhatsApp untuk mengirim RFQ...');
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
}

function buildWhatsAppMessage(data) {
  const now = new Date();
  const dateFormatted = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return `*PERMINTAAN PENAWARAN HARGA (RFQ)*\n` +
         `*PT. NURCAHYA TEKNIK INDUSTRY*\n` +
         `Tanggal: ${dateFormatted}\n\n` +
         `*DATA PERUSAHAAN / PEMESAN:*\n` +
         `• Nama: ${data.name}\n` +
         `• Perusahaan: ${data.company}\n` +
         `• No. Kontak / WA: ${data.contact}\n\n` +
         `*DETAIL PEKERJAAN & SPESIFIKASI:*\n` +
         `• Kategori Layanan: ${data.jobType}\n` +
         `• Jenis Material: ${data.material}\n` +
         `• Toleransi Dimensi: ${data.tolerance}\n` +
         `• Estimasi Volume: ${data.quantity}\n` +
         `• Target Lead Time: ${data.leadTime}\n\n` +
         `*DESKRIPSI / SPESIFIKASI TAMBAHAN:*\n` +
         `${data.details || '-'}\n\n` +
         `_Catatan: Gambar kerja teknis (2D PDF / 3D CAD) akan dikirimkan menyusul pada chat ini._\n\n` +
         `Mohon konfirmasi dan estimasi penawaran harga. Terima kasih.`;
}

/* ==========================================================================
   5. Lightbox Modal (High-Res Image Viewer & Technical Specs)
   ========================================================================== */
function initLightboxModal() {
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImage');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxCategory = document.getElementById('lightboxCategory');
  const lightboxDesc = document.getElementById('lightboxDesc');
  const lightboxRfqBtn = document.getElementById('lightboxRfqBtn');
  const closeButtons = document.querySelectorAll('[data-action="close-lightbox"]');

  // Open Lightbox from catalog or machine cards
  const previewButtons = document.querySelectorAll('[data-action="preview-image"]');
  previewButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const imgSrc = btn.getAttribute('data-img');
      const title = btn.getAttribute('data-title');
      const category = btn.getAttribute('data-category') || 'Spesifikasi Manufaktur';
      const desc = btn.getAttribute('data-desc') || 'Komponen presisi industri dengan standar toleransi tinggi.';
      const jobPreset = btn.getAttribute('data-preset-job') || '';

      if (lightboxImg) lightboxImg.src = imgSrc;
      if (lightboxImg) lightboxImg.alt = title;
      if (lightboxTitle) lightboxTitle.textContent = title;
      if (lightboxCategory) lightboxCategory.textContent = category;
      if (lightboxDesc) lightboxDesc.textContent = desc;

      if (lightboxRfqBtn) {
        lightboxRfqBtn.setAttribute('data-preset-job', jobPreset);
      }

      openModal(lightboxModal);
    });
  });

  // Connect Lightbox RFQ button to RFQ Modal
  if (lightboxRfqBtn) {
    lightboxRfqBtn.addEventListener('click', () => {
      const presetJob = lightboxRfqBtn.getAttribute('data-preset-job');
      closeModal(lightboxModal);
      const rfqModal = document.getElementById('rfqModal');
      const jobSelect = document.getElementById('rfqJobType');
      if (jobSelect && presetJob) {
        jobSelect.value = presetJob;
      }
      setTimeout(() => openModal(rfqModal), 150);
    });
  }

  // Close triggers
  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(lightboxModal);
    });
  });

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        closeModal(lightboxModal);
      }
    });
  }

  // Keyboard Escape listener
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openModalElem = document.querySelector('.modal-overlay.active');
      if (openModalElem) closeModal(openModalElem);
    }
  });
}

function openModal(modal) {
  if (!modal) return;
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

/* ==========================================================================
   6. Dynamic vCard Generator & Contact Downloader (.vcf)
   ========================================================================== */
function initVCardGenerator() {
  const downloadVCardBtn = document.getElementById('downloadVCardBtn');
  const copyContactBtn = document.getElementById('copyContactBtn');

  if (downloadVCardBtn) {
    downloadVCardBtn.addEventListener('click', (e) => {
      e.preventDefault();
      downloadVCard();
    });
  }

  if (copyContactBtn) {
    copyContactBtn.addEventListener('click', (e) => {
      e.preventDefault();
      copyContactDetails();
    });
  }
}

function downloadVCard() {
  const vCardData = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    'N:Cahyani;Nur;;;',
    'FN:Nur Cahyani',
    'ORG:PT. Nurcahya Teknik Industry',
    'TITLE:Marketing & Technical Operations',
    'TEL;TYPE=WORK,VOICE:+6281384151264',
    'TEL;TYPE=CELL:+6281384151264',
    'EMAIL;TYPE=WORK;TYPE=INTERNET:Nur.nurcahyani@outlook.co.id',
    'EMAIL;TYPE=HOME;TYPE=INTERNET:Nur.nurcahya92@outlook.com',
    'ADR;TYPE=WORK:;;Bugel salam poncol RT 02 Rw 06 desa hegarmukti kecamatan cikarang pusat;Bekasi;Jawa Barat;;Indonesia',
    'LABEL;TYPE=WORK:Bugel salam poncol RT 02 Rw 06 desa hegarmukti kecamatan cikarang pusat, Bekasi, Jawa Barat, Indonesia',
    'URL:https://pt-nurcahya-teknik-industry.com',
    'NOTE:PT. Nurcahya Teknik Industry - Mitra Presisi Machining CNC, Dies, Jig & Fabrikasi Industri Cikarang',
    'REV:2026-10-13T00:00:00Z',
    'END:VCARD'
  ].join('\r\n');

  const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');

  downloadLink.href = url;
  downloadLink.setAttribute('download', 'Nur_Cahyani_PT_NTI.vcf');
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);

  showToast('Kontak vCard berhasil diunduh ke perangkat Anda');
}

function copyContactDetails() {
  const textToCopy = `PT. NURCAHYA TEKNIK INDUSTRY\n` +
                     `Kontak: Nur Cahyani\n` +
                     `WhatsApp / Telp: +62 813-8415-1264\n` +
                     `Email 1: Nur.nurcahyani@outlook.co.id\n` +
                     `Email 2: Nur.nurcahya92@outlook.com\n` +
                     `Alamat: Bugel salam poncol RT 02 Rw 06 desa hegarmukti kecamatan cikarang pusat, Kab. Bekasi`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(textToCopy).then(() => {
      showToast('Informasi kontak berhasil disalin ke clipboard');
    }).catch(() => {
      fallbackCopy(textToCopy);
    });
  } else {
    fallbackCopy(textToCopy);
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast('Informasi kontak berhasil disalin');
  } catch (err) {
    showToast('Gagal menyalin informasi kontak');
  }
  document.body.removeChild(textarea);
}

/* ==========================================================================
   7. Scroll Effects & FAB Back to Top
   ========================================================================== */
function initScrollEffects() {
  const backToTopBtn = document.getElementById('backToTopBtn');

  window.addEventListener('scroll', () => {
    if (backToTopBtn) {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
  }, { passive: true });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

/* ==========================================================================
   8. URL Parameter Handler (Direct Deep-link e.g. PWA Shortcut)
   ========================================================================== */
function checkUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get('action');

  if (action === 'rfq') {
    const rfqModal = document.getElementById('rfqModal');
    if (rfqModal) {
      setTimeout(() => openModal(rfqModal), 300);
    }
  }
}

/* ==========================================================================
   9. Global Toast Notification Helper
   ========================================================================== */
let toastTimeout;
function showToast(message) {
  let toast = document.getElementById('toastBanner');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastBanner';
    toast.className = 'toast-banner';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}
