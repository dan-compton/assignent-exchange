# -*- coding: utf-8 -*-
import datetime as dt

from flask.ext.login import UserMixin, current_user
from assignexchg.security.auth import api_auth

from assignexchg.extensions import bcrypt, api_manager
from assignexchg.database import (
    Column,
    db,
    Model,
    ReferenceCol,
    relationship,
    SurrogatePK,
)


class LaunchNotification(Model):
    '''
        Holds emails of people that are signing up for the service

        NOTE: This may change as the site progresses
    '''
    __tablename__ = 'launch_notifications'
    id = db.Column(db.Integer, primary_key=True)
    email = Column(db.String(80), unique=True, nullable=False)

    def __init__(self, **kwargs):
        db.Model.__init__(self, **kwargs)

    def __repr__(self):
        return '<LaunchNotification({email!r})>'.format(email=self.email)

#REST API STUFF
api_manager.create_api(LaunchNotification, methods=['GET'], preprocessors=dict(GET_SINGLE=[api_auth], GET_MANY=[api_auth]))
