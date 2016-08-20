# -*- coding: utf-8 -*-
from flask import Flask, render_template
import flask.ext.restless

from flask.ext.pagedown import PageDown
from flask.ext.markdown import Markdown
from assignexchg.settings import ProdConfig, DevConfig
from assignexchg.assets import assets

from assignexchg.extensions import (
    bcrypt,
    cache,
    db,
    login_manager,
    migrate,
    debug_toolbar,
    api_manager,
    admin,
    mail,
    socketio
)
from assignexchg import public, assignment, payment, administration, landing, security, subject, messaging, profile, user, init, files

from flask_sslify import SSLify
import stripe
import sys
import logging
from logging import Formatter

logging.basicConfig()

def log_to_stderr(app):
  handler = logging.StreamHandler(sys.stderr)
  handler.setFormatter(Formatter(
    '%(asctime)s %(levelname)s: %(message)s '
    '[in %(pathname)s:%(lineno)d]'
  ))
  handler.setLevel(logging.WARNING)
  app.logger.addHandler(handler)

def create_app(config_object=DevConfig):
    app = Flask(__name__)
    app.config.from_object(config_object)
    register_errorhandlers(app)
    register_extensions(app)
    register_blueprints(app)
    do_startup_options(app)
    socketio.init_app(app)
    log_to_stderr(app)

    return app

def do_startup_options(app):
    # Debug mode
    app.debug = False#app.config['DEBUG']

    # Force SSL
    if False:
        if app.config['SSLIFY'] == True:
            sslify = SSLify(app, subdomains=True)
            if app.debug:
                print 'WARNING, sslify disabled when debug mode is on'

def register_extensions(app):
    #context hack
    db.app=app
    db.init_app(app)

    assets.init_app(app)
    bcrypt.init_app(app)
    cache.init_app(app)

    login_manager.init_app(app)
    migrate.init_app(app, db)
    api_manager.init_app(app, db.session)

    admin.init_app(app)
    mail.init_app(app)

    #Stripe
    stripe_keys = {
        'secret_key': app.config['STRIPE_SECRET_KEY'],
        'publishable_key': app.config['STRIPE_PUBLISHABLE_KEY']
    }
    stripe.api_key = stripe_keys['secret_key']

    #PageDown and Markdown
    pagedown=PageDown(app)
    Markdown(app)

    return None

def register_blueprints(app):
    app.register_blueprint(public.views.blueprint)
    app.register_blueprint(user.views.blueprint)
    app.register_blueprint(assignment.views.blueprint)
    app.register_blueprint(payment.views.blueprint)
    app.register_blueprint(messaging.views.blueprint)
    app.register_blueprint(profile.views.blueprint)
    app.register_blueprint(init.views.blueprint)
    app.register_blueprint(files.views.blueprint)
    return None

def register_errorhandlers(app):
    def render_error(error):
        # If a HTTPException, pull the `code` attribute; default to 500
        error_code = getattr(error, 'code', 500)
        return render_template("{0}.html".format(error_code)), error_code
    for errcode in [401, 404, 500]:
        app.errorhandler(errcode)(render_error)

    return None
