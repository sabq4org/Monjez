from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.task import Task
from hijri_converter import Hijri, Gregorian
from datetime import datetime, timedelta
import calendar

calendar_bp = Blueprint('calendar', __name__)

@calendar_bp.route('/calendar/grid', methods=['GET'])
@jwt_required()
def get_calendar_grid():
    try:
        user_id = get_jwt_identity()
        
        # الحصول على المعاملات
        view = request.args.get('view', 'month')  # year, month, week, day
        cal_type = request.args.get('cal', 'gregorian')  # gregorian, hijri
        from_date = request.args.get('from')
        overlays = request.args.get('overlays', '').split(',')
        
        if not from_date:
            from_date = datetime.now().strftime('%Y-%m-%d')
        
        # تحويل التاريخ
        base_date = datetime.strptime(from_date, '%Y-%m-%d')
        
        # تحديد نطاق التواريخ حسب نوع العرض
        if view == 'month':
            start_date = base_date.replace(day=1)
            # آخر يوم في الشهر
            last_day = calendar.monthrange(base_date.year, base_date.month)[1]
            end_date = base_date.replace(day=last_day)
        elif view == 'week':
            # بداية الأسبوع (الأحد)
            days_since_sunday = (base_date.weekday() + 1) % 7
            start_date = base_date - timedelta(days=days_since_sunday)
            end_date = start_date + timedelta(days=6)
        elif view == 'day':
            start_date = base_date
            end_date = base_date
        else:  # year
            start_date = base_date.replace(month=1, day=1)
            end_date = base_date.replace(month=12, day=31)
        
        # الحصول على المهام في النطاق المحدد
        tasks = Task.query.filter(
            Task.owner_id == user_id,
            Task.due_at >= start_date,
            Task.due_at <= end_date + timedelta(days=1)
        ).all()
        
        # تجميع المهام حسب التاريخ
        tasks_by_date = {}
        for task in tasks:
            if task.due_at:
                date_key = task.due_at.strftime('%Y-%m-%d')
                if date_key not in tasks_by_date:
                    tasks_by_date[date_key] = []
                tasks_by_date[date_key].append(task.to_dict())
        
        # إنشاء شبكة التقويم
        grid = []
        current_date = start_date
        
        while current_date <= end_date:
            date_key = current_date.strftime('%Y-%m-%d')
            
            # تحويل للهجري إذا كان مطلوباً
            hijri_date = None
            if cal_type == 'hijri':
                try:
                    hijri = Gregorian(current_date.year, current_date.month, current_date.day).to_hijri()
                    hijri_date = f"{hijri.year}-{hijri.month:02d}-{hijri.day:02d}"
                except:
                    hijri_date = None
            
            day_data = {
                'date': date_key,
                'hijri_date': hijri_date,
                'day_name': current_date.strftime('%A'),
                'day_number': current_date.day,
                'is_today': current_date.date() == datetime.now().date(),
                'tasks': tasks_by_date.get(date_key, []),
                'task_count': len(tasks_by_date.get(date_key, [])),
                'overlays': []
            }
            
            # إضافة التراكبات (الأعياد والأيام العالمية)
            if 'sa_holidays' in overlays:
                # يمكن إضافة منطق الأعياد السعودية هنا
                pass
            
            if 'world_days' in overlays:
                # يمكن إضافة منطق الأيام العالمية هنا
                pass
            
            grid.append(day_data)
            current_date += timedelta(days=1)
        
        return jsonify({
            'view': view,
            'calendar_type': cal_type,
            'from_date': from_date,
            'grid': grid,
            'total_tasks': len(tasks)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@calendar_bp.route('/calendar/convert', methods=['POST'])
def convert_date():
    """تحويل التاريخ بين الهجري والميلادي"""
    try:
        data = request.get_json()
        date_str = data.get('date')
        from_type = data.get('from', 'gregorian')  # gregorian, hijri
        to_type = data.get('to', 'hijri')  # gregorian, hijri
        
        if not date_str:
            return jsonify({'error': 'التاريخ مطلوب'}), 400
        
        if from_type == 'gregorian' and to_type == 'hijri':
            # تحويل من ميلادي إلى هجري
            date_parts = date_str.split('-')
            year, month, day = int(date_parts[0]), int(date_parts[1]), int(date_parts[2])
            hijri = Gregorian(year, month, day).to_hijri()
            converted_date = f"{hijri.year}-{hijri.month:02d}-{hijri.day:02d}"
        elif from_type == 'hijri' and to_type == 'gregorian':
            # تحويل من هجري إلى ميلادي
            date_parts = date_str.split('-')
            year, month, day = int(date_parts[0]), int(date_parts[1]), int(date_parts[2])
            gregorian = Hijri(year, month, day).to_gregorian()
            converted_date = f"{gregorian.year}-{gregorian.month:02d}-{gregorian.day:02d}"
        else:
            converted_date = date_str  # نفس التاريخ إذا كان النوع متشابه
        
        return jsonify({
            'original_date': date_str,
            'converted_date': converted_date,
            'from_type': from_type,
            'to_type': to_type
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

