// --- 1. KONFIGURASI (Bagian yang harus kamu ganti) ---
// Ganti URL di dalam tanda kutip dengan URL Web App kamu
const scriptURL = 'https://script.google.com/macros/s/AKfycbzVWcnpNx-rnzJ2bGWrX1N9R8newsFioY-6QuCX-R11k3Qe9wIjBhRwmVNIlhEjmiAY6g/exec'; 

// --- 2. LOGIKA MUSIK & COVER ---
const audio = document.getElementById("song");
const hero = document.getElementById("hero");
const mainContent = document.getElementById("main-content");
const audioContainer = document.getElementById("audio-container");
const audioBtn = document.getElementById("audio-btn");
const audioIcon = document.querySelector(".fa-compact-disc");

function bukaUndangan() {
    // 1. Geser layar cover ke atas
    hero.style.transform = "translateY(-100%)";
    hero.style.transition = "transform 1s ease-in-out";
    
    // 2. Munculkan konten utama
    mainContent.style.display = "block";
    
    // 3. Putar Musik
    audio.play();
    audioContainer.style.display = "block"; // Munculkan tombol musik
    
    // 4. Mulai scroll otomatis sedikit biar smooth (opsional)
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 1000);
}

// Kontrol Tombol Musik (Pause/Play)
audioBtn.addEventListener("click", function() {
    if (audio.paused) {
        audio.play();
        audioIcon.classList.add("fa-spin"); // Icon muter
    } else {
        audio.pause();
        audioIcon.classList.remove("fa-spin"); // Icon stop
    }
});

// --- 3. AMBIL NAMA TAMU DARI URL ---
// Contoh link: undangan.com/?to=Budi+Santoso
const urlParams = new URLSearchParams(window.location.search);
const namaTamu = urlParams.get('to'); // Ambil parameter 'to'
const namaContainer = document.getElementById("nama-tamu");

if (namaTamu) {
    // Ganti teks "Tamu Undangan" dengan nama asli
    namaContainer.innerText = namaTamu; 
    
    // Otomatis isi kolom nama di form RSVP juga biar praktis
    document.getElementById("nama").value = namaTamu;
}

// --- 4. KIRIM DATA RSVP KE GOOGLE SHEETS ---
const form = document.forms['rsvpForm'];
const btnKirim = document.querySelector("button[type='submit']");

form.addEventListener('submit', e => {
    e.preventDefault(); // Cegah halaman reload
    
    // Ubah tombol jadi "Loading..."
    btnKirim.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
    btnKirim.disabled = true;

    // Ambil data form
    const data = {
        nama: form.nama.value,
        jumlah: form.jumlah.value,
        status: form.status.value,
        pesan: form.pesan.value
    };

    // Kirim pakai Fetch API
    fetch(scriptURL, {
        method: 'POST',
        // Kita kirim sebagai text biasa tapi isinya JSON String
        // Ini trik agar tidak kena blokir CORS (Cross-Origin Resource Sharing)
        body: JSON.stringify(data),
    })
    .then(response => {
        // Jika sukses
        alert("Terima kasih! Konfirmasi Anda telah terkirim.");
        form.reset(); // Kosongkan form
        btnKirim.innerHTML = 'Kirim Konfirmasi';
        btnKirim.disabled = false;
    })
    .catch(error => {
        // Jika gagal
        console.error('Error!', error.message);
        alert("Maaf, terjadi kesalahan. Silakan coba lagi.");
        btnKirim.innerHTML = 'Kirim Konfirmasi';
        btnKirim.disabled = false;
    });
});
