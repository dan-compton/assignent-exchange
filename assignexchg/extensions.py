# -*- coding: utf-8 -*-
"""Extensions module. Each extension is initialized in the app factory located
in app.py
"""

from flask.ext.bcrypt import Bcrypt
bcrypt = Bcrypt()

from flask.ext.login import LoginManager
login_manager = LoginManager()

from flask.ext.sqlalchemy import SQLAlchemy
db = SQLAlchemy()

from flask.ext.migrate import Migrate
migrate = Migrate()

from flask.ext.cache import Cache
cache = Cache()

from flask.ext.debugtoolbar import DebugToolbarExtension
debug_toolbar = DebugToolbarExtension()

#Initialize REST API
from flask.ext.restless import APIManager
api_manager = APIManager()

#Administration Backend using Flask-Admin
from flask.ext.admin import Admin, AdminIndexView, expose
from flask import redirect, url_for
from flask.ext.login import current_user

# SocketIO (impossible to get to work)
from flask.ext.socketio import SocketIO
socketio = SocketIO()

# Flask Mail
from flask.ext.mail import Mail
mail = Mail()

class MyIndexView(AdminIndexView):
    @expose('/')
    def index(self):
        if not current_user.is_authenticated() or current_user.account_type != 'admin':
            return redirect(url_for('public.home'))
        return super(MyIndexView, self).index()

admin = Admin(index_view = MyIndexView())

