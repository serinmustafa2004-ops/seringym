# İnternete Yayınlama Adımları

Bu proje için en kolay ücretsiz dağıtım yapısı:

- Backend + PostgreSQL: Render
- Frontend: Vercel

## 1. Projeyi GitHub'a Yükle

Önce bu proje klasörünü GitHub'a gönder.

Gerekli olursa temel komutlar:

```bash
git init
git add .
git commit -m "SerinGym final teslim"
git branch -M main
git remote add origin GITHUB_REPO_LINKI
git push -u origin main
```

## 2. Render'da Backend ve Veritabanı

1. [Render](https://render.com) hesabı aç.
2. `New +` menüsünden `Blueprint` seç.
3. GitHub deponu bağla.
4. Render kökteki `render.yaml` dosyasını okuyacak.
5. Şunlar otomatik oluşacak:
   - PostgreSQL veritabanı
   - Node.js backend servisi

Backend ayağa kalktıktan sonra sana bir adres verecek:

```text
https://seringym-backend.onrender.com
```

Benzeri bir adres olacaktır.

## 3. Vercel'de Frontend

1. [Vercel](https://vercel.com) hesabı aç.
2. `Add New Project` ile aynı GitHub reposunu bağla.
3. `Root Directory` olarak `frontend` seç.
4. Ortam değişkeni ekle:

```text
VITE_API_URL=https://RENDER_BACKEND_ADRESIN/api
```

Örnek:

```text
VITE_API_URL=https://seringym-backend.onrender.com/api
```

5. Deploy et.

Frontend linkin buna benzer olur:

```text
https://seringym.vercel.app
```

## 4. Render Backend İçin CORS Ayarı

Render panelinde backend servisine gir ve `Environment` bölümünde `CLIENT_URL` değerini Vercel linkin ile güncelle.

Örnek:

```text
CLIENT_URL=https://seringym.vercel.app,http://localhost:5173,http://localhost:8080
```

Kaydet ve backend yeniden başlasın.

## 5. Sonuç

Artık hocan sadece Vercel linkine tıklayarak uygulamayı açabilir.

## 6. Not

Ücretsiz planlarda:

- ilk açılış biraz yavaş olabilir
- backend uyku moduna geçebilir
- bu normaldir
