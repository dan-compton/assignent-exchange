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


class Profile(Model):
    '''
        Design descision was made to store tutors and students in
        the same User database.

        There are only 2 columns that Students don't have:
        1. resume
        2. description

        NOTE: This may change as the site progresses
    '''
    __tablename__ = 'users'

    # Shared between students, tutors, and admins
    description = Column(db.String(1024), nullable=True)
    photo = Column(db.String(1024), nullable=True)

    def __init__(self **kwargs):
        db.Model.__init__(self, username=username, email=email, **kwargs)

    @property
    def full_name(self):
        return "{0} {1}".format(self.first_name, self.last_name)


