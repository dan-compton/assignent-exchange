# -*- coding: utf-8 -*-
'''Public section, including homepage and signup.'''
from flask import (Blueprint, request, render_template, flash, url_for,redirect, session, jsonify)

from flask.ext.login import login_user, login_required, logout_user, current_user
from flask.ext.admin import Admin, BaseView, expose, AdminIndexView
from flask.ext.admin.contrib.sqla import ModelView

from assignexchg.extensions import login_manager, admin
from assignexchg.security.auth import admin_required
from assignexchg.user.models import User
from assignexchg.messaging.models import Message, Room
from assignexchg.subject.models import Subject
from assignexchg.landing.models import LaunchNotification
from assignexchg.files.models import File
from assignexchg.assignment.models import Assignment, Claim
from assignexchg.utils import flash_errors, s3_upload
from assignexchg.database import db

class MyView(ModelView):
    #@login_required
    #@admin_required
    def is_accessible(self):
        return True

admin.add_view(MyView(User, db.session, endpoint='admin_User'))
admin.add_view(MyView(Assignment, db.session, endpoint='admin_Assignment'))
admin.add_view(MyView(Subject, db.session, endpoint='admin_Subject'))
admin.add_view(MyView(Claim, db.session, endpoint='admin_Claim'))
admin.add_view(MyView(Message, db.session, endpoint='admin_Message'))
admin.add_view(MyView(Room, db.session, endpoint='admin_Room'))
admin.add_view(MyView(File, db.session, endpoint='admin_File'))

