from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import uuid

db = SQLAlchemy()

# جدول الربط بين المستخدمين والفرق
user_teams = db.Table('user_teams',
    db.Column('user_id', db.String(36), db.ForeignKey('users.id'), primary_key=True),
    db.Column('team_id', db.String(36), db.ForeignKey('teams.id'), primary_key=True),
    db.Column('role', db.String(50), default='member'),  # owner, admin, member
    db.Column('joined_at', db.DateTime, default=datetime.utcnow)
)

# جدول الربط بين المهام والتسميات
task_labels = db.Table('task_labels',
    db.Column('task_id', db.String(36), db.ForeignKey('tasks.id'), primary_key=True),
    db.Column('label_id', db.String(36), db.ForeignKey('labels.id'), primary_key=True)
)

class Team(db.Model):
    __tablename__ = 'teams'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    owner_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # العلاقات
    owner = db.relationship('User', backref='owned_teams')
    members = db.relationship('User', secondary=user_teams, backref='teams')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'owner_id': self.owner_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'member_count': len(self.members)
        }

class Project(db.Model):
    __tablename__ = 'projects'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    color = db.Column(db.String(7), default='#3B82F6')  # Hex color
    team_id = db.Column(db.String(36), db.ForeignKey('teams.id'), nullable=True)
    owner_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(50), default='active')  # active, archived, completed
    start_date = db.Column(db.Date, nullable=True)
    end_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # العلاقات
    owner = db.relationship('User', backref='owned_projects')
    team = db.relationship('Team', backref='projects')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'color': self.color,
            'team_id': self.team_id,
            'owner_id': self.owner_id,
            'status': self.status,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Label(db.Model):
    __tablename__ = 'labels'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    color = db.Column(db.String(7), default='#6B7280')  # Hex color
    owner_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # العلاقات
    owner = db.relationship('User', backref='labels')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'color': self.color,
            'owner_id': self.owner_id,
            'created_at': self.created_at.isoformat()
        }

class Task(db.Model):
    __tablename__ = 'tasks'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    team_id = db.Column(db.String(36), db.ForeignKey('teams.id'), nullable=True)
    project_id = db.Column(db.String(36), db.ForeignKey('projects.id'), nullable=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), default='todo')  # todo, in_progress, done, archived
    priority = db.Column(db.String(50), default='med')  # low, med, high, urgent
    owner_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    start_at = db.Column(db.DateTime, nullable=True)
    due_at = db.Column(db.DateTime, nullable=True)
    all_day = db.Column(db.Boolean, default=False)
    calendar_type = db.Column(db.String(50), default='gregorian')  # gregorian, hijri, auto
    recurrence_rule = db.Column(db.Text, nullable=True)  # iCal RRULE
    parent_task_id = db.Column(db.String(36), db.ForeignKey('tasks.id'), nullable=True)
    created_by = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    
    # العلاقات
    owner = db.relationship('User', foreign_keys=[owner_id], backref='owned_tasks')
    creator = db.relationship('User', foreign_keys=[created_by], backref='created_tasks')
    project = db.relationship('Project', backref='tasks')
    team = db.relationship('Team', backref='tasks')
    parent_task = db.relationship('Task', remote_side=[id], backref='subtasks')
    labels = db.relationship('Label', secondary=task_labels, backref='tasks')
    
    def to_dict(self):
        return {
            'id': self.id,
            'team_id': self.team_id,
            'project_id': self.project_id,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'priority': self.priority,
            'owner_id': self.owner_id,
            'start_at': self.start_at.isoformat() if self.start_at else None,
            'due_at': self.due_at.isoformat() if self.due_at else None,
            'all_day': self.all_day,
            'calendar_type': self.calendar_type,
            'recurrence_rule': self.recurrence_rule,
            'parent_task_id': self.parent_task_id,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }

