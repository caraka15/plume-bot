# Scheduler Bot

Bot ini dirancang untuk menjalankan multiple bot JavaScript secara terjadwal. Saat ini mendukung penjadwalan untuk Rivalz Bot dan Plume Bot.

## ⚠️ Peringatan Penting

1. **Keamanan**:

   - **JANGAN PERNAH** menggunakan wallet utama untuk bot
   - Pastikan setiap bot menggunakan wallet terpisah
   - Backup private key di tempat yang aman
   - Jangan share private key dengan siapapun

2. **Risk Management**:
   - Monitor aktivitas setiap bot secara berkala
   - Set resource yang aman untuk setiap operasi
   - Pastikan ada cukup gas untuk operasi

## Persiapan

1. Clone repositori:

   ```bash
   git clone https://github.com/caraka15/scheduler-bot.git
   ```

2. Masuk ke direktori:

   ```bash
   cd scheduler-bot
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Letakkan file bot yang ingin dijadwalkan di root directory:

   ```
   scheduler-bot/
   ├── rivalz.js      # Bot Rivalz
   └── plume/         # Bot Plume
       ├── checkIn.js
       ├── movement.js
       └── landShare.js
   ```

5. Edit `config/scheduler-config.json`:
   ```json
   {
     "timezone": "Asia/Jakarta",
     "tasks": [
       {
         "name": "Rivalz Bot",
         "file": "rivalz.js",
         "schedule": "08:00",
         "enabled": true,
         "runNow": false
       },
       {
         "name": "Plume Check In",
         "file": "plume/checkIn.js",
         "schedule": "09:00",
         "enabled": true,
         "runNow": false
       },
       {
         "name": "Plume Movement",
         "file": "plume/movement.js",
         "schedule": "12:00",
         "enabled": true,
         "runNow": false
       },
       {
         "name": "Plume Land Share",
         "file": "plume/landShare.js",
         "schedule": "15:00",
         "enabled": true,
         "runNow": false
       }
     ]
   }
   ```

## Cara Menjalankan

### 1. Menggunakan Screen (Recommended)

```bash
# Buat screen session
screen -Rd scheduler

# Jalankan scheduler
npm start

# Detach dari screen: CTRL+A+D
# Reattach ke screen: screen -Rd scheduler
```

### 2. Development Mode

```bash
npm run dev  # Jalankan dengan auto-reload
```

### 3. Run Task Langsung

Jika ingin menjalankan task sekarang tanpa menunggu jadwal:

```bash
# Edit scheduler-config.json, set "runNow": true untuk task yang ingin dijalankan
npm start
```

## Struktur Project

```
scheduler-bot/
├── config/
│   └── scheduler-config.json  # Konfigurasi jadwal
├── src/
│   ├── scheduler.js          # Universal scheduler
│   └── index.js             # Entry point
├── rivalz.js                # Rivalz bot
├── plume/                   # Plume bot files
│   ├── checkIn.js
│   ├── movement.js
│   └── landShare.js
└── package.json
```

## Konfigurasi Task

| Parameter | Deskripsi                               |
| --------- | --------------------------------------- |
| name      | Nama task untuk identifikasi            |
| file      | Path ke file yang akan dijalankan       |
| schedule  | Waktu eksekusi (format: HH:mm)          |
| enabled   | Status aktif/nonaktif task              |
| runNow    | Jalankan langsung tanpa menunggu jadwal |

## Troubleshooting

1. Error scheduler:

   - Verifikasi timezone di config
   - Cek format waktu (HH:mm)
   - Pastikan path file benar
   - Cek status enabled di config

2. Error screen:

   - `screen -ls` - List semua session
   - `screen -Rd scheduler` - Reattach ke session
   - `screen -X -S scheduler quit` - Kill session

3. Error task:
   - Cek logs dari masing-masing bot
   - Verifikasi file bot bisa dijalankan manual
   - Cek dependencies masing-masing bot

## Maintenance

1. Update bot:

   ```bash
   git pull
   npm install
   ```

2. Cek status:

   ```bash
   # Lihat screen session
   screen -ls

   # Lihat logs
   tail -f logs/scheduler.log
   ```

3. Restart bot:

   ```bash
   # Masuk ke screen
   screen -Rd scheduler

   # CTRL+C untuk stop
   # npm start untuk start ulang
   ```

## Support

Jika mengalami masalah atau ada pertanyaan:

- Buka issue di GitHub
- Hubungi: [@caraka17](https://t.me/caraka17)

## Donasi

Jika Anda merasa terbantu dengan bot ini, Anda dapat memberikan dukungan melalui:

- Crypto: `0xede7fa099638d4f39931d2df549ac36c90dfbd26`
- Saweria: [https://saweria.co/crxanode](https://saweria.co/crxanode)

## Disclaimer

Bot ini disediakan "as is" tanpa jaminan apapun. Pengguna bertanggung jawab penuh atas penggunaan bot dan resiko yang mungkin timbul. Pastikan untuk:

- Menggunakan wallet terpisah
- Monitoring secara berkala
- Memahami resiko operasi di blockchain

## License

MIT License - lihat file [LICENSE](LICENSE) untuk detail lengkap.
