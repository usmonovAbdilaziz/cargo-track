# CargoTrack

Loyihada backend yo‘q. Uchta sahifa o‘z ma’lumotini `data/` papkasidagi JSON fayllardan oladi:

| Sahifa | Fayl |
| --- | --- |
| Trips — reyslar | `data/trips.json` |
| Counterparties — kontragentlar | `data/counterparties.json` |
| Licenses — litsenziyalar | `data/licenses.json` |


## Ishga tushirish

Node.js `20.19` yoki undan keyingi 20-versiya, yoxud `22.12+` va npm kerak. Loyiha papkasida quyidagi buyruqlarni bajaring:

```bash
npm install
npm run dev
```

Terminalda ko‘rsatilgan lokal manzilni brauzerda oching. Demo tizimga kirish uchun:

- Email: `demo@example.com`
- Parol: `demo123`

Login faqat namoyish uchun: holat brauzerning `localStorage`ida saqlanadi. Haqiqiy autentifikatsiya va ma’lumotlarni himoyalash uchun backend kerak bo‘ladi.

Boshqa buyruqlar:

```bash
npm run lint
npm run build
npm run preview
```

`preview`dan oldin `build` bajarilishi kerak. JSON fayllar build tarkibiga qo‘shiladi, shu sababli `data/`dagi o‘zgarishlarni production versiyada ko‘rish uchun build’ni qayta yaratish kerak.

## Jadvaldan foydalanish

Uchala sahifada bir xil jadval komponenti ishlatilgan:

- **Filters Row** — kerakli maydon bo‘yicha matn, sana yoki ro‘yxat orqali filtrlash. Bir nechta filtr bir vaqtda qo‘llanadi.
- Ustun sarlavhasini bosish — o‘sish yoki kamayish tartibida saralash.
- **Filters Col** — ustunlarni yashirish va qayta ko‘rsatish.
- **Excel** — ko‘rinib turgan ustunlar va filtrga mos yozuvlarni CSV formatida yuklab olish. Natijaga faqat joriy sahifa emas, filtrlangan barcha sahifalar kiradi.
- **Oldingi / Keyingi** — sahifalar bo‘ylab yurish.
- **To‘liq yozuv** — qator ma’lumotlarini modal oynada ko‘rish; oynadagi **Asl JSON** bo‘limidan asl qiymatlarni ochish mumkin.


## Yechim va texnologiyalar

React va TypeScript’ni sahifalar hamda umumiy jadvalni komponentlarga ajratish uchun tanladim. Vite lokal ishga tushirish va production build uchun ishlatiladi. React Router sahifalar o‘rtasida o‘tishni, TanStack Query esa JSON’ni yuklash va loading/error holatlarini boshqaradi. Tailwind CSS interfeysni bezashda, Highcharts esa qo‘shimcha Dashboard sahifasida ishlatilgan.

Jadval logikasi uchun TanStack Table tanlandi. Kutubxona filtrlangan va saralangan qatorlar, sahifalash hamda ustunlar ko‘rinishini boshqaradi. Bu umumiy jadval logikasini uchta sahifada qayta ishlatishga yordam beradi. TanStack Table tayyor dizaynni majburlamaydi, shu sababli interfeysni loyihaga moslashtirish mumkin. Sana va dinamik JSON maydonlariga mos filtrlar alohida sozlangan. CSV eksport esa jadvalning filtrlangan va saralangan natijasidan loyiha kodida tayyorlanadi.

## Ma’lumotlar o‘zgarsa

Uchta JSON’ning tashqi tuzilishi turlicha. Ma’lumotni yuklashda avval fayl uchun ma’lum ro‘yxat yo‘li tekshiriladi. U topilmasa, boshqa joydagi mos ro‘yxat qidiriladi. Yozuvning barcha qatorlaridagi qo‘shimcha maydonlar aniqlanib, jadvalga ustun sifatida qo‘shiladi. Biror qiymat bo‘lmasa, jadvalda `—` ko‘rsatiladi.

Qiyin qarorlardan biri — ro‘yxat boshqa joyga ko‘chganda qaysi massiv asl yozuvlar ekanini aniqlash edi. Hozirgi yechim bitta mos ro‘yxatni avtomatik topishga harakat qiladi; bir nechta noma’lum ro‘yxat topilsa, xato ko‘rsatadi. Bu qidiruv evristikaga asoslangan: boshqa massiv yozuvlarga o‘xshab qolsa, u noto‘g‘ri tanlanishi mumkin. Bunday holatda kerakli ro‘yxat yo‘lini kodda aniqlashtirish talab qilinadi.

Yana bir qaror — muhim maydonlar uchun o‘qishga qulay ustunlarni saqlash va qo‘shimcha maydonlarni avtomatik chiqarish bo‘ldi. Buning evaziga JSON’da maydonlar ko‘paysa jadval kengayadi; kerak bo‘lmagan ustunlarni yashirish yoki gorizontal aylantirish mumkin. `To‘liq yozuv` asl qatorni ko‘rishga yordam beradi.

