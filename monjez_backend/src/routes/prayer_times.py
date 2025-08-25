from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import requests
import json

prayer_bp = Blueprint('prayer', __name__)

# بيانات أوقات الصلاة الثابتة للرياض (يمكن تحسينها بـ API خارجي)
RIYADH_PRAYER_TIMES = {
    "2025-08-25": {
        "fajr": "04:15",
        "dhuhr": "12:05",
        "asr": "15:30",
        "maghrib": "18:45",
        "isha": "20:15"
    },
    "2025-08-26": {
        "fajr": "04:16",
        "dhuhr": "12:05",
        "asr": "15:29",
        "maghrib": "18:44",
        "isha": "20:14"
    },
    "2025-08-27": {
        "fajr": "04:17",
        "dhuhr": "12:04",
        "asr": "15:29",
        "maghrib": "18:43",
        "isha": "20:13"
    }
}

@prayer_bp.route('/prayer-times', methods=['GET'])
def get_prayer_times():
    """الحصول على أوقات الصلاة"""
    try:
        date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
        city = request.args.get('city', 'riyadh')
        
        # التحقق من صحة التاريخ
        try:
            datetime.strptime(date, '%Y-%m-%d')
        except ValueError:
            return jsonify({'error': 'تنسيق التاريخ غير صحيح. استخدم YYYY-MM-DD'}), 400
        
        # الحصول على أوقات الصلاة من البيانات المحلية
        prayer_times = RIYADH_PRAYER_TIMES.get(date)
        
        if not prayer_times:
            # إنشاء أوقات افتراضية إذا لم تكن متوفرة
            prayer_times = {
                "fajr": "04:15",
                "dhuhr": "12:05",
                "asr": "15:30",
                "maghrib": "18:45",
                "isha": "20:15"
            }
        
        # إضافة معلومات إضافية
        current_time = datetime.now().time()
        next_prayer = None
        time_to_next = None
        
        # تحديد الصلاة القادمة
        prayer_order = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']
        for prayer in prayer_order:
            prayer_time = datetime.strptime(prayer_times[prayer], '%H:%M').time()
            if current_time < prayer_time:
                next_prayer = prayer
                # حساب الوقت المتبقي
                now = datetime.combine(datetime.now().date(), current_time)
                next_prayer_dt = datetime.combine(datetime.now().date(), prayer_time)
                time_to_next = str(next_prayer_dt - now)
                break
        
        # إذا لم نجد صلاة قادمة اليوم، فالصلاة القادمة هي فجر الغد
        if not next_prayer:
            next_prayer = 'fajr'
            tomorrow = datetime.now().date() + timedelta(days=1)
            fajr_time = datetime.strptime(prayer_times['fajr'], '%H:%M').time()
            next_prayer_dt = datetime.combine(tomorrow, fajr_time)
            now = datetime.now()
            time_to_next = str(next_prayer_dt - now)
        
        # ترجمة أسماء الصلوات
        prayer_names = {
            'fajr': 'الفجر',
            'dhuhr': 'الظهر',
            'asr': 'العصر',
            'maghrib': 'المغرب',
            'isha': 'العشاء'
        }
        
        # تحويل الأوقات لتشمل الأسماء العربية
        arabic_prayer_times = {}
        for prayer, time in prayer_times.items():
            arabic_prayer_times[prayer] = {
                'time': time,
                'name': prayer_names[prayer]
            }
        
        return jsonify({
            'date': date,
            'city': city,
            'prayer_times': arabic_prayer_times,
            'next_prayer': {
                'name': prayer_names.get(next_prayer, next_prayer),
                'key': next_prayer,
                'time': prayer_times.get(next_prayer),
                'time_remaining': time_to_next
            },
            'hijri_date': get_hijri_date(date)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'خطأ في الحصول على أوقات الصلاة: {str(e)}'}), 500

@prayer_bp.route('/prayer-times/week', methods=['GET'])
def get_week_prayer_times():
    """الحصول على أوقات الصلاة لأسبوع كامل"""
    try:
        start_date = request.args.get('start_date', datetime.now().strftime('%Y-%m-%d'))
        city = request.args.get('city', 'riyadh')
        
        # التحقق من صحة التاريخ
        try:
            start_dt = datetime.strptime(start_date, '%Y-%m-%d')
        except ValueError:
            return jsonify({'error': 'تنسيق التاريخ غير صحيح. استخدم YYYY-MM-DD'}), 400
        
        week_prayer_times = {}
        
        for i in range(7):
            current_date = start_dt + timedelta(days=i)
            date_str = current_date.strftime('%Y-%m-%d')
            
            # الحصول على أوقات الصلاة لهذا اليوم
            prayer_times = RIYADH_PRAYER_TIMES.get(date_str, {
                "fajr": "04:15",
                "dhuhr": "12:05",
                "asr": "15:30",
                "maghrib": "18:45",
                "isha": "20:15"
            })
            
            week_prayer_times[date_str] = {
                'date': date_str,
                'day_name': get_arabic_day_name(current_date.weekday()),
                'prayer_times': prayer_times,
                'hijri_date': get_hijri_date(date_str)
            }
        
        return jsonify({
            'start_date': start_date,
            'city': city,
            'week_prayer_times': week_prayer_times
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'خطأ في الحصول على أوقات الصلاة الأسبوعية: {str(e)}'}), 500

@prayer_bp.route('/prayer-times/reminders', methods=['POST'])
def create_prayer_reminders():
    """إنشاء تذكيرات للصلوات"""
    try:
        data = request.get_json()
        
        enabled_prayers = data.get('prayers', ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'])
        reminder_minutes = data.get('reminder_minutes', 10)  # تذكير قبل 10 دقائق
        
        # هنا يمكن حفظ تفضيلات التذكير في قاعدة البيانات
        # وإنشاء مهام تذكير تلقائية
        
        return jsonify({
            'message': 'تم إنشاء تذكيرات الصلاة بنجاح',
            'enabled_prayers': enabled_prayers,
            'reminder_minutes': reminder_minutes,
            'created_at': datetime.utcnow().isoformat()
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'خطأ في إنشاء تذكيرات الصلاة: {str(e)}'}), 500

def get_hijri_date(gregorian_date):
    """تحويل التاريخ الميلادي إلى هجري (مبسط)"""
    try:
        from hijri_converter import Gregorian
        date_parts = gregorian_date.split('-')
        year, month, day = int(date_parts[0]), int(date_parts[1]), int(date_parts[2])
        hijri = Gregorian(year, month, day).to_hijri()
        return f"{hijri.year}-{hijri.month:02d}-{hijri.day:02d}"
    except:
        return None

def get_arabic_day_name(weekday):
    """الحصول على اسم اليوم بالعربية"""
    days = ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد']
    return days[weekday]

@prayer_bp.route('/islamic-calendar', methods=['GET'])
def get_islamic_calendar():
    """الحصول على معلومات التقويم الإسلامي"""
    try:
        date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
        
        # معلومات إسلامية مهمة
        islamic_info = {
            'hijri_date': get_hijri_date(date),
            'special_days': [],
            'recommended_actions': []
        }
        
        # التحقق من المناسبات الإسلامية المهمة
        current_date = datetime.strptime(date, '%Y-%m-%d')
        
        # يمكن إضافة منطق للتحقق من المناسبات الإسلامية
        # مثل رمضان، الحج، الأعياد، إلخ
        
        # أيام مستحبة للصيام
        if current_date.weekday() in [0, 3]:  # الاثنين والخميس
            islamic_info['recommended_actions'].append('يُستحب الصيام اليوم (الاثنين والخميس)')
        
        # الأيام البيض (13، 14، 15 من كل شهر هجري)
        hijri_date = get_hijri_date(date)
        if hijri_date:
            hijri_day = int(hijri_date.split('-')[2])
            if hijri_day in [13, 14, 15]:
                islamic_info['special_days'].append('الأيام البيض')
                islamic_info['recommended_actions'].append('يُستحب الصيام في الأيام البيض')
        
        return jsonify({
            'date': date,
            'islamic_info': islamic_info
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'خطأ في الحصول على معلومات التقويم الإسلامي: {str(e)}'}), 500

