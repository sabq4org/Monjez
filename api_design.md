# مشروع مُنجز Monjez - تصميم واجهة برمجة التطبيقات (API)

## نظرة عامة

تم تصميم واجهة برمجة التطبيقات (API) لتكون RESTful، مما يسهل على الواجهة الأمامية التفاعل مع الواجهة الخلفية. سيتم استخدام JWT للمصادقة.

## المصادقة

- `POST /api/auth/register`: تسجيل مستخدم جديد.
- `POST /api/auth/login`: تسجيل الدخول والحصول على JWT.
- `POST /api/auth/logout`: تسجيل الخروج.
- `GET /api/auth/me`: الحصول على معلومات المستخدم الحالي.

## المهام (Tasks)

- `POST /api/tasks`: إنشاء مهمة جديدة.
- `GET /api/tasks`: الحصول على قائمة بالمهام مع فلاتر (view, from, to, filters).
- `GET /api/tasks/{id}`: الحصول على تفاصيل مهمة محددة.
- `PATCH /api/tasks/{id}`: تحديث مهمة محددة.
- `DELETE /api/tasks/{id}`: حذف مهمة محددة.
- `POST /api/tasks/{id}/complete`: إكمال مهمة.
- `POST /api/tasks/{id}/comments`: إضافة تعليق على مهمة.

## المشاريع (Projects)

- `GET /api/projects`: الحصول على قائمة بالمشاريع.
- `POST /api/projects`: إنشاء مشروع جديد.
- `GET /api/projects/{id}`: الحصول على تفاصيل مشروع محدد.
- `PATCH /api/projects/{id}`: تحديث مشروع محدد.
- `DELETE /api/projects/{id}`: حذف مشروع محدد.

## الوسوم (Labels)

- `GET /api/labels`: الحصول على قائمة بالوسوم.
- `POST /api/labels`: إنشاء وسم جديد.
- `GET /api/labels/{id}`: الحصول على تفاصيل وسم محدد.
- `PATCH /api/labels/{id}`: تحديث وسم محدد.
- `DELETE /api/labels/{id}`: حذف وسم محدد.

## التقويم (Calendar)

- `GET /api/calendar/grid`: الحصول على شبكة التقويم مع المهام (view, cal, from, overlays).

## التراكبات (Overlays)

- `GET /api/overlays/sa-holidays`: الحصول على الأعياد السعودية (year).
- `GET /api/overlays/world-days`: الحصول على الأيام العالمية (month, category).

## العروض المحفوظة (Saved Views)

- `GET /api/views`: الحصول على قائمة بالعروض المحفوظة.
- `POST /api/views`: إنشاء عرض محفوظ جديد.
- `GET /api/views/{id}`: الحصول على تفاصيل عرض محفوظ محدد.
- `PATCH /api/views/{id}`: تحديث عرض محفوظ محدد.
- `DELETE /api/views/{id}`: حذف عرض محفوظ محدد.

## الذكاء الاصطناعي (AI)

- `POST /api/ai/suggestions`: الحصول على اقتراحات ذكية (مهام، أوقات، إلخ).
- `POST /api/ai/parse-text`: تحليل نص واستخراج المهام.

## أوقات الصلاة (Prayer Times)

- `GET /api/prayer-times`: الحصول على أوقات الصلاة لمدينة وتاريخ محددين.


