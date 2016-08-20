# -*- coding: utf-8 -*-
import datetime as dt

from functools import wraps
from assignexchg.extensions import login_manager, admin
from flask import current_app as app
from flask.ext.login import UserMixin, current_user, login_required
from flask.ext.restless import ProcessingException
from flask import abort, Blueprint, request, redirect, url_for

from assignexchg.extensions import bcrypt, api_manager

# admin_required decorator
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if current_user.account_type != 'admin':
            abort(401)
        return f(*args, **kwargs)
    return  decorated_function


def api_auth(**kw):
    if current_user.is_authenticated():
        return True
    else:
        return False

def api_auth_is_admin(**kw):
    if api_auth() and current_user.account_type == "admin":
        return True
    else:
        return False

def api_auth_is_student(**kw):
    if api_auth() and current_user.account_type == "student":
        return True
    else:
        return False

def api_auth_is_tutor(**kw):
    if api_auth() and current_user.account_type == "tutor":
        return True
    else:
        return False

def api_auth_is_owner(_id):
    if api_auth and current_user.id == _id:
        return True
    else:
        return False

