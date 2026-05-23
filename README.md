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

## ⚙️ Kurulum ve Çalıştırma

Projeyi yerel makinenizde (localhost) çalıştırmak için aşağıdaki adımları izleyebilirsiniz:

1. Repoyu bilgisayarınıza klonlayın:
```bash
git clone https://github.com/EgeNegir/EduTrade-Campus-Platform.git