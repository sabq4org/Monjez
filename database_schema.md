# مشروع مُنجز Monjez - تصميم قاعدة البيانات

## نظرة عامة

تم تصميم قاعدة البيانات لدعم جميع الميزات الأساسية والإبداعية لمشروع "مُنجز"، مع التركيز على الأداء والقابلية للتوسع. تم استخدام PostgreSQL كنظام لإدارة قواعد البيانات.

## الجداول الأساسية

### `users`

| اسم العمود | نوع البيانات | الوصف |
|---|---|---|
| `id` | `UUID` | المعرف الأساسي للمستخدم |
| `name` | `VARCHAR(255)` | اسم المستخدم |
| `email` | `VARCHAR(255)` | البريد الإلكتروني (فريد) |
| `password_hash` | `VARCHAR(255)` | تجزئة كلمة المرور |
| `locale` | `VARCHAR(10)` | اللغة المفضلة (ar, en) |
| `timezone` | `VARCHAR(50)` | المنطقة الزمنية (Asia/Riyadh) |
| `created_at` | `TIMESTAMPTZ` | تاريخ إنشاء الحساب |
| `updated_at` | `TIMESTAMPTZ` | تاريخ آخر تحديث |

### `teams`

| اسم العمود | نوع البيانات | الوصف |
|---|---|---|
| `id` | `UUID` | المعرف الأساسي للفريق |
| `name` | `VARCHAR(255)` | اسم الفريق |
| `created_at` | `TIMESTAMPTZ` | تاريخ إنشاء الفريق |
| `updated_at` | `TIMESTAMPTZ` | تاريخ آخر تحديث |

### `user_teams`

| اسم العمود | نوع البيانات | الوصف |
|---|---|---|
| `user_id` | `UUID` | معرف المستخدم (مفتاح خارجي) |
| `team_id` | `UUID` | معرف الفريق (مفتاح خارجي) |
| `role` | `VARCHAR(50)` | دور المستخدم في الفريق (admin, editor, viewer) |

## جداول المهام

### `projects`

| اسم العمود | نوع البيانات | الوصف |
|---|---|---|
| `id` | `UUID` | المعرف الأساسي للمشروع |
| `team_id` | `UUID` | معرف الفريق (مفتاح خارجي) |
| `name` | `VARCHAR(255)` | اسم المشروع |
| `color` | `VARCHAR(7)` | لون المشروع (HEX) |
| `created_at` | `TIMESTAMPTZ` | تاريخ إنشاء المشروع |
| `updated_at` | `TIMESTAMPTZ` | تاريخ آخر تحديث |

### `labels`

| اسم العمود | نوع البيانات | الوصف |
|---|---|---|
| `id` | `UUID` | المعرف الأساسي للوسم |
| `team_id` | `UUID` | معرف الفريق (مفتاح خارجي) |
| `name` | `VARCHAR(255)` | اسم الوسم |
| `color` | `VARCHAR(7)` | لون الوسم (HEX) |
| `is_primary_color` | `BOOLEAN` | هل هو اللون الأساسي؟ |
| `created_at` | `TIMESTAMPTZ` | تاريخ إنشاء الوسم |
| `updated_at` | `TIMESTAMPTZ` | تاريخ آخر تحديث |

### `tasks`

| اسم العمود | نوع البيانات | الوصف |
|---|---|---|
| `id` | `UUID` | المعرف الأساسي للمهمة |
| `team_id` | `UUID` | معرف الفريق (مفتاح خارجي) |
| `project_id` | `UUID` | معرف المشروع (مفتاح خارجي) |
| `title` | `VARCHAR(255)` | عنوان المهمة |
| `description` | `TEXT` | وصف المهمة |
| `status` | `VARCHAR(50)` | حالة المهمة (todo, in_progress, done, archived) |
| `priority` | `VARCHAR(50)` | أولوية المهمة (low, med, high, urgent) |
| `owner_id` | `UUID` | معرف المالك (مفتاح خارجي) |
| `start_at` | `TIMESTAMPTZ` | تاريخ بدء المهمة |
| `due_at` | `TIMESTAMPTZ` | تاريخ استحقاق المهمة |
| `all_day` | `BOOLEAN` | هل المهمة طوال اليوم؟ |
| `calendar_type` | `VARCHAR(50)` | نوع التقويم (gregorian, hijri, auto) |
| `recurrence_rule` | `TEXT` | قاعدة التكرار (iCal RRULE) |
| `parent_task_id` | `UUID` | معرف المهمة الأصل (للمهام الفرعية) |
| `created_by` | `UUID` | معرف المنشئ (مفتاح خارجي) |
| `created_at` | `TIMESTAMPTZ` | تاريخ إنشاء المهمة |
| `updated_at` | `TIMESTAMPTZ` | تاريخ آخر تحديث |
| `completed_at` | `TIMESTAMPTZ` | تاريخ إكمال المهمة |

### `task_labels`

| اسم العمود | نوع البيانات | الوصف |
|---|---|---|
| `task_id` | `UUID` | معرف المهمة (مفتاح خارجي) |
| `label_id` | `UUID` | معرف الوسم (مفتاح خارجي) |

### `task_checklist`

| اسم العمود | نوع البيانات | الوصف |
|---|---|---|
| `id` | `UUID` | المعرف الأساسي |
| `task_id` | `UUID` | معرف المهمة (مفتاح خارجي) |
| `title` | `VARCHAR(255)` | عنوان العنصر |
| `is_done` | `BOOLEAN` | هل تم الإنجاز؟ |

### `task_comments`

| اسم العمود | نوع البيانات | الوصف |
|---|---|---|
| `id` | `UUID` | المعرف الأساسي |
| `task_id` | `UUID` | معرف المهمة (مفتاح خارجي) |
| `author_id` | `UUID` | معرف المؤلف (مفتاح خارجي) |
| `body` | `TEXT` | نص التعليق |
| `created_at` | `TIMESTAMPTZ` | تاريخ إنشاء التعليق |

### `task_attachments`

| اسم العمود | نوع البيانات | الوصف |
|---|---|---|
| `id` | `UUID` | المعرف الأساسي |
| `task_id` | `UUID` | معرف المهمة (مفتاح خارجي) |
| `name` | `VARCHAR(255)` | اسم المرفق |
| `url` | `VARCHAR(2048)` | رابط المرفق |
| `mime` | `VARCHAR(100)` | نوع المرفق |
| `size` | `INTEGER` | حجم المرفق (بايت) |

## جداول التذكيرات والآراء

### `reminders`

| اسم العمود | نوع البيانات | الوصف |
|---|---|---|
| `id` | `UUID` | المعرف الأساسي |
| `task_id` | `UUID` | معرف المهمة (مفتاح خارجي) |
| `user_id` | `UUID` | معرف المستخدم (مفتاح خارجي) |
| `remind_at` | `TIMESTAMPTZ` | وقت التذكير |
| `channel` | `VARCHAR(50)` | قناة التذكير (inapp, email, push) |

### `saved_views`

| اسم العمود | نوع البيانات | الوصف |
|---|---|---|
| `id` | `UUID` | المعرف الأساسي |
| `user_id` | `UUID` | معرف المستخدم (مفتاح خارجي) |
| `team_id` | `UUID` | معرف الفريق (مفتاح خارجي) |
| `name` | `VARCHAR(255)` | اسم العرض المحفوظ |
| `filters` | `JSONB` | فلاتر العرض |
| `sort` | `JSONB` | ترتيب العرض |
| `calendar_view` | `VARCHAR(50)` | نوع عرض التقويم (year, month, week, day) |
| `overlays` | `JSONB` | تراكبات العرض |

## جداول تراكب التقويم

### `sa_holidays`

| اسم العمود | نوع البيانات | الوصف |
|---|---|---|
| `id` | `INTEGER` | المعرف الأساسي |
| `date_gregorian` | `DATE` | التاريخ الميلادي |
| `date_hijri` | `VARCHAR(10)` | التاريخ الهجري |
| `name_ar` | `VARCHAR(255)` | اسم العيد (عربي) |
| `name_en` | `VARCHAR(255)` | اسم العيد (إنجليزي) |
| `scope` | `VARCHAR(50)` | النطاق (national, religious) |

### `world_days`

| اسم العمود | نوع البيانات | الوصف |
|---|---|---|
| `id` | `INTEGER` | المعرف الأساسي |
| `date_gregorian` | `DATE` | التاريخ الميلادي |
| `name_ar` | `VARCHAR(255)` | اسم اليوم (عربي) |
| `name_en` | `VARCHAR(255)` | اسم اليوم (إنجليزي) |
| `category` | `VARCHAR(50)` | الفئة (health, media, education, ...) |
| `region` | `VARCHAR(50)` | المنطقة (global, mena) |
| `official_source` | `TEXT` | المصدر الرسمي |

## جداول الميزات الإبداعية

### `ai_suggestions`

| اسم العمود | نوع البيانات | الوصف |
|---|---|---|
| `id` | `UUID` | المعرف الأساسي |
| `user_id` | `UUID` | معرف المستخدم (مفتاح خارجي) |
| `suggestion_type` | `VARCHAR(50)` | نوع الاقتراح (task_timing, subtask, etc.) |
| `suggestion_data` | `JSONB` | بيانات الاقتراح |
| `created_at` | `TIMESTAMPTZ` | تاريخ إنشاء الاقتراح |

### `prayer_times`

| اسم العمود | نوع البيانات | الوصف |
|---|---|---|
| `id` | `INTEGER` | المعرف الأساسي |
| `date` | `DATE` | التاريخ |
| `city` | `VARCHAR(100)` | المدينة |
| `fajr` | `TIME` | الفجر |
| `dhuhr` | `TIME` | الظهر |
| `asr` | `TIME` | العصر |
| `maghrib` | `TIME` | المغرب |
| `isha` | `TIME` | العشاء |


