Berikut adalah versi yang lebih rapi dan informatif dari `README.md` kamu:  

---  

# **MushBot**  
**Script base yang mudah untuk dimodifikasi dan dipelihara**  

MushBot adalah framework bot WhatsApp yang fleksibel, memudahkan pengembang dalam menambahkan, mengelola, dan memelihara fitur melalui sistem plugin yang terorganisir.  

---  

## **📌 Cara Menambahkan Plugin**  
Semua plugin berada di dalam folder:  

```
src/handlers
```
Untuk menambahkan plugin baru, cukup buat file JavaScript di dalam folder tersebut dengan format berikut:  

```js
module.exports = {
  command: "nama_perintah", // Nama perintah yang akan dipanggil
  description: "Deskripsi singkat tentang perintah ini",
  category: ["kategori1", "kategori2"], // Kategori perintah
  execute: async (sock, m) => {
    // Logika eksekusi perintah di sini
  }
};
```

---

## **🔧 Properti Tambahan yang Bisa Digunakan**  
Untuk membatasi akses atau memberikan aturan tertentu pada perintah, kamu bisa menambahkan properti berikut:  

| Properti       | Tipe Data | Fungsi |
|---------------|----------|--------|
| `ownerOnly`   | Boolean  | Hanya bisa digunakan oleh pemilik bot |
| `adminOnly`   | Boolean  | Hanya bisa digunakan oleh admin grup |
| `groupOnly`   | Boolean  | Hanya bisa digunakan di dalam grup |
| `privateOnly` | Boolean  | Hanya bisa digunakan dalam chat pribadi |
| `premiumOnly` | Boolean  | Hanya bisa digunakan oleh pengguna premium |

---

**📌 Catatan:**  
- Pastikan setiap perintah memiliki deskripsi dan kategori agar lebih mudah dikelola.  
- Plugin dapat dibuat sesuai kebutuhan dengan mengikuti struktur di atas.  

🚀 **Selamat mengembangkan MushBot!**
