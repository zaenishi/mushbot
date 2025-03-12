
# **🍄 MushBot**  
**Script base yang mudah untuk dimodifikasi dan dipelihara**  

MushBot adalah script yang mudah untuk dipelihara dan dimodifikasi, dengan struktur folder yang lumayan rapih, kamu bisa lebih mudah dan leluasa memodifikasi, dan mengembangkan script mushbot!

---

## **🚀 Cara Menjalankan MushBot**  

1. **Instal dependensi terlebih dahulu:**  
   ```sh
   npm install
   ```  
2. **Jalankan bot:**  
   ```sh
   npm start
   ```  
3. **Saat pertama kali dijalankan, masukkan nomor WhatsApp kamu dalam format internasional (contoh: `62xx`) di console.**  
4. **Masukkan kode pairing ke perangkat tertaut di WhatsApp.**  
5. **Selesai! Bot siap digunakan.**  

---

## **📌 Cara Menambahkan Plugin**  
Semua plugin berada di dalam folder:  

```
src/handlers
```
### **🔹 Format Plugin Berbasis Perintah**  
Untuk menambahkan plugin berbasis perintah, buat file JavaScript di dalam folder tersebut dengan format berikut:  

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

### **🔹 Format Plugin Otomatis (Tanpa Perintah Langsung)**  
Selain berbasis perintah, MushBot juga mendukung plugin yang berjalan secara otomatis saat ada pesan masuk. Formatnya seperti ini:  

```js
module.exports = async (sock, m) => {
  if (!sock.public) {
    return "Bot dalam mode non-public (self)";
  }
  // Tambahkan logika lain di sini
};
```
Plugin ini berguna untuk fitur seperti **respon otomatis**, **filter pesan**, atau **notifikasi status bot**.  

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

## **💰 Tertarik dengan Versi Premium?**  
Saya menjual **script MushBot versi lebih canggih** dengan:  
✔ **Lebih banyak fitur**  
✔ **Dukungan penuh & pembaruan**  
✔ **Bisa request fitur custom sesuai kebutuhan**  

💬 Hubungi saya di WhatsApp: **[6283188229366](https://wa.me/6283188229366)**  
Juga bisa digunakan untuk **melaporkan bug atau error** pada script ini.  

🚀 **Selamat mengembangkan MushBot!**
