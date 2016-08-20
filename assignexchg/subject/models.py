# -*- coding: utf-8 -*-
import datetime as dt

from flask.ext.login import UserMixin, current_user
from assignexchg.extensions import bcrypt, api_manager
from assignexchg.security.auth import api_auth

from assignexchg.extensions import bcrypt
from assignexchg.messaging.models import Room
from assignexchg.database import (
    Column,
    db,
    Model,
    ReferenceCol,
    relationship,
    SurrogatePK,
)


class Subject(Room):
    __tablename__ = 'subjects'
    # A user's assignment
    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id')) # a username, userid ?

    def __init__(self, title, description):
        self.title=title
        self.description=description

    def __repr__(self):
        return '<Subject({subject_id!r})>'.format(subject_id=self.id)


#REST API STUFF
def pre_get_single_many(**kwargs):
    """
        as long as the user is authenticated, they can look at subjects
        -- why not.
    """
    pass


api_manager.create_api(Subject, methods=['GET', 'POST', 'PATCH'], preprocessors=dict(POST_SINGLE=[pre_get_single_many],PATCH_SINGLE=[pre_get_single_many]))
