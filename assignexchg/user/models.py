# -*- coding: utf-8 -*-
import datetime as dt

from flask.ext.login import UserMixin, current_user
from assignexchg.security.auth import api_auth, api_auth_is_admin
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import synonym
import base64
import time

from assignexchg.extensions import bcrypt, api_manager
from assignexchg.database import (
    Column,
    db,
    Model,
    ReferenceCol,
    relationship,
    SurrogatePK,
)

class Role(SurrogatePK, db.Model):
    __tablename__ = 'roles'
    name = db.Column(db.String(80), unique=True, nullable=False)
    user_id = ReferenceCol('users', nullable=True)
    user = relationship('User', backref='roles')

    def __init__(self, name, **kwargs):
        db.Model.__init__(self, name=name, **kwargs)

    def __repr__(self):
        return '<Role({name})>'.format(name=self.name)

class ExchangeAccount(db.Model):
    '''

    '''
    __tablename__ = 'exchange_account'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    paypal_account = db.Column(db.String(128), unique=False, nullable=False)
    minutes = db.Column(db.Integer(), nullable=False, default="0")


class Profile(db.Model):
    '''
        This will become the user's public profile
    '''
    __tablename__ = 'profiles'
    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    description = db.Column(db.Text, nullable=True)
    resume = db.Column(db.String(1024), nullable=True)


class User(UserMixin, SurrogatePK, db.Model):
    '''
    '''
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)

    # Shared between students, tutors, and admins
    #
    username = db.Column(db.String(80), unique=True, nullable=False)
    _password_hash = db.Column('password', db.String(128), nullable=True)
    email = db.Column(db.String(128), unique=True, nullable=False)

    # required for messages
    profile_image = db.Column(db.String(1024), nullable=True, default="https://s3-us-west-2.amazonaws.com/assignment-exchange/defaultIcon.png")
    created_at = db.Column(db.DateTime, nullable=False, default=dt.datetime.utcnow)

    # enables or disables user
    active = db.Column(db.Boolean(), default=False)
    account_type = db.Column(db.String(30), nullable=False, default="student")

    # Friends list
    #
    friends=relationship("Friend", backref="users")

    # email confirmations
    confirmed = db.Column(db.Boolean(), default=True, nullable=False)
    confirm_code = db.Column(db.Text())

    # Assignment
    #
    assignments = relationship('Assignment', backref='users')
    claim=relationship("Claim", uselist=False, backref="users")
    solution=relationship("Solution", backref="users")

    # Messaging
    #
    messages = relationship('Message', backref='users')

    # Public profile
    #
    profile = relationship("Profile", uselist=False)

    # File Uploads
    #
    files = relationship("File", backref='users')

    # Monetary Stuff
    #
    exchange_account = relationship("ExchangeAccount", uselist=False)

    def __init__(self, username="", email="", password="blah", active=False, account_type="student", **kwargs):
        self.username=username
        self.email=email
        self.password=password
        self.account_type=account_type
        self.active=active
        self.confirm_code = self.generate_confirm_code(email)

    def generate_confirm_code(self, email):
        timestamp = base64.urlsafe_b64encode("%d" % int(time.time()))
        return base64.urlsafe_b64encode(bcrypt.generate_password_hash(email + timestamp))

    def check_password(self, value):
        return bcrypt.check_password_hash(self.password, value)



    @property
    def password(self):
        return self._password_hash

    @password.setter
    def password(self,password):
        self._password_hash = bcrypt.generate_password_hash(password)

    password = synonym('_password_hash', descriptor=password)
    #legacy
    def set_password(self, password):
        self.password = bcrypt.generate_password_hash(password)

    def __repr__(self):
        return '<User({username!r})>'.format(username=self.username)


class Friend(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    username = db.Column(db.String(80), unique=False, nullable=False)

    def __init__(self, **kwargs):
        db.Model.__init__(self, **kwargs)


def pre_get_many(**kwargs):
    if api_auth_is_admin():
        pass

def pre_get_single(**kwargs):
    if api_auth():
        pass

api_manager.create_api(User, methods=['GET','PATCH','DELETE'], preprocessors=dict(GET_SINGLE=[pre_get_single], GET_MANY=[pre_get_many]),exclude_columns=['_password_hash', 'profile', 'solution'])

api_manager.create_api(Profile, methods=['GET','PATCH','DELETE'], preprocessors=dict(GET_SINGLE=[api_auth], GET_MANY=[api_auth], PATCH=[api_auth]))

api_manager.create_api(ExchangeAccount, methods=['GET','PATCH'], preprocessors=dict(GET_SINGLE=[api_auth], GET_MANY=[api_auth], PATCH=[api_auth]))
