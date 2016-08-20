# -*- coding: utf-8 -*-
import datetime as dt

from flask.ext.login import UserMixin, current_user
from assignexchg.security.auth import *
from assignexchg.extensions import bcrypt, api_manager
from assignexchg.messaging.models import Room
from assignexchg.database import (
    Column,
    db,
    Model,
    ReferenceCol,
    relationship,
    SurrogatePK,
)

class Assignment(Room):
    '''
        Model for an assignment that a student can create.

        #TODO Add room to assignment
    '''
    __tablename__ = 'assignments'

    id = Column(db.Integer(), primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'))

    solution = db.Column(db.Integer(), db.ForeignKey('solutions.id'))
    subject_id = db.Column(db.Integer(), db.ForeignKey('subjects.id'))

    created_by = db.Column(db.Integer(), db.ForeignKey('users.id'))
    created = db.Column(db.DateTime, nullable=False, default=dt.datetime.utcnow)

    #TODO Should there be a default?
    due_date = Column(db.DateTime, nullable=True, default=(dt.datetime.now() + dt.timedelta(hours=12)))

    # One-to-One relationship with Claim
    claim=relationship("Claim", uselist=False, backref="assignments")

    # One-to-One with solution
    solution=relationship("Solution", uselist=False, backref="assignments")

    title = db.Column(db.String(140), nullable=False)
    description = db.Column(db.String(1024), nullable=False)

    minutes = db.Column(db.Integer(), nullable=False)
    assignment_files = db.Column(db.String(1024), nullable=True)
    active = db.Column(db.Boolean(), default=True) # this will only change when due date is past or the assignment is solved

    # Let the base class handle the initialization.  Not sure how this will work..
    def __init__(self, **kwargs):
        db.Model.__init__(self,**kwargs)

    def __repr__(self):
        return '<Assignment({assignment_id!r})>'.format(assignment_id=self.id)


class Claim(db.Model):
    '''
        Defines a one-to-one association between a tutor and an assignment
    '''
    __tablename__ = 'claims'

    # A user's assignment
    id = db.Column(db.Integer(), primary_key=True)

    claim_date = db.Column(db.DateTime, nullable=False, default=dt.datetime.utcnow)
    claim_expiration =  db.Column(db.DateTime, nullable=False)

    tutor_id = db.Column(db.Integer(), db.ForeignKey("users.id"))
    assignment_id = db.Column(db.Integer(), db.ForeignKey("assignments.id"))

    # Let the base class handle the initialization.  Not sure how this will work..
    def __init__(self,**kwargs):
        db.Model.__init__(self,**kwargs)

    def __repr__(self):
        return '<Claim({claim_id!r})>'.format(claim_id=self.id)

class Solution(db.Model):
    '''
        Model for a solution to an assignment
    '''
    __tablename__ = 'solutions'

    # A user's assignment
    id = db.Column(db.Integer(), primary_key=True) # a username, userid ?

    tutor_id = db.Column(db.Integer(), db.ForeignKey("users.id"))
    assignment_id = db.Column(db.Integer(), db.ForeignKey("assignments.id"))

    created = db.Column(db.DateTime, nullable=False, default=dt.datetime.utcnow)
    description = db.Column(db.String(1024), nullable=False)

    #Link to solution files on S3
    solution_files = db.Column(db.String(1024), nullable=True)

    def __init__(self, **kwargs):
        self.user_id=current_user.id
        db.Model.__init__(self,**kwargs)

    def __repr__(self):
        return '<Solution({solution_id!r})>'.format(solution_id=self.id)

#
#
#  Restful API stuff
#
def pre_get_single(**kw):
    """
        Only allows get access for users that are either the assignment's creator
        or an administrator
    """
    # The id of the requested assignment
    assignment_id = kw['instance_id']

    passes = False

    # Avoid doing the db query if the user isn't logged in
    if api_auth_is_admin():
        passes = True

    elif api_auth_is_student():
        assignment = Assignment.query.filter_by(id=assignment_id).first()
        if current_user.id==assignment.created_by:
            passes = True

    elif api_auth_is_tutor():
        print 'is auth and is tutor'
        assignment = Assignment.query.filter_by(id=assignment_id).first()
        passes =True

    if passes:
        pass
    else:
        raise ProcessingException(description='Not authorized!', code=401)

def pre_get_many(**kw):
    """
        Only allows get access for users that are either the assignment's creator
        or an administrator
    """
    # The id of the requested assignment

    # Avoid doing the db query if the user isn't logged in
    if api_auth_is_admin() or api_auth_is_tutor() or api_auth_is_student():
        return True
    raise ProcessingException(description='Not authorized!', code=401)

def pre_delete(**kw):
    """
        Only allows get access for users that are either the assignment's creator
        or an administrator
    """
    # The id of the requested assignment
    assignment_id = kw['instance_id']

    # Avoid doing the db query if the user isn't logged in
    if api_auth_is_admin():
        return True
    if api_auth_is_student():
        assignment = Assignment.query.filter_by(id=assignment_id).first()
        if current_user.id==assignment.created_by:
            return True
    raise ProcessingException(description='Not authorized!', code=401)

def pre_post_single(**kw):
    if api_auth():
        if current_user.exchange_account.minutes >= int(kw['data']['minutes']):
            current_user.exchange_account.minutes -= int(kw['data']['minutes'])
            db.session.commit()
            return True
    raise ProcessingException(description='Not authorized!', code=401)




exclude_user = ['users._password_hash', 'users.email', 'users.created', 'users.active', 'users.paypal_account']

api_manager.create_api(Assignment, methods=['GET', 'POST','DELETE'], preprocessors=dict(GET_SINGLE=[pre_get_single], GET_MANY=[pre_get_many], DELETE=[pre_delete], POST=[pre_post_single]),results_per_page=-1, exclude_columns=exclude_user)

api_manager.create_api(Claim, methods=['GET','DELETE'], results_per_page=-1, exclude_columns=exclude_user)
