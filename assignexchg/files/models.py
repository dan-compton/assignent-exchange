# -*- coding: utf-8 -*-
import datetime as dt

from flask.ext.login import UserMixin, current_user
from assignexchg.security.auth import *
from assignexchg.extensions import bcrypt, api_manager
from assignexchg.messaging.models import Room
from assignexchg.extensions import bcrypt
from assignexchg.security.utils import entrophy_string
from assignexchg.database import (
    Column,
    db,
    Model,
    ReferenceCol,
    relationship,
    SurrogatePK,
)

class File(db.Model):
    '''

    '''
    __tablename__ = 'files'

    id = Column(db.Integer(), primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'))
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    filename = db.Column(db.Text)
    extension = db.Column(db.Text)
    url = db.Column(db.Text)
    created = db.Column(db.DateTime, nullable=False, default=dt.datetime.utcnow())

    def __init__(self, room_id, created_by, filename,extension, url, created=dt.datetime.utcnow()):
        self.room_id = room_id
        self.created_by = created_by
        self.filename = filename
        self.extension = extension
        self.url = url
        self.created = created

    def __repr__(self):
        return '<File({file_id!r})>'.format(file_id=self.id)

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
    file_id = kw['instance_id']

    passes = False

    # Avoid doing the db query if the user isn't logged in
    if api_auth_is_admin():
        passes = True

    elif api_auth_is_student() or api_auth_is_tutor():
        _file = File.query.filter_by(id=assignment_id).first()
        if current_user.id==_file.created_by:
            passes = True

    if passes:
        pass
    else:
        raise ProcessingException(description='Not authorized!', code=401)

def pre_get_many(**kw):
    """
        TODO postprocessor that removes all items not owned by searchee
    """
    pass

def pre_get_single(**kw):
    pass

exclude_user = ['users._password_hash', 'users.email', 'users.created', 'users.active', 'users.paypal_account', 'users.confirm_code']

api_manager.create_api(File, methods=['GET'], preprocessors=dict(GET_SINGLE=[pre_get_single], GET_MANY=[pre_get_many]),results_per_page=-1,exclude_columns=exclude_user)
