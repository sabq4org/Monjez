from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.user import db, User
from src.models.task import Task, Project, Label
from datetime import datetime
from dateutil import parser

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    try:
        user_id = get_jwt_identity()
        
        # الحصول على المعاملات من الاستعلام
        view = request.args.get('view', 'all')
        from_date = request.args.get('from')
        to_date = request.args.get('to')
        status = request.args.get('status')
        priority = request.args.get('priority')
        project_id = request.args.get('project_id')
        
        # بناء الاستعلام الأساسي
        query = Task.query.filter_by(owner_id=user_id)
        
        # تطبيق الفلاتر
        if status:
            query = query.filter_by(status=status)
        
        if priority:
            query = query.filter_by(priority=priority)
        
        if project_id:
            query = query.filter_by(project_id=project_id)
        
        if from_date:
            from_dt = parser.parse(from_date)
            query = query.filter(Task.due_at >= from_dt)
        
        if to_date:
            to_dt = parser.parse(to_date)
            query = query.filter(Task.due_at <= to_dt)
        
        # تطبيق فلاتر العرض
        if view == 'today':
            today = datetime.now().date()
            query = query.filter(db.func.date(Task.due_at) == today)
        elif view == 'week':
            # المهام للأسبوع الحالي
            pass  # يمكن تطبيق منطق الأسبوع هنا
        elif view == 'overdue':
            query = query.filter(Task.due_at < datetime.now(), Task.status != 'done')
        
        tasks = query.order_by(Task.due_at.asc()).all()
        
        return jsonify({
            'tasks': [task.to_dict() for task in tasks]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/tasks', methods=['POST'])
@jwt_required()
def create_task():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        
        if not data.get('title'):
            return jsonify({'error': 'عنوان المهمة مطلوب'}), 400
        
        task = Task(
            title=data['title'],
            description=data.get('description'),
            status=data.get('status', 'todo'),
            priority=data.get('priority', 'med'),
            owner_id=user_id,
            created_by=user_id,
            project_id=data.get('project_id'),
            all_day=data.get('all_day', False),
            calendar_type=data.get('calendar_type', 'gregorian'),
            recurrence_rule=data.get('recurrence_rule'),
            parent_task_id=data.get('parent_task_id')
        )
        
        # تحويل التواريخ
        if data.get('start_at'):
            task.start_at = parser.parse(data['start_at'])
        
        if data.get('due_at'):
            task.due_at = parser.parse(data['due_at'])
        
        db.session.add(task)
        db.session.commit()
        
        return jsonify({
            'message': 'تم إنشاء المهمة بنجاح',
            'task': task.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/tasks/<task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id):
    try:
        user_id = get_jwt_identity()
        task = Task.query.filter_by(id=task_id, owner_id=user_id).first()
        
        if not task:
            return jsonify({'error': 'المهمة غير موجودة'}), 404
        
        return jsonify({'task': task.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/tasks/<task_id>', methods=['PATCH'])
@jwt_required()
def update_task(task_id):
    try:
        user_id = get_jwt_identity()
        task = Task.query.filter_by(id=task_id, owner_id=user_id).first()
        
        if not task:
            return jsonify({'error': 'المهمة غير موجودة'}), 404
        
        data = request.get_json()
        
        # تحديث الحقول المسموحة
        if 'title' in data:
            task.title = data['title']
        if 'description' in data:
            task.description = data['description']
        if 'status' in data:
            task.status = data['status']
        if 'priority' in data:
            task.priority = data['priority']
        if 'project_id' in data:
            task.project_id = data['project_id']
        if 'all_day' in data:
            task.all_day = data['all_day']
        if 'calendar_type' in data:
            task.calendar_type = data['calendar_type']
        if 'recurrence_rule' in data:
            task.recurrence_rule = data['recurrence_rule']
        
        if 'start_at' in data:
            task.start_at = parser.parse(data['start_at']) if data['start_at'] else None
        
        if 'due_at' in data:
            task.due_at = parser.parse(data['due_at']) if data['due_at'] else None
        
        task.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'تم تحديث المهمة بنجاح',
            'task': task.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/tasks/<task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    try:
        user_id = get_jwt_identity()
        task = Task.query.filter_by(id=task_id, owner_id=user_id).first()
        
        if not task:
            return jsonify({'error': 'المهمة غير موجودة'}), 404
        
        db.session.delete(task)
        db.session.commit()
        
        return jsonify({'message': 'تم حذف المهمة بنجاح'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@tasks_bp.route('/tasks/<task_id>/complete', methods=['POST'])
@jwt_required()
def complete_task(task_id):
    try:
        user_id = get_jwt_identity()
        task = Task.query.filter_by(id=task_id, owner_id=user_id).first()
        
        if not task:
            return jsonify({'error': 'المهمة غير موجودة'}), 404
        
        task.status = 'done'
        task.completed_at = datetime.utcnow()
        task.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'تم إكمال المهمة بنجاح',
            'task': task.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

