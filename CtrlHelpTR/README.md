## Klavye Kısayolları • TR (Web + Electron)

Hafif, hızlı ve çevrimdışı çalışabilen klavye kısayolları görüntüleyicisi. Statik web olarak çalışır, ayrıca masaüstü için Electron sürümü vardır.

### Neler Sunar?

- **Anlık arama**: Kaynak, grup veya açıklamada yazdıkça filtreleme
- **Kaynağa göre filtre**: Windows, Google Chrome, VS Code vb. arasında çabuk geçiş
- **Grupları yönet**: Tek tıkla Aç/Daralt; kalıcı olarak hatırlanır
- **Sıralama seçenekleri**: Gruba veya açıklamaya göre A→Z / Z→A
- **Panoya kopyala**: Tuş kombinasyonuna tıklayın, anında kopyalansın
- **Dışa/İçe aktar**: Ekrandaki veriyi JSON indir; JSON’dan geri yükle
- **Favoriler**: Yıldızla ekle/çıkar, yalnızca favorileri göster
- **Tema**: Sistem/Koyu/Açık; tercihlerin tamamı `localStorage` ile kalıcı
- **PWA**: Servis worker ile çevrimdışı kullanılabilir (http/https altında)

---

## Kurulum ve Çalıştırma

### Web (Yerel Sunucu ile önerilir)

- PowerShell:
```powershell
cd "CtrlHelpTR"
powershell -ExecutionPolicy Bypass -File .\run.ps1
# Özel port
powershell -ExecutionPolicy Bypass -File .\run.ps1 -Port 8080
```

- Komut Dosyası (CMD):
```bat
cd /d CtrlHelpTR
run.cmd
```

- Doğrudan dosya açma: `index.html` dosyasını çift tıklayabilirsiniz; ancak servis worker `file://` altında çalışmaz.

### Electron (Masaüstü)

Gereksinimler: Node.js (öneri: 18+)

```powershell
cd "DesktopApp"
npm install
npm run start
```

Paketlemek (Windows NSIS):
```powershell
npm run build
```
Çıktı `DesktopApp/dist` altına düşer. Electron penceresi kardeş klasördeki `CtrlHelpTR/index.html`'i yükler.

---

## Kullanım İpuçları

- **Arama**: `Ctrl+K` ile arama kutusunu odaklayın. Yazdıkça sonuçlar filtrelenir.
- **Filtreler**: Başlıktaki çip butonlarına tıklayarak kaynakları aktif/pasif yapın.
- **Sıralama**: Açılır menüden gruba veya açıklamaya göre sıralayın.
- **Favoriler**: Yıldız butonuyla ekleyin; "Favoriler" kutusunu işaretleyerek yalnız favorileri görüntüleyin.
- **Kopyalama**: Her bir tuş kombinasyonunu tıklayarak panoya kopyalayın.
- **Dışa/İçe Aktarım**: JSON indirip daha sonra aynı biçimde geri yükleyebilirsiniz.

---

## Veri Kaynakları

Uygulama, varsayılan olarak `data/` klasöründen TR verilerini yükler. Sunucu erişilemezse, uygulama içi küçük bir yedek veri kümesi devreye girer.

### JSON Şeması (özet)

```json
{
  "groups": [
    {
      "source": "Windows",
      "group": "Genel",
      "shortcuts": [
        { "desc": "Kopyala", "keys": [["Ctrl","C"]] },
        { "desc": "Yapıştır", "keys": [["Ctrl","V"], ["Shift","Insert"]] }
      ]
    }
  ]
}
```

- **group**: Grup adı
- **shortcuts[].desc**: Kısayol açıklaması
- **shortcuts[].keys**: Çoklu kombinasyon desteği; her kombinasyon kendi dizisidir

Uygulama içinde ise her grup, render aşamasında bir `source` alanı ile eşleştirilir.

---

## Kütüphaneden Ekle (Electron’da)

Masaüstünde, üst menüdeki "Kütüphaneden Ekle" butonu ile `CtrlHelpApp/Shortcuts` klasöründeki resmi kısayol kütüphanesinden uygulama seçebilirsiniz.

- `DesktopApp/preload.js`, `CtrlHelpApp/Shortcuts/apps.json` dosyasını okur.
- Seçtiğiniz uygulamanın kısayolları dönüştürülerek mevcut listeye eklenir.
- Çalışması için depo düzeninin şu şekilde olması önerilir:

```text
<repo-kök>/
  CtrlHelpApp/
    Shortcuts/
      apps.json
      ...
  CtrlHelpTR/
  DesktopApp/
```

Kütüphane bulunamazsa buton kısa bir uyarı gösterir.

---

## PWA ve Çevrimdışı Kullanım

- Servis worker yalnızca `http://` veya `https://` altında kaydolur; `file://` altında devre dışıdır.
- Önbellek adı: `klavye-kisayollari-v1`. Yeni sürümlerde otomatik temizlik yapılır.
- "Uygulama olarak yükle" seçeneği tarayıcıya göre değişebilir.

---

## Proje Yapısı

```text
CtrlHelpTR/
  index.html
  styles.css
  app.js
  sw.js
  data/
DesktopApp/
  main.js
  preload.js
  package.json
```

---

## Geliştirme Notları

- **Tema**: `:root` değişkenleri ve `[data-theme]` ile Koyu/Açık + Sistem modu
- **Durum kalıcılığı**: `localStorage` üzerinden tema, filtreler, daraltılmış gruplar, sıralama, favoriler
- **Erişilebilirlik**: Etiketler, odak sırası; `aria-live` ile toast bildirimleri
- **Performans**: Filtrele → sırala → DOM üret; minimal yeniden akış

Elektron tarafında donanım hızlandırma devre dışı ve konsol logları aktiftir. Üretim için sıkı CSP ve uzak içerik kısıtları önerilir.

---

## SSS / Bilinen Sınırlamalar

- `file://` altında servis worker çalışmaz; yerel sunucu kullanın (`run.ps1` / `run.cmd`).
- Panoya kopyalama bazı tarayıcı politikalarına bağlı olarak engellenebilir; yerel/https altında çalıştırın.

---

## Lisans

MIT

