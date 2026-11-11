# CargoTrack

Loyiha asosiy maqsadi: logistika ma’lumotlarini ko‘rish, filtrlash, saralash va eksport qilish uchun qulay CRM ko‘rinish yaratish.

## Nima tayyor

- Uchala sahifa uchun jadval interfeysi ishlaydi: Trips, Counterparties va Licenses.
- Ma’lumotlar lokal JSON fayllardan yuklanadi.
- Jadvalda ishlaydigan umumiy komponent tayyor: filterlar, sort, column yashirish/ko‘rsatish, CSV export.
- Sticky header va scrollga moslangan jadval ishlaydi.
- Pagination ishlaydi.
- Loading, empty va error holatlari qo‘shildi.
- Ma’lumotlar qisman yoki noto‘g‘ri formatda kelganda ham xavfsiz ishlaydigan logika qo‘shildi.
- Login/logout holati localStorage orqali saqlanadi, shuning uchun sahifa refresh bo‘lganda ham auth holati saqlanadi.
- App routing va auth guard ishlaydi.

## Ishga tushirish va scriptlar

Proyektni local kompyuterda ishga tushirish uchun quyidagi komandalar ishlatiladi:

```bash
npm install
npm run dev
```

Demo kirish: `demo@example.com`, parol: `demo123`. Login faqat namoyish uchun va brauzerda ishlaydi; u haqiqiy autentifikatsiya yoki ma’lumotlarni himoya qilish vositasi emas. `.env` sozlash talab qilinmaydi.

JSON fayllar `data/` papkasida joylashgan. Jadval yozuvlardagi qo‘shimcha maydonlarni avtomatik ustun sifatida chiqaradi; `To‘liq yozuv` orqali asl yozuvni ko‘rish mumkin. Ro‘yxat boshqa joyga ko‘chsa, yagona mos ro‘yxat aniqlanadi. Bir nechta noma’lum ro‘yxat yoki ro‘yxat topilmasa, xato ko‘rsatiladi va qaysi biri kerakligini aniqlashtirish uchun kodni moslashtirish lozim.

Production build JSON fayllarni o‘z ichiga oladi, shuning uchun `data/` o‘zgartirilgandan keyin `npm run build` ni qayta ishga tushiring. Tekshiruvlarni `npm test` bilan bajarish mumkin.
## Hozir qaysi narsalar qolgan

### 1) Authni haqiqiy tizimga yaqinlashtirish
- Hozir login/logout localStorage bilan ishlayapti, lekin bu hali full backend auth emas.
- Ideal holatda JWT/session yoki server-side auth bo‘lishi kerak.
- Hozirgi holat shunchaki frontend auth state darajasida.

### 3) UX ni ozroq “final” qilish
- Global search qo‘shish mumkin.
- Clear all filters tugmasi qo‘shish mumkin.
- Rows per page tanlovini yaxshilash mumkin.
- Jadvalning responsive va ustun kengliklarini yanada yaxshi qilish mumkin.

### 4) Demo/taqdimot tayyorgarligi
- Asosiy ekranlar uchun screenshot yoki 2–3 daqiqalik video qo‘shish yaxshi bo‘ladi.

## Qisqa xulosa

Aksariyasi tayyor: jadval, filterlar, sort, export, scroll, pagination, error/loading holatlari, auth session, va ma’lumot xavfsizligi.

Qolganlar asosan “production polish” darajasidagi narsalar: real auth, README final, demo tayyorgarlik va qo‘shimcha UX yaxshilanishlar.



