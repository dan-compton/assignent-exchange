# -*- coding: utf-8 -*-
import datetime as dt

from flask.ext.login import UserMixin, current_user

from sqlalchemy.schema import Table
from sqlalchemy.orm import backref

from assignexchg.extensions import bcrypt, api_manager
from assignexchg.security.auth import api_auth

from assignexchg.database import (
    Column,
    db,
    Model,
    ReferenceCol,
    relationship,
    SurrogatePK,
)


association_table = db.Table('association',
        db.Column('room_id', db.Integer, db.ForeignKey('room.id')),
        db.Column('users_id', db.Integer, db.ForeignKey('users.id')))


likes_table = db.Table('likes_association',
        db.Column('message_id', db.Integer, db.ForeignKey('messages.id')),
        db.Column('users_id', db.Integer, db.ForeignKey('users.id')))


class Room(db.Model):
    __tablename__ = 'room'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(256), nullable=False)
    description = db.Column(db.String(1024), nullable=False)
    members = relationship("User", secondary=association_table, backref="rooms")

    def __init__(self, **kwargs):
        db.Model.__init__(self, **kwargs)

    def __repr__(self):
        return '<Room({id!r})>'.format(id=self.id)

class Message(db.Model):
    """
        A message from user to user.  Or user to Channel (e.g. tutor-chat)
        All users and channels will have a unique inbox_id

        #TODO: Determine if it's worth including user object in relationship
        -- since Profile-User is 1 to 1 and we store user_id
    """
    __tablename__ = 'messages'
    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    room_id = db.Column(db.Integer, nullable=False)
    body = db.Column(db.String(1024), unique=False, nullable=False)
    created = db.Column(db.DateTime, nullable=False, default=dt.datetime.utcnow)
    likes = relationship("User", secondary=likes_table, backref="likes")


    def __init__(self, room_id, body, created):
        self.room_id = room_id
        self.body = body
        self.created = created

    @property
    def __repr__(self):
        return '<Message({sender_id!r})>'.format(sender_id=self.sender_id)

#REST API STUFF
#TODO Add permissions for Rooms
# update get_many to ensure that the correct user is getting many

exclude_user = ['users._password_hash', 'users.email', 'users.created', 'users.active', 'users.paypal_account', 'users.confirm_code']

api_manager.create_api(Message, methods=['GET', 'POST'], preprocessors=dict(POST_SINGLE=[api_auth], GET_MANY=[api_auth], GET_SINGLE=[]), results_per_page=20, exclude_columns=exclude_user)

api_manager.create_api(Room, methods=['GET', 'POST', 'PATCH'], preprocessors=dict(POST_SINGLE=[api_auth], PATCH_SINGLE=[], GET_MANY=[api_auth]), results_per_page=-1, exclude_columns=exclude_user)

