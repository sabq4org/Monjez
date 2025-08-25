# مُنجِز (Monjez)

منصة مهام وتقويم ذكيّة بواجهة عصرية تدعم العربية، مع تكامل أوقات الصلاة والذكاء الاصطناعي.

- المستودع: [sabq4org/Monjez](https://github.com/sabq4org/Monjez)
- الواجهة: React + Vite + Tailwind
- الخادم الخلفي: Flask + SQLAlchemy + JWT
- قاعدة البيانات: SQLite محليًا، ودعم Postgres/Supabase للإنتاج

## المزايا
- إدارة مهام ومشاريع وتسميات
- تقويم مرن (شهر / أسبوع / يوم) مع ألوان فاتحة ووضع ليلي مضبوط
- ويدجت أوقات الصلاة
- مساعد ذكي (OpenAI) للاقتراحات وتحليل النصوص إلى مهام

## هيكلة المجلدات
```text
Monjez/
├─ monjez_backend/                 # خادم Flask
│  ├─ requirements.txt
│  └─ src/
│     ├─ main.py                   # نقطة تشغيل الخادم
│     ├─ models/                   # النماذج وقاعدة البيانات
│     └─ routes/                   # المسارات (auth, tasks, ai, prayer_times, ...)
│
└─ monjez_frontend/                # الواجهة الأمامية (Vite)
   ├─ package.json
   └─ src/
      ├─ App.jsx                   # التطبيق الرئيسي + التقويم
      └─ components/               # المكونات (Card / Dialog / ...)
```

## المتطلبات
- Node.js 18+
- pnpm (يفضل عبر corepack)
- Python 3.9+

## التشغيل محليًا
### 1) الواجهة (Vite)
```bash
cd monjez_frontend
corepack enable && corepack prepare pnpm@10.4.1 --activate  # أول مرة فقط
pnpm install
pnpm run dev -- --host
```
ستعمل على: http://localhost:5173

أضف ملف بيئة `monjez_frontend/.env`:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
# اختياري: لو لديك خادم خارجي
# VITE_API_BASE=https://your-backend-domain.com
```

### 2) الخادم الخلفي (Flask)
```bash
cd monjez_backend
python3 -m venv env
source env/bin/activate
pip install -r requirements.txt
python src/main.py
```
سيتوفر على: http://127.0.0.1:5001

أضف ملف بيئة `monjez_backend/.env`:
```env
# يستخدم SQLite محليًا إن لم تُحدِّد DATABASE_URL
DATABASE_URL=postgresql://USER:PASS@HOST:5432/DBNAME
JWT_SECRET_KEY=replace-me
SECRET_KEY=replace-me
# اختياري لتفعيل الذكاء الاصطناعي
# OPENAI_API_KEY=sk-...
```
ملاحظة: في حالة Supabase تتم إضافة `sslmode=require` تلقائيًا إن لم يكن موجودًا.

## أهم مسارات الـ API
- المصادقة (`/api/auth`): POST `/register`، POST `/login`، GET `/me`
- المهام (`/api`): GET `/tasks`، POST `/tasks`، GET/PATCH/DELETE `/tasks/<task_id>`، POST `/tasks/<task_id>/complete`
- الذكاء الاصطناعي (`/api/ai`): POST `/ai/suggestions`، `/ai/parse-text`، `/ai/smart-schedule`
- أوقات الصلاة (`/api`): GET `/prayer-times`، `/prayer-times/week`، `/islamic-calendar`

## أوامر مفيدة
- تشغيل الواجهة: `pnpm run dev`
- تشغيل الخادم: `python src/main.py`
- تثبيت باكإند: `pip install -r requirements.txt`

## النشر
### الواجهة على Vercel
أضف في Project Settings → Environment Variables:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
# (اختياري) إن لديك خادم منفصل
# VITE_API_BASE=https://your-backend-domain.com
```

### الخادم الخلفي
اختر استضافة Python (Render / Railway / Fly.io أو خادم خاص) وأضف:
- `DATABASE_URL`
- `JWT_SECRET_KEY`
- `SECRET_KEY`
- `OPENAI_API_KEY` (اختياري)

## المساهمة
- أنشئ فرعًا من `master`، ثم افتح Pull Request مع وصف موجز للتغييرات.

## ملاحظات
- لا ترفع ملفات `.env` أو قواعد بيانات محلية.
- تم ضبط الوضع الليلي/النهاري، الحواف الحادة، وحدود العناصر بشكل متناسق.
