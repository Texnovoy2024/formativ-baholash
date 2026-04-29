# Talablar Hujjati

## Kirish

Ushbu hujjat **Admin roli va markazlashgan autentifikatsiya tizimi** funksiyasining talablarini belgilaydi.

Loyiha React (Vite) asosida qurilgan frontend-only ta'lim platformasidir. Hozirda `teacher` va `student` rollari mavjud bo'lib, foydalanuvchilar mustaqil ro'yxatdan o'tishi mumkin. Yangi funksiya quyidagilarni amalga oshiradi:

- Tizimga yagona, o'zgarmas `admin` hisobi qo'shiladi (hardcoded)
- Faqat admin teacher va student hisoblarini yaratadi
- Mustaqil ro'yxatdan o'tish (Register sahifasi) butunlay o'chiriladi
- Barcha foydalanuvchilar faqat admin bergan login/parol orqali tizimga kiradi
- Admin o'z panelidan foydalanuvchilarni boshqaradi (qo'shish, o'chirish, ko'rish)

---

## Lug'at (Glossary)

- **Tizim** — React (Vite) asosidagi frontend-only ta'lim platformasi
- **Admin** — Tizimning yagona boshqaruvchisi; `qosimovamuxlisaxon04@gmail.com` emailiga ega, hardcoded hisob
- **Teacher** — Admin tomonidan yaratilgan o'qituvchi foydalanuvchi
- **Student** — Admin tomonidan yaratilgan o'quvchi foydalanuvchi
- **AuthContext** — Tizimning markazlashgan autentifikatsiya holat boshqaruvchisi (React Context)
- **localStorage** — Brauzerning mahalliy saqlash mexanizmi; foydalanuvchi ma'lumotlari shu yerda saqlanadi
- **ProtectedRoute** — Foydalanuvchi roliga qarab sahifaga kirishni cheklovchi marshrutlash komponenti
- **AdminPanel** — Faqat admin uchun mo'ljallangan boshqaruv paneli sahifasi
- **Hardcoded** — Dastur kodiga to'g'ridan-to'g'ri yozilgan, o'zgartirib bo'lmaydigan qiymat

---

## Talablar

### Talab 1: Hardcoded Admin Hisobi

**Foydalanuvchi hikoyasi:** Tizim egasi sifatida men platformaga kirish uchun o'zgarmas admin hisobiga ega bo'lishni xohlayman, shunda boshqa hech kim admin huquqlarini ololmasin.

#### Qabul qilish mezonlari

1. THE **Tizim** SHALL `qosimovamuxlisaxon04@gmail.com` emailli va `hasanova4` parolga ega yagona admin hisobini `AuthContext` ichida hardcoded tarzda saqlashi kerak.
2. THE **Tizim** SHALL admin hisobini `localStorage`-dagi `users` massiviga yozmasdan, faqat xotira (in-memory) yoki `AuthContext` konstantasi sifatida saqlashi kerak.
3. WHEN **Tizim** ishga tushganda, THE **Tizim** SHALL `localStorage`-da admin hisobi mavjudligini tekshirmasdan, hardcoded admin ma'lumotlarini autentifikatsiya uchun ishlatishi kerak.
4. IF admin emaili yoki paroli o'zgartirilmoqchi bo'lsa, THEN THE **Tizim** SHALL faqat manba kodini o'zgartirish orqali bunday imkoniyatni ta'minlashi kerak (UI orqali o'zgartirish mumkin emas).
5. THE **Tizim** SHALL faqat bitta admin hisobiga ruxsat berishi kerak; ikkinchi admin yaratish imkoniyati mavjud bo'lmasligi kerak.

---

### Talab 2: Markazlashgan Foydalanuvchi Yaratish (Admin Tomonidan)

**Foydalanuvchi hikoyasi:** Admin sifatida men teacher va student hisoblarini o'zim yaratishni xohlayman, shunda platforma foydalanuvchilari faqat men ruxsat bergan odamlar bo'lsin.

#### Qabul qilish mezonlari

1. WHEN **Admin** yangi teacher yaratish so'rovini yuborsa, THE **AdminPanel** SHALL ism, email va parol maydonlarini qabul qilib, yangi teacher hisobini `localStorage`-ga saqlashi kerak.
2. WHEN **Admin** yangi student yaratish so'rovini yuborsa, THE **AdminPanel** SHALL ism, email va parol maydonlarini qabul qilib, yangi student hisobini `localStorage`-ga saqlashi kerak.
3. IF yaratilmoqchi bo'lgan foydalanuvchining emaili `localStorage`-da allaqachon mavjud bo'lsa, THEN THE **AdminPanel** SHALL "Bu email allaqachon mavjud" xato xabarini ko'rsatishi kerak va yangi hisob yaratmasligi kerak.
4. THE **AdminPanel** SHALL foydalanuvchi yaratishda email formatini tekshirishi kerak; noto'g'ri formatdagi email qabul qilinmasligi kerak.
5. THE **AdminPanel** SHALL foydalanuvchi yaratishda parol uzunligini kamida 6 belgidan iborat bo'lishini tekshirishi kerak.
6. WHEN teacher yoki student muvaffaqiyatli yaratilsa, THE **AdminPanel** SHALL muvaffaqiyat xabarini ko'rsatishi va formani tozalashi kerak.

---

### Talab 3: Mustaqil Ro'yxatdan O'tishni Bloklash

**Foydalanuvchi hikoyasi:** Admin sifatida men foydalanuvchilarning mustaqil ro'yxatdan o'tishini to'xtatishni xohlayman, shunda tizimga faqat men ruxsat bergan odamlar kirsin.

#### Qabul qilish mezonlari

1. THE **Tizim** SHALL `/register` marshrutini o'chirib, ushbu URL-ga kirishda foydalanuvchini `/login` sahifasiga yo'naltirishini ta'minlashi kerak.
2. THE **Login** sahifasi SHALL "Hisobingiz yo'qmi? Ro'yxatdan o'ting" havolasini ko'rsatmasligi kerak.
3. THE **AuthContext** SHALL `register` funksiyasini eksport qilmasligi yoki ushbu funksiya chaqirilganda `{ success: false }` qaytarishi kerak.
4. WHEN foydalanuvchi `/register` URL-iga to'g'ridan-to'g'ri brauzer orqali kirmoqchi bo'lsa, THE **Tizim** SHALL foydalanuvchini `/login` sahifasiga yo'naltirishini ta'minlashi kerak.

---

### Talab 4: Rol Asosida Autentifikatsiya va Yo'naltirish

**Foydalanuvchi hikoyasi:** Foydalanuvchi sifatida men tizimga kirganimda o'z rolimga mos panelga avtomatik yo'naltirilishni xohlayman.

#### Qabul qilish mezonlari

1. WHEN **Admin** to'g'ri email va parol bilan tizimga kirsa, THE **Tizim** SHALL adminni `/teacher` (admin paneli) sahifasiga yo'naltirishini ta'minlashi kerak.
2. WHEN **Teacher** to'g'ri email va parol bilan tizimga kirsa, THE **Tizim** SHALL teacherni `/teacher` sahifasiga yo'naltirishini ta'minlashi kerak.
3. WHEN **Student** to'g'ri email va parol bilan tizimga kirsa, THE **Tizim** SHALL studentni `/student` sahifasiga yo'naltirishini ta'minlashi kerak.
4. IF noto'g'ri email yoki parol kiritilsa, THEN THE **Tizim** SHALL "Email yoki parol noto'g'ri" xato xabarini ko'rsatishi kerak va tizimga kirishga ruxsat bermasligi kerak.
5. WHILE foydalanuvchi tizimga kirmagan bo'lsa, THE **ProtectedRoute** SHALL himoyalangan sahifalarga kirishni bloklashi va foydalanuvchini `/login` sahifasiga yo'naltirishini ta'minlashi kerak.
6. WHILE **Student** tizimga kirgan bo'lsa, THE **ProtectedRoute** SHALL studentning `/teacher` sahifasiga kirishini bloklashi kerak.
7. WHILE **Teacher** tizimga kirgan bo'lsa, THE **ProtectedRoute** SHALL teacherning `/student` sahifasiga kirishini bloklashi kerak.

---

### Talab 5: Admin Panelida Foydalanuvchilarni Boshqarish

**Foydalanuvchi hikoyasi:** Admin sifatida men barcha teacher va studentlar ro'yxatini ko'rishni va kerak bo'lganda ularni o'chirishni xohlayman.

#### Qabul qilish mezonlari

1. WHEN **Admin** foydalanuvchilar boshqaruv sahifasiga kirsa, THE **AdminPanel** SHALL `localStorage`-dagi barcha teacher va student hisoblarini ro'yxat ko'rinishida ko'rsatishi kerak.
2. THE **AdminPanel** SHALL har bir foydalanuvchi uchun ism, email va rolni ko'rsatishi kerak.
3. WHEN **Admin** biror foydalanuvchini o'chirish tugmasini bossa, THE **AdminPanel** SHALL tasdiqlash so'rovini ko'rsatishi kerak.
4. WHEN **Admin** o'chirishni tasdiqlasa, THE **AdminPanel** SHALL foydalanuvchini `localStorage`-dan o'chirib, ro'yxatni yangilashi kerak.
5. THE **AdminPanel** SHALL admin hisobini o'chirish imkoniyatini ko'rsatmasligi kerak.
6. WHERE foydalanuvchilar ro'yxati bo'sh bo'lsa, THE **AdminPanel** SHALL "Hozircha foydalanuvchilar yo'q" xabarini ko'rsatishi kerak.

---

### Talab 6: Sessiyani Saqlash va Tizimdan Chiqish

**Foydalanuvchi hikoyasi:** Foydalanuvchi sifatida men brauzer sahifasini yangilaganimda ham tizimda qolishni xohlayman va xohlagan vaqtda tizimdan chiqishni xohlayman.

#### Qabul qilish mezonlari

1. WHEN foydalanuvchi muvaffaqiyatli tizimga kirsa, THE **AuthContext** SHALL joriy foydalanuvchi ma'lumotlarini `localStorage`-ning `currentUser` kalitiga saqlashi kerak.
2. WHEN brauzer sahifasi yangilansa, THE **AuthContext** SHALL `localStorage`-dan `currentUser` ma'lumotlarini o'qib, sessiyani tiklashi kerak.
3. WHEN foydalanuvchi "Chiqish" tugmasini bossa, THE **AuthContext** SHALL `localStorage`-dan `currentUser` ma'lumotlarini o'chirib, foydalanuvchini `/login` sahifasiga yo'naltirishini ta'minlashi kerak.
4. IF `localStorage`-dagi `currentUser` ma'lumotlari buzilgan (invalid JSON) bo'lsa, THEN THE **AuthContext** SHALL xatoni ushlab, foydalanuvchini tizimdan chiqarib, `/login` sahifasiga yo'naltirishini ta'minlashi kerak.
