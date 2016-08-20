# -*- coding: utf-8 -*-
'''Helper utilities and decorators.'''
from flask import flash
from flask import current_app as app
from flask.ext.login import current_user
from functools import wraps
from flask import (Blueprint, render_template, request, url_for, redirect, flash)

def check_confirmed(func):
    @wraps(func)
    def decorated_function(*args, **kwargs):
        if current_user.confirmed is False:
            flash('Please confirm your email account!', 'warning')
            return redirect(url_for('users.uncomfirmed'))
        return func(*args, **kwargs)
    return decorated_function
