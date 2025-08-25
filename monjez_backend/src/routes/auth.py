from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from src.models.user import db, User
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # التحقق من وجود البيانات المطلوبة
        if not data.get('name') or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'الاسم والبريد الإلكتروني وكلمة المرور مطلوبة'}), 400
        
        # التحقق من عدم وجود المستخدم مسبقاً
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'البريد الإلكتروني مستخدم مسبقاً'}), 400
        
        # إنشاء مستخدم جديد
        user = User(
            name=data['name'],
            email=data['email'],
            locale=data.get('locale', 'ar'),
            timezone=data.get('timezone', 'Asia/Riyadh')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        # إنشاء JWT token
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(days=30)
        )
        
        return jsonify({
            'message': 'تم إنشاء الحساب بنجاح',
            'access_token': access_token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'البريد الإلكتروني وكلمة المرور مطلوبان'}), 400
        
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not user.check_password(data['password']):
            return jsonify({'error': 'البريد الإلكتروني أو كلمة المرور غير صحيحة'}), 401
        
        access_token = create_access_token(
            identity=user.id,
            expires_delta=timedelta(days=30)
        )
        
        return jsonify({
            'message': 'تم تسجيل الدخول بنجاح',
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'المستخدم غير موجود'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    # في JWT، تسجيل الخروج يتم من جانب العميل بحذف التوكن
    return jsonify({'message': 'تم تسجيل الخروج بنجاح'}), 200

