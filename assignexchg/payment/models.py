# -*- coding: utf-8 -*-
import datetime as dt

from flask.ext.login import UserMixin, current_user
from assignexchg.security.auth import *
from assignexchg.messaging.models import Message

from sqlalchemy.schema import Table
from sqlalchemy.orm import backref

from assignexchg.extensions import bcrypt, api_manager
from assignexchg.database import (
    Column,
    db,
    Model,
    ReferenceCol,
    relationship,
    SurrogatePK,
)

class Payment(Message):
    '''

    '''
    __tablename__ = 'payments'
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float)
    minutes = db.Column(db.Float)

    def __init__(self, user_id, room_id, body, amount, minutes):
        super(Message, self).__init__(user_id, room_id, body)
        self.amount = amount

    @property
    def __repr__(self):
        return '<Payment({id!r})>'.format(id = self.id)

#REST API STUFF
#TODO Add permissions for Rooms
# update get_many to ensure that the correct user is getting many
def pre_get_many(**kw): pass
def pre_post_single(**kwargs):
    """
        allows any authenticated user to post a message to any other user

        TODO:
        RATE LIMITING.  SPAM DETECTION.

    """
    if api_auth_is_authenticated():
        return True
    raise ProcessingException(description='Not authorized!', code=401)

api_manager.create_api(Payment, methods=['GET', 'POST'], preprocessors=dict(POST_SINGLE=[pre_post_single], GET_MANY=[pre_get_many]), results_per_page=None)

