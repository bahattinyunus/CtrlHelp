## Klavye Kısayolları (Basit TR)

Basit, hafif ve çevrimdışı çalışabilen klavye kısayolları görüntüleyicisi. Web (statik) ve Electron masaüstü sürümüyle gelir.

### Hızlı Başlangıç (Web)

PowerShell ile yerel sunucu:

```powershell
cd "CtrlHelpTR"
powershell -ExecutionPolicy Bypass -File .\run.ps1
# Farklı port:
powershell -ExecutionPolicy Bypass -File .\run.ps1 -Port 8080
```

Python olmadan da doğrudan `index.html` açılır, ancak bazı özellikler (servis worker) devre dışı olabilir.

### Hızlı Başlangıç (Electron)

```powershell
cd "DesktopApp"
npm install
npm run start
```

Electron penceresi `CtrlHelpTR/index.html` dosyasını yükler. Paketlemek için:

```powershell
npm run build
```

Çıktı `DesktopApp/dist` altına üretilir (Windows NSIS).

### Özellikler

- Hızlı arama (kaynak, grup, açıklama)
- Kaynağa göre filtreleme (Windows, Chrome, VS Code vs.)
- Grup aç/kapa kontrolü (Aç/Daralt)
- Sıralama: gruba göre veya açıklamaya göre (A→Z/Z→A)
- Dışa aktarma: Görüntülenen veriyi JSON olarak indir
- İçe aktarma: JSON dosyasından veri yükle
- Kısayol üstüne tıklayarak panoya kopyalama
- Tema seçici: Sistem/Koyu/Açık, kalıcı
- Favoriler: Yıldızla ekle/çıkart, sadece favorileri göster filtresi
- Kalıcı ayarlar: seçili kaynaklar, daraltılmış gruplar, sıralama, favori filtresi

### Dizinyapısı

```
CtrlHelpTR/
  index.html       # Arayüz
  styles.css       # Stil
  app.js           # Mantık ve veri yükleme
  data/            # TR verileri (json)
  sw.js            # Servis worker (yalnızca http/https)
DesktopApp/
  main.js          # Electron ana işlem
  preload.js       # Renderer bridge
  package.json     # Komutlar ve build ayarları
```

### Notlar

- Electron ile dosya protokolünde servis worker çalışmadığı için `app.js` içinde yalnızca http/https altında kayıt yapılır.
- Güvenlik uyarıları geliştirme modunda görünebilir; paketlendiğinde kaybolur. Üretimde sıkı CSP önerilir.
- Kısayol: `Ctrl+K` arama alanını odaklar.

### Lisans
## Eğitim: Bu uygulamada kullanılan teknolojiler

### 1) HTML
- "İskelet" yapıyı sağlar. `index.html` içinde `<header>`, `<main>`, `<footer>` bölümleri tanımlanır.
- Erişilebilirlik (aria-label), semantik etiketler ve for/id bağları ile daha iyi UX.

### 2) CSS (Değişkenler ve Tema)
- `:root` değişkenleri ve `[data-theme]` ile açık/koyu tema.
- Grid ve flexbox ile düzen. Bileşen odaklı sınıflar (`.chips`, `.key`, `.toast`).

### 3) Vanilla JS (Frameworksüz)
- Veri yükleme: `fetch` ile `data/*.json` kaynaklarını çekme, başarısızlıkta gömülü yedek veri.
- Durum yönetimi: Basit değişkenler ve `localStorage` ile kalıcılık (tema, filtreler, favoriler, sıralama).
- Olaylar: input, click, change, keyboard (Ctrl+K) dinleyicileri.
- Render akışı: Filtrele → Sırala → DOM oluştur. Performans için minimal yeniden akış.

### 4) Service Worker (PWA mantığı)
- Yalnızca http/https altında kayıt olur. `file://` altında devre dışı. Önbellekleme eğitim amaçlı basit kurgulanabilir.

### 5) Electron (Masaüstü kabuğu)
- Chromium + Node.js birleşimi. `DesktopApp/main.js` tarayıcı penceresi açar ve `CtrlHelpTR/index.html`'i yükler.
- `preload.js` ile renderer’a güvenli köprü. Donanım hızlandırma kapatma, loglama bayrakları.
- Paketleme: `electron-builder` ile Windows NSIS kurulumu (`npm run build`).

### 6) JSON veri formatı
- Basit, okunabilir yapı: `[{ group, shortcuts: [{ desc, keys: [[..]] }] }]`.
- Çoklu tuş kombinasyonları `keys` içinde dizi-dizileri olarak tutulur.

### 7) Erişilebilirlik ve UX
- Klavye ile kullanım: Ctrl+K, buton odak sırası, buton etiketleri.
- Görsel geri bildirimler: highlight, toast, aktif chip durumu.

### 8) Güvenlik İpuçları (Özet)
- Geliştirme modunda Electron CSP uyarıları normaldir; paketlemede ortadan kalkar.
- Üretimde sıkı CSP başlığı, uzak içerik kısıtları ve otomatik güncelleme imzaları önerilir.


MIT


