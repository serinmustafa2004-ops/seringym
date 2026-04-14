# Hocaya Teslim Kurulum

Bu proje PostgreSQL, backend ve frontend ayrıca kurulmadan Docker ile çalıştırılabilir.

## Gereken Tek Şey

- Docker Desktop

## Çalıştırma

Proje klasöründe terminal açıp şu komutu çalıştır:

```bash
docker compose up --build
```

Ardından tarayıcıdan şu adrese gir:

```text
http://localhost:8080
```

## Giriş Bilgileri

Örnek hesaplar için şu dosyayı aç:

- `kullanıcı adları ve şifreler.md`

## Durdurma

```bash
docker compose down
```

## Tam Sıfırlama

```bash
docker compose down -v
docker compose up --build
```

Bu işlem veritabanını baştan kurar ve örnek verileri yeniden yükler.
