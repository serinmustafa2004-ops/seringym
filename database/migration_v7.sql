DELETE FROM trainer_reviews
WHERE trainer_id IN (
  '55555555-5555-5555-5555-555555555555',
  '66666666-6666-6666-6666-666666666666',
  '77776666-6666-6666-6666-666666666666',
  '88887777-7777-7777-7777-777777777777',
  '99991000-0000-0000-0000-000000000001',
  '99991000-0000-0000-0000-000000000002',
  '99991000-0000-0000-0000-000000000003',
  '99991000-0000-0000-0000-000000000004'
);

WITH review_pool AS (
  SELECT * FROM (
    VALUES
      ('55555555-5555-5555-5555-555555555555'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, 5, 'Programları düzenli, sonuç takibi çok iyi ve iletişimi kuvvetli.'),
      ('55555555-5555-5555-5555-555555555555'::uuid, '90000000-0000-0000-0000-000000000001'::uuid, 5, 'Uzun süredir çalışıyoruz, hedefe göre programı sürekli güncelliyor.'),
      ('55555555-5555-5555-5555-555555555555'::uuid, '90000000-0000-0000-0000-000000000002'::uuid, 4, 'Teknik anlatımı iyi ama bazen seanslar çok yoğun geçiyor.'),
      ('55555555-5555-5555-5555-555555555555'::uuid, '90000000-0000-0000-0000-000000000003'::uuid, 5, 'Motivasyon ve disiplin tarafında çok güçlü bir antrenör.'),

      ('66666666-6666-6666-6666-666666666666'::uuid, '90000000-0000-0000-0000-000000000004'::uuid, 5, 'Postür ve mobilite konusunda gerçekten fark yarattı.'),
      ('66666666-6666-6666-6666-666666666666'::uuid, '90000000-0000-0000-0000-000000000005'::uuid, 4, 'Dersler çok verimli, sadece saat bulmak bazen zor olabiliyor.'),
      ('66666666-6666-6666-6666-666666666666'::uuid, '90000000-0000-0000-0000-000000000006'::uuid, 5, 'Ağrısız ve kontrollü ilerlememe ciddi katkı sağladı.'),
      ('66666666-6666-6666-6666-666666666666'::uuid, '90000000-0000-0000-0000-000000000007'::uuid, 5, 'Açıklamaları sade ve çok anlaşılır.'),

      ('77776666-6666-6666-6666-666666666666'::uuid, '90000000-0000-0000-0000-000000000008'::uuid, 5, 'Fonksiyonel antrenmanlarda çok sistemli ilerletiyor.'),
      ('77776666-6666-6666-6666-666666666666'::uuid, '90000000-0000-0000-0000-000000000009'::uuid, 4, 'Kondisyonum belirgin arttı, bazen set araları kısa geliyor.'),
      ('77776666-6666-6666-6666-666666666666'::uuid, '90000000-0000-0000-0000-000000000010'::uuid, 5, 'Salon içi takibi ve yaklaşımı çok profesyonel.'),
      ('77776666-6666-6666-6666-666666666666'::uuid, '90000000-0000-0000-0000-000000000011'::uuid, 5, 'Güç ve kondisyonu birlikte çok iyi planlıyor.'),

      ('88887777-7777-7777-7777-777777777777'::uuid, '90000000-0000-0000-0000-000000000012'::uuid, 5, 'Esneklik kazanımım gözle görülür şekilde arttı.'),
      ('88887777-7777-7777-7777-777777777777'::uuid, '90000000-0000-0000-0000-000000000013'::uuid, 4, 'Ders kalitesi iyi, bazen sınıf biraz kalabalık oluyor.'),
      ('88887777-7777-7777-7777-777777777777'::uuid, '90000000-0000-0000-0000-000000000014'::uuid, 5, 'Reformer tarafında çok bilgili ve dikkatli.'),
      ('88887777-7777-7777-7777-777777777777'::uuid, '90000000-0000-0000-0000-000000000015'::uuid, 5, 'Sakin ve güven veren bir eğitim tarzı var.'),

      ('99991000-0000-0000-0000-000000000001'::uuid, '90000000-0000-0000-0000-000000000016'::uuid, 5, 'Koşu ve kondisyon tarafında beklentimin üstünde katkı sağladı.'),
      ('99991000-0000-0000-0000-000000000001'::uuid, '90000000-0000-0000-0000-000000000017'::uuid, 4, 'Programları iyi ama bazen tempo çok yüksek geliyor.'),
      ('99991000-0000-0000-0000-000000000001'::uuid, '90000000-0000-0000-0000-000000000018'::uuid, 5, 'Uzun vadeli hedef planlaması çok başarılı.'),

      ('99991000-0000-0000-0000-000000000002'::uuid, '90000000-0000-0000-0000-000000000019'::uuid, 5, 'Kadın üyeler için yaklaşımı çok motive edici ve net.'),
      ('99991000-0000-0000-0000-000000000002'::uuid, '90000000-0000-0000-0000-000000000020'::uuid, 5, 'Sıkılaşma hedefimde hızlı ilerleme gördüm.'),
      ('99991000-0000-0000-0000-000000000002'::uuid, '90000000-0000-0000-0000-000000000021'::uuid, 4, 'İyi ama yoğun saatlerde randevu bulmak biraz zor.'),

      ('99991000-0000-0000-0000-000000000003'::uuid, '90000000-0000-0000-0000-000000000022'::uuid, 2, 'Enerjisi yüksek ama teknik düzeltme konusunda daha dikkatli olabilir.'),
      ('99991000-0000-0000-0000-000000000003'::uuid, '90000000-0000-0000-0000-000000000023'::uuid, 3, 'Antrenmanlar etkili ama başlangıç seviyesi için biraz sert gelebiliyor.'),
      ('99991000-0000-0000-0000-000000000003'::uuid, '90000000-0000-0000-0000-000000000024'::uuid, 2, 'Motivasyonu iyi fakat kişisel takip tarafı zayıf kaldı.'),

      ('99991000-0000-0000-0000-000000000004'::uuid, '90000000-0000-0000-0000-000000000025'::uuid, 3, 'Dersler sakin ama daha detaylı birebir yönlendirme bekliyordum.'),
      ('99991000-0000-0000-0000-000000000004'::uuid, '90000000-0000-0000-0000-000000000026'::uuid, 2, 'Esneklik odaklı iyi ancak seans temposu beklentimin altında kaldı.'),
      ('99991000-0000-0000-0000-000000000004'::uuid, '90000000-0000-0000-0000-000000000027'::uuid, 3, 'Temel eğitim iyi fakat programlar biraz tekrar ediyor.')
  ) AS t(trainer_id, member_id, rating, comment)
)
INSERT INTO trainer_reviews (trainer_id, member_id, rating, comment)
SELECT trainer_id, member_id, rating, comment
FROM review_pool;

UPDATE trainers t
SET
  rating_average = stats.avg_rating,
  rating_count = stats.review_count
FROM (
  SELECT trainer_id, ROUND(AVG(rating)::numeric, 2) AS avg_rating, COUNT(*) AS review_count
  FROM trainer_reviews
  GROUP BY trainer_id
) AS stats
WHERE stats.trainer_id = t.id;
