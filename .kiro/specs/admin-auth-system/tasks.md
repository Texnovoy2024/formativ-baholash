# Implementatsiya Rejasi: Admin Roli va Markazlashgan Autentifikatsiya Tizimi

## Umumiy Ko'rinish

Mavjud React + Vite loyihasiga admin roli va markazlashgan autentifikatsiya tizimini qo'shish. `AuthContext` qayta yoziladi, `AdminPanel` yangi sahifa sifatida yaratiladi, `/register` marshruti bloklanadi va rol asosida yo'naltirish sozlanadi.

## Vazifalar

- [x] 1. Test muhitini sozlash va `AuthContext`ni qayta yozish
  - `vitest` va `fast-check` kutubxonalarini o'rnatish
  - `vite.config.js`ga test konfiguratsiyasini qo'shish
  - `AuthContext.jsx`ni to'liq qayta yozish: `ADMIN_USER` konstantasi, `login`, `logout`, `addUser`, `deleteUser`, `getUsers`, `register` (bloklangan) funksiyalari
  - `addTeacher` o'rniga `addUser(userData)` — `role` parametrini qabul qiladi
  - Admin `localStorage.users`ga yozilmasligi ta'minlanadi
  - Sessiya tiklanishi: `localStorage.currentUser` dan `try/catch` bilan o'qish
  - _Talablar: 1.1, 1.2, 1.3, 1.5, 2.1, 2.2, 2.3, 2.5, 3.3, 6.1, 6.2, 6.3, 6.4_

  - [x]* 1.1 Xossa 2 uchun property test yozish: Admin localStorage-ga hech qachon yozilmaydi
    - **Xossa 2: Admin never in localStorage**
    - **Validates: Talablar 1.2, 1.3, 1.5**

  - [x]* 1.2 Xossa 11 uchun property test yozish: Register funksiyasi bloklangan
    - **Xossa 11: Register function blocked**
    - **Validates: Talab 3.3**

  - [x]* 1.3 Xossa 1 uchun property test yozish: Login sessiya round-trip
    - **Xossa 1: Login session round-trip**
    - **Validates: Talablar 6.1, 6.2**

  - [x]* 1.4 Xossa 5 uchun property test yozish: Noto'g'ri login bloklash
    - **Xossa 5: Invalid login blocked**
    - **Validates: Talab 4.4**

  - [x]* 1.5 Xossa 4 uchun property test yozish: Muvaffaqiyatli login rol qaytaradi
    - **Xossa 4: Successful login returns correct role**
    - **Validates: Talablar 4.2, 4.3**

  - [x]* 1.6 Xossa 8 uchun property test yozish: Logout round-trip
    - **Xossa 8: Logout round-trip**
    - **Validates: Talab 6.3**

- [x] 2. Checkpoint — Barcha testlar o'tishini tekshiring, savollar bo'lsa so'rang.

- [x] 3. `addUser` va `deleteUser` funksiyalarini sinash
  - `addUser` — teacher va student qo'shish, email unikalligi, parol uzunligi tekshiruvi
  - `deleteUser` — mavjud foydalanuvchini o'chirish, admin o'chirilmasligi
  - `getUsers` — faqat teacher va studentlarni qaytaradi
  - _Talablar: 2.1, 2.2, 2.3, 2.4, 2.5, 5.1, 5.4, 5.5_

  - [x]* 3.1 Xossa 3 uchun property test yozish: Email unikalligi
    - **Xossa 3: Email uniqueness**
    - **Validates: Talab 2.3**

  - [x]* 3.2 Xossa 7 uchun property test yozish: Parol uzunligi validatsiyasi
    - **Xossa 7: Password length validation**
    - **Validates: Talab 2.5**

  - [x]* 3.3 Xossa 10 uchun property test yozish: Foydalanuvchi qo'shish round-trip
    - **Xossa 10: Add user round-trip**
    - **Validates: Talablar 2.1, 2.2**

  - [x]* 3.4 Xossa 6 uchun property test yozish: Foydalanuvchi o'chirish round-trip
    - **Xossa 6: Delete round-trip**
    - **Validates: Talab 5.4**

- [x] 4. Checkpoint — Barcha testlar o'tishini tekshiring, savollar bo'lsa so'rang.

- [x] 5. `AdminPanel` sahifasini yaratish
  - `src/pages/admin/AdminPanel.jsx` va `AdminPanel.css` fayllarini yaratish
  - Mavjud `AddTeacherPage.jsx` uslubida (ko'k tugmalar, avatar, qizil o'chirish) quriladi
  - Rol tanlash tab-lari: "O'qituvchi" | "O'quvchi"
  - Foydalanuvchi qo'shish formasi: ism, email, parol (ko'rsatish/yashirish)
  - Foydalanuvchilar ro'yxati: avatar, ism, email, rol, o'chirish tugmasi
  - Muvaffaqiyat modali va tasdiqlash modali
  - Bo'sh ro'yxat holati: "Hozircha foydalanuvchilar yo'q"
  - `AuthContext`dan `addUser`, `deleteUser`, `getUsers` ishlatiladi
  - _Talablar: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 6. `App.jsx` marshrutlarini yangilash
  - `/register` marshrutini `<Navigate to="/login" replace />` ga o'zgartirish
  - `/teacher/add-teacher` marshrutini `/teacher/admin` ga o'zgartirish
  - `AdminPanel` komponentini import qilish va yangi marshrut qo'shish
  - _Talablar: 3.1, 3.4, 4.1, 4.2, 4.3_

  - [x]* 6.1 Xossa 9 uchun property test yozish: ProtectedRoute rol asosida bloklash
    - **Xossa 9: ProtectedRoute role-based blocking**
    - **Validates: Talablar 4.5, 4.6, 4.7**

- [x] 7. `TeacherLayout.jsx` va `Login.jsx` ni yangilash
  - `TeacherLayout.jsx`: sidebar havolasini `/teacher/add-teacher` → `/teacher/admin` ga o'zgartirish, matnni "Foydalanuvchilar boshqaruvi" ga o'zgartirish
  - `Login.jsx`: "Hisobingiz yo'qmi? Ro'yxatdan o'ting" havolasini olib tashlash
  - `TeacherLayout.jsx`da `logout` funksiyasini `AuthContext`dan olish (to'g'ridan-to'g'ri `localStorage.removeItem` o'rniga)
  - _Talablar: 3.2, 4.1, 6.3_

- [x] 8. Checkpoint — Barcha testlar o'tishini tekshiring, savollar bo'lsa so'rang.

## Eslatmalar

- `*` bilan belgilangan sub-vazifalar ixtiyoriy — tezroq MVP uchun o'tkazib yuborish mumkin
- Har bir vazifa aniq talablarga havola qiladi (kuzatish uchun)
- Checkpointlar bosqichma-bosqich tekshirishni ta'minlaydi
- Property testlar universal to'g'rilik xossalarini tekshiradi
- Birlik testlar aniq misollar va chegaraviy holatlarni tekshiradi
- Barcha testlar `vitest` + `fast-check` bilan yoziladi (kamida 100 iteratsiya)
