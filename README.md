# 🎓 EduTrade - Kampüs Takas ve Dayanışma Platformu

EduTrade, üniversite kampüsündeki öğrencilerin kendi aralarında ders notu, kitap, elektronik eşya ve yeteneklerini (özel ders vb.) güvenle takas edebilecekleri kapalı devre bir web ekosistemidir. Platform, sürdürülebilir bir kampüs ekonomisi yaratmayı ve öğrencilerin bütçelerini korumayı hedefler.

## 🚀 Öne Çıkan Özellikler

* **Kapalı Kampüs Ağı:** Sisteme yalnızca `@ogr.inonu.edu.tr` uzantılı akademik e-posta adresleriyle kayıt olunabilir, dışarıdan manipülasyon engellenir.
* **Güvenli Kimlik Doğrulama:** Kullanıcı şifreleri veritabanında `bcrypt` algoritması ile tek yönlü (hash) şifrelenerek saklanır. İki aşamalı e-posta doğrulama simülasyonu içerir.
* **Akıllı Çapraz Takas:** Kullanıcılar sadece aynı kategori içinde değil; örneğin "Özel Ders" verip karşılığında "Elektronik" bir eşya talep edebilecekleri esnek bir takas algoritmasına sahiptir.
* **Gelişmiş İlan Yönetimi:** Tam kapsamlı CRUD (Create, Read, Update, Delete) operasyonları desteklenir.
* **Dinamik Medya Kontrolü:** İlanlara `multer` altyapısı ile maksimum 3 adet ve sınırlandırılmış boyutta görsel yüklenebilir. 

## 🛠️ Kullanılan Teknolojiler (Tech Stack)

* **Front-end:** HTML5, CSS3, JavaScript (Vanilla / Fetch API), Bootstrap 5
* **Back-end:** Node.js, Express.js
* **Database:** PostgreSQL (pg)
* **Güvenlik & Araçlar:** Bcrypt (Şifreleme), Multer (Dosya Yükleme)

<img width="1905" height="1079" alt="Ekran görüntüsü 2026-05-23 222828" src="https://github.com/user-attachments/assets/0ea20abf-b9d5-42d4-b2a3-2c018c524e59" />
<img width="1904" height="931" alt="Ekran görüntüsü 2026-05-23 222813" src="https://github.com/user-attachments/assets/8621ce67-3df5-4b7c-88c4-ff10127a7ab4" />
<img width="1919" height="1079" alt="Ekran görüntüsü 2026-05-23 222845" src="https://github.com/user-attachments/assets/f43fe82f-5a0f-4ac6-94d9-423f1c956476" />
<img width="1903" height="1079" alt="Ekran görüntüsü 2026-05-23 222839" src="https://github.com/user-attachments/assets/02d8036b-3351-4c59-bb96-5d268b8689f2" />

## ⚙️ Kurulum ve Çalıştırma

Projeyi yerel makinenizde (localhost) çalıştırmak için aşağıdaki adımları izleyebilirsiniz:

1. Repoyu bilgisayarınıza klonlayın:
```bash
git clone https://github.com/EgeNegir/EduTrade-Campus-Platform.git
