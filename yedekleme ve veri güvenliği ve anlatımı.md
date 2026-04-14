# Yedekleme ve Veri Güvenliği ve Anlatımı

Bu dosya, SerinGym uygulamasının yedekleme mantığını ve temel güvenlik yaklaşımını kısa ve anlaşılır biçimde açıklar.

## Veri Güvenliği

- Kullanıcı şifreleri veritabanında düz metin olarak tutulmaz.
- Şifreler `bcrypt` ile karma hale getirilerek saklanır.
- Oturum işlemleri `JWT` ile korunur.
- Yetkisiz isteklerde sistem erişimi kapatır.
- Yönetici işlemleri rol kontrolü ile sınırlandırılmıştır.
- `.env` dosyasında bulunan veritabanı bilgileri ve gizli anahtarlar paylaşılmamalıdır.

## Yedekleme Mantığı

Projede PostgreSQL kullanıldığı için veritabanı düzenli olarak dışa aktarılabilir.

Veritabanını yedeklemek için:

```bash
pg_dump gym_management > seringym_backup.sql
```

Bu komut tüm tablo yapısını ve verileri `seringym_backup.sql` dosyasına yazar.

Yedeği geri yüklemek için:

```bash
psql -d gym_management -f seringym_backup.sql
```

Bu komut daha önce alınmış yedeği tekrar veritabanına işler.

## Teslim ve Sunum Notu

Hocaya anlatırken şu şekilde özetleyebilirsin:

- Veriler PostgreSQL üzerinde tutulur.
- Şifreler güvenli biçimde saklanır.
- Yetkiler rol bazlı çalışır.
- Veritabanı tek komutla yedeklenebilir ve geri yüklenebilir.
- Yönetici raporları ve kullanıcı yönetimi sadece yönetici hesabına açıktır.
