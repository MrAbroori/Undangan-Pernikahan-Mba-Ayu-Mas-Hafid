// =============================================================================
// 1. KONFIGURASI UTAMA
// =============================================================================
// Pastikan ini adalah URL Web App TERBARU (Akhiran /exec)
// Jika kamu deploy ulang, GANTI URL INI!
const scriptURL = 'https://script.google.com/macros/s/AKfycby1PBsKvOYagze-tXkzNPLSLC3AxGVtJyXxNAe3e1wT2Q60z8oUqnrX7RpWiL5fnP4Ehw/exec'; 

// Tanggal Acara: 04 April 2026, 08:00
const tanggalTujuan = new Date(2026, 3, 4, 8, 0, 0).getTime();


// =============================================================================
// 2. FUNGSI UTAMA (Jalan saat website dimuat)
// =============================================================================
document.addEventListener("DOMContentLoaded", function() {
    
    // A. SETUP NAMA TAMU (DARI URL)
    const urlParams = new URLSearchParams(window.location.search);
    const namaTamu = urlParams.get('to'); 
    
    if (namaTamu) {
        const namaContainer = document.getElementById("nama-tamu");
        if (namaContainer) namaContainer.innerText = namaTamu; 

        const inputNama = document.getElementById("nama");
        if (inputNama) inputNama.value = namaTamu;
    }

    // B. LOAD UCAPAN AWAL
    loadUcapan();

    // C. SETUP TOMBOL MUSIK
    const audioBtn = document.getElementById("audio-btn");
    const audio = document.getElementById("song");
    const audioIcon = document.querySelector(".fa-compact-disc");

    if (audioBtn && audio) {
        audioBtn.addEventListener("click", function() {
            if (audio.paused) {
                audio.play();
                audioIcon.classList.add("fa-spin");
            } else {
                audio.pause();
                audioIcon.classList.remove("fa-spin");
            }
        });
    }

    // D. SETUP FORM SUBMIT (RSVP) - BAGIAN KRUSIAL
    const form = document.getElementById('rsvpForm');
    const btnKirim = document.querySelector("button[type='submit']");

    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault(); 
            
            // 1. Simpan teks asli tombol
            const textAwal = btnKirim.innerHTML;
            
            // 2. Ambil data form
            const data = {
                nama: form.nama.value,
                jumlah: form.jumlah.value,
                status: form.status.value,
                pesan: form.pesan.value
            };

            // 3. VALIDASI (PENTING: Harus ada return!)
            if(data.nama.trim().length < 3) {
                alert("Mohon masukkan nama lengkap yang valid.");
                return; // BERHENTI DISINI jika salah
            }

            if(data.jumlah < 1) {
                alert("Jumlah tamu minimal 1 orang.");
                return; // BERHENTI DISINI jika salah
            }

            // 4. Ubah tombol jadi loading
            btnKirim.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
            btnKirim.disabled = true;

            // 5. KIRIM KE GOOGLE SHEET
            fetch(scriptURL, {
                method: 'POST',
                // Stringify data JSON
                body: JSON.stringify(data),
                // Header ini penting agar GAS tidak menolak request (CORS)
                headers: {
                    "Content-Type": "text/plain;charset=utf-8",
                },
            })
            .then(response => {
                // Cek jika response sukses (200 OK)
                if (!response.ok) {
                    throw new Error('Respon server gagal.');
                }
                return response.json();
            })
            .then(result => {
                // Cek balikan dari Apps Script
                if (result.result === 'success') {
                    alert("Terima kasih! Konfirmasi & Ucapan Anda telah terkirim.");
                    form.reset(); // Kosongkan form
                    loadUcapan(); // Refresh daftar ucapan
                } else {
                    throw new Error(result.error || 'Gagal menyimpan data.');
                }
            })
            .catch(error => {
                console.error('Error saat kirim:', error);
                alert("Maaf, terjadi kesalahan koneksi. Pastikan internet lancar atau coba lagi nanti.");
            })
            .finally(() => {
                // Kembalikan tombol seperti semula (selalu dijalankan sukses/gagal)
                btnKirim.innerHTML = textAwal;
                btnKirim.disabled = false;
            });
        });
    }
});


// =============================================================================
// 3. FUNGSI GLOBAL
// =============================================================================

function bukaUndangan() {
    const hero = document.getElementById("hero");
    const mainContent = document.getElementById("main-content");
    const audio = document.getElementById("song");
    const audioContainer = document.getElementById("audio-container");
    const page1 = document.getElementById("page-1");

    if (hero) {
        hero.style.transform = "translateY(-100vh)";
        hero.style.transition = "transform 1s ease-in-out";
    }
    
    if (mainContent) {
        mainContent.style.display = "block";
        setTimeout(() => {
            if(page1) page1.scrollIntoView({ behavior: 'smooth' });
        }, 500);
    }
    
    if (audio) {
        audio.play().catch(error => console.log("Autoplay blocked:", error));
    }
    if (audioContainer) {
        audioContainer.style.display = "block";
    }
}

function copyText(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    const textToCopy = element.innerText;
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert("Berhasil disalin: " + textToCopy);
    }, () => {
        alert("Gagal menyalin.");
    });
}


// =============================================================================
// 4. FUNGSI LOAD UCAPAN
// =============================================================================

function loadUcapan() {
    const daftarUcapan = document.getElementById("daftar-ucapan");
    if (!daftarUcapan) return;

    fetch(scriptURL)
    .then(response => response.json())
    .then(data => {
        if (!data || data.length === 0) {
            daftarUcapan.innerHTML = '<div class="text-center py-5 opacity-75 text-cream">Belum ada ucapan. Jadilah yang pertama!</div>';
            return;
        }

        let html = '';
        data.forEach(item => {
            // Validasi data kosong
            const nama = item.nama ? item.nama : 'Tanpa Nama';
            const status = item.status ? item.status : 'Hadir';
            const pesan = item.pesan ? item.pesan : '';

            let badgeClass = 'bg-secondary';
            if(status === 'Hadir') badgeClass = 'bg-success';
            if(status === 'Tidak Hadir') badgeClass = 'bg-danger';

            html += `
            <div class="ucapan-item animate__animated animate__fadeIn">
                <div class="d-flex align-items-center mb-2">
                    <div class="fw-bold text-cream me-2">${nama}</div>
                    <span class="badge ${badgeClass}" style="font-size: 0.6rem;">${status}</span>
                </div>
                <p class="small text-cream opacity-75 mb-0 fst-italic">"${pesan}"</p>
            </div>
            `;
        });
        
        daftarUcapan.innerHTML = html;
    })
    .catch(error => {
        console.error('Gagal load ucapan:', error);
        daftarUcapan.innerHTML = '<div class="text-center py-5 text-warning small">Gagal memuat data.</div>';
    });
}


// =============================================================================
// 5. COUNTDOWN & ANIMATION
// =============================================================================

const hitungMundur = setInterval(function() {
    const sekarang = new Date().getTime();
    const selisih = tanggalTujuan - sekarang;

    const elHari = document.getElementById("days");
    const elJam = document.getElementById("hours");
    const elMenit = document.getElementById("minutes");
    const elDetik = document.getElementById("seconds");

    if (elHari && elJam && elMenit && elDetik) {
        const hari = Math.floor(selisih / (1000 * 60 * 60 * 24));
        const jam = Math.floor((selisih % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const menit = Math.floor((selisih % (1000 * 60 * 60)) / (1000 * 60));
        const detik = Math.floor((selisih % (1000 * 60)) / 1000);

        elHari.innerText = hari < 10 ? "0" + hari : hari;
        elJam.innerText = jam < 10 ? "0" + jam : jam;
        elMenit.innerText = menit < 10 ? "0" + menit : menit;
        elDetik.innerText = detik < 10 ? "0" + detik : detik;
    }

    if (selisih < 0) {
        clearInterval(hitungMundur);
    }
}, 1000);

// Init AOS Animation
if (typeof AOS !== 'undefined') {
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        mirror: false
    });
}