const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const bcrypt = require('bcryptjs');
const multer = require('multer'); 
const fs = require('fs'); 
const crypto = require('crypto'); 
const nodemailer = require('nodemailer'); 

const app = express();
const port = 3000;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'edutrade',
    password: '1234', 
    port: 5432,
});

pool.connect((err, client, release) => {
    if (err) return console.error('Veritabanı hatası!', err.stack);
    console.log('PostgreSQL veritabanına başarıyla bağlanıldı!');
    release();
});

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, 'uploads/'); },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// GEÇİCİ ONAY KODLARI 
// E-postaya giden 6 haneli kodları geçici olarak burada tutacağız.
const onayKodlari = {};

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });


// KAYIT İÇİN ONAY KODU ÜRET VE GÖNDER

app.post('/api/kayit-kod-gonder', async (req, res) => {
    const { email } = req.body;
    if (!email.endsWith('@ogr.inonu.edu.tr')) {
        return res.status(400).send('Hata: Sadece @ogr.inonu.edu.tr uzantılı e-postalar kayıt olabilir.');
    }

    try {
        // Mail zaten veritabanında var mı kontrolü
        const checkUser = await pool.query('SELECT * FROM Kullanicilar WHERE email = $1', [email]);
        if (checkUser.rows.length > 0) {
            return res.status(400).send('Hata: Bu e-posta adresi sistemde zaten kayıtlı.');
        }

        // 100000 ile 999999 arası 6 haneli rastgele kod üret
        const kod = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Kodu 5 dakika geçerli olacak şekilde hafızaya kaydet
        onayKodlari[email] = {
            kod: kod,
            zaman: Date.now() + (5 * 60 * 1000)
        };

        console.log(`\n🔑 [EduTrade Güvenlik Sistemi] Yeni Kayıt Talebi!`);
        console.log(`E-Posta: ${email}`);
        console.log(`6 Haneli Doğrulama Kodu: ${kod}\n`);

        res.status(200).send('Doğrulama kodu gönderildi.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Sunucu hatası.');
    }
});


// KODU DOĞRULA VE KAYDI TAMAMLA

app.post('/kayit', async (req, res) => {
    const { ad_soyad, email, sifre, onay_kodu } = req.body;

    // Hafızadan o e-postaya ait kodu çekiyoruz
    const kayitliVeri = onayKodlari[email];

    if (!kayitliVeri) {
        return res.status(400).send('Hata: Bu e-posta için kod istenmemiş veya sistemden silinmiş.');
    }
    
    // Süre kontrolü (5 dk geçtiyse)
    if (Date.now() > kayitliVeri.zaman) {
        delete onayKodlari[email];
        return res.status(400).send('Hata: Kodun süresi dolmuş. Lütfen sayfayı yenileyip baştan başlayın.');
    }
    
    // Kod eşleşiyor mu
    if (kayitliVeri.kod !== onay_kodu) {
        return res.status(400).send('Hata: Girdiğiniz 6 haneli kod yanlış!');
    }

    // Kod doğruysa klasik kayıt işlemi
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(sifre, salt);
        await pool.query('INSERT INTO Kullanicilar (ad_soyad, email, sifre, rol) VALUES ($1, $2, $3, \'Öğrenci\')', [ad_soyad, email, hashedPassword]);
        
        // İşlem bitti, kodu hafızadan temizle
        delete onayKodlari[email];
        
        res.status(200).send('Kayıt başarılı.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Kayıt tamamlanırken sunucu hatası.');
    }
});



app.post('/giris', async (req, res) => {
    const { email, sifre } = req.body;
    try {
        const { rows } = await pool.query('SELECT * FROM Kullanicilar WHERE email = $1', [email]);
        if (rows.length === 0) return res.status(400).send('Hesap bulunamadı.');
        const isMatch = await bcrypt.compare(sifre, rows[0].sifre);
        if (!isMatch) return res.status(400).send('Hatalı şifre.');
        res.send(`<script>alert("Hoş geldin!"); localStorage.setItem('kullaniciAdSoyad', '${rows[0].ad_soyad}'); localStorage.setItem('kullaniciEmail', '${rows[0].email}'); window.location.href = "/index.html";</script>`);
    } catch (err) { res.status(500).send('Hata'); }
});

app.post('/api/sifremi-unuttum', async (req, res) => {
    const { email } = req.body;
    try {
        const { rows } = await pool.query('SELECT * FROM Kullanicilar WHERE email = $1', [email]);
        if (rows.length === 0) return res.status(404).send('Bulunamadı.');
        const token = crypto.randomBytes(32).toString('hex');
        const expireDate = new Date(Date.now() + 15 * 60 * 1000); 
        await pool.query('UPDATE Kullanicilar SET reset_token = $1, reset_token_expires = $2 WHERE email = $3', [token, expireDate, email]);
        console.log(`\n✉️ Şifre Sıfırlama: http://localhost:3000/sifre-sifirla.html?token=${token}\n`);
        res.status(200).send('Sıfırlama bağlantısı gönderildi.');
    } catch (err) { res.status(500).send('Hata'); }
});

app.post('/api/sifre-sifirla', async (req, res) => {
    const { token, yeniSifre } = req.body;
    try {
        const { rows } = await pool.query('SELECT * FROM Kullanicilar WHERE reset_token = $1 AND reset_token_expires > NOW()', [token]);
        if (rows.length === 0) return res.status(400).send('Geçersiz link.');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(yeniSifre, salt);
        await pool.query('UPDATE Kullanicilar SET sifre = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2', [hashedPassword, rows[0].id]);
        res.status(200).send('Şifre güncellendi.');
    } catch (err) { res.status(500).send('Hata'); }
});

app.post('/api/ilanlar', upload.array('fotograflar', 3), async (req, res) => {
    const { baslik, kategori, takas_istegi, aciklama, sahibi, sahibi_email } = req.body;
    const resimYollari = req.files ? req.files.map(file => '/uploads/' + file.filename) : [];
    try {
        await pool.query('INSERT INTO ilanlar (baslik, kategori, takas_istegi, aciklama, sahibi, sahibi_email, resimler) VALUES ($1, $2, $3, $4, $5, $6, $7)', [baslik, kategori, takas_istegi, aciklama, sahibi, sahibi_email, resimYollari]);
        res.send('<script>alert("İlan yayınlandı!"); window.location.href = "/index.html";</script>');
    } catch (err) { res.status(500).send('Hata'); }
});

app.get('/api/ilanlar', async (req, res) => {
    try { const { rows } = await pool.query('SELECT * FROM ilanlar ORDER BY id DESC'); res.json(rows); } 
    catch (err) { res.status(500).json({ error: 'Hata' }); }
});
app.delete('/api/ilanlar/:id', async (req, res) => {
    try { await pool.query('DELETE FROM ilanlar WHERE id = $1', [req.params.id]); res.status(200).send('Silindi.'); } 
    catch (err) { res.status(500).send('Hata'); }
});
app.get('/api/ilanlar/ara', async (req, res) => {
    try { const { rows } = await pool.query('SELECT * FROM ilanlar WHERE baslik ILIKE $1 OR aciklama ILIKE $1 OR kategori ILIKE $1 ORDER BY id DESC', [`%${req.query.q}%`]); res.json(rows); } 
    catch (err) { res.status(500).json({ error: 'Hata' }); }
});
app.get('/api/ilanlar/:id', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM ilanlar WHERE id = $1', [req.params.id]);
        if (rows.length > 0) res.json(rows[0]); else res.status(404).send("Bulunamadı");
    } catch (err) { res.status(500).send("Hata"); }
});
app.put('/api/ilanlar/:id', upload.array('fotograflar', 3), async (req, res) => {
    const { baslik, kategori, takas_istegi, aciklama, kalan_resimler } = req.body;
    let mevcutResimler = kalan_resimler ? (Array.isArray(kalan_resimler) ? kalan_resimler : [kalan_resimler]) : [];
    const yeniResimler = req.files ? req.files.map(file => '/uploads/' + file.filename) : [];
    const guncelResimler = [...mevcutResimler, ...yeniResimler];
    if (guncelResimler.length > 3) return res.status(400).send('Maksimum 3 resim.');
    try {
        await pool.query('UPDATE ilanlar SET baslik = $1, kategori = $2, takas_istegi = $3, aciklama = $4, resimler = $5 WHERE id = $6', [baslik, kategori, takas_istegi, aciklama, guncelResimler, req.params.id]);
        res.status(200).send('Güncellendi.');
    } catch (err) { res.status(500).send('Hata'); }
});

app.listen(port, () => { console.log(`Sunucu http://localhost:${port} adresinde çalışıyor...`); });