from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    locale = db.Column(db.String(10), default='ar')  # ar, en
    timezone = db.Column(db.String(50), default='Asia/Riyadh')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'locale': self.locale,
            'timezone': self.timezone,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class UserTeam(db.Model):
    __tablename__ = 'user_teams'
    
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), primary_key=True)
    team_id = db.Column(db.String(36), db.ForeignKey('teams.id'), primary_key=True)
    role = db.Column(db.String(50), default='editor')  # admin, editor, viewer
    
    user = db.relationship('User', backref='team_memberships')
    team = db.relationship('Team', backref='user_memberships')

