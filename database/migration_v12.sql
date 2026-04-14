UPDATE users
SET full_name = 'Admin Kullanıcı'
WHERE full_name = 'Admin Kullanici';

UPDATE users
SET full_name = 'Mert Yıldız'
WHERE full_name = 'Mert Yildiz';

UPDATE trainers
SET title = 'Pilates ve Mobilite Uzmanı'
WHERE title IN ('Pilates ve Mobility Uzmani', 'Pilates ve Mobility Uzmanı');

UPDATE trainers
SET bio = REPLACE(REPLACE(REPLACE(bio, 'Masa basi', 'Masa başı'), 'calisan', 'çalışan'), 'ozel', 'özel')
WHERE bio LIKE '%Masa basi%' OR bio LIKE '%calisan%' OR bio LIKE '%ozel%';

UPDATE rewards
SET name = 'Üyelikte %10 İndirim',
    description = 'Bir sonraki üyelik yenilemesinde indirim.'
WHERE name = 'Uyelikte %10 Indirim';

UPDATE badges
SET description = REPLACE(REPLACE(REPLACE(description, 'Uc', 'Üç'), 'ust uste', 'üst üste'), 'katildin', 'katıldın')
WHERE description LIKE '%Uc grup dersine ust uste katildin.%';
