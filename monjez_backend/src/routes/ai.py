from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import db, User
from src.models.task import Task
import openai
import json
from datetime import datetime, timedelta
import re

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/ai/suggestions', methods=['POST'])
@jwt_required()
def get_ai_suggestions():
    """الحصول على اقتراحات ذكية من الذكاء الاصطناعي"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        suggestion_type = data.get('type', 'general')  # general, timing, subtasks, productivity
        context = data.get('context', '')
        
        # الحصول على مهام المستخدم الحالية
        user_tasks = Task.query.filter_by(owner_id=user_id).limit(10).all()
        tasks_context = []
        
        for task in user_tasks:
            tasks_context.append({
                'title': task.title,
                'status': task.status,
                'priority': task.priority,
                'due_date': task.due_at.isoformat() if task.due_at else None
            })
        
        # إنشاء prompt للذكاء الاصطناعي
        if suggestion_type == 'timing':
            prompt = f"""
            أنت مساعد ذكي لإدارة المهام. بناءً على المهام التالية للمستخدم:
            {json.dumps(tasks_context, ensure_ascii=False)}
            
            اقترح أفضل الأوقات لتنفيذ المهام الجديدة مع تجنب التضارب. 
            السياق الإضافي: {context}
            
            أجب بصيغة JSON مع الحقول التالية:
            - suggested_times: قائمة بالأوقات المقترحة
            - reasoning: سبب الاقتراح
            - conflicts: أي تضارب محتمل
            """
        elif suggestion_type == 'subtasks':
            prompt = f"""
            أنت مساعد ذكي لإدارة المهام. المهمة المطلوب تقسيمها:
            {context}
            
            اقترح تقسيم هذه المهمة إلى مهام فرعية أصغر وأكثر قابلية للإدارة.
            
            أجب بصيغة JSON مع الحقول التالية:
            - subtasks: قائمة بالمهام الفرعية
            - estimated_time: الوقت المقدر لكل مهمة فرعية
            - priority_order: ترتيب الأولوية
            """
        elif suggestion_type == 'productivity':
            prompt = f"""
            أنت مساعد ذكي لتحليل الإنتاجية. بناءً على مهام المستخدم:
            {json.dumps(tasks_context, ensure_ascii=False)}
            
            قدم تحليلاً للإنتاجية واقتراحات للتحسين.
            
            أجب بصيغة JSON مع الحقول التالية:
            - productivity_score: نقاط الإنتاجية (1-10)
            - insights: رؤى حول أنماط العمل
            - recommendations: اقتراحات للتحسين
            """
        else:  # general
            prompt = f"""
            أنت مساعد ذكي لإدارة المهام. بناءً على السياق التالي:
            المهام الحالية: {json.dumps(tasks_context, ensure_ascii=False)}
            السياق الإضافي: {context}
            
            قدم اقتراحات عامة لتحسين إدارة المهام والإنتاجية.
            
            أجب بصيغة JSON مع الحقول التالية:
            - suggestions: قائمة بالاقتراحات
            - tips: نصائح سريعة
            - next_actions: الإجراءات المقترحة التالية
            """
        
        # استدعاء OpenAI API
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "أنت مساعد ذكي متخصص في إدارة المهام والإنتاجية. تجيب باللغة العربية وبصيغة JSON صحيحة."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1000,
            temperature=0.7
        )
        
        ai_response = response.choices[0].message.content
        
        # محاولة تحويل الاستجابة إلى JSON
        try:
            suggestions = json.loads(ai_response)
        except json.JSONDecodeError:
            # إذا فشل التحويل، إنشاء استجابة افتراضية
            suggestions = {
                "suggestions": ["تنظيم المهام حسب الأولوية", "تخصيص أوقات محددة للمهام المهمة"],
                "tips": ["استخدم تقنية البومودورو", "خذ فترات راحة منتظمة"],
                "message": "تم إنشاء اقتراحات افتراضية"
            }
        
        return jsonify({
            'type': suggestion_type,
            'suggestions': suggestions,
            'generated_at': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'خطأ في الحصول على الاقتراحات: {str(e)}'}), 500

@ai_bp.route('/ai/parse-text', methods=['POST'])
@jwt_required()
def parse_text_for_tasks():
    """تحليل النص واستخراج المهام منه"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        text = data.get('text', '')
        if not text:
            return jsonify({'error': 'النص مطلوب'}), 400
        
        # استخدام regex بسيط لاستخراج المهام
        # يمكن تحسين هذا باستخدام NLP أكثر تقدماً
        task_patterns = [
            r'(?:مهمة|task|todo|يجب|لازم|ضروري)\s*:?\s*(.+?)(?:\n|$)',
            r'(?:اجتماع|meeting)\s+(.+?)(?:\s+في\s+(.+?))?(?:\n|$)',
            r'(?:موعد|appointment)\s+(.+?)(?:\s+في\s+(.+?))?(?:\n|$)',
        ]
        
        extracted_tasks = []
        
        for pattern in task_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE | re.MULTILINE)
            for match in matches:
                task_title = match.group(1).strip()
                if len(task_title) > 3:  # تجنب المطابقات القصيرة جداً
                    extracted_tasks.append({
                        'title': task_title,
                        'extracted_from': match.group(0),
                        'confidence': 0.8
                    })
        
        # استخدام OpenAI لتحليل أكثر دقة
        try:
            prompt = f"""
            حلل النص التالي واستخرج المهام والمواعيد منه:
            
            "{text}"
            
            أجب بصيغة JSON مع قائمة من المهام، كل مهمة تحتوي على:
            - title: عنوان المهمة
            - description: وصف مختصر
            - priority: الأولوية (low, med, high, urgent)
            - due_date: التاريخ المستحق إن وجد (بصيغة ISO)
            - category: فئة المهمة
            """
            
            response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "أنت مساعد ذكي لاستخراج المهام من النصوص. تجيب بصيغة JSON صحيحة."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=800,
                temperature=0.3
            )
            
            ai_response = response.choices[0].message.content
            ai_tasks = json.loads(ai_response)
            
            if isinstance(ai_tasks, dict) and 'tasks' in ai_tasks:
                ai_tasks = ai_tasks['tasks']
            
            # دمج النتائج
            for ai_task in ai_tasks:
                if isinstance(ai_task, dict) and 'title' in ai_task:
                    extracted_tasks.append({
                        'title': ai_task.get('title', ''),
                        'description': ai_task.get('description', ''),
                        'priority': ai_task.get('priority', 'med'),
                        'due_date': ai_task.get('due_date'),
                        'category': ai_task.get('category', 'عام'),
                        'confidence': 0.9,
                        'source': 'ai'
                    })
                    
        except Exception as ai_error:
            print(f"AI parsing error: {ai_error}")
        
        return jsonify({
            'original_text': text,
            'extracted_tasks': extracted_tasks,
            'count': len(extracted_tasks),
            'processed_at': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'خطأ في تحليل النص: {str(e)}'}), 500

@ai_bp.route('/ai/smart-schedule', methods=['POST'])
@jwt_required()
def smart_schedule():
    """جدولة ذكية للمهام"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        task_ids = data.get('task_ids', [])
        preferences = data.get('preferences', {})
        
        if not task_ids:
            return jsonify({'error': 'معرفات المهام مطلوبة'}), 400
        
        # الحصول على المهام
        tasks = Task.query.filter(Task.id.in_(task_ids), Task.owner_id == user_id).all()
        
        if not tasks:
            return jsonify({'error': 'لم يتم العثور على مهام'}), 404
        
        # تحليل المهام وإنشاء جدولة ذكية
        schedule_suggestions = []
        
        for task in tasks:
            # حساب الوقت المقترح بناءً على الأولوية والمدة المقدرة
            base_time = datetime.now()
            
            if task.priority == 'urgent':
                suggested_time = base_time + timedelta(hours=1)
            elif task.priority == 'high':
                suggested_time = base_time + timedelta(hours=4)
            elif task.priority == 'med':
                suggested_time = base_time + timedelta(days=1)
            else:  # low
                suggested_time = base_time + timedelta(days=3)
            
            # تجنب عطلة نهاية الأسبوع للمهام العملية
            if suggested_time.weekday() >= 5:  # السبت والأحد
                suggested_time += timedelta(days=2)
            
            schedule_suggestions.append({
                'task_id': task.id,
                'task_title': task.title,
                'current_due_date': task.due_at.isoformat() if task.due_at else None,
                'suggested_time': suggested_time.isoformat(),
                'reasoning': f'مجدولة بناءً على الأولوية: {task.priority}',
                'confidence': 0.85
            })
        
        return jsonify({
            'schedule_suggestions': schedule_suggestions,
            'preferences_applied': preferences,
            'generated_at': datetime.utcnow().isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'خطأ في الجدولة الذكية: {str(e)}'}), 500

