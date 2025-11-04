<<<<<<< HEAD
# BUILDINGCOMPANY
=======
# موقع شركة بناء — نموذج جاهز

هذا المشروع هو موقع ثابت (HTML/CSS/JS) مصمم باللغة العربية وباتجاه RTL ليشبه موقع شركة بناء احترافية.

المحتوى:
- `index.html` — الصفحة الرئيسية مع أقسام: رأس، بطل، من نحن، القيم، المشاريع، الإحصائيات، الشركاء، وتذييل.
- `styles.css` — أنماط الموقع مع دعم متجاوب (responsive) وألوان رمادي/أسود/أحمر.
- `script.js` — تفعيل القوائم على الأجهزة الصغيرة وأنيميشن بسيط عند التمرير.

كيفية التشغيل محليًا:
1. افتح المجلد `c:\Users\Mustaphox\Desktop\sa3oudi`.
2. افتح `index.html` في المتصفح مباشرة مرتين-نقر، أو استخدم ملحق Live Server في VS Code للحصول على إعادة تحميل تلقائي.

ملاحظات وتعديلات مقترحة:
- استبدل صورة الخلفية في قسم الـ Hero بصور الشركة الأصلية أو بانورامية مستقبلية عالية الجودة.
- استبدل شعارات الشركاء بصور PNG/SVG حقيقية داخل مجلد `assets/` وقم بتحديث HTML.
- أضف روابط فعلية لحسابات الشبكات الاجتماعية في الـ footer.

خطوط وأصول:
- تم استخدام خط "Tajawal" من Google Fonts. يمكنك تغيير الخط إلى "Cairo" أو أي خط عربي آخر حسب الرغبة.

---

## Backend (news + job applications)

I added a simple Node.js backend (`server.js`) to store news and receive job applications (with CV upload). It uses SQLite and saves uploaded CVs under `uploads/`.

Quick setup:

1. Copy `.env.example` to `.env` and set SMTP values and `RECEIVER_EMAIL`.
2. Run `npm install` and then `npm start`.

The admin dashboard at `admin/dashboard.html` now attempts to POST news to `/api/news` and fetch them. The careers page posts applications to `/api/apply` and uploads the CV; the server will save it and (if SMTP configured) send it to `RECEIVER_EMAIL`.

If you want, I can further secure the admin endpoints (authentication) and add pagination, filtering, or an admin UI to view applications.

Database schema:
- A plain SQL schema is provided at `data/schema.sql`. You can initialize the database manually with the sqlite3 CLI:

```powershell
sqlite3 data\sa3oudi.db < data\schema.sql
```

Or let the server create the database automatically: when the server starts and the DB file does not exist it will run `data/schema.sql` to initialize the schema.


تم الإنشاء: موقع نموذجي متوافق مع طلبك الأساسي (RTL، خط عربي، أنيميشن خفيف، وعدد الأقسام المطلوبة).
>>>>>>> 2ef0ec0 (Initial commit - رفع الملفات للمستودع)
